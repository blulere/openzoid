importScripts("av_init.js");
var startTime;
var fs;
var fileEntry;
var fileWriter;
var now = Date.now;
var lastErr = "";

function print(e) {
    if (typeof e == "object") {
        e = JSON.parse(JSON.stringify(e));
    }
    postMessage({ type: "stdout", data: e });
}

function printErr(e) {
    if (typeof e == "string") {
        lastErr = e;
    }
    print(e);
}

function quit(e, r) {
    postMessage({ type: "error", data: r.message + "\n" + lastErr });
    throw r;
}

function onReturn(e) {
    var r = [];
    for (var t = 0; t < e.length; t++) {
        r.push(e[t].data);
    }
    postMessage(
        {
            type: "done",
            data: e,
            file: fileEntry ? fileEntry.file() : null,
            time: now() - startTime,
        },
        r
    );
}

function readCallback(e, r, t, a, f) {
    var s = fileEntry.file();
    var n = new Uint8Array(r.buffer, t, a);
    var _ = new FileReaderSync().readAsArrayBuffer(s.slice(f, f + a));
    n.set(new Uint8Array(_));
    return a;
}

function writeCallback(e, r, t, a, f) {
    var s = new Uint8Array(r.buffer, t, a);
    var n = new Blob([s]);
    fileWriter.write(n);
    return a;
}

function seekCallback(e, r, t) {
    fileWriter.seek(r);
    return r;
}

var _heap;
var _sync;
var _callback;
var _buf_ptrs;
var _xfer_buffer;
var _xfer_ptrs;
var _xfer_ptrs_v;
var _xfer_ptrs_a;
var _remux;
var AV_NUM_DATA_POINTERS = 8;
var HAS_THREADS = false;

function getAudioSamples(e, r, t) {
    _callback = t;
    _buf_ptrs = new Int32Array(_heap, e, 8);
    _xfer_ptrs = _xfer_ptrs_a;
    postMessage(
        {
            type: "audio",
            num: r,
            xfer_ptrs: [_xfer_ptrs[0], _xfer_ptrs[1]],
            xfer_buffer: _xfer_buffer,
        },
        [_xfer_buffer]
    );
}

function getVideoFrame(e, r) {
    _callback = r;
    _buf_ptrs = new Int32Array(_heap, e, 8);
    _xfer_ptrs = _xfer_ptrs_v;
    postMessage(
        {
            type: "video",
            xfer_ptrs: [_xfer_ptrs[0]],
            xfer_buffer: _xfer_buffer,
        },
        [_xfer_buffer]
    );
}

function gotCallback(e, r) {
    for (var t = 0; t < _xfer_ptrs.length - 1; t++) {
        r = _xfer_ptrs[t + 1] - _xfer_ptrs[t];
        var a = new Int8Array(_heap, _buf_ptrs[t], r);
        var f = new Int8Array(_xfer_buffer, _xfer_ptrs[t], r);
        a.set(f);
    }
    _callback(e);
}

function gotHeap(e) {
    _heap = e;
}

function gotRemux(e) {
    _remux = e;
}

onmessage = function (e) {
    if (e.data.type === "callback") {
        _xfer_buffer = e.data.xfer_buffer;
        gotCallback(e.data.ret, e.data.length);
        return;
    }
    if (e.data.type === "remux") {
        var s = _remux(e.data.options);
        var n = [];
        for (var _ = 0; _ < s.buffers.length; _++) {
            n.push(s.buffers[_].data);
        }
        postMessage({ type: "remux", offset: s.offset, data: s.buffers }, n);
    } else {
        if (e.data.syncBuffer) {
            _sync = new Int32Array(e.data.syncBuffer, 0, 1);
        }
        if (true && !e.data.options.decode) {
            var r = e.data.options.frameWidth * e.data.options.frameHeight * 4;
            var t = Math.max(r, 7680);
            _xfer_buffer = new ArrayBuffer(t);
            _xfer_ptrs_v = [0, r];
            _xfer_ptrs_a = [0, 3840, 7680];
        }
        var a = 16777216;
        if (e.data.options.haveVideo === 1) {
            a =
                1024 *
                (a =
                    16 *
                    Math.ceil(
                        ((e.data.options.frameWidth *
                            e.data.options.frameHeight) /
                            17600 +
                            15) /
                            16
                    )) *
                1024;
        }
        var f = {
            pthreadMainPrefixURL: "/js/encoder/",
            options: e.data.options,
            files: e.data.files || [],
            arguments: e.data.arguments || [],
            links0: e.data.vlinks || [],
            links1: e.data.alinks || [],
            print: print,
            printErr: printErr,
            read: readCallback,
            quit: quit,
            write: writeCallback,
            seek: seekCallback,
            getAudioSamples: getAudioSamples,
            getVideoFrame: getVideoFrame,
            bufferRef: gotHeap,
            gotRemux: gotRemux,
            return: onReturn,
            TOTAL_MEMORY: a,
        };
        if (e.data.options.haveVideo === 1 && !e.data.options.decode) {
            try {
                fs = webkitRequestFileSystemSync(PERSISTENT, 104857600);
                try {
                    fs.root.getFile("out", { create: false }).remove();
                } catch (e) {
                } finally {
                    fileEntry = fs.root.getFile("out", { create: true });
                    fileWriter = fileEntry.createWriter();
                }
            } catch (e) {
            } finally {
                if (fs && fileEntry && fileWriter) {
                    f.useDevFile = true;
                }
            }
        }
        postMessage({ type: "start", data: f.arguments });
        startTime = now();
        ffmpeg_run(f);
    }
};

postMessage({ type: "ready" });
