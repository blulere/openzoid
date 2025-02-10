importScripts("av_init.js");
var startTime, fs, fileEntry, fileWriter, now = Date.now,
    lastErr = "";

function print(e) {
    "object" == typeof e && (e = JSON.parse(JSON.stringify(e))), postMessage({
        type: "stdout",
        data: e
    })
}

function printErr(e) {
    "string" == typeof e && (lastErr = e), print(e)
}

function quit(e, r) {
    throw postMessage({
        type: "error",
        data: r.message + "\n" + lastErr
    }), r
}

function onReturn(e) {
    for (var r = [], t = 0; t < e.length; t++) r.push(e[t].data);
    postMessage({
        type: "done",
        data: e,
        file: fileEntry ? fileEntry.file() : null,
        time: now() - startTime
    }, r)
}

function readCallback(e, r, t, a, f) {
    var s = fileEntry.file(),
        n = new Uint8Array(r.buffer, t, a),
        _ = (new FileReaderSync).readAsArrayBuffer(s.slice(f, f + a));
    return n.set(new Uint8Array(_)), a
}

function writeCallback(e, r, t, a, f) {
    var s = new Uint8Array(r.buffer, t, a),
        n = new Blob([s]);
    return fileWriter.write(n), a
}

function seekCallback(e, r, t) {
    return fileWriter.seek(r), r
}
var _heap, _sync, _callback, _buf_ptrs, _xfer_buffer, _xfer_ptrs, _xfer_ptrs_v, _xfer_ptrs_a, _remux, AV_NUM_DATA_POINTERS = 8,
    HAS_THREADS = !1;

function getAudioSamples(e, r, t) {
    if (_callback = t, _buf_ptrs = new Int32Array(_heap, e, AV_NUM_DATA_POINTERS), HAS_THREADS ? (_sync[0] = -1, _xfer_ptrs[0] = _buf_ptrs[0], _xfer_ptrs[1] = _buf_ptrs[1]) : _xfer_ptrs = _xfer_ptrs_a, postMessage({
            type: "audio",
            num: r,
            xfer_ptrs: [_xfer_ptrs[0], _xfer_ptrs[1]],
            xfer_buffer: _xfer_buffer
        }, [_xfer_buffer]), HAS_THREADS) return Atomics.wait(_sync, 0, -1), _sync[0]
}

function getVideoFrame(e, r) {
    if (_callback = r, _buf_ptrs = new Int32Array(_heap, e, AV_NUM_DATA_POINTERS), HAS_THREADS ? (_sync[0] = -1, _xfer_ptrs[0] = _buf_ptrs[0]) : _xfer_ptrs = _xfer_ptrs_v, postMessage({
            type: "video",
            xfer_ptrs: [_xfer_ptrs[0]],
            xfer_buffer: _xfer_buffer
        }, [_xfer_buffer]), HAS_THREADS) return Atomics.wait(_sync, 0, -1), _sync[0]
}

function gotCallback(e, r) {
    for (var t = 0; t < _xfer_ptrs.length - 1; t++) {
        r = _xfer_ptrs[t + 1] - _xfer_ptrs[t];
        var a = new Int8Array(_heap, _buf_ptrs[t], r),
            f = new Int8Array(_xfer_buffer, _xfer_ptrs[t], r);
        a.set(f)
    }
    _callback(e)
}

function gotHeap(e) {
    _heap = e, HAS_THREADS && postMessage({
        type: "buffer",
        buffer: _heap
    })
}

function gotRemux(e) {
    _remux = e
}
onmessage = function(e) {
    if ("callback" === e.data.type) return _xfer_buffer = e.data.xfer_buffer, void gotCallback(e.data.ret, e.data.length);
    if ("remux" !== e.data.type) {
        if (e.data.syncBuffer && (_sync = new Int32Array(e.data.syncBuffer, 0, 1)), !HAS_THREADS && !e.data.options.decode) {
            var r = e.data.options.frameWidth * e.data.options.frameHeight * 4,
                t = Math.max(r, 7680);
            _xfer_buffer = new ArrayBuffer(t), _xfer_ptrs_v = [0, r], _xfer_ptrs_a = [0, 3840, 7680]
        }
        var a = 16777216;
        1 === e.data.options.haveVideo && (a = 1024 * (a = 16 * Math.ceil((e.data.options.frameWidth * e.data.options.frameHeight / 17600 + 15) / 16)) * 1024);
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
            TOTAL_MEMORY: a
        };
        if (1 === e.data.options.haveVideo && !e.data.options.decode) try {
            fs = webkitRequestFileSystemSync(PERSISTENT, 104857600);
            try {
                fs.root.getFile("out", {
                    create: !1
                }).remove()
            } catch (e) {} finally {
                fileEntry = fs.root.getFile("out", {
                    create: !0
                }), fileWriter = fileEntry.createWriter()
            }
        } catch (e) {} finally {
            fs && fileEntry && fileWriter && (f.useDevFile = !0)
        }
        postMessage({
            type: "start",
            data: f.arguments
        }), startTime = now(), ffmpeg_run(f)
    } else {
        for (var s = _remux(e.data.options), n = [], _ = 0; _ < s.buffers.length; _++) n.push(s.buffers[_].data);
        postMessage({
            type: "remux",
            offset: s.offset,
            data: s.buffers
        }, n)
    }
}, postMessage({
    type: "ready"
});