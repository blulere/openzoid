importScripts("tar_init.js");
var startTime;
var fs;
var fileEntry;
var fileWriter;
var now = Date.now;

function print(e) {
    postMessage({ type: "stdout", data: e });
}

function onReturn(e) {
    var t = [];
    for (var r = 0; r < e.length; r++) {
        t.push(e[r].data);
    }
    postMessage(
        {
            type: "done",
            data: e,
            file: fileEntry ? fileEntry.file() : null,
            time: now() - startTime,
        },
        t
    );
}

function readCallback(e, t, r, i, a) {
    var n = fileEntry.file();
    var l = new Uint8Array(t.buffer, r, i);
    var s = new FileReaderSync().readAsArrayBuffer(n.slice(a, a + i));
    l.set(new Uint8Array(s));
    return i;
}

function writeCallback(e, t, r, i, a) {
    var n = new Uint8Array(t.buffer, r, i);
    var l = new Blob([n]);
    fileWriter.write(l);
    e.node.size = a + i;
    return i;
}

function seekCallback(e, t, r) {
    fileWriter.seek(t);
    return t;
}

onmessage = function (e) {
    var t = {
        files: e.data.files || [],
        wfiles: e.data.wfiles || [],
        arguments: e.data.arguments || [],
        print: print,
        printErr: print,
        read: readCallback,
        write: writeCallback,
        seek: seekCallback,
        inputDirectory: e.data.inputDirectory,
        outputDirectory: e.data.outputDirectory,
        return: onReturn,
        TOTAL_MEMORY: 16777216,
    };
    if (t.wfiles[0] && undefined === t.wfiles[0].name) {
        t.wfiles[0].name = "blob.pz";
    }
    if (e.data.useDevFile === true) {
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
                t.useDevFile = true;
            }
        }
    }
    postMessage({ type: "start", data: t.arguments });
    startTime = now();
    tar_run(t);
};

postMessage({ type: "ready" });
