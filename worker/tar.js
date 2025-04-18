importScripts("tar_init.js");
var startTime, fs, fileEntry, fileWriter, now = Date.now;

function print(e) {
    postMessage({
        type: "stdout",
        data: e
    })
}

function onReturn(e) {
    for (var t = [], r = 0; r < e.length; r++) t.push(e[r].data);
    postMessage({
        type: "done",
        data: e,
        file: fileEntry ? fileEntry.file() : null,
        time: now() - startTime
    }, t)
}

function readCallback(e, t, r, i, a) {
    var n = fileEntry.file(),
        l = new Uint8Array(t.buffer, r, i),
        s = (new FileReaderSync).readAsArrayBuffer(n.slice(a, a + i));
    return l.set(new Uint8Array(s)), i
}

function writeCallback(e, t, r, i, a) {
    var n = new Uint8Array(t.buffer, r, i),
        l = new Blob([n]);
    return fileWriter.write(l), e.node.size = a + i, i
}

function seekCallback(e, t, r) {
    return fileWriter.seek(t), t
}
onmessage = function(e) {
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
        TOTAL_MEMORY: 16777216
    };
    if (t.wfiles[0] && void 0 === t.wfiles[0].name && (t.wfiles[0].name = "blob.pz"), !0 === e.data.useDevFile) try {
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
        fs && fileEntry && fileWriter && (t.useDevFile = !0)
    }
    postMessage({
        type: "start",
        data: t.arguments
    }), startTime = now(), tar_run(t)
}, postMessage({
    type: "ready"
});