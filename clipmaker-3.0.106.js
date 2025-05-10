const PZTOOLVERSION = "3.0.106";
var CM = new PZ.ui.editor();
CM.name = "openzoid (Clipmaker 3)";
var BG = {}; // What does this do ? only one use, worth removing ? - blulere 2025-02-13
// Likely a stub from Backgrounder, could be removed in unminified, definitely should be removed in main - blulere 2025-02-14

async function initTool() {
    let currentAccount = await PZ.account.getCurrent();
    CM.setUpEditor(currentAccount);
    let loadedCreation = await CM.getCreationFromUrl();
    CM.init(loadedCreation);
    CM.enabled = true;
}

CM.setUpEditor = function (currentAccount) {
    CM.playback = new PZ.ui.playback(CM);
    CM.playback.loop = true;
    let mainWindow = CM.createMainWindow();
    let toolbarIcons = [
        {
            title: "new (ctrl-m)",
            icon: "new",
            fn: function () {
                CM.new();
            },
        },
        {
            title: "open (ctrl-o)",
            icon: "load",
            fn: function () {
                CM.open();
            },
        },
        {
            title: "save (ctrl-s)",
            icon: "save",
            fn: function () {
                CM.save();
            },
        },
        {
            separator: true,
        },
        {
            title: "undo (ctrl-z)",
            icon: "undo",
            fn: function () {
                CM.history.undo();
            },
        },
        {
            title: "redo (ctrl-y)",
            icon: "redo",
            fn: function () {
                CM.history.redo();
            },
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
        keyframePanel: timeline.keyframes,
    });
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
        showListItemButtons: false,
        keyframePanel: timeline.keyframes,
    });
    menuBarEdit.title = "Edit";
    menuBarEdit.icon = "edit2";
    menuBarEdit.objects = timeline.tracks.selection;
    let menuBarObjectsTop = new PZ.ui.edit(CM, {
        childFilter: (e) => e instanceof PZ.objectList && e.type === PZ.object3d,
        columnLayout: 1,
        showListItemButtons: false,
        emptyMessage: "select a clip",
        objectFilter: (e) => !!e.object.objects,
        objectMap: (e) => e.object.objects,
    });
    let menuBarObjectsBottom = new PZ.ui.edit(CM, { childFilter: (e) => !(e instanceof PZ.objectList) || e.type !== PZ.object3d, keyframePanel: timeline.keyframes });
    let menuBarObjects = new PZ.ui.splitPanel(CM, menuBarObjectsTop, menuBarObjectsBottom, 0.4);
    menuBarObjects.title = "Objects";
    menuBarObjects.icon = "objects";
    menuBarObjectsTop.objects = timeline.tracks.selection;
    menuBarObjectsBottom.objects = menuBarObjectsTop.selection;
    let menuBarEffectsTop = new PZ.ui.edit(CM, {
        childFilter: (e) => e instanceof PZ.objectList && e.type === PZ.effect,
        columnLayout: 1,
        showListItemButtons: false,
        emptyMessage: "select a clip",
        objectFilter: (e) => !!e.object.effects,
        objectMap: (e) => e.object.effects,
    });
    let menuBarEffectsBottom = new PZ.ui.edit(CM, { childFilter: (e) => !(e instanceof PZ.objectList) || e.type !== PZ.effect, keyframePanel: timeline.keyframes });
    let menuBarEffects = new PZ.ui.splitPanel(CM, menuBarEffectsTop, menuBarEffectsBottom, 0.4);
    menuBarEffects.title = "Effects";
    menuBarEffects.icon = "fx";
    menuBarEffectsTop.objects = timeline.tracks.selection;
    menuBarEffectsBottom.objects = menuBarEffectsTop.selection;
    let menuBar = [new PZ.ui.media(CM), menuBarSequence, menuBarEdit, menuBarObjects, menuBarEffects, new PZ.ui.export(CM), new PZ.ui.about(CM)];
    let menuBarElevator = new PZ.ui.elevator(CM, menuBar);
    let viewport = new PZ.ui.viewport(CM, {
        helper3dObjects: menuBarObjectsTop.selection,
        widget3dObjects: menuBarObjectsTop.selection,
        widget2dObjects: timeline.tracks.selection,
    });
    viewport.objects = timeline.tracks.selection;
    viewport.edit = true;
    let splitPanelViewport;
    let transportBar = [
        {
            title: "editing camera (c)",
            icon: "camera",
            key: "c",
            observable: viewport.onEditChanged,
            update: function (e) {
                let color = viewport.edit ? "#8a2828" : "#acacac";
                e.children[0].style.fill = color;
            },
            fn: function () {
                viewport.edit = !viewport.edit;
            },
        },
        {
            title: "layer transform controls (t)",
            icon: "transform",
            key: "t",
            observable: viewport.widget2d ? viewport.widget2d.onEditChanged : undefined,
            update: function (e) {
                let color = viewport.widget2d.edit ? "#8a2828" : "#acacac";
                e.children[0].style.fill = color;
            },
            fn: function () {
                viewport.widget2d.edit = !viewport.widget2d.edit;
            },
        },
        { separator: true },
        {
            title: "start (home)",
            icon: "start",
            key: "Home",
            fn: function () {
                this.editor.playback.speed = 0;
                this.editor.playback.currentFrame = 0;
            },
        },
        {
            title: "skip frames back",
            key: "ArrowLeft",
            modifierMask: PZ.ui.toolbar.SHIFT,
            fn: function () {
                this.editor.playback.speed = 0;
                this.editor.playback.currentFrame = Math.max(this.editor.playback.currentFrame - 5, 0);
            },
        },
        {
            title: "previous frame",
            icon: "prevframe",
            key: "ArrowLeft",
            modifierMask: 0,
            fn: function () {
                this.editor.playback.speed = 0;
                this.editor.playback.currentFrame = Math.max(this.editor.playback.currentFrame - 1, 0);
            },
        },
        {
            title: "play (space)",
            icon: "play",
            key: " ",
            observable: CM.playback.onSpeedChanged,
            update: function (e) {
                let paused = 0 !== this.editor.playback.speed;
                let text = paused ? "pause" : "play";
                let color = paused ? "#8a2828" : "#acacac";
                PZ.ui.switchIcon(e.children[0], text);
                e.children[0].style.fill = color;
            },
            fn: function () {
                var newSpeed = 0 === this.editor.playback.speed ? 1 : 0;
                this.editor.playback.speed = newSpeed;
            },
        },
        {
            title: "next frame",
            icon: "nextframe",
            key: "ArrowRight",
            modifierMask: 0,
            fn: function () {
                this.editor.playback.speed = 0;
                this.editor.playback.currentFrame = Math.max(Math.min(this.editor.playback.currentFrame + 1, this.editor.playback.totalFrames - 1), 0);
            },
        },
        {
            title: "skip frames forward",
            key: "ArrowRight",
            modifierMask: PZ.ui.toolbar.SHIFT,
            fn: function () {
                this.editor.playback.speed = 0;
                this.editor.playback.currentFrame = Math.max(Math.min(this.editor.playback.currentFrame + 5, this.editor.playback.totalFrames - 1), 0);
            },
        },
        {
            title: "end (end)",
            icon: "end",
            key: "End",
            fn: function () {
                this.editor.playback.speed = 0;
                this.editor.playback.currentFrame = this.editor.playback.totalFrames - 1;
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
        { separator: true },
        {
            title: "loop (ctrl-l)",
            icon: "loop",
            key: "l",
            modifierMask: PZ.ui.toolbar.CTRL,
            observable: CM.playback.onLoopChanged,
            update: function (e) {
                let color = this.editor.playback.loop ? "#8a2828" : "#acacac";
                e.children[0].style.fill = color;
            },
            fn: function () {
                this.editor.playback.loop = !this.editor.playback.loop;
            },
        },
        {
            title: "toggle marker",
            key: "m",
            fn: function () {
                let props = new PZ.ui.properties(this.editor);
                let currentFrame = this.editor.playback.currentFrame;
                this.editor.history.startOperation();
                props.toggleKeyframe(this.editor.sequence.properties.markers, currentFrame);
                this.editor.history.finishOperation();
            },
        },
        {
            title: "previous marker",
            key: "ArrowLeft",
            modifierMask: PZ.ui.toolbar.CTRL,
            fn: function () {
                let markers = this.editor.sequence.properties.markers;
                let currentFrame = this.editor.playback.currentFrame;
                let frameOffset = markers.frameOffset;
                let closestMarker = markers.getClosestKeyframeIndex(currentFrame);

                if (closestMarker >= 0) {
                    let currentKeyframe = markers.keyframes[closestMarker];
                    let previousKeyframe = markers.keyframes[closestMarker - 1];

                    // If the closest keyframe is at or after the current frame and there's a previous keyframe, adjust the index
                    if (currentKeyframe.frame >= currentFrame && previousKeyframe) {
                        closestMarker -= 1;
                    }
                }
                this.editor.playback.currentFrame = markers.keyframes[closestMarker].frame + frameOffset;
            },
        },
        {
            title: "next marker",
            key: "ArrowRight",
            modifierMask: PZ.ui.toolbar.CTRL,
            fn: function () {
                let markers = this.editor.sequence.properties.markers;
                let currentFrame = this.editor.playback.currentFrame;
                let frameOffset = markers.frameOffset;
                let closestMarker = markers.getClosestKeyframeIndex(currentFrame);
                if (closestMarker >= 0) {
                    let currentKeyframe = markers.keyframes[closestMarker];
                    let nextKeyframe = markers.keyframes[closestMarker + 1];

                    // If the closest keyframe is before or at the current frame and there's a next keyframe, move forward
                    if (currentKeyframe.frame <= currentFrame && nextKeyframe) {
                        closestMarker += 1;
                    }
                }
                this.editor.playback.currentFrame = markers.keyframes[closestMarker].frame + frameOffset;
            },
        },
        {
            title: "graph",
            key: "g",
            icon: "interp_1",
            modifierMask: PZ.ui.toolbar.CTRL,
            fn: function () {
                let graphEditorWindow = CM.createWindow({ title: "Graph editor" });
                let graphEditor = new PZ.ui.graphEditor(graphEditorWindow.editor);
                graphEditorWindow.setPanel(graphEditor);
                graphEditorWindow.enabled = true;
            },
        },
    ];
    let transportBarToolbar = new PZ.ui.toolbar(CM, transportBar);
    let audioMeter = new PZ.ui.audioMeter(CM);
    let toolbarMenuBarSplit = new PZ.ui.splitPanel(CM, toolbar, menuBarElevator, 0, 0);

    splitPanelViewport = viewport;

    let splitPanelTimeline = new PZ.ui.splitPanel(CM, timeline, audioMeter, 1, 1);
    let splitPanelBottom = new PZ.ui.splitPanel(CM, transportBarToolbar, splitPanelTimeline, 0, 0);
    let splitPanelRight = new PZ.ui.splitPanel(CM, splitPanelViewport, splitPanelBottom, 0.65, 0);
    let splitPanelLeft = new PZ.ui.splitPanel(CM, toolbarMenuBarSplit, splitPanelRight, 0.3, 1);
    mainWindow.setPanel(splitPanelLeft);
};

CM.defaultProject = {
    sequence: {
        properties: { resolution: [1920, 1080], rate: 30 },
        length: 180,
        videoTracks: [{ type: 0, clips: [{ type: 0, start: 0, length: 180, offset: 0, relativeRate: 1, media: null, link: null, properties: { name: "Scene" }, object: { type: 4, effects: [], objects: [{ type: 6, objectType: 1 }] } }] }],
        audioTracks: [{ type: 1, clips: [] }],
    },
    assets: [],
    media: [
        {
            properties: { name: "3D Scene", icon: "objects" },
            preset: true,
            assets: [],
            data: [{ type: 0, clips: [{ start: 0, length: 180, offset: 0, type: 0, link: null, properties: { name: "Scene" }, object: { type: 4, effects: [], objects: [{ type: 6, objectType: 1 }] } }] }],
            baseType: "track",
        },
        {
            properties: { name: "Adjustment", icon: "fx" },
            preset: true,
            assets: [],
            data: [{ type: 0, clips: [{ start: 0, length: 180, offset: 0, type: 0, link: null, properties: { name: "Adjustment" }, object: { type: 1, effects: [] } }] }],
            baseType: "track",
        },
        {
            properties: { name: "Text", icon: "text" },
            preset: true,
            assets: [],
            data: [{ type: 0, clips: [{ start: 0, length: 180, offset: 0, type: 0, link: null, properties: { name: "Text" }, object: { type: 7, objects: [], effects: [] } }] }],
            baseType: "track",
        },
        {
            properties: { name: "Preset shape", icon: "shape" },
            assets: [],
            preset: true,
            data: [{ type: 0, clips: [{ start: 0, length: 180, offset: 0, type: 0, link: null, properties: { name: "Shape" }, object: { type: 8, objects: [], effects: [] } }] }],
            baseType: "track",
        },
        {
            properties: { name: "Shape", icon: "shape" },
            assets: [],
            preset: true,
            data: [{ type: 0, clips: [{ start: 0, length: 180, offset: 0, type: 0, link: null, properties: { name: "Shape" }, object: { type: 6, objects: [], effects: [] } }] }],
            baseType: "track",
        },
        {
            properties: { name: "Composite", icon: "layers" },
            assets: [],
            preset: true,
            data: [{ type: 0, clips: [{ start: 0, length: 180, offset: 0, type: 0, link: null, properties: { name: "Composite" }, object: { type: 2, objects: [], effects: [] } }] }],
            baseType: "track",
        },
    ],
};

/*
BG.defaultProject = {
    sequence: {
        properties: {
            resolution: [1920, 1080],
            rate: 1,
        },
        length: 1,
        videoTracks: [{ clips: [{ start: 0, length: 1, offset: 0, type: 0, link: null, object: { type: 2, properties: { name: "Image" }, objects: [], effects: [] } }] }],
        audioTracks: [],
    },
    assets: {},
    media: [],
};
*/