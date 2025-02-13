const PZTOOLVERSION = "3.0.106";
var CM = new PZ.ui.editor();
CM.name = "openzoid (Clipmaker 3)";
var BG = {}; // What does this do ? only one use, worth removing ? - blulere 2025-02-13

async function initTool() {
    let currentAccount = await PZ.account.getCurrent();
    CM.setUpEditor(currentAccount);
    let loadedCreation = await CM.getCreationFromUrl();
    CM.init(loadedCreation);
    CM.enabled = true;
}

(CM.setUpEditor = function (e) {
    CM.playback = new PZ.ui.playback(CM);
    CM.playback.loop = true;
    let mainWindow = CM.createMainWindow();
    let adBanner = new PZ.ui.ad(CM);
    let toolbarIcons = [
        {
            title: "new (ctrl-m)",
            icon: "new",
            fn: function() { CM.new(); },
        },
        {
            title: "open (ctrl-o)",
            icon: "load",
            fn: function() { CM.open(); },
        },
        {
            title: "save (ctrl-s)",
            icon: "save",
            fn: function() { CM.save(); },
        },
        { separator: !0 },
        {
            title: "undo (ctrl-z)",
            icon: "undo",
            fn: function() { CM.history.undo(); },
        },
        {
            title: "redo (ctrl-y)",
            icon: "redo",
            fn: function() { CM.history.redo(); },
        },
    ];
    let toolbar = new PZ.ui.toolbar(CM, toolbarIcons);
    let timeline = new PZ.ui.timeline(CM);

    timeline.tracks.videoTrackSize = 30;
    timeline.tracks.audioTrackSize = 50;
    timeline.timeFormat = 2;
    timeline.zoom = 0.3;

    let menuBarSequence = new PZ.ui.edit(CM, {
        childFilter: (e) => e instanceof PZ.propertyList,
        keyframePanel: timeline.keyframes });
    menuBarSequence.title = "Sequence";
    menuBarSequence.icon = "sequence";
    CM.onSequenceChanged.watch(() => {
        let menuBarSequenceList = new PZ.objectList();
        menuBarSequenceList.push(CM.sequence);
        menuBarSequence.objects = menuBarSequenceList;
    });
    let menuBarEdit = new PZ.ui.edit(CM, {
        childFilter: (e) => e instanceof PZ.propertyList || e instanceof PZ.object || (e instanceof PZ.objectList && e.type === PZ.property.dynamic),
        emptyMessage: "select a clip",
        showListItemButtons: !1,
        keyframePanel: timeline.keyframes,
    });
    menuBarEdit.title = "Edit";
    menuBarEdit.icon = "edit2";
    menuBarEdit.objects = timeline.tracks.selection;
    let c = new PZ.ui.edit(CM, {
        childFilter: (e) => e instanceof PZ.objectList && e.type === PZ.object3d,
        columnLayout: 1,
        showListItemButtons: false,
        emptyMessage: "select a clip",
        objectFilter: (e) => !!e.object.objects,
        objectMap: (e) => e.object.objects,
    });
    let l = new PZ.ui.edit(CM, { childFilter: (e) => !(e instanceof PZ.objectList) || e.type !== PZ.object3d, keyframePanel: timeline.keyframes });
    let menuBarObjects = new PZ.ui.splitPanel(CM, c, l, 0.4);
    menuBarObjects.title = "Objects";
    menuBarObjects.icon = "objects";
    c.objects = timeline.tracks.selection;
    l.objects = c.selection;
    let d = new PZ.ui.edit(CM, {
            childFilter: (e) => e instanceof PZ.objectList && e.type === PZ.effect,
            columnLayout: 1,
            showListItemButtons: !1,
            emptyMessage: "select a clip",
            objectFilter: (e) => !!e.object.effects,
            objectMap: (e) => e.object.effects,
        }),
        f = new PZ.ui.edit(CM, { childFilter: (e) => !(e instanceof PZ.objectList) || e.type !== PZ.effect, keyframePanel: timeline.keyframes }),
        menuBarEffects = new PZ.ui.splitPanel(CM, d, f, 0.4);
    (menuBarEffects.title = "Effects"), (menuBarEffects.icon = "fx"), (d.objects = timeline.tracks.selection), (f.objects = d.selection);
    let menuBar = [new PZ.ui.media(CM), menuBarSequence, menuBarEdit, menuBarObjects, menuBarEffects, new PZ.ui.export(CM), new PZ.ui.about(CM)];
    let elevator = new PZ.ui.elevator(CM, menuBar),
        viewport = new PZ.ui.viewport(CM, { helper3dObjects: c.selection, widget3dObjects: c.selection, widget2dObjects: timeline.tracks.selection });
    (viewport.objects = timeline.tracks.selection), (viewport.edit = !0);
    let m,
        h = [
            {
                title: "editing camera (c)",
                icon: "camera",
                key: "c",
                observable: viewport.onEditChanged,
                update: function (e) {
                    let t = viewport.edit ? "#8a2828" : "#acacac";
                    e.children[0].style.fill = t;
                },
                fn: function () {
                    viewport.edit = !viewport.edit;
                },
            },
            {
                title: "layer transform controls (t)",
                icon: "transform",
                key: "t",
                observable: viewport.widget2d ? viewport.widget2d.onEditChanged : void 0,
                update: function (e) {
                    let t = viewport.widget2d.edit ? "#8a2828" : "#acacac";
                    e.children[0].style.fill = t;
                },
                fn: function () {
                    viewport.widget2d.edit = !viewport.widget2d.edit;
                },
            },
            { separator: !0 },
            {
                title: "start (home)",
                icon: "start",
                key: "Home",
                fn: function () {
                    (this.editor.playback.speed = 0), (this.editor.playback.currentFrame = 0);
                },
            },
            {
                title: "skip frames back",
                key: "ArrowLeft",
                modifierMask: PZ.ui.toolbar.SHIFT,
                fn: function () {
                    (this.editor.playback.speed = 0), (this.editor.playback.currentFrame = Math.max(this.editor.playback.currentFrame - 5, 0));
                },
            },
            {
                title: "previous frame",
                icon: "prevframe",
                key: "ArrowLeft",
                modifierMask: 0,
                fn: function () {
                    (this.editor.playback.speed = 0), (this.editor.playback.currentFrame = Math.max(this.editor.playback.currentFrame - 1, 0));
                },
            },
            {
                title: "play (space)",
                icon: "play",
                key: " ",
                observable: CM.playback.onSpeedChanged,
                update: function (e) {
                    let t = 0 !== this.editor.playback.speed,
                        i = t ? "pause" : "play",
                        a = t ? "#8a2828" : "#acacac";
                    PZ.ui.switchIcon(e.children[0], i), (e.children[0].style.fill = a);
                },
                fn: function () {
                    var e = 0 === this.editor.playback.speed ? 1 : 0;
                    this.editor.playback.speed = e;
                },
            },
            {
                title: "next frame",
                icon: "nextframe",
                key: "ArrowRight",
                modifierMask: 0,
                fn: function () {
                    (this.editor.playback.speed = 0), (this.editor.playback.currentFrame = Math.max(Math.min(this.editor.playback.currentFrame + 1, this.editor.playback.totalFrames - 1), 0));
                },
            },
            {
                title: "skip frames forward",
                key: "ArrowRight",
                modifierMask: PZ.ui.toolbar.SHIFT,
                fn: function () {
                    (this.editor.playback.speed = 0), (this.editor.playback.currentFrame = Math.max(Math.min(this.editor.playback.currentFrame + 5, this.editor.playback.totalFrames - 1), 0));
                },
            },
            {
                title: "end (end)",
                icon: "end",
                key: "End",
                fn: function () {
                    (this.editor.playback.speed = 0), (this.editor.playback.currentFrame = this.editor.playback.totalFrames - 1);
                },
            },
            {
                title: "reverse++",
                key: "j",
                fn: function () {
                    this.editor.playback.speed = this.editor.playback.speed - 0.25;
                },
            },
            {
                title: "stop",
                key: "k",
                fn: function () {
                    this.editor.playback.speed = 0;
                },
            },
            {
                title: "forward++",
                key: "l",
                fn: function () {
                    this.editor.playback.speed = this.editor.playback.speed + 0.25;
                },
            },
            { separator: !0 },
            {
                title: "loop (ctrl-l)",
                icon: "loop",
                key: "l",
                modifierMask: PZ.ui.toolbar.CTRL,
                observable: CM.playback.onLoopChanged,
                update: function (e, t) {
                    let i = this.editor.playback.loop ? "#8a2828" : "#acacac";
                    e.children[0].style.fill = i;
                },
                fn: function () {
                    this.editor.playback.loop = !this.editor.playback.loop;
                },
            },
            {
                title: "toggle marker",
                key: "m",
                fn: function () {
                    let e = new PZ.ui.properties(this.editor),
                        t = this.editor.playback.currentFrame;
                    this.editor.history.startOperation(), e.toggleKeyframe(this.editor.sequence.properties.markers, t), this.editor.history.finishOperation();
                },
            },
            {
                title: "previous marker",
                key: "ArrowLeft",
                modifierMask: PZ.ui.toolbar.CTRL,
                fn: function () {
                    let e = this.editor.sequence.properties.markers,
                        t = this.editor.playback.currentFrame,
                        i = e.frameOffset,
                        a = e.getClosestKeyframeIndex(t);
                    a < 0 || (e.keyframes[a].frame >= t && e.keyframes[a - 1] && (a -= 1), (this.editor.playback.currentFrame = e.keyframes[a].frame + i));
                },
            },
            {
                title: "next marker",
                key: "ArrowRight",
                modifierMask: PZ.ui.toolbar.CTRL,
                fn: function () {
                    let e = this.editor.sequence.properties.markers,
                        t = this.editor.playback.currentFrame,
                        i = e.frameOffset,
                        a = e.getClosestKeyframeIndex(t);
                    a < 0 || (e.keyframes[a].frame <= t && e.keyframes[a + 1] && (a += 1), (this.editor.playback.currentFrame = e.keyframes[a].frame + i));
                },
            },
            {
                title: "graph",
                key: "g",
                icon: "interp_1",
                modifierMask: PZ.ui.toolbar.CTRL,
                fn: function () {
                    let e = CM.createWindow({ title: "Graph editor" }),
                        t = new PZ.ui.graphEditor(e.editor);
                    e.setPanel(t), (e.enabled = !0);
                },
            },
        ],
        P = new PZ.ui.toolbar(CM, h),
        M = new PZ.ui.audioMeter(CM),
        C = new PZ.ui.splitPanel(CM, toolbar, elevator, 0, 0);
    m = e && e.hasSubscription ? viewport : new PZ.ui.splitPanel(CM, adBanner, viewport, 0, 0);
    let w = new PZ.ui.splitPanel(CM, timeline, M, 1, 1),
        j = new PZ.ui.splitPanel(CM, P, w, 0, 0),
        Z = new PZ.ui.splitPanel(CM, m, j, 0.65, 0),
        g = new PZ.ui.splitPanel(CM, C, Z, 0.3, 1);
    mainWindow.setPanel(g);
}),
    (CM.defaultProject = {
        sequence: {
            properties: { resolution: [1920, 1080], rate: 30 },
            length: 180,
            videoTracks: [
                { type: 0, clips: [{ type: 0, start: 0, length: 180, offset: 0, relativeRate: 1, media: null, link: null, properties: { name: "Scene" }, object: { type: 4, effects: [], objects: [{ type: 6, objectType: 1 }] } }] },
            ],
            audioTracks: [{ type: 1, clips: [] }],
        },
        assets: [],
        media: [
            {
                properties: { name: "3D Scene", icon: "objects" },
                preset: !0,
                assets: [],
                data: [{ type: 0, clips: [{ start: 0, length: 180, offset: 0, type: 0, link: null, properties: { name: "Scene" }, object: { type: 4, effects: [], objects: [{ type: 6, objectType: 1 }] } }] }],
                baseType: "track",
            },
            {
                properties: { name: "Adjustment", icon: "fx" },
                preset: !0,
                assets: [],
                data: [{ type: 0, clips: [{ start: 0, length: 180, offset: 0, type: 0, link: null, properties: { name: "Adjustment" }, object: { type: 1, effects: [] } }] }],
                baseType: "track",
            },
            {
                properties: { name: "Text", icon: "text" },
                preset: !0,
                assets: [],
                data: [{ type: 0, clips: [{ start: 0, length: 180, offset: 0, type: 0, link: null, properties: { name: "Text" }, object: { type: 7, objects: [], effects: [] } }] }],
                baseType: "track",
            },
            {
                properties: { name: "Preset shape", icon: "shape" },
                assets: [],
                preset: !0,
                data: [{ type: 0, clips: [{ start: 0, length: 180, offset: 0, type: 0, link: null, properties: { name: "Shape" }, object: { type: 8, objects: [], effects: [] } }] }],
                baseType: "track",
            },
            {
                properties: { name: "Shape", icon: "shape" },
                assets: [],
                preset: !0,
                data: [{ type: 0, clips: [{ start: 0, length: 180, offset: 0, type: 0, link: null, properties: { name: "Shape" }, object: { type: 6, objects: [], effects: [] } }] }],
                baseType: "track",
            },
            {
                properties: { name: "Composite", icon: "layers" },
                assets: [],
                preset: !0,
                data: [{ type: 0, clips: [{ start: 0, length: 180, offset: 0, type: 0, link: null, properties: { name: "Composite" }, object: { type: 2, objects: [], effects: [] } }] }],
                baseType: "track",
            },
        ],
    }),
    (BG.defaultProject = {
        sequence: {
            properties: { resolution: [1920, 1080], rate: 1 },
            length: 1,
            videoTracks: [{ clips: [{ start: 0, length: 1, offset: 0, type: 0, link: null, object: { type: 2, properties: { name: "Image" }, objects: [], effects: [] } }] }],
            audioTracks: [],
        },
        assets: {},
        media: [],
    });
