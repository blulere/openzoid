const PZVERSION = "1.0.102";
THREE.OBJLoader = function (e) {
    this.manager = undefined !== e ? e : THREE.DefaultLoadingManager;
    this.materials = null;
    this.regexp = {
        vertex_pattern: /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
        normal_pattern: /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
        uv_pattern: /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
        face_vertex: /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
        face_vertex_uv: /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
        face_vertex_uv_normal:
            /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
        face_vertex_normal:
            /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,
        object_pattern: /^[og]\s*(.+)?/,
        smoothing_pattern: /^s\s+(\d+|on|off)/,
        material_library_pattern: /^mtllib /,
        material_use_pattern: /^usemtl /,
    };
};
THREE.OBJLoader.prototype = {
    constructor: THREE.OBJLoader,
    load: function (e, t, r, i) {
        var a = this;
        var s = new THREE.XHRLoader(a.manager);
        s.setPath(this.path);
        s.load(
            e,
            function (e) {
                t(a.parse(e));
            },
            r,
            i
        );
    },
    setPath: function (e) {
        this.path = e;
    },
    setMaterials: function (e) {
        this.materials = e;
    },
    _createParserState: function () {
        var e = {
            objects: [],
            object: {},
            vertices: [],
            normals: [],
            uvs: [],
            materialLibraries: [],
            startObject: function (e, t) {
                if (this.object && this.object.fromDeclaration === false) {
                    this.object.name = e;
                    this.object.fromDeclaration = t !== false;
                    return;
                }
                if (this.object && typeof this.object._finalize == "function") {
                    this.object._finalize();
                }
                var r =
                    this.object && typeof this.object.currentMaterial == "function"
                        ? this.object.currentMaterial()
                        : undefined;
                this.object = {
                    name: e || "",
                    fromDeclaration: t !== false,
                    geometry: { vertices: [], normals: [], uvs: [] },
                    materials: [],
                    smooth: true,
                    startMaterial: function (e, t) {
                        var r = this._finalize(false);
                        if (r && (r.inherited || r.groupCount <= 0)) {
                            this.materials.splice(r.index, 1);
                        }
                        var i = {
                            index: this.materials.length,
                            name: e || "",
                            mtllib: Array.isArray(t) && t.length > 0 ? t[t.length - 1] : "",
                            smooth: undefined !== r ? r.smooth : this.smooth,
                            groupStart: undefined !== r ? r.groupEnd : 0,
                            groupEnd: -1,
                            groupCount: -1,
                            inherited: false,
                            clone: function (e) {
                                return {
                                    index: typeof e == "number" ? e : this.index,
                                    name: this.name,
                                    mtllib: this.mtllib,
                                    smooth: this.smooth,
                                    groupStart: this.groupEnd,
                                    groupEnd: -1,
                                    groupCount: -1,
                                    inherited: false,
                                };
                            },
                        };
                        this.materials.push(i);
                        return i;
                    },
                    currentMaterial: function () {
                        if (this.materials.length > 0) {
                            return this.materials[this.materials.length - 1];
                        }
                    },
                    _finalize: function (e) {
                        var t = this.currentMaterial();
                        if (t && t.groupEnd === -1) {
                            t.groupEnd = this.geometry.vertices.length / 3;
                            t.groupCount = t.groupEnd - t.groupStart;
                            t.inherited = false;
                        }
                        if (e !== false && this.materials.length === 0) {
                            this.materials.push({ name: "", smooth: this.smooth });
                        }
                        return t;
                    },
                };
                if (r && r.name && typeof r.clone == "function") {
                    var i = r.clone(0);
                    i.inherited = true;
                    this.object.materials.push(i);
                }
                this.objects.push(this.object);
            },
            finalize: function () {
                if (this.object && typeof this.object._finalize == "function") {
                    this.object._finalize();
                }
            },
            parseVertexIndex: function (e, t) {
                var r = parseInt(e, 10);
                return 3 * (r >= 0 ? r - 1 : r + t / 3);
            },
            parseNormalIndex: function (e, t) {
                var r = parseInt(e, 10);
                return 3 * (r >= 0 ? r - 1 : r + t / 3);
            },
            parseUVIndex: function (e, t) {
                var r = parseInt(e, 10);
                return 2 * (r >= 0 ? r - 1 : r + t / 2);
            },
            addVertex: function (e, t, r) {
                var i = this.vertices;
                var a = this.object.geometry.vertices;
                a.push(i[e + 0]);
                a.push(i[e + 1]);
                a.push(i[e + 2]);
                a.push(i[t + 0]);
                a.push(i[t + 1]);
                a.push(i[t + 2]);
                a.push(i[r + 0]);
                a.push(i[r + 1]);
                a.push(i[r + 2]);
            },
            addVertexLine: function (e) {
                var t = this.vertices;
                var r = this.object.geometry.vertices;
                r.push(t[e + 0]);
                r.push(t[e + 1]);
                r.push(t[e + 2]);
            },
            addNormal: function (e, t, r) {
                var i = this.normals;
                var a = this.object.geometry.normals;
                a.push(i[e + 0]);
                a.push(i[e + 1]);
                a.push(i[e + 2]);
                a.push(i[t + 0]);
                a.push(i[t + 1]);
                a.push(i[t + 2]);
                a.push(i[r + 0]);
                a.push(i[r + 1]);
                a.push(i[r + 2]);
            },
            addUV: function (e, t, r) {
                var i = this.uvs;
                var a = this.object.geometry.uvs;
                a.push(i[e + 0]);
                a.push(i[e + 1]);
                a.push(i[t + 0]);
                a.push(i[t + 1]);
                a.push(i[r + 0]);
                a.push(i[r + 1]);
            },
            addUVLine: function (e) {
                var t = this.uvs;
                var r = this.object.geometry.uvs;
                r.push(t[e + 0]);
                r.push(t[e + 1]);
            },
            addFace: function (e, t, r, i, a, s, n, o, p, l, h, c) {
                var u;
                var d = this.vertices.length;
                var f = this.parseVertexIndex(e, d);
                var m = this.parseVertexIndex(t, d);
                var y = this.parseVertexIndex(r, d);
                if (undefined === i) {
                    this.addVertex(f, m, y);
                } else {
                    u = this.parseVertexIndex(i, d);
                    this.addVertex(f, m, u);
                    this.addVertex(m, y, u);
                }
                if (undefined !== a) {
                    var g = this.uvs.length;
                    f = this.parseUVIndex(a, g);
                    m = this.parseUVIndex(s, g);
                    y = this.parseUVIndex(n, g);
                    if (undefined === i) {
                        this.addUV(f, m, y);
                    } else {
                        u = this.parseUVIndex(o, g);
                        this.addUV(f, m, u);
                        this.addUV(m, y, u);
                    }
                }
                if (undefined !== p) {
                    var v = this.normals.length;
                    f = this.parseNormalIndex(p, v);
                    m = p === l ? f : this.parseNormalIndex(l, v);
                    y = p === h ? f : this.parseNormalIndex(h, v);
                    if (undefined === i) {
                        this.addNormal(f, m, y);
                    } else {
                        u = this.parseNormalIndex(c, v);
                        this.addNormal(f, m, u);
                        this.addNormal(m, y, u);
                    }
                }
            },
            addLineGeometry: function (e, t) {
                this.object.geometry.type = "Line";
                var r = this.vertices.length;
                var i = this.uvs.length;
                var a = 0;
                for (var s = e.length; a < s; a++) {
                    this.addVertexLine(this.parseVertexIndex(e[a], r));
                }
                var n = 0;
                for (s = t.length; n < s; n++) {
                    this.addUVLine(this.parseUVIndex(t[n], i));
                }
            },
        };
        e.startObject("", false);
        return e;
    },
    parse: function (e) {
        console.time("OBJLoader");
        var t = this._createParserState();
        if (e.indexOf("\r\n") !== -1) {
            e = e.replace("\r\n", "\n");
        }
        var r = e.split("\n");
        var i = "";
        var a = "";
        var s = "";
        var n = [];
        var p = 0;
        for (var l = r.length; p < l; p++) {
            i = r[p];
            if ((i = i.trimLeft()).length !== 0 && (a = i.charAt(0)) !== "#") {
                if (a === "v") {
                    if ((s = i.charAt(1)) === " " && (n = this.regexp.vertex_pattern.exec(i)) !== null) {
                        t.vertices.push(parseFloat(n[1]), parseFloat(n[2]), parseFloat(n[3]));
                    } else if (s === "n" && (n = this.regexp.normal_pattern.exec(i)) !== null) {
                        t.normals.push(parseFloat(n[1]), parseFloat(n[2]), parseFloat(n[3]));
                    } else {
                        if (s !== "t" || (n = this.regexp.uv_pattern.exec(i)) === null) {
                            throw new Error("Unexpected vertex/normal/uv line: '" + i + "'");
                        }
                        t.uvs.push(parseFloat(n[1]), parseFloat(n[2]));
                    }
                } else if (a === "f") {
                    if ((n = this.regexp.face_vertex_uv_normal.exec(i)) === null) {
                        if ((n = this.regexp.face_vertex_uv.exec(i)) === null) {
                            if ((n = this.regexp.face_vertex_normal.exec(i)) === null) {
                                if ((n = this.regexp.face_vertex.exec(i)) === null) {
                                    throw new Error("Unexpected face line: '" + i + "'");
                                }
                                t.addFace(n[1], n[2], n[3], n[4]);
                            } else {
                                t.addFace(
                                    n[1],
                                    n[3],
                                    n[5],
                                    n[7],
                                    undefined,
                                    undefined,
                                    undefined,
                                    undefined,
                                    n[2],
                                    n[4],
                                    n[6],
                                    n[8]
                                );
                            }
                        } else {
                            t.addFace(n[1], n[3], n[5], n[7], n[2], n[4], n[6], n[8]);
                        }
                    } else {
                        t.addFace(n[1], n[4], n[7], n[10], n[2], n[5], n[8], n[11], n[3], n[6], n[9], n[12]);
                    }
                } else if (a === "l") {
                    var h = i.substring(1).trim().split(" ");
                    var c = [];
                    var u = [];
                    if (i.indexOf("/") === -1) {
                        c = h;
                    } else {
                        var d = 0;
                        for (var f = h.length; d < f; d++) {
                            var m = h[d].split("/");
                            if (m[0] !== "") {
                                c.push(m[0]);
                            }
                            if (m[1] !== "") {
                                u.push(m[1]);
                            }
                        }
                    }
                    t.addLineGeometry(c, u);
                } else if ((n = this.regexp.object_pattern.exec(i)) === null) {
                    if (this.regexp.material_use_pattern.test(i)) {
                        t.object.startMaterial(i.substring(7).trim(), t.materialLibraries);
                    } else if (this.regexp.material_library_pattern.test(i)) {
                        t.materialLibraries.push(i.substring(7).trim());
                    } else {
                        if ((n = this.regexp.smoothing_pattern.exec(i)) === null) {
                            if (i === "\0") {
                                continue;
                            }
                            throw new Error("Unexpected line: '" + i + "'");
                        }
                        var g = n[1].trim().toLowerCase();
                        t.object.smooth = g === "1" || g === "on";
                        if ((R = t.object.currentMaterial())) {
                            R.smooth = t.object.smooth;
                        }
                    }
                } else {
                    var y = n[0].substr(1).trim();
                    t.startObject(y);
                }
            }
        }
        t.finalize();
        var v = new THREE.Group();
        v.materialLibraries = [].concat(t.materialLibraries);
        p = 0;
        for (l = t.objects.length; p < l; p++) {
            var b = t.objects[p];
            var x = b.geometry;
            var P = b.materials;
            var w = x.type === "Line";
            if (x.vertices.length !== 0) {
                var S = new THREE.BufferGeometry();
                S.addAttribute("position", new THREE.BufferAttribute(new Float32Array(x.vertices), 3));
                if (x.normals.length > 0) {
                    S.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(x.normals), 3));
                } else {
                    S.computeVertexNormals();
                }
                if (x.uvs.length > 0) {
                    S.addAttribute("uv", new THREE.BufferAttribute(new Float32Array(x.uvs), 2));
                }
                var E;
                var T = [];
                var k = 0;
                for (var O = P.length; k < O; k++) {
                    var Z = P[k];
                    var R = undefined;
                    if (this.materials !== null) {
                        R = this.materials.create(Z.name);
                        if (w && R && !(R instanceof THREE.LineBasicMaterial)) {
                            var C = new THREE.LineBasicMaterial();
                            C.copy(R);
                            R = C;
                        }
                    }
                    if (!R) {
                        (R = w ? new THREE.LineBasicMaterial() : new THREE.MeshPhongMaterial()).name = Z.name;
                    }
                    R.shading = Z.smooth ? THREE.SmoothShading : THREE.FlatShading;
                    T.push(R);
                }
                if (T.length > 1) {
                    k = 0;
                    for (O = P.length; k < O; k++) {
                        Z = P[k];
                        S.addGroup(Z.groupStart, Z.groupCount, k);
                    }
                    var N = new THREE.MultiMaterial(T);
                    E = w ? new THREE.Line(S, N) : new THREE.Mesh(S, N);
                } else {
                    E = w ? new THREE.Line(S, T[0]) : new THREE.Mesh(S, T[0]);
                }
                E.name = b.name;
                v.add(E);
            }
        }
        console.timeEnd("OBJLoader");
        return v;
    },
};
THREE.CopyShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
        uvOffset: { type: "v2", value: new THREE.Vector2(0, 0) },
        opacity: { type: "f", value: 1 },
    },
    vertexShader: [
        "uniform vec2 uvScale;",
        "uniform vec2 uvOffset;",
        "varying vec2 vUv;",
        "varying vec2 vUvScaled;",
        "void main() {",
        "vUv = uv;",
        "vUvScaled = uv * uvScale + uvOffset;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}",
    ].join("\n"),
    fragmentShader: [
        "uniform float opacity;",
        "uniform sampler2D tDiffuse;",
        "varying vec2 vUvScaled;",
        "void main() {",
        "vec4 texel = texture2D( tDiffuse, vUvScaled );",
        "gl_FragColor = opacity * texel;",
        "}",
    ].join("\n"),
};
THREE.RenderPass = function (e, t, r, i, a) {
    this.scene = e;
    this.camera = t;
    this.overrideMaterial = r;
    this.clearColor = i;
    this.clearAlpha = undefined !== a ? a : 1;
    this.enabled = true;
    this.clear = true;
    this.needsSwap = false;
};
THREE.RenderPass.prototype = {
    render: function (e, t, r, i) {
        this.scene.overrideMaterial = this.overrideMaterial;
        this.envMap.render(e);
        this.motionBlur.render(e);
        e.render(this.scene, this.camera, t, i);
        this.scene.overrideMaterial = null;
    },
};
THREE.ShaderPass = function (e) {
    this.material = e;
    this.uniforms = e.uniforms;
    this.renderToScreen = false;
    this.enabled = true;
    this.needsSwap = true;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene.add(this.camera);
    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);
    this.scene.add(this.quad);
};
THREE.ShaderPass.prototype = {
    render: function (e, t, r, i) {
        if (r) {
            this.uniforms.tDiffuse.value = r.texture;
        }
        e.render(this.scene, this.camera, t, i);
    },
};
THREE.BlendPass = function (e) {
    THREE.ShaderPass.call(this, e);
    this.bgMaterial = new THREE.ShaderMaterial({
        vertexShader: THREE.CopyShader.vertexShader,
        fragmentShader: THREE.CopyShader.fragmentShader,
        uniforms: THREE.UniformsUtils.clone(THREE.CopyShader.uniforms),
    });
    this.bg = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.bgMaterial);
    this.bg.position.set(0, 0, -1);
    this.scene.add(this.bg);
};
THREE.BlendPass.prototype = {
    render: function (e, t, r, i) {
        this.uniforms.tBG.value = r.texture;
        this.bgMaterial.uniforms.tDiffuse.value = r.texture;
        e.render(this.scene, this.camera, t, i);
    },
};
THREE.OverlayPass = function (e) {
    THREE.BlendPass.call(this, e);
};
THREE.OverlayPass.prototype = {
    render: function (e, t, r, i) {
        this.uniforms.tBG.value = r.texture;
        this.bgMaterial.uniforms.tDiffuse.value = r.texture;
        this.bgMaterial.uniforms.uvScale.value.copy(this.uniforms.uvScale.value);
        e.render(this.scene, this.camera, t, i);
    },
};
THREE.MixPass = function () {
    THREE.ShaderPass.call(
        this,
        new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse0: { type: "t", value: null },
                tDiffuse1: { type: "t", value: null },
                uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            },
            vertexShader: `
                uniform vec2 uvScale;
                varying vec2 vUv;
                varying vec2 vUvScaled;
                void main() {
                    vUv = uv;
                    vUvScaled = uv * uvScale;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
                `,
            fragmentShader: `
                uniform sampler2D tDiffuse0;
                uniform sampler2D tDiffuse1;
                varying vec2 vUvScaled;
                void main() {
                    vec4 texel = texture2D(tDiffuse0, vUvScaled) + texture2D(tDiffuse1, vUvScaled);
                    gl_FragColor = texel;
                }
                `,
        })
    );
};
THREE.MixPass.prototype = {
    render: function (e, t, r, i, a) {
        this.material.uniforms.tDiffuse0.value = r.texture;
        this.material.uniforms.tDiffuse1.value = i.texture;
        e.render(this.scene, this.camera, t, a);
    },
};
THREE.TTFLoader = function (e) {
    this.manager = undefined !== e ? e : THREE.DefaultLoadingManager;
    this.reversed = false;
};
THREE.TTFLoader.prototype.load = function (e, t, r, i) {
    var a = this;
    var s = new THREE.XHRLoader(this.manager);
    s.setResponseType("arraybuffer");
    s.load(
        e,
        function (e) {
            if (undefined !== t) {
                t(a.parse(e));
            }
        },
        r,
        i
    );
};
THREE.TTFLoader.prototype.parse = function (e) {
    function t(e) {
        var t;
        var r = [];
        e.forEach(function (e) {
            if (e.type.toLowerCase() === "m") {
                t = [e];
                r.push(t);
            } else if (e.type.toLowerCase() !== "z") {
                t.push(e);
            }
        });
        var i = [];
        r.forEach(function (e) {
            var t = { type: "m", x: e[e.length - 1].x, y: e[e.length - 1].y };
            i.push(t);
            for (var r = e.length - 1; r > 0; r--) {
                var a = e[r];
                t = { type: a.type };
                if (undefined !== a.x2 && undefined !== a.y2) {
                    t.x1 = a.x2;
                    t.y1 = a.y2;
                    t.x2 = a.x1;
                    t.y2 = a.y1;
                } else if (undefined !== a.x1 && undefined !== a.y1) {
                    t.x1 = a.x1;
                    t.y1 = a.y1;
                }
                t.x = e[r - 1].x;
                t.y = e[r - 1].y;
                i.push(t);
            }
        });
        return i;
    }
    if (typeof opentype == "undefined") {
        console.warn("TTFLoader requires opentype.js Make sure it's included before using the loader");
        return null;
    }
    return (function (e, r) {
        var i = Math.round;
        var a = {};
        var s = 1e5 / (72 * (e.unitsPerEm || 2048));
        for (var n = 0; n < e.glyphs.length; n++) {
            var o = e.glyphs.glyphs[n];
            if (undefined !== o.unicode) {
                var p = { ha: i(o.advanceWidth * s), x_min: i(o.xMin * s), x_max: i(o.xMax * s), o: "" };
                if (r) {
                    o.path.commands = t(o.path.commands);
                }
                o.path.commands.forEach(function (e, t) {
                    if (e.type.toLowerCase() === "c") {
                        e.type = "b";
                    }
                    p.o += e.type.toLowerCase() + " ";
                    if (undefined !== e.x && undefined !== e.y) {
                        p.o += i(e.x * s) + " " + i(e.y * s) + " ";
                    }
                    if (undefined !== e.x1 && undefined !== e.y1) {
                        p.o += i(e.x1 * s) + " " + i(e.y1 * s) + " ";
                    }
                    if (undefined !== e.x2 && undefined !== e.y2) {
                        p.o += i(e.x2 * s) + " " + i(e.y2 * s) + " ";
                    }
                });
                a[String.fromCharCode(o.unicode)] = p;
            }
        }
        return {
            glyphs: a,
            familyName: e.familyName || e.tables.name.fontFamily.en,
            ascender: i(e.ascender * s),
            descender: i(e.descender * s),
            underlinePosition: e.tables.post.underlinePosition,
            underlineThickness: e.tables.post.underlineThickness,
            boundingBox: {
                xMin: e.tables.head.xMin,
                xMax: e.tables.head.xMax,
                yMin: e.tables.head.yMin,
                yMax: e.tables.head.yMax,
            },
            resolution: 1e3,
            original_font_information: e.tables.name,
        };
    })(opentype.parse(e), this.reversed);
};
PZ.downloadBlob = null;
if (typeof ISNODE == "undefined") {
    ISNODE = false;
}
PZ.expression = class {
    constructor(e) {
        this.source = e;
        this.error = null;
        this.fn = this.parse(e);
    }
    toJSON() {
        return this.source;
    }
    parse(e) {
        let t = this.noop;
        try {
            let r;
            let i = acorn.parse(e);
            let a = ["frame", "time", "methods", "properties"];
            let s = Object.keys(PZ.expression.methods);
            let n = [];
            let o = astring.baseGenerator.VariableDeclarator;
            astring.baseGenerator.ArrowFunctionExpression;
            let p = astring.baseGenerator.VariableDeclaration;
            let l = Object.assign({}, astring.baseGenerator, {
                Program: function (e, t) {
                    var r = t.indent.repeat(t.indentLevel);
                    var i = t.lineEnd;
                    var a = e.body;
                    var s = a.length;
                    for (var n = 0; n < s; n++) {
                        var o = a[n];
                        t.write(r);
                        if (n === s - 1 && o.type === "ExpressionStatement") {
                            t.write("return ");
                        }
                        this[o.type](o, t);
                        t.write(i);
                    }
                },
                Identifier: function (e, t) {
                    if (n.includes(e.name) || a.includes(e.name)) {
                        t.write(e.name);
                    } else if (s.includes(e.name)) {
                        t.write("methods." + e.name);
                    } else {
                        if (!Math.hasOwnProperty(e.name)) {
                            throw new ReferenceError(e.name + " is not defined");
                        }
                        t.write("Math." + e.name);
                    }
                },
                VariableDeclaration: function (e, t) {
                    if (e.kind !== "var") {
                        throw new SyntaxError("'" + e.kind + "' declaration is not supported");
                    }
                    p.call(this, e, t);
                },
                VariableDeclarator: function (e, t) {
                    if (e.id.type === "Identifier") {
                        n.push(e.id.name);
                    }
                    o.call(this, e, t);
                },
                ArrowFunctionExpression: function (e, t) {
                    throw new SyntaxError("arrow functions are not supported");
                },
                ThrowStatement: function (e, t) {
                    throw new SyntaxError("'throw' is not allowed");
                },
                DebuggerStatement: function (e, t) {
                    throw new SyntaxError("'debugger' is not allowed");
                },
                ClassDeclaration: function (e, t) {
                    throw new SyntaxError("class declaration is not supported");
                },
                FunctionDeclaration: (r = function (e, t) {
                    throw new SyntaxError("functions are not supported");
                }),
                FunctionExpression: r,
                ThisExpression: function (e, t) {
                    throw new ReferenceError("'this' is not defined");
                },
                Super: function (e, t) {
                    throw new ReferenceError("'super' is not defined");
                },
            });

            let h = astring.generate(i, { generator: l });

            if (ISNODE) {
                t = new Function(...a, h);
            } else {
                let e = document.createElement("iframe");
                e.setAttribute("sandbox", "allow-scripts allow-same-origin");
                document.body.appendChild(e);
                let r = e.contentWindow.Function;
                let i = Object.keys(e.contentWindow);
                e.remove();
                t = r(...a, ...i, h);
            }
        } catch (e) {
            console.log(e);
            this.error = e.toString();
            t = this.noop;
        }
        return t;
    }
    noop() {}
    getCustomProperties(e, t) {
        let r = t.parentObject.customProperties;
        if (r) {
            let t = {};
            for (let i = 0; i < r.length; i++) {
                let a = r[i].get(e);
                t[r[i].properties.name.get()] = a;
            }
            return t;
        }
        return Object.prototype;
    }
    evaluate(e, t) {
        try {
            let r = t.tryGetParentOfType(PZ.clip);
            let i = r ? r.properties.time.get(e) : 0;
            let a = this.getCustomProperties(e, t);
            return this.fn(e, i, PZ.expression.methods, a);
        } catch (e) {
            return undefined;
        }
    }
};
PZ.expression.methods = {
    add(e, t) {
        let r = new Array(Math.max(e.length, t.length));
        let i = Math.min(e.length, t.length);
        for (let a = 0; a < i; a++) {
            r[a] = e[a] + t[a];
        }
        return r;
    },
    sub(e, t) {
        let r = new Array(Math.max(e.length, t.length));
        let i = Math.min(e.length, t.length);
        for (let a = 0; a < i; a++) {
            r[a] = e[a] - t[a];
        }
        return r;
    },
    mul(e, t) {
        let r = new Array(e.length);
        for (let i = 0; i < e.length; i++) {
            r[i] = e[i] * t;
        }
        return r;
    },
    div(e, t) {
        return this.mul(e, 1 / t);
    },
    clamp(e, t, r) {
        let i = new Array(e.length);
        for (let a = 0; a < e.length; a++) {
            i[a] = Math.min(Math.max(e[a], t), r);
        }
        return i;
    },
    dot(e, t) {
        let r = Math.min(e.length, t.length);
        let i = 0;
        for (let a = 0; a < r; a++) {
            i += e[a] * t[a];
        }
        return i;
    },
    cross(e, t) {
        if (e.length === 3) {
            let r = new Array(3);
            r[0] = e[1] * t[2] - e[2] * t[1];
            r[1] = e[2] * t[0] - e[0] * t[2];
            r[2] = e[0] * t[1] - e[1] * t[0];
            return r;
        }
    },
    normalize(e) {
        return this.div(e, this.length(e));
    },
    length(e, t) {
        if (t) {
            return this.length(this.sub(e, t));
        }
        let r = 0;
        for (let t = 0; t < e.length; t++) {
            r += Math.pow(e[t], 2);
        }
        return Math.sqrt(r);
    },
    wave: (e) => 2 * (1 & e) - 1,
    lerp(e, t, r) {
        return this.linear(e, t, r);
    },
    linear: (e, t, r) => PZ.tween.linear(e, t, r),
    catmullRom: (e, t, r, i, a) => PZ.tween.catmullRom(e, t, r, i, a),
    ease: (e, t = "Quadratic", r = "InOut") => PZ.tween.easing[t][r](e),
    shake(e, t = 1, r = 0, i = 1, a = 0, s = 1) {
        let n = e * t + r;
        let o = Math.floor(n);
        let p = o + 1;
        let l = n - o;
        if (s) {
            l = l * l * (3 - 2 * l);
        }
        let h = i * this.wave(o) + 2 * a * (this.random(o) - 0.5);
        let c = i * this.wave(p) + 2 * a * (this.random(p) - 0.5);
        return this.lerp(h, c, l);
    },
    random(e) {
        let t = 1e4 * Math.sin(e);
        return t - Math.floor(t);
    },
    gaussRandom(e, t = 0.5, r = 0.25) {
        var i = 0;
        for (var a = 0; a < 5; a++) {
            i += this.random(e * a);
        }
        return (r * (i - 2.5)) / 2.5 + t;
    },
};
(function (e, t) {
    !(function (e) {
        var t = {
                3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
                5: "class enum extends super const export import",
                6: "enum",
                strict: "implements interface let package private protected public static yield",
                strictBind: "eval arguments",
            },
            r =
                "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this",
            i = { 5: r, 6: r + " const class extends export import super" },
            a = /^in(stanceof)?$/,
            s =
                "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙՠ-ֈא-תׯ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࡠ-ࡪࢠ-ࢴࢶ-ࢽऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱৼਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౠౡಀಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൔ-ൖൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡸᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᲀ-ᲈᲐ-ᲺᲽ-Ჿᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄯㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿯ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞹꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꣾꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ",
            n =
                "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߽߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛࣓-ࣣ࣡-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯৾ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ૺ-૿ଁ-ଃ଼ା-ୄେୈୋ-୍ୖୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఄా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ഀ-ഃ഻഼ാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ංඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ູົຼ່-ໍ໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜔ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠐-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭ᳲ-᳴᳷-᳹᷀-᷹᷻-᷿‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧꢀꢁꢴ-ꣅ꣐-꣙꣠-꣱ꣿ-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿",
            o = new RegExp("[" + s + "]"),
            p = new RegExp("[" + s + n + "]");
        s = n = null;
        var l = [
                0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29,
                3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 157, 310, 10, 21, 11, 7, 153, 5, 3, 0, 2, 43,
                2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2,
                28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 477,
                28, 11, 0, 9, 21, 190, 52, 76, 44, 33, 24, 27, 35, 30, 0, 12, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36,
                17, 2, 24, 85, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13,
                4, 159, 52, 19, 3, 54, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 86, 26, 230, 43, 117, 63,
                32, 0, 257, 0, 11, 39, 8, 0, 22, 0, 12, 39, 3, 3, 20, 0, 35, 56, 264, 8, 2, 36, 18, 0, 50, 29, 113, 6,
                2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 270, 921, 103, 110, 18, 195, 2749, 1070, 4050,
                582, 8634, 568, 8, 30, 114, 29, 19, 47, 17, 3, 32, 20, 6, 18, 689, 63, 129, 68, 12, 0, 67, 12, 65, 1,
                31, 6129, 15, 754, 9486, 286, 82, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1,
                3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24,
                2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 4149, 196, 60, 67, 1213, 3, 2, 26, 2, 1,
                2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2,
                0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42710, 42, 4148, 12,
                221, 3, 5761, 15, 7472, 3104, 541,
            ],
            h = [
                509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 525, 10, 176, 2,
                54, 14, 32, 9, 16, 3, 46, 10, 54, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 4, 9, 83, 11,
                7, 0, 161, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 193, 17, 10, 9, 5, 0, 82,
                19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 84, 14, 5, 9, 243, 14, 166, 9, 280, 9, 41,
                6, 2, 3, 9, 0, 10, 10, 47, 15, 406, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9,
                49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 19306, 9, 135, 4, 60, 6, 26, 9, 1016, 45, 17, 3, 19723, 1, 5319, 4, 4,
                5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6,
                2, 1, 2, 4, 2214, 6, 110, 6, 6, 9, 792487, 239,
            ];
        function c(e, t) {
            for (var r = 65536, i = 0; i < t.length; i += 2) {
                if ((r += t[i]) > e) return false;
                if ((r += t[i + 1]) >= e) return true;
            }
        }
        function u(e, t) {
            return e < 65
                ? 36 === e
                : e < 91 ||
                      (e < 97
                          ? 95 === e
                          : e < 123 ||
                            (e <= 65535 ? e >= 170 && o.test(String.fromCharCode(e)) : false !== t && c(e, l)));
        }
        function d(e, t) {
            return e < 48
                ? 36 === e
                : e < 58 ||
                      (!(e < 65) &&
                          (e < 91 ||
                              (e < 97
                                  ? 95 === e
                                  : e < 123 ||
                                    (e <= 65535
                                        ? e >= 170 && p.test(String.fromCharCode(e))
                                        : false !== t && (c(e, l) || c(e, h))))));
        }
        var f = function (e, t) {
            undefined === t && (t = {}),
                (this.label = e),
                (this.keyword = t.keyword),
                (this.beforeExpr = !!t.beforeExpr),
                (this.startsExpr = !!t.startsExpr),
                (this.isLoop = !!t.isLoop),
                (this.isAssign = !!t.isAssign),
                (this.prefix = !!t.prefix),
                (this.postfix = !!t.postfix),
                (this.binop = t.binop || null),
                (this.updateContext = null);
        };
        function m(e, t) {
            return new f(e, { beforeExpr: true, binop: t });
        }
        var y = { beforeExpr: true },
            g = { startsExpr: true },
            v = {};
        function b(e, t) {
            return undefined === t && (t = {}), (t.keyword = e), (v[e] = new f(e, t));
        }
        var x = {
                num: new f("num", g),
                regexp: new f("regexp", g),
                string: new f("string", g),
                name: new f("name", g),
                eof: new f("eof"),
                bracketL: new f("[", { beforeExpr: true, startsExpr: true }),
                bracketR: new f("]"),
                braceL: new f("{", { beforeExpr: true, startsExpr: true }),
                braceR: new f("}"),
                parenL: new f("(", { beforeExpr: true, startsExpr: true }),
                parenR: new f(")"),
                comma: new f(",", y),
                semi: new f(";", y),
                colon: new f(":", y),
                dot: new f("."),
                question: new f("?", y),
                arrow: new f("=>", y),
                template: new f("template"),
                invalidTemplate: new f("invalidTemplate"),
                ellipsis: new f("...", y),
                backQuote: new f("`", g),
                dollarBraceL: new f("${", { beforeExpr: true, startsExpr: true }),
                eq: new f("=", { beforeExpr: true, isAssign: true }),
                assign: new f("_=", { beforeExpr: true, isAssign: true }),
                incDec: new f("++/--", { prefix: true, postfix: true, startsExpr: true }),
                prefix: new f("!/~", { beforeExpr: true, prefix: true, startsExpr: true }),
                logicalOR: m("||", 1),
                logicalAND: m("&&", 2),
                bitwiseOR: m("|", 3),
                bitwiseXOR: m("^", 4),
                bitwiseAND: m("&", 5),
                equality: m("==/!=/===/!==", 6),
                relational: m("</>/<=/>=", 7),
                bitShift: m("<</>>/>>>", 8),
                plusMin: new f("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
                modulo: m("%", 10),
                star: m("*", 10),
                slash: m("/", 10),
                starstar: new f("**", { beforeExpr: true }),
                _break: b("break"),
                _case: b("case", y),
                _catch: b("catch"),
                _continue: b("continue"),
                _debugger: b("debugger"),
                _default: b("default", y),
                _do: b("do", { isLoop: true, beforeExpr: true }),
                _else: b("else", y),
                _finally: b("finally"),
                _for: b("for", { isLoop: true }),
                _function: b("function", g),
                _if: b("if"),
                _return: b("return", y),
                _switch: b("switch"),
                _throw: b("throw", y),
                _try: b("try"),
                _var: b("var"),
                _const: b("const"),
                _while: b("while", { isLoop: true }),
                _with: b("with"),
                _new: b("new", { beforeExpr: true, startsExpr: true }),
                _this: b("this", g),
                _super: b("super", g),
                _class: b("class", g),
                _extends: b("extends", y),
                _export: b("export"),
                _import: b("import"),
                _null: b("null", g),
                _true: b("true", g),
                _false: b("false", g),
                _in: b("in", { beforeExpr: true, binop: 7 }),
                _instanceof: b("instanceof", { beforeExpr: true, binop: 7 }),
                _typeof: b("typeof", { beforeExpr: true, prefix: true, startsExpr: true }),
                _void: b("void", { beforeExpr: true, prefix: true, startsExpr: true }),
                _delete: b("delete", { beforeExpr: true, prefix: true, startsExpr: true }),
            },
            P = /\r\n?|\n|\u2028|\u2029/,
            w = new RegExp(P.source, "g");
        function S(e, t) {
            return 10 === e || 13 === e || (!t && (8232 === e || 8233 === e));
        }
        var E = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/,
            T = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g,
            k = Object.prototype,
            O = k.hasOwnProperty,
            Z = k.toString;
        function R(e, t) {
            return O.call(e, t);
        }
        var C =
                Array.isArray ||
                function (e) {
                    return "[object Array]" === Z.call(e);
                },
            N = function (e, t) {
                (this.line = e), (this.column = t);
            };
        N.prototype.offset = function (e) {
            return new N(this.line, this.column + e);
        };
        var L = function (e, t, r) {
            (this.start = t), (this.end = r), null !== e.sourceFile && (this.source = e.sourceFile);
        };
        function M(e, t) {
            for (var r = 1, i = 0; ; ) {
                w.lastIndex = i;
                var a = w.exec(e);
                if (!(a && a.index < t)) return new N(r, t - i);
                ++r, (i = a.index + a[0].length);
            }
        }
        var U = {
            ecmaVersion: 9,
            sourceType: "script",
            onInsertedSemicolon: null,
            onTrailingComma: null,
            allowReserved: null,
            allowReturnOutsideFunction: false,
            allowImportExportEverywhere: false,
            allowAwaitOutsideFunction: false,
            allowHashBang: false,
            locations: false,
            onToken: null,
            onComment: null,
            ranges: false,
            program: null,
            sourceFile: null,
            directSourceFile: null,
            preserveParens: false,
        };
        function I(e) {
            var t = {};
            for (var r in U) t[r] = e && R(e, r) ? e[r] : U[r];
            if (
                (t.ecmaVersion >= 2015 && (t.ecmaVersion -= 2009),
                null == t.allowReserved && (t.allowReserved = t.ecmaVersion < 5),
                C(t.onToken))
            ) {
                var i = t.onToken;
                t.onToken = function (e) {
                    return i.push(e);
                };
            }
            return (
                C(t.onComment) &&
                    (t.onComment = (function (e, t) {
                        return function (r, i, a, s, n, o) {
                            var p = { type: r ? "Block" : "Line", value: i, start: a, end: s };
                            e.locations && (p.loc = new L(this, n, o)), e.ranges && (p.range = [a, s]), t.push(p);
                        };
                    })(t, t.onComment)),
                t
            );
        }
        var j = 2,
            A = 1 | j,
            D = 4,
            B = 8;
        function _(e, t) {
            return j | (e ? D : 0) | (t ? B : 0);
        }
        function F(e) {
            return new RegExp("^(?:" + e.replace(/ /g, "|") + ")$");
        }
        var G = function (e, r, a) {
                (this.options = e = I(e)),
                    (this.sourceFile = e.sourceFile),
                    (this.keywords = F(i[e.ecmaVersion >= 6 ? 6 : 5]));
                var s = "";
                if (!e.allowReserved) {
                    for (var n = e.ecmaVersion; !(s = t[n]); n--);
                    "module" === e.sourceType && (s += " await");
                }
                this.reservedWords = F(s);
                var o = (s ? s + " " : "") + t.strict;
                (this.reservedWordsStrict = F(o)),
                    (this.reservedWordsStrictBind = F(o + " " + t.strictBind)),
                    (this.input = String(r)),
                    (this.containsEsc = false),
                    a
                        ? ((this.pos = a),
                          (this.lineStart = this.input.lastIndexOf("\n", a - 1) + 1),
                          (this.curLine = this.input.slice(0, this.lineStart).split(P).length))
                        : ((this.pos = this.lineStart = 0), (this.curLine = 1)),
                    (this.type = x.eof),
                    (this.value = null),
                    (this.start = this.end = this.pos),
                    (this.startLoc = this.endLoc = this.curPosition()),
                    (this.lastTokEndLoc = this.lastTokStartLoc = null),
                    (this.lastTokStart = this.lastTokEnd = this.pos),
                    (this.context = this.initialContext()),
                    (this.exprAllowed = true),
                    (this.inModule = "module" === e.sourceType),
                    (this.strict = this.inModule || this.strictDirective(this.pos)),
                    (this.potentialArrowAt = -1),
                    (this.yieldPos = this.awaitPos = 0),
                    (this.labels = []),
                    0 === this.pos && e.allowHashBang && "#!" === this.input.slice(0, 2) && this.skipLineComment(2),
                    (this.scopeStack = []),
                    this.enterScope(1),
                    (this.regexpState = null);
            },
            V = {
                inFunction: { configurable: true },
                inGenerator: { configurable: true },
                inAsync: { configurable: true },
                allowSuper: { configurable: true },
                allowDirectSuper: { configurable: true },
            };
        (G.prototype.parse = function () {
            var e = this.options.program || this.startNode();
            return this.nextToken(), this.parseTopLevel(e);
        }),
            (V.inFunction.get = function () {
                return (this.currentVarScope().flags & j) > 0;
            }),
            (V.inGenerator.get = function () {
                return (this.currentVarScope().flags & B) > 0;
            }),
            (V.inAsync.get = function () {
                return (this.currentVarScope().flags & D) > 0;
            }),
            (V.allowSuper.get = function () {
                return (64 & this.currentThisScope().flags) > 0;
            }),
            (V.allowDirectSuper.get = function () {
                return (128 & this.currentThisScope().flags) > 0;
            }),
            (G.prototype.inNonArrowFunction = function () {
                return (this.currentThisScope().flags & j) > 0;
            }),
            (G.extend = function () {
                for (var e = [], t = arguments.length; t--; ) e[t] = arguments[t];
                for (var r = this, i = 0; i < e.length; i++) r = e[i](r);
                return r;
            }),
            (G.parse = function (e, t) {
                return new this(t, e).parse();
            }),
            (G.parseExpressionAt = function (e, t, r) {
                var i = new this(r, e, t);
                return i.nextToken(), i.parseExpression();
            }),
            (G.tokenizer = function (e, t) {
                return new this(t, e);
            }),
            Object.defineProperties(G.prototype, V);
        var H = G.prototype,
            z = /^(?:'((?:\\.|[^'])*?)'|"((?:\\.|[^"])*?)"|;)/;
        function q() {
            this.shorthandAssign =
                this.trailingComma =
                this.parenthesizedAssign =
                this.parenthesizedBind =
                this.doubleProto =
                    -1;
        }
        (H.strictDirective = function (e) {
            for (;;) {
                (T.lastIndex = e), (e += T.exec(this.input)[0].length);
                var t = z.exec(this.input.slice(e));
                if (!t) return false;
                if ("use strict" === (t[1] || t[2])) return true;
                e += t[0].length;
            }
        }),
            (H.eat = function (e) {
                return this.type === e && (this.next(), true);
            }),
            (H.isContextual = function (e) {
                return this.type === x.name && this.value === e && !this.containsEsc;
            }),
            (H.eatContextual = function (e) {
                return !!this.isContextual(e) && (this.next(), true);
            }),
            (H.expectContextual = function (e) {
                this.eatContextual(e) || this.unexpected();
            }),
            (H.canInsertSemicolon = function () {
                return (
                    this.type === x.eof ||
                    this.type === x.braceR ||
                    P.test(this.input.slice(this.lastTokEnd, this.start))
                );
            }),
            (H.insertSemicolon = function () {
                if (this.canInsertSemicolon())
                    return (
                        this.options.onInsertedSemicolon &&
                            this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc),
                        true
                    );
            }),
            (H.semicolon = function () {
                this.eat(x.semi) || this.insertSemicolon() || this.unexpected();
            }),
            (H.afterTrailingComma = function (e, t) {
                if (this.type === e)
                    return (
                        this.options.onTrailingComma &&
                            this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc),
                        t || this.next(),
                        true
                    );
            }),
            (H.expect = function (e) {
                this.eat(e) || this.unexpected();
            }),
            (H.unexpected = function (e) {
                this.raise(null != e ? e : this.start, "Unexpected token");
            }),
            (H.checkPatternErrors = function (e, t) {
                if (e) {
                    e.trailingComma > -1 &&
                        this.raiseRecoverable(e.trailingComma, "Comma is not permitted after the rest element");
                    var r = t ? e.parenthesizedAssign : e.parenthesizedBind;
                    r > -1 && this.raiseRecoverable(r, "Parenthesized pattern");
                }
            }),
            (H.checkExpressionErrors = function (e, t) {
                if (!e) return false;
                var r = e.shorthandAssign,
                    i = e.doubleProto;
                if (!t) return r >= 0 || i >= 0;
                r >= 0 && this.raise(r, "Shorthand property assignments are valid only in destructuring patterns"),
                    i >= 0 && this.raiseRecoverable(i, "Redefinition of __proto__ property");
            }),
            (H.checkYieldAwaitInDefaultParams = function () {
                this.yieldPos &&
                    (!this.awaitPos || this.yieldPos < this.awaitPos) &&
                    this.raise(this.yieldPos, "Yield expression cannot be a default value"),
                    this.awaitPos && this.raise(this.awaitPos, "Await expression cannot be a default value");
            }),
            (H.isSimpleAssignTarget = function (e) {
                return "ParenthesizedExpression" === e.type
                    ? this.isSimpleAssignTarget(e.expression)
                    : "Identifier" === e.type || "MemberExpression" === e.type;
            });
        var W = G.prototype;
        W.parseTopLevel = function (e) {
            var t = {};
            for (e.body || (e.body = []); this.type !== x.eof; ) {
                var r = this.parseStatement(null, true, t);
                e.body.push(r);
            }
            return (
                this.adaptDirectivePrologue(e.body),
                this.next(),
                this.options.ecmaVersion >= 6 && (e.sourceType = this.options.sourceType),
                this.finishNode(e, "Program")
            );
        };
        var X = { kind: "loop" },
            Y = { kind: "switch" };
        (W.isLet = function () {
            if (this.options.ecmaVersion < 6 || !this.isContextual("let")) return false;
            T.lastIndex = this.pos;
            var e = T.exec(this.input),
                t = this.pos + e[0].length,
                r = this.input.charCodeAt(t);
            if (91 === r || 123 === r) return true;
            if (u(r, true)) {
                for (var i = t + 1; d(this.input.charCodeAt(i), true); ) ++i;
                var s = this.input.slice(t, i);
                if (!a.test(s)) return true;
            }
            return false;
        }),
            (W.isAsyncFunction = function () {
                if (this.options.ecmaVersion < 8 || !this.isContextual("async")) return false;
                T.lastIndex = this.pos;
                var e = T.exec(this.input),
                    t = this.pos + e[0].length;
                return !(
                    P.test(this.input.slice(this.pos, t)) ||
                    "function" !== this.input.slice(t, t + 8) ||
                    (t + 8 !== this.input.length && d(this.input.charAt(t + 8)))
                );
            }),
            (W.parseStatement = function (e, t, r) {
                var i,
                    a = this.type,
                    s = this.startNode();
                switch ((this.isLet() && ((a = x._var), (i = "let")), a)) {
                    case x._break:
                    case x._continue:
                        return this.parseBreakContinueStatement(s, a.keyword);
                    case x._debugger:
                        return this.parseDebuggerStatement(s);
                    case x._do:
                        return this.parseDoStatement(s);
                    case x._for:
                        return this.parseForStatement(s);
                    case x._function:
                        return (
                            e && (this.strict || "if" !== e) && this.options.ecmaVersion >= 6 && this.unexpected(),
                            this.parseFunctionStatement(s, false, !e)
                        );
                    case x._class:
                        return e && this.unexpected(), this.parseClass(s, true);
                    case x._if:
                        return this.parseIfStatement(s);
                    case x._return:
                        return this.parseReturnStatement(s);
                    case x._switch:
                        return this.parseSwitchStatement(s);
                    case x._throw:
                        return this.parseThrowStatement(s);
                    case x._try:
                        return this.parseTryStatement(s);
                    case x._const:
                    case x._var:
                        return (
                            (i = i || this.value), e && "var" !== i && this.unexpected(), this.parseVarStatement(s, i)
                        );
                    case x._while:
                        return this.parseWhileStatement(s);
                    case x._with:
                        return this.parseWithStatement(s);
                    case x.braceL:
                        return this.parseBlock(true, s);
                    case x.semi:
                        return this.parseEmptyStatement(s);
                    case x._export:
                    case x._import:
                        return (
                            this.options.allowImportExportEverywhere ||
                                (t || this.raise(this.start, "'import' and 'export' may only appear at the top level"),
                                this.inModule ||
                                    this.raise(
                                        this.start,
                                        "'import' and 'export' may appear only with 'sourceType: module'"
                                    )),
                            a === x._import ? this.parseImport(s) : this.parseExport(s, r)
                        );
                    default:
                        if (this.isAsyncFunction())
                            return e && this.unexpected(), this.next(), this.parseFunctionStatement(s, true, !e);
                        var n = this.value,
                            o = this.parseExpression();
                        return a === x.name && "Identifier" === o.type && this.eat(x.colon)
                            ? this.parseLabeledStatement(s, n, o, e)
                            : this.parseExpressionStatement(s, o);
                }
            }),
            (W.parseBreakContinueStatement = function (e, t) {
                var r = "break" === t;
                this.next(),
                    this.eat(x.semi) || this.insertSemicolon()
                        ? (e.label = null)
                        : this.type !== x.name
                        ? this.unexpected()
                        : ((e.label = this.parseIdent()), this.semicolon());
                for (var i = 0; i < this.labels.length; ++i) {
                    var a = this.labels[i];
                    if (null == e.label || a.name === e.label.name) {
                        if (null != a.kind && (r || "loop" === a.kind)) break;
                        if (e.label && r) break;
                    }
                }
                return (
                    i === this.labels.length && this.raise(e.start, "Unsyntactic " + t),
                    this.finishNode(e, r ? "BreakStatement" : "ContinueStatement")
                );
            }),
            (W.parseDebuggerStatement = function (e) {
                return this.next(), this.semicolon(), this.finishNode(e, "DebuggerStatement");
            }),
            (W.parseDoStatement = function (e) {
                return (
                    this.next(),
                    this.labels.push(X),
                    (e.body = this.parseStatement("do")),
                    this.labels.pop(),
                    this.expect(x._while),
                    (e.test = this.parseParenExpression()),
                    this.options.ecmaVersion >= 6 ? this.eat(x.semi) : this.semicolon(),
                    this.finishNode(e, "DoWhileStatement")
                );
            }),
            (W.parseForStatement = function (e) {
                this.next();
                var t =
                    this.options.ecmaVersion >= 9 &&
                    (this.inAsync || (!this.inFunction && this.options.allowAwaitOutsideFunction)) &&
                    this.eatContextual("await")
                        ? this.lastTokStart
                        : -1;
                if ((this.labels.push(X), this.enterScope(0), this.expect(x.parenL), this.type === x.semi))
                    return t > -1 && this.unexpected(t), this.parseFor(e, null);
                var r = this.isLet();
                if (this.type === x._var || this.type === x._const || r) {
                    var i = this.startNode(),
                        a = r ? "let" : this.value;
                    return (
                        this.next(),
                        this.parseVar(i, true, a),
                        this.finishNode(i, "VariableDeclaration"),
                        !(this.type === x._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) ||
                        1 !== i.declarations.length ||
                        ("var" !== a && i.declarations[0].init)
                            ? (t > -1 && this.unexpected(t), this.parseFor(e, i))
                            : (this.options.ecmaVersion >= 9 &&
                                  (this.type === x._in ? t > -1 && this.unexpected(t) : (e.await = t > -1)),
                              this.parseForIn(e, i))
                    );
                }
                var s = new q(),
                    n = this.parseExpression(true, s);
                return this.type === x._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))
                    ? (this.options.ecmaVersion >= 9 &&
                          (this.type === x._in ? t > -1 && this.unexpected(t) : (e.await = t > -1)),
                      this.toAssignable(n, false, s),
                      this.checkLVal(n),
                      this.parseForIn(e, n))
                    : (this.checkExpressionErrors(s, true), t > -1 && this.unexpected(t), this.parseFor(e, n));
            }),
            (W.parseFunctionStatement = function (e, t, r) {
                return this.next(), this.parseFunction(e, K | (r ? 0 : Q), false, t);
            }),
            (W.parseIfStatement = function (e) {
                return (
                    this.next(),
                    (e.test = this.parseParenExpression()),
                    (e.consequent = this.parseStatement("if")),
                    (e.alternate = this.eat(x._else) ? this.parseStatement("if") : null),
                    this.finishNode(e, "IfStatement")
                );
            }),
            (W.parseReturnStatement = function (e) {
                return (
                    this.inFunction ||
                        this.options.allowReturnOutsideFunction ||
                        this.raise(this.start, "'return' outside of function"),
                    this.next(),
                    this.eat(x.semi) || this.insertSemicolon()
                        ? (e.argument = null)
                        : ((e.argument = this.parseExpression()), this.semicolon()),
                    this.finishNode(e, "ReturnStatement")
                );
            }),
            (W.parseSwitchStatement = function (e) {
                var t;
                this.next(),
                    (e.discriminant = this.parseParenExpression()),
                    (e.cases = []),
                    this.expect(x.braceL),
                    this.labels.push(Y),
                    this.enterScope(0);
                for (var r = false; this.type !== x.braceR; )
                    if (this.type === x._case || this.type === x._default) {
                        var i = this.type === x._case;
                        t && this.finishNode(t, "SwitchCase"),
                            e.cases.push((t = this.startNode())),
                            (t.consequent = []),
                            this.next(),
                            i
                                ? (t.test = this.parseExpression())
                                : (r && this.raiseRecoverable(this.lastTokStart, "Multiple default clauses"),
                                  (r = true),
                                  (t.test = null)),
                            this.expect(x.colon);
                    } else t || this.unexpected(), t.consequent.push(this.parseStatement(null));
                return (
                    this.exitScope(),
                    t && this.finishNode(t, "SwitchCase"),
                    this.next(),
                    this.labels.pop(),
                    this.finishNode(e, "SwitchStatement")
                );
            }),
            (W.parseThrowStatement = function (e) {
                return (
                    this.next(),
                    P.test(this.input.slice(this.lastTokEnd, this.start)) &&
                        this.raise(this.lastTokEnd, "Illegal newline after throw"),
                    (e.argument = this.parseExpression()),
                    this.semicolon(),
                    this.finishNode(e, "ThrowStatement")
                );
            });
        var J = [];
        (W.parseTryStatement = function (e) {
            if ((this.next(), (e.block = this.parseBlock()), (e.handler = null), this.type === x._catch)) {
                var t = this.startNode();
                if ((this.next(), this.eat(x.parenL))) {
                    t.param = this.parseBindingAtom();
                    var r = "Identifier" === t.param.type;
                    this.enterScope(r ? 32 : 0), this.checkLVal(t.param, r ? 4 : 2), this.expect(x.parenR);
                } else this.options.ecmaVersion < 10 && this.unexpected(), (t.param = null), this.enterScope(0);
                (t.body = this.parseBlock(false)), this.exitScope(), (e.handler = this.finishNode(t, "CatchClause"));
            }
            return (
                (e.finalizer = this.eat(x._finally) ? this.parseBlock() : null),
                e.handler || e.finalizer || this.raise(e.start, "Missing catch or finally clause"),
                this.finishNode(e, "TryStatement")
            );
        }),
            (W.parseVarStatement = function (e, t) {
                return (
                    this.next(), this.parseVar(e, false, t), this.semicolon(), this.finishNode(e, "VariableDeclaration")
                );
            }),
            (W.parseWhileStatement = function (e) {
                return (
                    this.next(),
                    (e.test = this.parseParenExpression()),
                    this.labels.push(X),
                    (e.body = this.parseStatement("while")),
                    this.labels.pop(),
                    this.finishNode(e, "WhileStatement")
                );
            }),
            (W.parseWithStatement = function (e) {
                return (
                    this.strict && this.raise(this.start, "'with' in strict mode"),
                    this.next(),
                    (e.object = this.parseParenExpression()),
                    (e.body = this.parseStatement("with")),
                    this.finishNode(e, "WithStatement")
                );
            }),
            (W.parseEmptyStatement = function (e) {
                return this.next(), this.finishNode(e, "EmptyStatement");
            }),
            (W.parseLabeledStatement = function (e, t, r, i) {
                for (var a = 0, s = this.labels; a < s.length; a += 1) {
                    var n = s[a];
                    n.name === t && this.raise(r.start, "Label '" + t + "' is already declared");
                }
                for (
                    var o = this.type.isLoop ? "loop" : this.type === x._switch ? "switch" : null,
                        p = this.labels.length - 1;
                    p >= 0;
                    p--
                ) {
                    var l = this.labels[p];
                    if (l.statementStart !== e.start) break;
                    (l.statementStart = this.start), (l.kind = o);
                }
                return (
                    this.labels.push({ name: t, kind: o, statementStart: this.start }),
                    (e.body = this.parseStatement(i)),
                    ("ClassDeclaration" === e.body.type ||
                        ("VariableDeclaration" === e.body.type && "var" !== e.body.kind) ||
                        ("FunctionDeclaration" === e.body.type && (this.strict || e.body.generator || e.body.async))) &&
                        this.raiseRecoverable(e.body.start, "Invalid labeled declaration"),
                    this.labels.pop(),
                    (e.label = r),
                    this.finishNode(e, "LabeledStatement")
                );
            }),
            (W.parseExpressionStatement = function (e, t) {
                return (e.expression = t), this.semicolon(), this.finishNode(e, "ExpressionStatement");
            }),
            (W.parseBlock = function (e, t) {
                for (
                    undefined === e && (e = true),
                        undefined === t && (t = this.startNode()),
                        t.body = [],
                        this.expect(x.braceL),
                        e && this.enterScope(0);
                    !this.eat(x.braceR);

                ) {
                    var r = this.parseStatement(null);
                    t.body.push(r);
                }
                return e && this.exitScope(), this.finishNode(t, "BlockStatement");
            }),
            (W.parseFor = function (e, t) {
                return (
                    (e.init = t),
                    this.expect(x.semi),
                    (e.test = this.type === x.semi ? null : this.parseExpression()),
                    this.expect(x.semi),
                    (e.update = this.type === x.parenR ? null : this.parseExpression()),
                    this.expect(x.parenR),
                    this.exitScope(),
                    (e.body = this.parseStatement("for")),
                    this.labels.pop(),
                    this.finishNode(e, "ForStatement")
                );
            }),
            (W.parseForIn = function (e, t) {
                var r = this.type === x._in ? "ForInStatement" : "ForOfStatement";
                return (
                    this.next(),
                    "ForInStatement" === r &&
                        ("AssignmentPattern" === t.type ||
                            ("VariableDeclaration" === t.type &&
                                null != t.declarations[0].init &&
                                (this.strict || "Identifier" !== t.declarations[0].id.type))) &&
                        this.raise(t.start, "Invalid assignment in for-in loop head"),
                    (e.left = t),
                    (e.right = "ForInStatement" === r ? this.parseExpression() : this.parseMaybeAssign()),
                    this.expect(x.parenR),
                    this.exitScope(),
                    (e.body = this.parseStatement("for")),
                    this.labels.pop(),
                    this.finishNode(e, r)
                );
            }),
            (W.parseVar = function (e, t, r) {
                for (e.declarations = [], e.kind = r; ; ) {
                    var i = this.startNode();
                    if (
                        (this.parseVarId(i, r),
                        this.eat(x.eq)
                            ? (i.init = this.parseMaybeAssign(t))
                            : "const" !== r ||
                              this.type === x._in ||
                              (this.options.ecmaVersion >= 6 && this.isContextual("of"))
                            ? "Identifier" === i.id.type || (t && (this.type === x._in || this.isContextual("of")))
                                ? (i.init = null)
                                : this.raise(
                                      this.lastTokEnd,
                                      "Complex binding patterns require an initialization value"
                                  )
                            : this.unexpected(),
                        e.declarations.push(this.finishNode(i, "VariableDeclarator")),
                        !this.eat(x.comma))
                    )
                        break;
                }
                return e;
            }),
            (W.parseVarId = function (e, t) {
                (e.id = this.parseBindingAtom(t)), this.checkLVal(e.id, "var" === t ? 1 : 2, false);
            });
        var K = 1,
            Q = 2;
        (W.parseFunction = function (e, t, r, i) {
            this.initFunction(e),
                (this.options.ecmaVersion >= 9 || (this.options.ecmaVersion >= 6 && !i)) &&
                    (e.generator = this.eat(x.star)),
                this.options.ecmaVersion >= 8 && (e.async = !!i),
                t & K &&
                    ((e.id = 4 & t && this.type !== x.name ? null : this.parseIdent()),
                    !e.id || t & Q || this.checkLVal(e.id, this.inModule && !this.inFunction ? 2 : 3));
            var a = this.yieldPos,
                s = this.awaitPos;
            return (
                (this.yieldPos = 0),
                (this.awaitPos = 0),
                this.enterScope(_(e.async, e.generator)),
                t & K || (e.id = this.type === x.name ? this.parseIdent() : null),
                this.parseFunctionParams(e),
                this.parseFunctionBody(e, r),
                (this.yieldPos = a),
                (this.awaitPos = s),
                this.finishNode(e, t & K ? "FunctionDeclaration" : "FunctionExpression")
            );
        }),
            (W.parseFunctionParams = function (e) {
                this.expect(x.parenL),
                    (e.params = this.parseBindingList(x.parenR, false, this.options.ecmaVersion >= 8)),
                    this.checkYieldAwaitInDefaultParams();
            }),
            (W.parseClass = function (e, t) {
                this.next(), this.parseClassId(e, t), this.parseClassSuper(e);
                var r = this.startNode(),
                    i = false;
                for (r.body = [], this.expect(x.braceL); !this.eat(x.braceR); ) {
                    var a = this.parseClassElement(null !== e.superClass);
                    a &&
                        (r.body.push(a),
                        "MethodDefinition" === a.type &&
                            "constructor" === a.kind &&
                            (i && this.raise(a.start, "Duplicate constructor in the same class"), (i = true)));
                }
                return (
                    (e.body = this.finishNode(r, "ClassBody")),
                    this.finishNode(e, t ? "ClassDeclaration" : "ClassExpression")
                );
            }),
            (W.parseClassElement = function (e) {
                var t = this;
                if (this.eat(x.semi)) return null;
                var r = this.startNode(),
                    i = function (e, i) {
                        undefined === i && (i = false);
                        var a = t.start,
                            s = t.startLoc;
                        return (
                            !!t.eatContextual(e) &&
                            (!(t.type === x.parenL || (i && t.canInsertSemicolon())) ||
                                (r.key && t.unexpected(),
                                (r.computed = false),
                                (r.key = t.startNodeAt(a, s)),
                                (r.key.name = e),
                                t.finishNode(r.key, "Identifier"),
                                false))
                        );
                    };
                (r.kind = "method"), (r.static = i("static"));
                var a = this.eat(x.star),
                    s = false;
                a ||
                    (this.options.ecmaVersion >= 8 && i("async", true)
                        ? ((s = true), (a = this.options.ecmaVersion >= 9 && this.eat(x.star)))
                        : i("get")
                        ? (r.kind = "get")
                        : i("set") && (r.kind = "set")),
                    r.key || this.parsePropertyName(r);
                var n = r.key,
                    o = false;
                return (
                    r.computed ||
                    r.static ||
                    !(
                        ("Identifier" === n.type && "constructor" === n.name) ||
                        ("Literal" === n.type && "constructor" === n.value)
                    )
                        ? r.static &&
                          "Identifier" === n.type &&
                          "prototype" === n.name &&
                          this.raise(n.start, "Classes may not have a static property named prototype")
                        : ("method" !== r.kind && this.raise(n.start, "Constructor can't have get/set modifier"),
                          a && this.raise(n.start, "Constructor can't be a generator"),
                          s && this.raise(n.start, "Constructor can't be an async method"),
                          (r.kind = "constructor"),
                          (o = e)),
                    this.parseClassMethod(r, a, s, o),
                    "get" === r.kind &&
                        0 !== r.value.params.length &&
                        this.raiseRecoverable(r.value.start, "getter should have no params"),
                    "set" === r.kind &&
                        1 !== r.value.params.length &&
                        this.raiseRecoverable(r.value.start, "setter should have exactly one param"),
                    "set" === r.kind &&
                        "RestElement" === r.value.params[0].type &&
                        this.raiseRecoverable(r.value.params[0].start, "Setter cannot use rest params"),
                    r
                );
            }),
            (W.parseClassMethod = function (e, t, r, i) {
                return (e.value = this.parseMethod(t, r, i)), this.finishNode(e, "MethodDefinition");
            }),
            (W.parseClassId = function (e, t) {
                e.id = this.type === x.name ? this.parseIdent() : true === t ? this.unexpected() : null;
            }),
            (W.parseClassSuper = function (e) {
                e.superClass = this.eat(x._extends) ? this.parseExprSubscripts() : null;
            }),
            (W.parseExport = function (e, t) {
                if ((this.next(), this.eat(x.star)))
                    return (
                        this.expectContextual("from"),
                        this.type !== x.string && this.unexpected(),
                        (e.source = this.parseExprAtom()),
                        this.semicolon(),
                        this.finishNode(e, "ExportAllDeclaration")
                    );
                if (this.eat(x._default)) {
                    var r;
                    if (
                        (this.checkExport(t, "default", this.lastTokStart),
                        this.type === x._function || (r = this.isAsyncFunction()))
                    ) {
                        var i = this.startNode();
                        this.next(), r && this.next(), (e.declaration = this.parseFunction(i, 4 | K, false, r, true));
                    } else if (this.type === x._class) {
                        var a = this.startNode();
                        e.declaration = this.parseClass(a, "nullableID");
                    } else (e.declaration = this.parseMaybeAssign()), this.semicolon();
                    return this.finishNode(e, "ExportDefaultDeclaration");
                }
                if (this.shouldParseExportStatement())
                    (e.declaration = this.parseStatement(null)),
                        "VariableDeclaration" === e.declaration.type
                            ? this.checkVariableExport(t, e.declaration.declarations)
                            : this.checkExport(t, e.declaration.id.name, e.declaration.id.start),
                        (e.specifiers = []),
                        (e.source = null);
                else {
                    if (
                        ((e.declaration = null),
                        (e.specifiers = this.parseExportSpecifiers(t)),
                        this.eatContextual("from"))
                    )
                        this.type !== x.string && this.unexpected(), (e.source = this.parseExprAtom());
                    else {
                        for (var s = 0, n = e.specifiers; s < n.length; s += 1) {
                            var o = n[s];
                            this.checkUnreserved(o.local);
                        }
                        e.source = null;
                    }
                    this.semicolon();
                }
                return this.finishNode(e, "ExportNamedDeclaration");
            }),
            (W.checkExport = function (e, t, r) {
                e && (R(e, t) && this.raiseRecoverable(r, "Duplicate export '" + t + "'"), (e[t] = true));
            }),
            (W.checkPatternExport = function (e, t) {
                var r = t.type;
                if ("Identifier" === r) this.checkExport(e, t.name, t.start);
                else if ("ObjectPattern" === r)
                    for (var i = 0, a = t.properties; i < a.length; i += 1) {
                        var s = a[i];
                        this.checkPatternExport(e, s);
                    }
                else if ("ArrayPattern" === r)
                    for (var n = 0, o = t.elements; n < o.length; n += 1) {
                        var p = o[n];
                        p && this.checkPatternExport(e, p);
                    }
                else
                    "Property" === r
                        ? this.checkPatternExport(e, t.value)
                        : "AssignmentPattern" === r
                        ? this.checkPatternExport(e, t.left)
                        : "RestElement" === r
                        ? this.checkPatternExport(e, t.argument)
                        : "ParenthesizedExpression" === r && this.checkPatternExport(e, t.expression);
            }),
            (W.checkVariableExport = function (e, t) {
                if (e)
                    for (var r = 0, i = t; r < i.length; r += 1) {
                        var a = i[r];
                        this.checkPatternExport(e, a.id);
                    }
            }),
            (W.shouldParseExportStatement = function () {
                return (
                    "var" === this.type.keyword ||
                    "const" === this.type.keyword ||
                    "class" === this.type.keyword ||
                    "function" === this.type.keyword ||
                    this.isLet() ||
                    this.isAsyncFunction()
                );
            }),
            (W.parseExportSpecifiers = function (e) {
                var t = [],
                    r = true;
                for (this.expect(x.braceL); !this.eat(x.braceR); ) {
                    if (r) r = false;
                    else if ((this.expect(x.comma), this.afterTrailingComma(x.braceR))) break;
                    var i = this.startNode();
                    (i.local = this.parseIdent(true)),
                        (i.exported = this.eatContextual("as") ? this.parseIdent(true) : i.local),
                        this.checkExport(e, i.exported.name, i.exported.start),
                        t.push(this.finishNode(i, "ExportSpecifier"));
                }
                return t;
            }),
            (W.parseImport = function (e) {
                return (
                    this.next(),
                    this.type === x.string
                        ? ((e.specifiers = J), (e.source = this.parseExprAtom()))
                        : ((e.specifiers = this.parseImportSpecifiers()),
                          this.expectContextual("from"),
                          (e.source = this.type === x.string ? this.parseExprAtom() : this.unexpected())),
                    this.semicolon(),
                    this.finishNode(e, "ImportDeclaration")
                );
            }),
            (W.parseImportSpecifiers = function () {
                var e = [],
                    t = true;
                if (this.type === x.name) {
                    var r = this.startNode();
                    if (
                        ((r.local = this.parseIdent()),
                        this.checkLVal(r.local, 2),
                        e.push(this.finishNode(r, "ImportDefaultSpecifier")),
                        !this.eat(x.comma))
                    )
                        return e;
                }
                if (this.type === x.star) {
                    var i = this.startNode();
                    return (
                        this.next(),
                        this.expectContextual("as"),
                        (i.local = this.parseIdent()),
                        this.checkLVal(i.local, 2),
                        e.push(this.finishNode(i, "ImportNamespaceSpecifier")),
                        e
                    );
                }
                for (this.expect(x.braceL); !this.eat(x.braceR); ) {
                    if (t) t = false;
                    else if ((this.expect(x.comma), this.afterTrailingComma(x.braceR))) break;
                    var a = this.startNode();
                    (a.imported = this.parseIdent(true)),
                        this.eatContextual("as")
                            ? (a.local = this.parseIdent())
                            : (this.checkUnreserved(a.imported), (a.local = a.imported)),
                        this.checkLVal(a.local, 2),
                        e.push(this.finishNode(a, "ImportSpecifier"));
                }
                return e;
            }),
            (W.adaptDirectivePrologue = function (e) {
                for (var t = 0; t < e.length && this.isDirectiveCandidate(e[t]); ++t)
                    e[t].directive = e[t].expression.raw.slice(1, -1);
            }),
            (W.isDirectiveCandidate = function (e) {
                return (
                    "ExpressionStatement" === e.type &&
                    "Literal" === e.expression.type &&
                    "string" == typeof e.expression.value &&
                    ('"' === this.input[e.start] || "'" === this.input[e.start])
                );
            });
        var $ = G.prototype;
        ($.toAssignable = function (e, t, r) {
            if (this.options.ecmaVersion >= 6 && e)
                switch (e.type) {
                    case "Identifier":
                        this.inAsync &&
                            "await" === e.name &&
                            this.raise(e.start, "Can not use 'await' as identifier inside an async function");
                        break;
                    case "ObjectPattern":
                    case "ArrayPattern":
                    case "RestElement":
                        break;
                    case "ObjectExpression":
                        (e.type = "ObjectPattern"), r && this.checkPatternErrors(r, true);
                        for (var i = 0, a = e.properties; i < a.length; i += 1) {
                            var s = a[i];
                            this.toAssignable(s, t),
                                "RestElement" !== s.type ||
                                    ("ArrayPattern" !== s.argument.type && "ObjectPattern" !== s.argument.type) ||
                                    this.raise(s.argument.start, "Unexpected token");
                        }
                        break;
                    case "Property":
                        "init" !== e.kind && this.raise(e.key.start, "Object pattern can't contain getter or setter"),
                            this.toAssignable(e.value, t);
                        break;
                    case "ArrayExpression":
                        (e.type = "ArrayPattern"),
                            r && this.checkPatternErrors(r, true),
                            this.toAssignableList(e.elements, t);
                        break;
                    case "SpreadElement":
                        (e.type = "RestElement"),
                            this.toAssignable(e.argument, t),
                            "AssignmentPattern" === e.argument.type &&
                                this.raise(e.argument.start, "Rest elements cannot have a default value");
                        break;
                    case "AssignmentExpression":
                        "=" !== e.operator &&
                            this.raise(e.left.end, "Only '=' operator can be used for specifying default value."),
                            (e.type = "AssignmentPattern"),
                            delete e.operator,
                            this.toAssignable(e.left, t);
                    case "AssignmentPattern":
                        break;
                    case "ParenthesizedExpression":
                        this.toAssignable(e.expression, t);
                        break;
                    case "MemberExpression":
                        if (!t) break;
                    default:
                        this.raise(e.start, "Assigning to rvalue");
                }
            else r && this.checkPatternErrors(r, true);
            return e;
        }),
            ($.toAssignableList = function (e, t) {
                for (var r = e.length, i = 0; i < r; i++) {
                    var a = e[i];
                    a && this.toAssignable(a, t);
                }
                if (r) {
                    var s = e[r - 1];
                    6 === this.options.ecmaVersion &&
                        t &&
                        s &&
                        "RestElement" === s.type &&
                        "Identifier" !== s.argument.type &&
                        this.unexpected(s.argument.start);
                }
                return e;
            }),
            ($.parseSpread = function (e) {
                var t = this.startNode();
                return this.next(), (t.argument = this.parseMaybeAssign(false, e)), this.finishNode(t, "SpreadElement");
            }),
            ($.parseRestBinding = function () {
                var e = this.startNode();
                return (
                    this.next(),
                    6 === this.options.ecmaVersion && this.type !== x.name && this.unexpected(),
                    (e.argument = this.parseBindingAtom()),
                    this.finishNode(e, "RestElement")
                );
            }),
            ($.parseBindingAtom = function () {
                if (this.options.ecmaVersion >= 6)
                    switch (this.type) {
                        case x.bracketL:
                            var e = this.startNode();
                            return (
                                this.next(),
                                (e.elements = this.parseBindingList(x.bracketR, true, true)),
                                this.finishNode(e, "ArrayPattern")
                            );
                        case x.braceL:
                            return this.parseObj(true);
                    }
                return this.parseIdent();
            }),
            ($.parseBindingList = function (e, t, r) {
                for (var i = [], a = true; !this.eat(e); )
                    if ((a ? (a = false) : this.expect(x.comma), t && this.type === x.comma)) i.push(null);
                    else {
                        if (r && this.afterTrailingComma(e)) break;
                        if (this.type === x.ellipsis) {
                            var s = this.parseRestBinding();
                            this.parseBindingListItem(s),
                                i.push(s),
                                this.type === x.comma &&
                                    this.raise(this.start, "Comma is not permitted after the rest element"),
                                this.expect(e);
                            break;
                        }
                        var n = this.parseMaybeDefault(this.start, this.startLoc);
                        this.parseBindingListItem(n), i.push(n);
                    }
                return i;
            }),
            ($.parseBindingListItem = function (e) {
                return e;
            }),
            ($.parseMaybeDefault = function (e, t, r) {
                if (((r = r || this.parseBindingAtom()), this.options.ecmaVersion < 6 || !this.eat(x.eq))) return r;
                var i = this.startNodeAt(e, t);
                return (i.left = r), (i.right = this.parseMaybeAssign()), this.finishNode(i, "AssignmentPattern");
            }),
            ($.checkLVal = function (e, t, r) {
                switch ((undefined === t && (t = 0), e.type)) {
                    case "Identifier":
                        this.strict &&
                            this.reservedWordsStrictBind.test(e.name) &&
                            this.raiseRecoverable(
                                e.start,
                                (t ? "Binding " : "Assigning to ") + e.name + " in strict mode"
                            ),
                            r &&
                                (R(r, e.name) && this.raiseRecoverable(e.start, "Argument name clash"),
                                (r[e.name] = true)),
                            0 !== t && 5 !== t && this.declareName(e.name, t, e.start);
                        break;
                    case "MemberExpression":
                        t && this.raiseRecoverable(e.start, "Binding member expression");
                        break;
                    case "ObjectPattern":
                        for (var i = 0, a = e.properties; i < a.length; i += 1) {
                            var s = a[i];
                            this.checkLVal(s, t, r);
                        }
                        break;
                    case "Property":
                        this.checkLVal(e.value, t, r);
                        break;
                    case "ArrayPattern":
                        for (var n = 0, o = e.elements; n < o.length; n += 1) {
                            var p = o[n];
                            p && this.checkLVal(p, t, r);
                        }
                        break;
                    case "AssignmentPattern":
                        this.checkLVal(e.left, t, r);
                        break;
                    case "RestElement":
                        this.checkLVal(e.argument, t, r);
                        break;
                    case "ParenthesizedExpression":
                        this.checkLVal(e.expression, t, r);
                        break;
                    default:
                        this.raise(e.start, (t ? "Binding" : "Assigning to") + " rvalue");
                }
            });
        var ee = G.prototype;
        (ee.checkPropClash = function (e, t, r) {
            if (
                !(
                    (this.options.ecmaVersion >= 9 && "SpreadElement" === e.type) ||
                    (this.options.ecmaVersion >= 6 && (e.computed || e.method || e.shorthand))
                )
            ) {
                var i,
                    a = e.key;
                switch (a.type) {
                    case "Identifier":
                        i = a.name;
                        break;
                    case "Literal":
                        i = String(a.value);
                        break;
                    default:
                        return;
                }
                var s = e.kind;
                if (this.options.ecmaVersion >= 6)
                    "__proto__" === i &&
                        "init" === s &&
                        (t.proto &&
                            (r && r.doubleProto < 0
                                ? (r.doubleProto = a.start)
                                : this.raiseRecoverable(a.start, "Redefinition of __proto__ property")),
                        (t.proto = true));
                else {
                    var n = t[(i = "$" + i)];
                    if (n)
                        ("init" === s ? (this.strict && n.init) || n.get || n.set : n.init || n[s]) &&
                            this.raiseRecoverable(a.start, "Redefinition of property");
                    else n = t[i] = { init: false, get: false, set: false };
                    n[s] = true;
                }
            }
        }),
            (ee.parseExpression = function (e, t) {
                var r = this.start,
                    i = this.startLoc,
                    a = this.parseMaybeAssign(e, t);
                if (this.type === x.comma) {
                    var s = this.startNodeAt(r, i);
                    for (s.expressions = [a]; this.eat(x.comma); ) s.expressions.push(this.parseMaybeAssign(e, t));
                    return this.finishNode(s, "SequenceExpression");
                }
                return a;
            }),
            (ee.parseMaybeAssign = function (e, t, r) {
                if (this.isContextual("yield")) {
                    if (this.inGenerator) return this.parseYield();
                    this.exprAllowed = false;
                }
                var i = false,
                    a = -1,
                    s = -1,
                    n = -1;
                t
                    ? ((a = t.parenthesizedAssign),
                      (s = t.trailingComma),
                      (n = t.shorthandAssign),
                      (t.parenthesizedAssign = t.trailingComma = t.shorthandAssign = -1))
                    : ((t = new q()), (i = true));
                var o = this.start,
                    p = this.startLoc;
                (this.type !== x.parenL && this.type !== x.name) || (this.potentialArrowAt = this.start);
                var l = this.parseMaybeConditional(e, t);
                if ((r && (l = r.call(this, l, o, p)), this.type.isAssign)) {
                    var h = this.startNodeAt(o, p);
                    return (
                        (h.operator = this.value),
                        (h.left = this.type === x.eq ? this.toAssignable(l, false, t) : l),
                        i || q.call(t),
                        (t.shorthandAssign = -1),
                        this.checkLVal(l),
                        this.next(),
                        (h.right = this.parseMaybeAssign(e)),
                        this.finishNode(h, "AssignmentExpression")
                    );
                }
                return (
                    i && this.checkExpressionErrors(t, true),
                    a > -1 && (t.parenthesizedAssign = a),
                    s > -1 && (t.trailingComma = s),
                    n > -1 && (t.shorthandAssign = n),
                    l
                );
            }),
            (ee.parseMaybeConditional = function (e, t) {
                var r = this.start,
                    i = this.startLoc,
                    a = this.parseExprOps(e, t);
                if (this.checkExpressionErrors(t)) return a;
                if (this.eat(x.question)) {
                    var s = this.startNodeAt(r, i);
                    return (
                        (s.test = a),
                        (s.consequent = this.parseMaybeAssign()),
                        this.expect(x.colon),
                        (s.alternate = this.parseMaybeAssign(e)),
                        this.finishNode(s, "ConditionalExpression")
                    );
                }
                return a;
            }),
            (ee.parseExprOps = function (e, t) {
                var r = this.start,
                    i = this.startLoc,
                    a = this.parseMaybeUnary(t, false);
                return this.checkExpressionErrors(t)
                    ? a
                    : a.start === r && "ArrowFunctionExpression" === a.type
                    ? a
                    : this.parseExprOp(a, r, i, -1, e);
            }),
            (ee.parseExprOp = function (e, t, r, i, a) {
                var s = this.type.binop;
                if (null != s && (!a || this.type !== x._in) && s > i) {
                    var n = this.type === x.logicalOR || this.type === x.logicalAND,
                        o = this.value;
                    this.next();
                    var p = this.start,
                        l = this.startLoc,
                        h = this.parseExprOp(this.parseMaybeUnary(null, false), p, l, s, a),
                        c = this.buildBinary(t, r, e, h, o, n);
                    return this.parseExprOp(c, t, r, i, a);
                }
                return e;
            }),
            (ee.buildBinary = function (e, t, r, i, a, s) {
                var n = this.startNodeAt(e, t);
                return (
                    (n.left = r),
                    (n.operator = a),
                    (n.right = i),
                    this.finishNode(n, s ? "LogicalExpression" : "BinaryExpression")
                );
            }),
            (ee.parseMaybeUnary = function (e, t) {
                var r,
                    i = this.start,
                    a = this.startLoc;
                if (
                    this.isContextual("await") &&
                    (this.inAsync || (!this.inFunction && this.options.allowAwaitOutsideFunction))
                )
                    (r = this.parseAwait()), (t = true);
                else if (this.type.prefix) {
                    var s = this.startNode(),
                        n = this.type === x.incDec;
                    (s.operator = this.value),
                        (s.prefix = true),
                        this.next(),
                        (s.argument = this.parseMaybeUnary(null, true)),
                        this.checkExpressionErrors(e, true),
                        n
                            ? this.checkLVal(s.argument)
                            : this.strict && "delete" === s.operator && "Identifier" === s.argument.type
                            ? this.raiseRecoverable(s.start, "Deleting local variable in strict mode")
                            : (t = true),
                        (r = this.finishNode(s, n ? "UpdateExpression" : "UnaryExpression"));
                } else {
                    if (((r = this.parseExprSubscripts(e)), this.checkExpressionErrors(e))) return r;
                    for (; this.type.postfix && !this.canInsertSemicolon(); ) {
                        var o = this.startNodeAt(i, a);
                        (o.operator = this.value),
                            (o.prefix = false),
                            (o.argument = r),
                            this.checkLVal(r),
                            this.next(),
                            (r = this.finishNode(o, "UpdateExpression"));
                    }
                }
                return !t && this.eat(x.starstar)
                    ? this.buildBinary(i, a, r, this.parseMaybeUnary(null, false), "**", false)
                    : r;
            }),
            (ee.parseExprSubscripts = function (e) {
                var t = this.start,
                    r = this.startLoc,
                    i = this.parseExprAtom(e),
                    a =
                        "ArrowFunctionExpression" === i.type &&
                        ")" !== this.input.slice(this.lastTokStart, this.lastTokEnd);
                if (this.checkExpressionErrors(e) || a) return i;
                var s = this.parseSubscripts(i, t, r);
                return (
                    e &&
                        "MemberExpression" === s.type &&
                        (e.parenthesizedAssign >= s.start && (e.parenthesizedAssign = -1),
                        e.parenthesizedBind >= s.start && (e.parenthesizedBind = -1)),
                    s
                );
            }),
            (ee.parseSubscripts = function (e, t, r, i) {
                for (
                    var a =
                            this.options.ecmaVersion >= 8 &&
                            "Identifier" === e.type &&
                            "async" === e.name &&
                            this.lastTokEnd === e.end &&
                            !this.canInsertSemicolon() &&
                            "async" === this.input.slice(e.start, e.end),
                        s = undefined;
                    ;

                )
                    if ((s = this.eat(x.bracketL)) || this.eat(x.dot)) {
                        var n = this.startNodeAt(t, r);
                        (n.object = e),
                            (n.property = s ? this.parseExpression() : this.parseIdent(true)),
                            (n.computed = !!s),
                            s && this.expect(x.bracketR),
                            (e = this.finishNode(n, "MemberExpression"));
                    } else if (!i && this.eat(x.parenL)) {
                        var o = new q(),
                            p = this.yieldPos,
                            l = this.awaitPos;
                        (this.yieldPos = 0), (this.awaitPos = 0);
                        var h = this.parseExprList(x.parenR, this.options.ecmaVersion >= 8, false, o);
                        if (a && !this.canInsertSemicolon() && this.eat(x.arrow))
                            return (
                                this.checkPatternErrors(o, false),
                                this.checkYieldAwaitInDefaultParams(),
                                (this.yieldPos = p),
                                (this.awaitPos = l),
                                this.parseArrowExpression(this.startNodeAt(t, r), h, true)
                            );
                        this.checkExpressionErrors(o, true),
                            (this.yieldPos = p || this.yieldPos),
                            (this.awaitPos = l || this.awaitPos);
                        var c = this.startNodeAt(t, r);
                        (c.callee = e), (c.arguments = h), (e = this.finishNode(c, "CallExpression"));
                    } else {
                        if (this.type !== x.backQuote) return e;
                        var u = this.startNodeAt(t, r);
                        (u.tag = e),
                            (u.quasi = this.parseTemplate({ isTagged: true })),
                            (e = this.finishNode(u, "TaggedTemplateExpression"));
                    }
            }),
            (ee.parseExprAtom = function (e) {
                this.type === x.slash && this.readRegexp();
                var t,
                    r = this.potentialArrowAt === this.start;
                switch (this.type) {
                    case x._super:
                        return (
                            this.allowSuper || this.raise(this.start, "'super' keyword outside a method"),
                            (t = this.startNode()),
                            this.next(),
                            this.type !== x.parenL ||
                                this.allowDirectSuper ||
                                this.raise(t.start, "super() call outside constructor of a subclass"),
                            this.type !== x.dot &&
                                this.type !== x.bracketL &&
                                this.type !== x.parenL &&
                                this.unexpected(),
                            this.finishNode(t, "Super")
                        );
                    case x._this:
                        return (t = this.startNode()), this.next(), this.finishNode(t, "ThisExpression");
                    case x.name:
                        var i = this.start,
                            a = this.startLoc,
                            s = this.containsEsc,
                            n = this.parseIdent(this.type !== x.name);
                        if (
                            this.options.ecmaVersion >= 8 &&
                            !s &&
                            "async" === n.name &&
                            !this.canInsertSemicolon() &&
                            this.eat(x._function)
                        )
                            return this.parseFunction(this.startNodeAt(i, a), 0, false, true);
                        if (r && !this.canInsertSemicolon()) {
                            if (this.eat(x.arrow)) return this.parseArrowExpression(this.startNodeAt(i, a), [n], false);
                            if (this.options.ecmaVersion >= 8 && "async" === n.name && this.type === x.name && !s)
                                return (
                                    (n = this.parseIdent()),
                                    (!this.canInsertSemicolon() && this.eat(x.arrow)) || this.unexpected(),
                                    this.parseArrowExpression(this.startNodeAt(i, a), [n], true)
                                );
                        }
                        return n;
                    case x.regexp:
                        var o = this.value;
                        return ((t = this.parseLiteral(o.value)).regex = { pattern: o.pattern, flags: o.flags }), t;
                    case x.num:
                    case x.string:
                        return this.parseLiteral(this.value);
                    case x._null:
                    case x._true:
                    case x._false:
                        return (
                            ((t = this.startNode()).value = this.type === x._null ? null : this.type === x._true),
                            (t.raw = this.type.keyword),
                            this.next(),
                            this.finishNode(t, "Literal")
                        );
                    case x.parenL:
                        var p = this.start,
                            l = this.parseParenAndDistinguishExpression(r);
                        return (
                            e &&
                                (e.parenthesizedAssign < 0 &&
                                    !this.isSimpleAssignTarget(l) &&
                                    (e.parenthesizedAssign = p),
                                e.parenthesizedBind < 0 && (e.parenthesizedBind = p)),
                            l
                        );
                    case x.bracketL:
                        return (
                            (t = this.startNode()),
                            this.next(),
                            (t.elements = this.parseExprList(x.bracketR, true, true, e)),
                            this.finishNode(t, "ArrayExpression")
                        );
                    case x.braceL:
                        return this.parseObj(false, e);
                    case x._function:
                        return (t = this.startNode()), this.next(), this.parseFunction(t, 0);
                    case x._class:
                        return this.parseClass(this.startNode(), false);
                    case x._new:
                        return this.parseNew();
                    case x.backQuote:
                        return this.parseTemplate();
                    default:
                        this.unexpected();
                }
            }),
            (ee.parseLiteral = function (e) {
                var t = this.startNode();
                return (
                    (t.value = e),
                    (t.raw = this.input.slice(this.start, this.end)),
                    this.next(),
                    this.finishNode(t, "Literal")
                );
            }),
            (ee.parseParenExpression = function () {
                this.expect(x.parenL);
                var e = this.parseExpression();
                return this.expect(x.parenR), e;
            }),
            (ee.parseParenAndDistinguishExpression = function (e) {
                var t,
                    r = this.start,
                    i = this.startLoc,
                    a = this.options.ecmaVersion >= 8;
                if (this.options.ecmaVersion >= 6) {
                    this.next();
                    var s,
                        n = this.start,
                        o = this.startLoc,
                        p = [],
                        l = true,
                        h = false,
                        c = new q(),
                        u = this.yieldPos,
                        d = this.awaitPos;
                    for (this.yieldPos = 0, this.awaitPos = 0; this.type !== x.parenR; ) {
                        if ((l ? (l = false) : this.expect(x.comma), a && this.afterTrailingComma(x.parenR, true))) {
                            h = true;
                            break;
                        }
                        if (this.type === x.ellipsis) {
                            (s = this.start),
                                p.push(this.parseParenItem(this.parseRestBinding())),
                                this.type === x.comma &&
                                    this.raise(this.start, "Comma is not permitted after the rest element");
                            break;
                        }
                        p.push(this.parseMaybeAssign(false, c, this.parseParenItem));
                    }
                    var f = this.start,
                        m = this.startLoc;
                    if ((this.expect(x.parenR), e && !this.canInsertSemicolon() && this.eat(x.arrow)))
                        return (
                            this.checkPatternErrors(c, false),
                            this.checkYieldAwaitInDefaultParams(),
                            (this.yieldPos = u),
                            (this.awaitPos = d),
                            this.parseParenArrowList(r, i, p)
                        );
                    (p.length && !h) || this.unexpected(this.lastTokStart),
                        s && this.unexpected(s),
                        this.checkExpressionErrors(c, true),
                        (this.yieldPos = u || this.yieldPos),
                        (this.awaitPos = d || this.awaitPos),
                        p.length > 1
                            ? (((t = this.startNodeAt(n, o)).expressions = p),
                              this.finishNodeAt(t, "SequenceExpression", f, m))
                            : (t = p[0]);
                } else t = this.parseParenExpression();
                if (this.options.preserveParens) {
                    var y = this.startNodeAt(r, i);
                    return (y.expression = t), this.finishNode(y, "ParenthesizedExpression");
                }
                return t;
            }),
            (ee.parseParenItem = function (e) {
                return e;
            }),
            (ee.parseParenArrowList = function (e, t, r) {
                return this.parseArrowExpression(this.startNodeAt(e, t), r);
            });
        var te = [];
        (ee.parseNew = function () {
            var e = this.startNode(),
                t = this.parseIdent(true);
            if (this.options.ecmaVersion >= 6 && this.eat(x.dot)) {
                e.meta = t;
                var r = this.containsEsc;
                return (
                    (e.property = this.parseIdent(true)),
                    ("target" !== e.property.name || r) &&
                        this.raiseRecoverable(e.property.start, "The only valid meta property for new is new.target"),
                    this.inNonArrowFunction() ||
                        this.raiseRecoverable(e.start, "new.target can only be used in functions"),
                    this.finishNode(e, "MetaProperty")
                );
            }
            var i = this.start,
                a = this.startLoc;
            return (
                (e.callee = this.parseSubscripts(this.parseExprAtom(), i, a, true)),
                this.eat(x.parenL)
                    ? (e.arguments = this.parseExprList(x.parenR, this.options.ecmaVersion >= 8, false))
                    : (e.arguments = te),
                this.finishNode(e, "NewExpression")
            );
        }),
            (ee.parseTemplateElement = function (e) {
                var t = e.isTagged,
                    r = this.startNode();
                return (
                    this.type === x.invalidTemplate
                        ? (t || this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal"),
                          (r.value = { raw: this.value, cooked: null }))
                        : (r.value = {
                              raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
                              cooked: this.value,
                          }),
                    this.next(),
                    (r.tail = this.type === x.backQuote),
                    this.finishNode(r, "TemplateElement")
                );
            }),
            (ee.parseTemplate = function (e) {
                undefined === e && (e = {});
                var t = e.isTagged;
                undefined === t && (t = false);
                var r = this.startNode();
                this.next(), (r.expressions = []);
                var i = this.parseTemplateElement({ isTagged: t });
                for (r.quasis = [i]; !i.tail; )
                    this.type === x.eof && this.raise(this.pos, "Unterminated template literal"),
                        this.expect(x.dollarBraceL),
                        r.expressions.push(this.parseExpression()),
                        this.expect(x.braceR),
                        r.quasis.push((i = this.parseTemplateElement({ isTagged: t })));
                return this.next(), this.finishNode(r, "TemplateLiteral");
            }),
            (ee.isAsyncProp = function (e) {
                return (
                    !e.computed &&
                    "Identifier" === e.key.type &&
                    "async" === e.key.name &&
                    (this.type === x.name ||
                        this.type === x.num ||
                        this.type === x.string ||
                        this.type === x.bracketL ||
                        this.type.keyword ||
                        (this.options.ecmaVersion >= 9 && this.type === x.star)) &&
                    !P.test(this.input.slice(this.lastTokEnd, this.start))
                );
            }),
            (ee.parseObj = function (e, t) {
                var r = this.startNode(),
                    i = true,
                    a = {};
                for (r.properties = [], this.next(); !this.eat(x.braceR); ) {
                    if (i) i = false;
                    else if ((this.expect(x.comma), this.afterTrailingComma(x.braceR))) break;
                    var s = this.parseProperty(e, t);
                    e || this.checkPropClash(s, a, t), r.properties.push(s);
                }
                return this.finishNode(r, e ? "ObjectPattern" : "ObjectExpression");
            }),
            (ee.parseProperty = function (e, t) {
                var r,
                    i,
                    a,
                    s,
                    n = this.startNode();
                if (this.options.ecmaVersion >= 9 && this.eat(x.ellipsis))
                    return e
                        ? ((n.argument = this.parseIdent(false)),
                          this.type === x.comma &&
                              this.raise(this.start, "Comma is not permitted after the rest element"),
                          this.finishNode(n, "RestElement"))
                        : (this.type === x.parenL &&
                              t &&
                              (t.parenthesizedAssign < 0 && (t.parenthesizedAssign = this.start),
                              t.parenthesizedBind < 0 && (t.parenthesizedBind = this.start)),
                          (n.argument = this.parseMaybeAssign(false, t)),
                          this.type === x.comma && t && t.trailingComma < 0 && (t.trailingComma = this.start),
                          this.finishNode(n, "SpreadElement"));
                this.options.ecmaVersion >= 6 &&
                    ((n.method = false),
                    (n.shorthand = false),
                    (e || t) && ((a = this.start), (s = this.startLoc)),
                    e || (r = this.eat(x.star)));
                var o = this.containsEsc;
                return (
                    this.parsePropertyName(n),
                    !e && !o && this.options.ecmaVersion >= 8 && !r && this.isAsyncProp(n)
                        ? ((i = true),
                          (r = this.options.ecmaVersion >= 9 && this.eat(x.star)),
                          this.parsePropertyName(n, t))
                        : (i = false),
                    this.parsePropertyValue(n, e, r, i, a, s, t, o),
                    this.finishNode(n, "Property")
                );
            }),
            (ee.parsePropertyValue = function (e, t, r, i, a, s, n, o) {
                if (((r || i) && this.type === x.colon && this.unexpected(), this.eat(x.colon)))
                    (e.value = t ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, n)),
                        (e.kind = "init");
                else if (this.options.ecmaVersion >= 6 && this.type === x.parenL)
                    t && this.unexpected(), (e.kind = "init"), (e.method = true), (e.value = this.parseMethod(r, i));
                else if (
                    t ||
                    o ||
                    !(this.options.ecmaVersion >= 5) ||
                    e.computed ||
                    "Identifier" !== e.key.type ||
                    ("get" !== e.key.name && "set" !== e.key.name) ||
                    this.type === x.comma ||
                    this.type === x.braceR
                )
                    this.options.ecmaVersion >= 6 && !e.computed && "Identifier" === e.key.type
                        ? (this.checkUnreserved(e.key),
                          (e.kind = "init"),
                          t
                              ? (e.value = this.parseMaybeDefault(a, s, e.key))
                              : this.type === x.eq && n
                              ? (n.shorthandAssign < 0 && (n.shorthandAssign = this.start),
                                (e.value = this.parseMaybeDefault(a, s, e.key)))
                              : (e.value = e.key),
                          (e.shorthand = true))
                        : this.unexpected();
                else {
                    (r || i) && this.unexpected(),
                        (e.kind = e.key.name),
                        this.parsePropertyName(e),
                        (e.value = this.parseMethod(false));
                    var p = "get" === e.kind ? 0 : 1;
                    if (e.value.params.length !== p) {
                        var l = e.value.start;
                        "get" === e.kind
                            ? this.raiseRecoverable(l, "getter should have no params")
                            : this.raiseRecoverable(l, "setter should have exactly one param");
                    } else
                        "set" === e.kind &&
                            "RestElement" === e.value.params[0].type &&
                            this.raiseRecoverable(e.value.params[0].start, "Setter cannot use rest params");
                }
            }),
            (ee.parsePropertyName = function (e) {
                if (this.options.ecmaVersion >= 6) {
                    if (this.eat(x.bracketL))
                        return (e.computed = true), (e.key = this.parseMaybeAssign()), this.expect(x.bracketR), e.key;
                    e.computed = false;
                }
                return (e.key =
                    this.type === x.num || this.type === x.string ? this.parseExprAtom() : this.parseIdent(true));
            }),
            (ee.initFunction = function (e) {
                (e.id = null),
                    this.options.ecmaVersion >= 6 && (e.generator = e.expression = false),
                    this.options.ecmaVersion >= 8 && (e.async = false);
            }),
            (ee.parseMethod = function (e, t, r) {
                var i = this.startNode(),
                    a = this.yieldPos,
                    s = this.awaitPos;
                return (
                    this.initFunction(i),
                    this.options.ecmaVersion >= 6 && (i.generator = e),
                    this.options.ecmaVersion >= 8 && (i.async = !!t),
                    (this.yieldPos = 0),
                    (this.awaitPos = 0),
                    this.enterScope(64 | _(t, i.generator) | (r ? 128 : 0)),
                    this.expect(x.parenL),
                    (i.params = this.parseBindingList(x.parenR, false, this.options.ecmaVersion >= 8)),
                    this.checkYieldAwaitInDefaultParams(),
                    this.parseFunctionBody(i, false),
                    (this.yieldPos = a),
                    (this.awaitPos = s),
                    this.finishNode(i, "FunctionExpression")
                );
            }),
            (ee.parseArrowExpression = function (e, t, r) {
                var i = this.yieldPos,
                    a = this.awaitPos;
                return (
                    this.enterScope(16 | _(r, false)),
                    this.initFunction(e),
                    this.options.ecmaVersion >= 8 && (e.async = !!r),
                    (this.yieldPos = 0),
                    (this.awaitPos = 0),
                    (e.params = this.toAssignableList(t, true)),
                    this.parseFunctionBody(e, true),
                    (this.yieldPos = i),
                    (this.awaitPos = a),
                    this.finishNode(e, "ArrowFunctionExpression")
                );
            }),
            (ee.parseFunctionBody = function (e, t) {
                var r = t && this.type !== x.braceL,
                    i = this.strict,
                    a = false;
                if (r) (e.body = this.parseMaybeAssign()), (e.expression = true), this.checkParams(e, false);
                else {
                    var s = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(e.params);
                    (i && !s) ||
                        ((a = this.strictDirective(this.end)) &&
                            s &&
                            this.raiseRecoverable(
                                e.start,
                                "Illegal 'use strict' directive in function with non-simple parameter list"
                            ));
                    var n = this.labels;
                    (this.labels = []),
                        a && (this.strict = true),
                        this.checkParams(e, !i && !a && !t && this.isSimpleParamList(e.params)),
                        (e.body = this.parseBlock(false)),
                        (e.expression = false),
                        this.adaptDirectivePrologue(e.body.body),
                        (this.labels = n);
                }
                this.exitScope(), this.strict && e.id && this.checkLVal(e.id, 5), (this.strict = i);
            }),
            (ee.isSimpleParamList = function (e) {
                for (var t = 0, r = e; t < r.length; t += 1) {
                    var i = r[t];
                    if ("Identifier" !== i.type) return false;
                }
                return true;
            }),
            (ee.checkParams = function (e, t) {
                for (var r = {}, i = 0, a = e.params; i < a.length; i += 1) {
                    var s = a[i];
                    this.checkLVal(s, 1, t ? null : r);
                }
            }),
            (ee.parseExprList = function (e, t, r, i) {
                for (var a = [], s = true; !this.eat(e); ) {
                    if (s) s = false;
                    else if ((this.expect(x.comma), t && this.afterTrailingComma(e))) break;
                    var n = undefined;
                    r && this.type === x.comma
                        ? (n = null)
                        : this.type === x.ellipsis
                        ? ((n = this.parseSpread(i)),
                          i && this.type === x.comma && i.trailingComma < 0 && (i.trailingComma = this.start))
                        : (n = this.parseMaybeAssign(false, i)),
                        a.push(n);
                }
                return a;
            }),
            (ee.checkUnreserved = function (e) {
                var t = e.start,
                    r = e.end,
                    i = e.name;
                if (
                    (this.inGenerator &&
                        "yield" === i &&
                        this.raiseRecoverable(t, "Can not use 'yield' as identifier inside a generator"),
                    this.inAsync &&
                        "await" === i &&
                        this.raiseRecoverable(t, "Can not use 'await' as identifier inside an async function"),
                    this.keywords.test(i) && this.raise(t, "Unexpected keyword '" + i + "'"),
                    !(this.options.ecmaVersion < 6 && -1 !== this.input.slice(t, r).indexOf("\\")))
                ) {
                    var a = this.strict ? this.reservedWordsStrict : this.reservedWords;
                    a.test(i) &&
                        (this.inAsync ||
                            "await" !== i ||
                            this.raiseRecoverable(t, "Can not use keyword 'await' outside an async function"),
                        this.raiseRecoverable(t, "The keyword '" + i + "' is reserved"));
                }
            }),
            (ee.parseIdent = function (e, t) {
                var r = this.startNode();
                return (
                    e && "never" === this.options.allowReserved && (e = false),
                    this.type === x.name
                        ? (r.name = this.value)
                        : this.type.keyword
                        ? ((r.name = this.type.keyword),
                          ("class" !== r.name && "function" !== r.name) ||
                              (this.lastTokEnd === this.lastTokStart + 1 &&
                                  46 === this.input.charCodeAt(this.lastTokStart)) ||
                              this.context.pop())
                        : this.unexpected(),
                    this.next(),
                    this.finishNode(r, "Identifier"),
                    e || this.checkUnreserved(r),
                    r
                );
            }),
            (ee.parseYield = function () {
                this.yieldPos || (this.yieldPos = this.start);
                var e = this.startNode();
                return (
                    this.next(),
                    this.type === x.semi || this.canInsertSemicolon() || (this.type !== x.star && !this.type.startsExpr)
                        ? ((e.delegate = false), (e.argument = null))
                        : ((e.delegate = this.eat(x.star)), (e.argument = this.parseMaybeAssign())),
                    this.finishNode(e, "YieldExpression")
                );
            }),
            (ee.parseAwait = function () {
                this.awaitPos || (this.awaitPos = this.start);
                var e = this.startNode();
                return (
                    this.next(), (e.argument = this.parseMaybeUnary(null, true)), this.finishNode(e, "AwaitExpression")
                );
            });
        var re = G.prototype;
        (re.raise = function (e, t) {
            var r = M(this.input, e);
            t += " (" + r.line + ":" + r.column + ")";
            var i = new SyntaxError(t);
            throw ((i.pos = e), (i.loc = r), (i.raisedAt = this.pos), i);
        }),
            (re.raiseRecoverable = re.raise),
            (re.curPosition = function () {
                if (this.options.locations) return new N(this.curLine, this.pos - this.lineStart);
            });
        var ie = G.prototype;
        (ie.enterScope = function (e) {
            this.scopeStack.push(
                new (function (e) {
                    (this.flags = e), (this.var = []), (this.lexical = []);
                })(e)
            );
        }),
            (ie.exitScope = function () {
                this.scopeStack.pop();
            }),
            (ie.declareName = function (e, t, r) {
                var i = false;
                if (2 === t) {
                    var a = this.currentScope();
                    (i = a.lexical.indexOf(e) > -1 || a.var.indexOf(e) > -1), a.lexical.push(e);
                } else if (4 === t) {
                    var s = this.currentScope();
                    s.lexical.push(e);
                } else if (3 === t) {
                    var n = this.currentScope();
                    (i = n.lexical.indexOf(e) > -1), n.var.push(e);
                } else
                    for (var o = this.scopeStack.length - 1; o >= 0; --o) {
                        var p = this.scopeStack[o];
                        if (
                            (p.lexical.indexOf(e) > -1 && !(32 & p.flags) && p.lexical[0] === e && (i = true),
                            p.var.push(e),
                            p.flags & A)
                        )
                            break;
                    }
                i && this.raiseRecoverable(r, "Identifier '" + e + "' has already been declared");
            }),
            (ie.currentScope = function () {
                return this.scopeStack[this.scopeStack.length - 1];
            }),
            (ie.currentVarScope = function () {
                for (var e = this.scopeStack.length - 1; ; e--) {
                    var t = this.scopeStack[e];
                    if (t.flags & A) return t;
                }
            }),
            (ie.currentThisScope = function () {
                for (var e = this.scopeStack.length - 1; ; e--) {
                    var t = this.scopeStack[e];
                    if (t.flags & A && !(16 & t.flags)) return t;
                }
            });
        var ae = function (e, t, r) {
                (this.type = ""),
                    (this.start = t),
                    (this.end = 0),
                    e.options.locations && (this.loc = new L(e, r)),
                    e.options.directSourceFile && (this.sourceFile = e.options.directSourceFile),
                    e.options.ranges && (this.range = [t, 0]);
            },
            se = G.prototype;
        function ne(e, t, r, i) {
            return (
                (e.type = t),
                (e.end = r),
                this.options.locations && (e.loc.end = i),
                this.options.ranges && (e.range[1] = r),
                e
            );
        }
        (se.startNode = function () {
            return new ae(this, this.start, this.startLoc);
        }),
            (se.startNodeAt = function (e, t) {
                return new ae(this, e, t);
            }),
            (se.finishNode = function (e, t) {
                return ne.call(this, e, t, this.lastTokEnd, this.lastTokEndLoc);
            }),
            (se.finishNodeAt = function (e, t, r, i) {
                return ne.call(this, e, t, r, i);
            });
        var oe = function (e, t, r, i, a) {
                (this.token = e),
                    (this.isExpr = !!t),
                    (this.preserveSpace = !!r),
                    (this.override = i),
                    (this.generator = !!a);
            },
            pe = {
                b_stat: new oe("{", false),
                b_expr: new oe("{", true),
                b_tmpl: new oe("${", false),
                p_stat: new oe("(", false),
                p_expr: new oe("(", true),
                q_tmpl: new oe("`", true, true, function (e) {
                    return e.tryReadTemplateToken();
                }),
                f_stat: new oe("function", false),
                f_expr: new oe("function", true),
                f_expr_gen: new oe("function", true, false, null, true),
                f_gen: new oe("function", false, false, null, true),
            },
            le = G.prototype;
        (le.initialContext = function () {
            return [pe.b_stat];
        }),
            (le.braceIsBlock = function (e) {
                var t = this.curContext();
                return (
                    t === pe.f_expr ||
                    t === pe.f_stat ||
                    (e !== x.colon || (t !== pe.b_stat && t !== pe.b_expr)
                        ? e === x._return || (e === x.name && this.exprAllowed)
                            ? P.test(this.input.slice(this.lastTokEnd, this.start))
                            : e === x._else ||
                              e === x.semi ||
                              e === x.eof ||
                              e === x.parenR ||
                              e === x.arrow ||
                              (e === x.braceL
                                  ? t === pe.b_stat
                                  : e !== x._var && e !== x._const && e !== x.name && !this.exprAllowed)
                        : !t.isExpr)
                );
            }),
            (le.inGeneratorContext = function () {
                for (var e = this.context.length - 1; e >= 1; e--) {
                    var t = this.context[e];
                    if ("function" === t.token) return t.generator;
                }
                return false;
            }),
            (le.updateContext = function (e) {
                var t,
                    r = this.type;
                r.keyword && e === x.dot
                    ? (this.exprAllowed = false)
                    : (t = r.updateContext)
                    ? t.call(this, e)
                    : (this.exprAllowed = r.beforeExpr);
            }),
            (x.parenR.updateContext = x.braceR.updateContext =
                function () {
                    if (1 !== this.context.length) {
                        var e = this.context.pop();
                        e === pe.b_stat && "function" === this.curContext().token && (e = this.context.pop()),
                            (this.exprAllowed = !e.isExpr);
                    } else this.exprAllowed = true;
                }),
            (x.braceL.updateContext = function (e) {
                this.context.push(this.braceIsBlock(e) ? pe.b_stat : pe.b_expr), (this.exprAllowed = true);
            }),
            (x.dollarBraceL.updateContext = function () {
                this.context.push(pe.b_tmpl), (this.exprAllowed = true);
            }),
            (x.parenL.updateContext = function (e) {
                var t = e === x._if || e === x._for || e === x._with || e === x._while;
                this.context.push(t ? pe.p_stat : pe.p_expr), (this.exprAllowed = true);
            }),
            (x.incDec.updateContext = function () {}),
            (x._function.updateContext = x._class.updateContext =
                function (e) {
                    !e.beforeExpr ||
                    e === x.semi ||
                    e === x._else ||
                    (e === x._return && P.test(this.input.slice(this.lastTokEnd, this.start))) ||
                    ((e === x.colon || e === x.braceL) && this.curContext() === pe.b_stat)
                        ? this.context.push(pe.f_stat)
                        : this.context.push(pe.f_expr),
                        (this.exprAllowed = false);
                }),
            (x.backQuote.updateContext = function () {
                this.curContext() === pe.q_tmpl ? this.context.pop() : this.context.push(pe.q_tmpl),
                    (this.exprAllowed = false);
            }),
            (x.star.updateContext = function (e) {
                if (e === x._function) {
                    var t = this.context.length - 1;
                    this.context[t] === pe.f_expr ? (this.context[t] = pe.f_expr_gen) : (this.context[t] = pe.f_gen);
                }
                this.exprAllowed = true;
            }),
            (x.name.updateContext = function (e) {
                var t = false;
                this.options.ecmaVersion >= 6 &&
                    e !== x.dot &&
                    (("of" === this.value && !this.exprAllowed) ||
                        ("yield" === this.value && this.inGeneratorContext())) &&
                    (t = true),
                    (this.exprAllowed = t);
            });
        var he = {
            $LONE: [
                "ASCII",
                "ASCII_Hex_Digit",
                "AHex",
                "Alphabetic",
                "Alpha",
                "Any",
                "Assigned",
                "Bidi_Control",
                "Bidi_C",
                "Bidi_Mirrored",
                "Bidi_M",
                "Case_Ignorable",
                "CI",
                "Cased",
                "Changes_When_Casefolded",
                "CWCF",
                "Changes_When_Casemapped",
                "CWCM",
                "Changes_When_Lowercased",
                "CWL",
                "Changes_When_NFKC_Casefolded",
                "CWKCF",
                "Changes_When_Titlecased",
                "CWT",
                "Changes_When_Uppercased",
                "CWU",
                "Dash",
                "Default_Ignorable_Code_Point",
                "DI",
                "Deprecated",
                "Dep",
                "Diacritic",
                "Dia",
                "Emoji",
                "Emoji_Component",
                "Emoji_Modifier",
                "Emoji_Modifier_Base",
                "Emoji_Presentation",
                "Extender",
                "Ext",
                "Grapheme_Base",
                "Gr_Base",
                "Grapheme_Extend",
                "Gr_Ext",
                "Hex_Digit",
                "Hex",
                "IDS_Binary_Operator",
                "IDSB",
                "IDS_Trinary_Operator",
                "IDST",
                "ID_Continue",
                "IDC",
                "ID_Start",
                "IDS",
                "Ideographic",
                "Ideo",
                "Join_Control",
                "Join_C",
                "Logical_Order_Exception",
                "LOE",
                "Lowercase",
                "Lower",
                "Math",
                "Noncharacter_Code_Point",
                "NChar",
                "Pattern_Syntax",
                "Pat_Syn",
                "Pattern_White_Space",
                "Pat_WS",
                "Quotation_Mark",
                "QMark",
                "Radical",
                "Regional_Indicator",
                "RI",
                "Sentence_Terminal",
                "STerm",
                "Soft_Dotted",
                "SD",
                "Terminal_Punctuation",
                "Term",
                "Unified_Ideograph",
                "UIdeo",
                "Uppercase",
                "Upper",
                "Variation_Selector",
                "VS",
                "White_Space",
                "space",
                "XID_Continue",
                "XIDC",
                "XID_Start",
                "XIDS",
            ],
            General_Category: [
                "Cased_Letter",
                "LC",
                "Close_Punctuation",
                "Pe",
                "Connector_Punctuation",
                "Pc",
                "Control",
                "Cc",
                "cntrl",
                "Currency_Symbol",
                "Sc",
                "Dash_Punctuation",
                "Pd",
                "Decimal_Number",
                "Nd",
                "digit",
                "Enclosing_Mark",
                "Me",
                "Final_Punctuation",
                "Pf",
                "Format",
                "Cf",
                "Initial_Punctuation",
                "Pi",
                "Letter",
                "L",
                "Letter_Number",
                "Nl",
                "Line_Separator",
                "Zl",
                "Lowercase_Letter",
                "Ll",
                "Mark",
                "M",
                "Combining_Mark",
                "Math_Symbol",
                "Sm",
                "Modifier_Letter",
                "Lm",
                "Modifier_Symbol",
                "Sk",
                "Nonspacing_Mark",
                "Mn",
                "Number",
                "N",
                "Open_Punctuation",
                "Ps",
                "Other",
                "C",
                "Other_Letter",
                "Lo",
                "Other_Number",
                "No",
                "Other_Punctuation",
                "Po",
                "Other_Symbol",
                "So",
                "Paragraph_Separator",
                "Zp",
                "Private_Use",
                "Co",
                "Punctuation",
                "P",
                "punct",
                "Separator",
                "Z",
                "Space_Separator",
                "Zs",
                "Spacing_Mark",
                "Mc",
                "Surrogate",
                "Cs",
                "Symbol",
                "S",
                "Titlecase_Letter",
                "Lt",
                "Unassigned",
                "Cn",
                "Uppercase_Letter",
                "Lu",
            ],
            Script: [
                "Adlam",
                "Adlm",
                "Ahom",
                "Anatolian_Hieroglyphs",
                "Hluw",
                "Arabic",
                "Arab",
                "Armenian",
                "Armn",
                "Avestan",
                "Avst",
                "Balinese",
                "Bali",
                "Bamum",
                "Bamu",
                "Bassa_Vah",
                "Bass",
                "Batak",
                "Batk",
                "Bengali",
                "Beng",
                "Bhaiksuki",
                "Bhks",
                "Bopomofo",
                "Bopo",
                "Brahmi",
                "Brah",
                "Braille",
                "Brai",
                "Buginese",
                "Bugi",
                "Buhid",
                "Buhd",
                "Canadian_Aboriginal",
                "Cans",
                "Carian",
                "Cari",
                "Caucasian_Albanian",
                "Aghb",
                "Chakma",
                "Cakm",
                "Cham",
                "Cherokee",
                "Cher",
                "Common",
                "Zyyy",
                "Coptic",
                "Copt",
                "Qaac",
                "Cuneiform",
                "Xsux",
                "Cypriot",
                "Cprt",
                "Cyrillic",
                "Cyrl",
                "Deseret",
                "Dsrt",
                "Devanagari",
                "Deva",
                "Duployan",
                "Dupl",
                "Egyptian_Hieroglyphs",
                "Egyp",
                "Elbasan",
                "Elba",
                "Ethiopic",
                "Ethi",
                "Georgian",
                "Geor",
                "Glagolitic",
                "Glag",
                "Gothic",
                "Goth",
                "Grantha",
                "Gran",
                "Greek",
                "Grek",
                "Gujarati",
                "Gujr",
                "Gurmukhi",
                "Guru",
                "Han",
                "Hani",
                "Hangul",
                "Hang",
                "Hanunoo",
                "Hano",
                "Hatran",
                "Hatr",
                "Hebrew",
                "Hebr",
                "Hiragana",
                "Hira",
                "Imperial_Aramaic",
                "Armi",
                "Inherited",
                "Zinh",
                "Qaai",
                "Inscriptional_Pahlavi",
                "Phli",
                "Inscriptional_Parthian",
                "Prti",
                "Javanese",
                "Java",
                "Kaithi",
                "Kthi",
                "Kannada",
                "Knda",
                "Katakana",
                "Kana",
                "Kayah_Li",
                "Kali",
                "Kharoshthi",
                "Khar",
                "Khmer",
                "Khmr",
                "Khojki",
                "Khoj",
                "Khudawadi",
                "Sind",
                "Lao",
                "Laoo",
                "Latin",
                "Latn",
                "Lepcha",
                "Lepc",
                "Limbu",
                "Limb",
                "Linear_A",
                "Lina",
                "Linear_B",
                "Linb",
                "Lisu",
                "Lycian",
                "Lyci",
                "Lydian",
                "Lydi",
                "Mahajani",
                "Mahj",
                "Malayalam",
                "Mlym",
                "Mandaic",
                "Mand",
                "Manichaean",
                "Mani",
                "Marchen",
                "Marc",
                "Masaram_Gondi",
                "Gonm",
                "Meetei_Mayek",
                "Mtei",
                "Mende_Kikakui",
                "Mend",
                "Meroitic_Cursive",
                "Merc",
                "Meroitic_Hieroglyphs",
                "Mero",
                "Miao",
                "Plrd",
                "Modi",
                "Mongolian",
                "Mong",
                "Mro",
                "Mroo",
                "Multani",
                "Mult",
                "Myanmar",
                "Mymr",
                "Nabataean",
                "Nbat",
                "New_Tai_Lue",
                "Talu",
                "Newa",
                "Nko",
                "Nkoo",
                "Nushu",
                "Nshu",
                "Ogham",
                "Ogam",
                "Ol_Chiki",
                "Olck",
                "Old_Hungarian",
                "Hung",
                "Old_Italic",
                "Ital",
                "Old_North_Arabian",
                "Narb",
                "Old_Permic",
                "Perm",
                "Old_Persian",
                "Xpeo",
                "Old_South_Arabian",
                "Sarb",
                "Old_Turkic",
                "Orkh",
                "Oriya",
                "Orya",
                "Osage",
                "Osge",
                "Osmanya",
                "Osma",
                "Pahawh_Hmong",
                "Hmng",
                "Palmyrene",
                "Palm",
                "Pau_Cin_Hau",
                "Pauc",
                "Phags_Pa",
                "Phag",
                "Phoenician",
                "Phnx",
                "Psalter_Pahlavi",
                "Phlp",
                "Rejang",
                "Rjng",
                "Runic",
                "Runr",
                "Samaritan",
                "Samr",
                "Saurashtra",
                "Saur",
                "Sharada",
                "Shrd",
                "Shavian",
                "Shaw",
                "Siddham",
                "Sidd",
                "SignWriting",
                "Sgnw",
                "Sinhala",
                "Sinh",
                "Sora_Sompeng",
                "Sora",
                "Soyombo",
                "Soyo",
                "Sundanese",
                "Sund",
                "Syloti_Nagri",
                "Sylo",
                "Syriac",
                "Syrc",
                "Tagalog",
                "Tglg",
                "Tagbanwa",
                "Tagb",
                "Tai_Le",
                "Tale",
                "Tai_Tham",
                "Lana",
                "Tai_Viet",
                "Tavt",
                "Takri",
                "Takr",
                "Tamil",
                "Taml",
                "Tangut",
                "Tang",
                "Telugu",
                "Telu",
                "Thaana",
                "Thaa",
                "Thai",
                "Tibetan",
                "Tibt",
                "Tifinagh",
                "Tfng",
                "Tirhuta",
                "Tirh",
                "Ugaritic",
                "Ugar",
                "Vai",
                "Vaii",
                "Warang_Citi",
                "Wara",
                "Yi",
                "Yiii",
                "Zanabazar_Square",
                "Zanb",
            ],
        };
        Array.prototype.push.apply(he.$LONE, he.General_Category),
            (he.gc = he.General_Category),
            (he.sc = he.Script_Extensions = he.scx = he.Script);
        var ce = G.prototype,
            ue = function (e) {
                (this.parser = e),
                    (this.validFlags =
                        "gim" + (e.options.ecmaVersion >= 6 ? "uy" : "") + (e.options.ecmaVersion >= 9 ? "s" : "")),
                    (this.source = ""),
                    (this.flags = ""),
                    (this.start = 0),
                    (this.switchU = false),
                    (this.switchN = false),
                    (this.pos = 0),
                    (this.lastIntValue = 0),
                    (this.lastStringValue = ""),
                    (this.lastAssertionIsQuantifiable = false),
                    (this.numCapturingParens = 0),
                    (this.maxBackReference = 0),
                    (this.groupNames = []),
                    (this.backReferenceNames = []);
            };
        function de(e) {
            return e <= 65535
                ? String.fromCharCode(e)
                : ((e -= 65536), String.fromCharCode(55296 + (e >> 10), 56320 + (1023 & e)));
        }
        function fe(e) {
            return (
                36 === e ||
                (e >= 40 && e <= 43) ||
                46 === e ||
                63 === e ||
                (e >= 91 && e <= 94) ||
                (e >= 123 && e <= 125)
            );
        }
        function me(e) {
            return (e >= 65 && e <= 90) || (e >= 97 && e <= 122);
        }
        function ye(e) {
            return me(e) || 95 === e;
        }
        function ge(e) {
            return ye(e) || ve(e);
        }
        function ve(e) {
            return e >= 48 && e <= 57;
        }
        function be(e) {
            return (e >= 48 && e <= 57) || (e >= 65 && e <= 70) || (e >= 97 && e <= 102);
        }
        function xe(e) {
            return e >= 65 && e <= 70 ? e - 65 + 10 : e >= 97 && e <= 102 ? e - 97 + 10 : e - 48;
        }
        function Pe(e) {
            return e >= 48 && e <= 55;
        }
        (ue.prototype.reset = function (e, t, r) {
            var i = -1 !== r.indexOf("u");
            (this.start = 0 | e),
                (this.source = t + ""),
                (this.flags = r),
                (this.switchU = i && this.parser.options.ecmaVersion >= 6),
                (this.switchN = i && this.parser.options.ecmaVersion >= 9);
        }),
            (ue.prototype.raise = function (e) {
                this.parser.raiseRecoverable(this.start, "Invalid regular expression: /" + this.source + "/: " + e);
            }),
            (ue.prototype.at = function (e) {
                var t = this.source,
                    r = t.length;
                if (e >= r) return -1;
                var i = t.charCodeAt(e);
                return !this.switchU || i <= 55295 || i >= 57344 || e + 1 >= r
                    ? i
                    : (i << 10) + t.charCodeAt(e + 1) - 56613888;
            }),
            (ue.prototype.nextIndex = function (e) {
                var t = this.source,
                    r = t.length;
                if (e >= r) return r;
                var i = t.charCodeAt(e);
                return !this.switchU || i <= 55295 || i >= 57344 || e + 1 >= r ? e + 1 : e + 2;
            }),
            (ue.prototype.current = function () {
                return this.at(this.pos);
            }),
            (ue.prototype.lookahead = function () {
                return this.at(this.nextIndex(this.pos));
            }),
            (ue.prototype.advance = function () {
                this.pos = this.nextIndex(this.pos);
            }),
            (ue.prototype.eat = function (e) {
                return this.current() === e && (this.advance(), true);
            }),
            (ce.validateRegExpFlags = function (e) {
                for (var t = e.validFlags, r = e.flags, i = 0; i < r.length; i++) {
                    var a = r.charAt(i);
                    -1 === t.indexOf(a) && this.raise(e.start, "Invalid regular expression flag"),
                        r.indexOf(a, i + 1) > -1 && this.raise(e.start, "Duplicate regular expression flag");
                }
            }),
            (ce.validateRegExpPattern = function (e) {
                this.regexp_pattern(e),
                    !e.switchN &&
                        this.options.ecmaVersion >= 9 &&
                        e.groupNames.length > 0 &&
                        ((e.switchN = true), this.regexp_pattern(e));
            }),
            (ce.regexp_pattern = function (e) {
                (e.pos = 0),
                    (e.lastIntValue = 0),
                    (e.lastStringValue = ""),
                    (e.lastAssertionIsQuantifiable = false),
                    (e.numCapturingParens = 0),
                    (e.maxBackReference = 0),
                    (e.groupNames.length = 0),
                    (e.backReferenceNames.length = 0),
                    this.regexp_disjunction(e),
                    e.pos !== e.source.length &&
                        (e.eat(41) && e.raise("Unmatched ')'"),
                        (e.eat(93) || e.eat(125)) && e.raise("Lone quantifier brackets")),
                    e.maxBackReference > e.numCapturingParens && e.raise("Invalid escape");
                for (var t = 0, r = e.backReferenceNames; t < r.length; t += 1) {
                    var i = r[t];
                    -1 === e.groupNames.indexOf(i) && e.raise("Invalid named capture referenced");
                }
            }),
            (ce.regexp_disjunction = function (e) {
                for (this.regexp_alternative(e); e.eat(124); ) this.regexp_alternative(e);
                this.regexp_eatQuantifier(e, true) && e.raise("Nothing to repeat"),
                    e.eat(123) && e.raise("Lone quantifier brackets");
            }),
            (ce.regexp_alternative = function (e) {
                for (; e.pos < e.source.length && this.regexp_eatTerm(e); );
            }),
            (ce.regexp_eatTerm = function (e) {
                return this.regexp_eatAssertion(e)
                    ? (e.lastAssertionIsQuantifiable &&
                          this.regexp_eatQuantifier(e) &&
                          e.switchU &&
                          e.raise("Invalid quantifier"),
                      true)
                    : !(e.switchU ? !this.regexp_eatAtom(e) : !this.regexp_eatExtendedAtom(e)) &&
                          (this.regexp_eatQuantifier(e), true);
            }),
            (ce.regexp_eatAssertion = function (e) {
                var t = e.pos;
                if (((e.lastAssertionIsQuantifiable = false), e.eat(94) || e.eat(36))) return true;
                if (e.eat(92)) {
                    if (e.eat(66) || e.eat(98)) return true;
                    e.pos = t;
                }
                if (e.eat(40) && e.eat(63)) {
                    var r = false;
                    if ((this.options.ecmaVersion >= 9 && (r = e.eat(60)), e.eat(61) || e.eat(33)))
                        return (
                            this.regexp_disjunction(e),
                            e.eat(41) || e.raise("Unterminated group"),
                            (e.lastAssertionIsQuantifiable = !r),
                            true
                        );
                }
                return (e.pos = t), false;
            }),
            (ce.regexp_eatQuantifier = function (e, t) {
                return undefined === t && (t = false), !!this.regexp_eatQuantifierPrefix(e, t) && (e.eat(63), true);
            }),
            (ce.regexp_eatQuantifierPrefix = function (e, t) {
                return e.eat(42) || e.eat(43) || e.eat(63) || this.regexp_eatBracedQuantifier(e, t);
            }),
            (ce.regexp_eatBracedQuantifier = function (e, t) {
                var r = e.pos;
                if (e.eat(123)) {
                    var i = 0,
                        a = -1;
                    if (
                        this.regexp_eatDecimalDigits(e) &&
                        ((i = e.lastIntValue),
                        e.eat(44) && this.regexp_eatDecimalDigits(e) && (a = e.lastIntValue),
                        e.eat(125))
                    )
                        return -1 !== a && a < i && !t && e.raise("numbers out of order in {} quantifier"), true;
                    e.switchU && !t && e.raise("Incomplete quantifier"), (e.pos = r);
                }
                return false;
            }),
            (ce.regexp_eatAtom = function (e) {
                return (
                    this.regexp_eatPatternCharacters(e) ||
                    e.eat(46) ||
                    this.regexp_eatReverseSolidusAtomEscape(e) ||
                    this.regexp_eatCharacterClass(e) ||
                    this.regexp_eatUncapturingGroup(e) ||
                    this.regexp_eatCapturingGroup(e)
                );
            }),
            (ce.regexp_eatReverseSolidusAtomEscape = function (e) {
                var t = e.pos;
                if (e.eat(92)) {
                    if (this.regexp_eatAtomEscape(e)) return true;
                    e.pos = t;
                }
                return false;
            }),
            (ce.regexp_eatUncapturingGroup = function (e) {
                var t = e.pos;
                if (e.eat(40)) {
                    if (e.eat(63) && e.eat(58)) {
                        if ((this.regexp_disjunction(e), e.eat(41))) return true;
                        e.raise("Unterminated group");
                    }
                    e.pos = t;
                }
                return false;
            }),
            (ce.regexp_eatCapturingGroup = function (e) {
                if (e.eat(40)) {
                    if (
                        (this.options.ecmaVersion >= 9
                            ? this.regexp_groupSpecifier(e)
                            : 63 === e.current() && e.raise("Invalid group"),
                        this.regexp_disjunction(e),
                        e.eat(41))
                    )
                        return (e.numCapturingParens += 1), true;
                    e.raise("Unterminated group");
                }
                return false;
            }),
            (ce.regexp_eatExtendedAtom = function (e) {
                return (
                    e.eat(46) ||
                    this.regexp_eatReverseSolidusAtomEscape(e) ||
                    this.regexp_eatCharacterClass(e) ||
                    this.regexp_eatUncapturingGroup(e) ||
                    this.regexp_eatCapturingGroup(e) ||
                    this.regexp_eatInvalidBracedQuantifier(e) ||
                    this.regexp_eatExtendedPatternCharacter(e)
                );
            }),
            (ce.regexp_eatInvalidBracedQuantifier = function (e) {
                return this.regexp_eatBracedQuantifier(e, true) && e.raise("Nothing to repeat"), false;
            }),
            (ce.regexp_eatSyntaxCharacter = function (e) {
                var t = e.current();
                return !!fe(t) && ((e.lastIntValue = t), e.advance(), true);
            }),
            (ce.regexp_eatPatternCharacters = function (e) {
                for (var t = e.pos, r = 0; -1 !== (r = e.current()) && !fe(r); ) e.advance();
                return e.pos !== t;
            }),
            (ce.regexp_eatExtendedPatternCharacter = function (e) {
                var t = e.current();
                return (
                    !(
                        -1 === t ||
                        36 === t ||
                        (t >= 40 && t <= 43) ||
                        46 === t ||
                        63 === t ||
                        91 === t ||
                        94 === t ||
                        124 === t
                    ) && (e.advance(), true)
                );
            }),
            (ce.regexp_groupSpecifier = function (e) {
                if (e.eat(63)) {
                    if (this.regexp_eatGroupName(e))
                        return (
                            -1 !== e.groupNames.indexOf(e.lastStringValue) && e.raise("Duplicate capture group name"),
                            void e.groupNames.push(e.lastStringValue)
                        );
                    e.raise("Invalid group");
                }
            }),
            (ce.regexp_eatGroupName = function (e) {
                if (((e.lastStringValue = ""), e.eat(60))) {
                    if (this.regexp_eatRegExpIdentifierName(e) && e.eat(62)) return true;
                    e.raise("Invalid capture group name");
                }
                return false;
            }),
            (ce.regexp_eatRegExpIdentifierName = function (e) {
                if (((e.lastStringValue = ""), this.regexp_eatRegExpIdentifierStart(e))) {
                    for (e.lastStringValue += de(e.lastIntValue); this.regexp_eatRegExpIdentifierPart(e); )
                        e.lastStringValue += de(e.lastIntValue);
                    return true;
                }
                return false;
            }),
            (ce.regexp_eatRegExpIdentifierStart = function (e) {
                var t = e.pos,
                    r = e.current();
                return (
                    e.advance(),
                    92 === r && this.regexp_eatRegExpUnicodeEscapeSequence(e) && (r = e.lastIntValue),
                    (function (e) {
                        return u(e, true) || 36 === e || 95 === e;
                    })(r)
                        ? ((e.lastIntValue = r), true)
                        : ((e.pos = t), false)
                );
            }),
            (ce.regexp_eatRegExpIdentifierPart = function (e) {
                var t = e.pos,
                    r = e.current();
                return (
                    e.advance(),
                    92 === r && this.regexp_eatRegExpUnicodeEscapeSequence(e) && (r = e.lastIntValue),
                    (function (e) {
                        return d(e, true) || 36 === e || 95 === e || 8204 === e || 8205 === e;
                    })(r)
                        ? ((e.lastIntValue = r), true)
                        : ((e.pos = t), false)
                );
            }),
            (ce.regexp_eatAtomEscape = function (e) {
                return (
                    !!(
                        this.regexp_eatBackReference(e) ||
                        this.regexp_eatCharacterClassEscape(e) ||
                        this.regexp_eatCharacterEscape(e) ||
                        (e.switchN && this.regexp_eatKGroupName(e))
                    ) ||
                    (e.switchU && (99 === e.current() && e.raise("Invalid unicode escape"), e.raise("Invalid escape")),
                    false)
                );
            }),
            (ce.regexp_eatBackReference = function (e) {
                var t = e.pos;
                if (this.regexp_eatDecimalEscape(e)) {
                    var r = e.lastIntValue;
                    if (e.switchU) return r > e.maxBackReference && (e.maxBackReference = r), true;
                    if (r <= e.numCapturingParens) return true;
                    e.pos = t;
                }
                return false;
            }),
            (ce.regexp_eatKGroupName = function (e) {
                if (e.eat(107)) {
                    if (this.regexp_eatGroupName(e)) return e.backReferenceNames.push(e.lastStringValue), true;
                    e.raise("Invalid named reference");
                }
                return false;
            }),
            (ce.regexp_eatCharacterEscape = function (e) {
                return (
                    this.regexp_eatControlEscape(e) ||
                    this.regexp_eatCControlLetter(e) ||
                    this.regexp_eatZero(e) ||
                    this.regexp_eatHexEscapeSequence(e) ||
                    this.regexp_eatRegExpUnicodeEscapeSequence(e) ||
                    (!e.switchU && this.regexp_eatLegacyOctalEscapeSequence(e)) ||
                    this.regexp_eatIdentityEscape(e)
                );
            }),
            (ce.regexp_eatCControlLetter = function (e) {
                var t = e.pos;
                if (e.eat(99)) {
                    if (this.regexp_eatControlLetter(e)) return true;
                    e.pos = t;
                }
                return false;
            }),
            (ce.regexp_eatZero = function (e) {
                return 48 === e.current() && !ve(e.lookahead()) && ((e.lastIntValue = 0), e.advance(), true);
            }),
            (ce.regexp_eatControlEscape = function (e) {
                var t = e.current();
                return 116 === t
                    ? ((e.lastIntValue = 9), e.advance(), true)
                    : 110 === t
                    ? ((e.lastIntValue = 10), e.advance(), true)
                    : 118 === t
                    ? ((e.lastIntValue = 11), e.advance(), true)
                    : 102 === t
                    ? ((e.lastIntValue = 12), e.advance(), true)
                    : 114 === t && ((e.lastIntValue = 13), e.advance(), true);
            }),
            (ce.regexp_eatControlLetter = function (e) {
                var t = e.current();
                return !!me(t) && ((e.lastIntValue = t % 32), e.advance(), true);
            }),
            (ce.regexp_eatRegExpUnicodeEscapeSequence = function (e) {
                var t,
                    r = e.pos;
                if (e.eat(117)) {
                    if (this.regexp_eatFixedHexDigits(e, 4)) {
                        var i = e.lastIntValue;
                        if (e.switchU && i >= 55296 && i <= 56319) {
                            var a = e.pos;
                            if (e.eat(92) && e.eat(117) && this.regexp_eatFixedHexDigits(e, 4)) {
                                var s = e.lastIntValue;
                                if (s >= 56320 && s <= 57343)
                                    return (e.lastIntValue = 1024 * (i - 55296) + (s - 56320) + 65536), true;
                            }
                            (e.pos = a), (e.lastIntValue = i);
                        }
                        return true;
                    }
                    if (
                        e.switchU &&
                        e.eat(123) &&
                        this.regexp_eatHexDigits(e) &&
                        e.eat(125) &&
                        (t = e.lastIntValue) >= 0 &&
                        t <= 1114111
                    )
                        return true;
                    e.switchU && e.raise("Invalid unicode escape"), (e.pos = r);
                }
                return false;
            }),
            (ce.regexp_eatIdentityEscape = function (e) {
                if (e.switchU)
                    return !!this.regexp_eatSyntaxCharacter(e) || (!!e.eat(47) && ((e.lastIntValue = 47), true));
                var t = e.current();
                return !(99 === t || (e.switchN && 107 === t)) && ((e.lastIntValue = t), e.advance(), true);
            }),
            (ce.regexp_eatDecimalEscape = function (e) {
                e.lastIntValue = 0;
                var t = e.current();
                if (t >= 49 && t <= 57) {
                    do {
                        (e.lastIntValue = 10 * e.lastIntValue + (t - 48)), e.advance();
                    } while ((t = e.current()) >= 48 && t <= 57);
                    return true;
                }
                return false;
            }),
            (ce.regexp_eatCharacterClassEscape = function (e) {
                var t = e.current();
                if (
                    (function (e) {
                        return 100 === e || 68 === e || 115 === e || 83 === e || 119 === e || 87 === e;
                    })(t)
                )
                    return (e.lastIntValue = -1), e.advance(), true;
                if (e.switchU && this.options.ecmaVersion >= 9 && (80 === t || 112 === t)) {
                    if (
                        ((e.lastIntValue = -1),
                        e.advance(),
                        e.eat(123) && this.regexp_eatUnicodePropertyValueExpression(e) && e.eat(125))
                    )
                        return true;
                    e.raise("Invalid property name");
                }
                return false;
            }),
            (ce.regexp_eatUnicodePropertyValueExpression = function (e) {
                var t = e.pos;
                if (this.regexp_eatUnicodePropertyName(e) && e.eat(61)) {
                    var r = e.lastStringValue;
                    if (this.regexp_eatUnicodePropertyValue(e)) {
                        var i = e.lastStringValue;
                        return this.regexp_validateUnicodePropertyNameAndValue(e, r, i), true;
                    }
                }
                if (((e.pos = t), this.regexp_eatLoneUnicodePropertyNameOrValue(e))) {
                    var a = e.lastStringValue;
                    return this.regexp_validateUnicodePropertyNameOrValue(e, a), true;
                }
                return false;
            }),
            (ce.regexp_validateUnicodePropertyNameAndValue = function (e, t, r) {
                (he.hasOwnProperty(t) && -1 !== he[t].indexOf(r)) || e.raise("Invalid property name");
            }),
            (ce.regexp_validateUnicodePropertyNameOrValue = function (e, t) {
                -1 === he.$LONE.indexOf(t) && e.raise("Invalid property name");
            }),
            (ce.regexp_eatUnicodePropertyName = function (e) {
                var t = 0;
                for (e.lastStringValue = ""; ye((t = e.current())); ) (e.lastStringValue += de(t)), e.advance();
                return "" !== e.lastStringValue;
            }),
            (ce.regexp_eatUnicodePropertyValue = function (e) {
                var t = 0;
                for (e.lastStringValue = ""; ge((t = e.current())); ) (e.lastStringValue += de(t)), e.advance();
                return "" !== e.lastStringValue;
            }),
            (ce.regexp_eatLoneUnicodePropertyNameOrValue = function (e) {
                return this.regexp_eatUnicodePropertyValue(e);
            }),
            (ce.regexp_eatCharacterClass = function (e) {
                if (e.eat(91)) {
                    if ((e.eat(94), this.regexp_classRanges(e), e.eat(93))) return true;
                    e.raise("Unterminated character class");
                }
                return false;
            }),
            (ce.regexp_classRanges = function (e) {
                for (; this.regexp_eatClassAtom(e); ) {
                    var t = e.lastIntValue;
                    if (e.eat(45) && this.regexp_eatClassAtom(e)) {
                        var r = e.lastIntValue;
                        !e.switchU || (-1 !== t && -1 !== r) || e.raise("Invalid character class"),
                            -1 !== t && -1 !== r && t > r && e.raise("Range out of order in character class");
                    }
                }
            }),
            (ce.regexp_eatClassAtom = function (e) {
                var t = e.pos;
                if (e.eat(92)) {
                    if (this.regexp_eatClassEscape(e)) return true;
                    if (e.switchU) {
                        var r = e.current();
                        (99 === r || Pe(r)) && e.raise("Invalid class escape"), e.raise("Invalid escape");
                    }
                    e.pos = t;
                }
                var i = e.current();
                return 93 !== i && ((e.lastIntValue = i), e.advance(), true);
            }),
            (ce.regexp_eatClassEscape = function (e) {
                var t = e.pos;
                if (e.eat(98)) return (e.lastIntValue = 8), true;
                if (e.switchU && e.eat(45)) return (e.lastIntValue = 45), true;
                if (!e.switchU && e.eat(99)) {
                    if (this.regexp_eatClassControlLetter(e)) return true;
                    e.pos = t;
                }
                return this.regexp_eatCharacterClassEscape(e) || this.regexp_eatCharacterEscape(e);
            }),
            (ce.regexp_eatClassControlLetter = function (e) {
                var t = e.current();
                return !(!ve(t) && 95 !== t) && ((e.lastIntValue = t % 32), e.advance(), true);
            }),
            (ce.regexp_eatHexEscapeSequence = function (e) {
                var t = e.pos;
                if (e.eat(120)) {
                    if (this.regexp_eatFixedHexDigits(e, 2)) return true;
                    e.switchU && e.raise("Invalid escape"), (e.pos = t);
                }
                return false;
            }),
            (ce.regexp_eatDecimalDigits = function (e) {
                var t = e.pos,
                    r = 0;
                for (e.lastIntValue = 0; ve((r = e.current())); )
                    (e.lastIntValue = 10 * e.lastIntValue + (r - 48)), e.advance();
                return e.pos !== t;
            }),
            (ce.regexp_eatHexDigits = function (e) {
                var t = e.pos,
                    r = 0;
                for (e.lastIntValue = 0; be((r = e.current())); )
                    (e.lastIntValue = 16 * e.lastIntValue + xe(r)), e.advance();
                return e.pos !== t;
            }),
            (ce.regexp_eatLegacyOctalEscapeSequence = function (e) {
                if (this.regexp_eatOctalDigit(e)) {
                    var t = e.lastIntValue;
                    if (this.regexp_eatOctalDigit(e)) {
                        var r = e.lastIntValue;
                        t <= 3 && this.regexp_eatOctalDigit(e)
                            ? (e.lastIntValue = 64 * t + 8 * r + e.lastIntValue)
                            : (e.lastIntValue = 8 * t + r);
                    } else e.lastIntValue = t;
                    return true;
                }
                return false;
            }),
            (ce.regexp_eatOctalDigit = function (e) {
                var t = e.current();
                return Pe(t) ? ((e.lastIntValue = t - 48), e.advance(), true) : ((e.lastIntValue = 0), false);
            }),
            (ce.regexp_eatFixedHexDigits = function (e, t) {
                var r = e.pos;
                e.lastIntValue = 0;
                for (var i = 0; i < t; ++i) {
                    var a = e.current();
                    if (!be(a)) return (e.pos = r), false;
                    (e.lastIntValue = 16 * e.lastIntValue + xe(a)), e.advance();
                }
                return true;
            });
        var we = function (e) {
                (this.type = e.type),
                    (this.value = e.value),
                    (this.start = e.start),
                    (this.end = e.end),
                    e.options.locations && (this.loc = new L(e, e.startLoc, e.endLoc)),
                    e.options.ranges && (this.range = [e.start, e.end]);
            },
            Se = G.prototype;
        (Se.next = function () {
            this.options.onToken && this.options.onToken(new we(this)),
                (this.lastTokEnd = this.end),
                (this.lastTokStart = this.start),
                (this.lastTokEndLoc = this.endLoc),
                (this.lastTokStartLoc = this.startLoc),
                this.nextToken();
        }),
            (Se.getToken = function () {
                return this.next(), new we(this);
            }),
            "undefined" != typeof Symbol &&
                (Se[Symbol.iterator] = function () {
                    var e = this;
                    return {
                        next: function () {
                            var t = e.getToken();
                            return { done: t.type === x.eof, value: t };
                        },
                    };
                });
        function Ee(e) {
            return e <= 65535
                ? String.fromCharCode(e)
                : ((e -= 65536), String.fromCharCode(55296 + (e >> 10), 56320 + (1023 & e)));
        }
        (Se.curContext = function () {
            return this.context[this.context.length - 1];
        }),
            (Se.nextToken = function () {
                var e = this.curContext();
                return (
                    (e && e.preserveSpace) || this.skipSpace(),
                    (this.start = this.pos),
                    this.options.locations && (this.startLoc = this.curPosition()),
                    this.pos >= this.input.length
                        ? this.finishToken(x.eof)
                        : e.override
                        ? e.override(this)
                        : void this.readToken(this.fullCharCodeAtPos())
                );
            }),
            (Se.readToken = function (e) {
                return u(e, this.options.ecmaVersion >= 6) || 92 === e ? this.readWord() : this.getTokenFromCode(e);
            }),
            (Se.fullCharCodeAtPos = function () {
                var e = this.input.charCodeAt(this.pos);
                if (e <= 55295 || e >= 57344) return e;
                var t = this.input.charCodeAt(this.pos + 1);
                return (e << 10) + t - 56613888;
            }),
            (Se.skipBlockComment = function () {
                var e,
                    t = this.options.onComment && this.curPosition(),
                    r = this.pos,
                    i = this.input.indexOf("*/", (this.pos += 2));
                if (
                    (-1 === i && this.raise(this.pos - 2, "Unterminated comment"),
                    (this.pos = i + 2),
                    this.options.locations)
                )
                    for (w.lastIndex = r; (e = w.exec(this.input)) && e.index < this.pos; )
                        ++this.curLine, (this.lineStart = e.index + e[0].length);
                this.options.onComment &&
                    this.options.onComment(true, this.input.slice(r + 2, i), r, this.pos, t, this.curPosition());
            }),
            (Se.skipLineComment = function (e) {
                for (
                    var t = this.pos,
                        r = this.options.onComment && this.curPosition(),
                        i = this.input.charCodeAt((this.pos += e));
                    this.pos < this.input.length && !S(i);

                )
                    i = this.input.charCodeAt(++this.pos);
                this.options.onComment &&
                    this.options.onComment(
                        false,
                        this.input.slice(t + e, this.pos),
                        t,
                        this.pos,
                        r,
                        this.curPosition()
                    );
            }),
            (Se.skipSpace = function () {
                e: for (; this.pos < this.input.length; ) {
                    var e = this.input.charCodeAt(this.pos);
                    switch (e) {
                        case 32:
                        case 160:
                            ++this.pos;
                            break;
                        case 13:
                            10 === this.input.charCodeAt(this.pos + 1) && ++this.pos;
                        case 10:
                        case 8232:
                        case 8233:
                            ++this.pos, this.options.locations && (++this.curLine, (this.lineStart = this.pos));
                            break;
                        case 47:
                            switch (this.input.charCodeAt(this.pos + 1)) {
                                case 42:
                                    this.skipBlockComment();
                                    break;
                                case 47:
                                    this.skipLineComment(2);
                                    break;
                                default:
                                    break e;
                            }
                            break;
                        default:
                            if (!((e > 8 && e < 14) || (e >= 5760 && E.test(String.fromCharCode(e))))) break e;
                            ++this.pos;
                    }
                }
            }),
            (Se.finishToken = function (e, t) {
                (this.end = this.pos), this.options.locations && (this.endLoc = this.curPosition());
                var r = this.type;
                (this.type = e), (this.value = t), this.updateContext(r);
            }),
            (Se.readToken_dot = function () {
                var e = this.input.charCodeAt(this.pos + 1);
                if (e >= 48 && e <= 57) return this.readNumber(true);
                var t = this.input.charCodeAt(this.pos + 2);
                return this.options.ecmaVersion >= 6 && 46 === e && 46 === t
                    ? ((this.pos += 3), this.finishToken(x.ellipsis))
                    : (++this.pos, this.finishToken(x.dot));
            }),
            (Se.readToken_slash = function () {
                var e = this.input.charCodeAt(this.pos + 1);
                return this.exprAllowed
                    ? (++this.pos, this.readRegexp())
                    : 61 === e
                    ? this.finishOp(x.assign, 2)
                    : this.finishOp(x.slash, 1);
            }),
            (Se.readToken_mult_modulo_exp = function (e) {
                var t = this.input.charCodeAt(this.pos + 1),
                    r = 1,
                    i = 42 === e ? x.star : x.modulo;
                return (
                    this.options.ecmaVersion >= 7 &&
                        42 === e &&
                        42 === t &&
                        (++r, (i = x.starstar), (t = this.input.charCodeAt(this.pos + 2))),
                    61 === t ? this.finishOp(x.assign, r + 1) : this.finishOp(i, r)
                );
            }),
            (Se.readToken_pipe_amp = function (e) {
                var t = this.input.charCodeAt(this.pos + 1);
                return t === e
                    ? this.finishOp(124 === e ? x.logicalOR : x.logicalAND, 2)
                    : 61 === t
                    ? this.finishOp(x.assign, 2)
                    : this.finishOp(124 === e ? x.bitwiseOR : x.bitwiseAND, 1);
            }),
            (Se.readToken_caret = function () {
                var e = this.input.charCodeAt(this.pos + 1);
                return 61 === e ? this.finishOp(x.assign, 2) : this.finishOp(x.bitwiseXOR, 1);
            }),
            (Se.readToken_plus_min = function (e) {
                var t = this.input.charCodeAt(this.pos + 1);
                return t === e
                    ? 45 !== t ||
                      this.inModule ||
                      62 !== this.input.charCodeAt(this.pos + 2) ||
                      (0 !== this.lastTokEnd && !P.test(this.input.slice(this.lastTokEnd, this.pos)))
                        ? this.finishOp(x.incDec, 2)
                        : (this.skipLineComment(3), this.skipSpace(), this.nextToken())
                    : 61 === t
                    ? this.finishOp(x.assign, 2)
                    : this.finishOp(x.plusMin, 1);
            }),
            (Se.readToken_lt_gt = function (e) {
                var t = this.input.charCodeAt(this.pos + 1),
                    r = 1;
                return t === e
                    ? ((r = 62 === e && 62 === this.input.charCodeAt(this.pos + 2) ? 3 : 2),
                      61 === this.input.charCodeAt(this.pos + r)
                          ? this.finishOp(x.assign, r + 1)
                          : this.finishOp(x.bitShift, r))
                    : 33 !== t ||
                      60 !== e ||
                      this.inModule ||
                      45 !== this.input.charCodeAt(this.pos + 2) ||
                      45 !== this.input.charCodeAt(this.pos + 3)
                    ? (61 === t && (r = 2), this.finishOp(x.relational, r))
                    : (this.skipLineComment(4), this.skipSpace(), this.nextToken());
            }),
            (Se.readToken_eq_excl = function (e) {
                var t = this.input.charCodeAt(this.pos + 1);
                return 61 === t
                    ? this.finishOp(x.equality, 61 === this.input.charCodeAt(this.pos + 2) ? 3 : 2)
                    : 61 === e && 62 === t && this.options.ecmaVersion >= 6
                    ? ((this.pos += 2), this.finishToken(x.arrow))
                    : this.finishOp(61 === e ? x.eq : x.prefix, 1);
            }),
            (Se.getTokenFromCode = function (e) {
                switch (e) {
                    case 46:
                        return this.readToken_dot();
                    case 40:
                        return ++this.pos, this.finishToken(x.parenL);
                    case 41:
                        return ++this.pos, this.finishToken(x.parenR);
                    case 59:
                        return ++this.pos, this.finishToken(x.semi);
                    case 44:
                        return ++this.pos, this.finishToken(x.comma);
                    case 91:
                        return ++this.pos, this.finishToken(x.bracketL);
                    case 93:
                        return ++this.pos, this.finishToken(x.bracketR);
                    case 123:
                        return ++this.pos, this.finishToken(x.braceL);
                    case 125:
                        return ++this.pos, this.finishToken(x.braceR);
                    case 58:
                        return ++this.pos, this.finishToken(x.colon);
                    case 63:
                        return ++this.pos, this.finishToken(x.question);
                    case 96:
                        if (this.options.ecmaVersion < 6) break;
                        return ++this.pos, this.finishToken(x.backQuote);
                    case 48:
                        var t = this.input.charCodeAt(this.pos + 1);
                        if (120 === t || 88 === t) return this.readRadixNumber(16);
                        if (this.options.ecmaVersion >= 6) {
                            if (111 === t || 79 === t) return this.readRadixNumber(8);
                            if (98 === t || 66 === t) return this.readRadixNumber(2);
                        }
                    case 49:
                    case 50:
                    case 51:
                    case 52:
                    case 53:
                    case 54:
                    case 55:
                    case 56:
                    case 57:
                        return this.readNumber(false);
                    case 34:
                    case 39:
                        return this.readString(e);
                    case 47:
                        return this.readToken_slash();
                    case 37:
                    case 42:
                        return this.readToken_mult_modulo_exp(e);
                    case 124:
                    case 38:
                        return this.readToken_pipe_amp(e);
                    case 94:
                        return this.readToken_caret();
                    case 43:
                    case 45:
                        return this.readToken_plus_min(e);
                    case 60:
                    case 62:
                        return this.readToken_lt_gt(e);
                    case 61:
                    case 33:
                        return this.readToken_eq_excl(e);
                    case 126:
                        return this.finishOp(x.prefix, 1);
                }
                this.raise(this.pos, "Unexpected character '" + Ee(e) + "'");
            }),
            (Se.finishOp = function (e, t) {
                var r = this.input.slice(this.pos, this.pos + t);
                return (this.pos += t), this.finishToken(e, r);
            }),
            (Se.readRegexp = function () {
                for (var e, t, r = this.pos; ; ) {
                    this.pos >= this.input.length && this.raise(r, "Unterminated regular expression");
                    var i = this.input.charAt(this.pos);
                    if ((P.test(i) && this.raise(r, "Unterminated regular expression"), e)) e = false;
                    else {
                        if ("[" === i) t = true;
                        else if ("]" === i && t) t = false;
                        else if ("/" === i && !t) break;
                        e = "\\" === i;
                    }
                    ++this.pos;
                }
                var a = this.input.slice(r, this.pos);
                ++this.pos;
                var s = this.pos,
                    n = this.readWord1();
                this.containsEsc && this.unexpected(s);
                var o = this.regexpState || (this.regexpState = new ue(this));
                o.reset(r, a, n), this.validateRegExpFlags(o), this.validateRegExpPattern(o);
                var p = null;
                try {
                    p = new RegExp(a, n);
                } catch (e) {}
                return this.finishToken(x.regexp, { pattern: a, flags: n, value: p });
            }),
            (Se.readInt = function (e, t) {
                for (var r = this.pos, i = 0, a = 0, s = null == t ? 1 / 0 : t; a < s; ++a) {
                    var n = this.input.charCodeAt(this.pos),
                        o = undefined;
                    if ((o = n >= 97 ? n - 97 + 10 : n >= 65 ? n - 65 + 10 : n >= 48 && n <= 57 ? n - 48 : 1 / 0) >= e)
                        break;
                    ++this.pos, (i = i * e + o);
                }
                return this.pos === r || (null != t && this.pos - r !== t) ? null : i;
            }),
            (Se.readRadixNumber = function (e) {
                this.pos += 2;
                var t = this.readInt(e);
                return (
                    null == t && this.raise(this.start + 2, "Expected number in radix " + e),
                    u(this.fullCharCodeAtPos()) && this.raise(this.pos, "Identifier directly after number"),
                    this.finishToken(x.num, t)
                );
            }),
            (Se.readNumber = function (e) {
                var t = this.pos;
                e || null !== this.readInt(10) || this.raise(t, "Invalid number");
                var r = this.pos - t >= 2 && 48 === this.input.charCodeAt(t);
                r && this.strict && this.raise(t, "Invalid number"),
                    r && /[89]/.test(this.input.slice(t, this.pos)) && (r = false);
                var i = this.input.charCodeAt(this.pos);
                46 !== i || r || (++this.pos, this.readInt(10), (i = this.input.charCodeAt(this.pos))),
                    (69 !== i && 101 !== i) ||
                        r ||
                        ((43 !== (i = this.input.charCodeAt(++this.pos)) && 45 !== i) || ++this.pos,
                        null === this.readInt(10) && this.raise(t, "Invalid number")),
                    u(this.fullCharCodeAtPos()) && this.raise(this.pos, "Identifier directly after number");
                var a = this.input.slice(t, this.pos),
                    s = r ? parseInt(a, 8) : parseFloat(a);
                return this.finishToken(x.num, s);
            }),
            (Se.readCodePoint = function () {
                var e,
                    t = this.input.charCodeAt(this.pos);
                if (123 === t) {
                    this.options.ecmaVersion < 6 && this.unexpected();
                    var r = ++this.pos;
                    (e = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos)),
                        ++this.pos,
                        e > 1114111 && this.invalidStringToken(r, "Code point out of bounds");
                } else e = this.readHexChar(4);
                return e;
            }),
            (Se.readString = function (e) {
                for (var t = "", r = ++this.pos; ; ) {
                    this.pos >= this.input.length && this.raise(this.start, "Unterminated string constant");
                    var i = this.input.charCodeAt(this.pos);
                    if (i === e) break;
                    92 === i
                        ? ((t += this.input.slice(r, this.pos)), (t += this.readEscapedChar(false)), (r = this.pos))
                        : (S(i, this.options.ecmaVersion >= 10) &&
                              this.raise(this.start, "Unterminated string constant"),
                          ++this.pos);
                }
                return (t += this.input.slice(r, this.pos++)), this.finishToken(x.string, t);
            });
        var Te = {};
        (Se.tryReadTemplateToken = function () {
            this.inTemplateElement = true;
            try {
                this.readTmplToken();
            } catch (e) {
                if (e !== Te) throw e;
                this.readInvalidTemplateToken();
            }
            this.inTemplateElement = false;
        }),
            (Se.invalidStringToken = function (e, t) {
                if (this.inTemplateElement && this.options.ecmaVersion >= 9) throw Te;
                this.raise(e, t);
            }),
            (Se.readTmplToken = function () {
                for (var e = "", t = this.pos; ; ) {
                    this.pos >= this.input.length && this.raise(this.start, "Unterminated template");
                    var r = this.input.charCodeAt(this.pos);
                    if (96 === r || (36 === r && 123 === this.input.charCodeAt(this.pos + 1)))
                        return this.pos !== this.start || (this.type !== x.template && this.type !== x.invalidTemplate)
                            ? ((e += this.input.slice(t, this.pos)), this.finishToken(x.template, e))
                            : 36 === r
                            ? ((this.pos += 2), this.finishToken(x.dollarBraceL))
                            : (++this.pos, this.finishToken(x.backQuote));
                    if (92 === r)
                        (e += this.input.slice(t, this.pos)), (e += this.readEscapedChar(true)), (t = this.pos);
                    else if (S(r)) {
                        switch (((e += this.input.slice(t, this.pos)), ++this.pos, r)) {
                            case 13:
                                10 === this.input.charCodeAt(this.pos) && ++this.pos;
                            case 10:
                                e += "\n";
                                break;
                            default:
                                e += String.fromCharCode(r);
                        }
                        this.options.locations && (++this.curLine, (this.lineStart = this.pos)), (t = this.pos);
                    } else ++this.pos;
                }
            }),
            (Se.readInvalidTemplateToken = function () {
                for (; this.pos < this.input.length; this.pos++)
                    switch (this.input[this.pos]) {
                        case "\\":
                            ++this.pos;
                            break;
                        case "$":
                            if ("{" !== this.input[this.pos + 1]) break;
                        case "`":
                            return this.finishToken(x.invalidTemplate, this.input.slice(this.start, this.pos));
                    }
                this.raise(this.start, "Unterminated template");
            }),
            (Se.readEscapedChar = function (e) {
                var t = this.input.charCodeAt(++this.pos);
                switch ((++this.pos, t)) {
                    case 110:
                        return "\n";
                    case 114:
                        return "\r";
                    case 120:
                        return String.fromCharCode(this.readHexChar(2));
                    case 117:
                        return Ee(this.readCodePoint());
                    case 116:
                        return "\t";
                    case 98:
                        return "\b";
                    case 118:
                        return "\v";
                    case 102:
                        return "\f";
                    case 13:
                        10 === this.input.charCodeAt(this.pos) && ++this.pos;
                    case 10:
                        return this.options.locations && ((this.lineStart = this.pos), ++this.curLine), "";
                    default:
                        if (t >= 48 && t <= 55) {
                            var r = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0],
                                i = parseInt(r, 8);
                            return (
                                i > 255 && ((r = r.slice(0, -1)), (i = parseInt(r, 8))),
                                (this.pos += r.length - 1),
                                (t = this.input.charCodeAt(this.pos)),
                                ("0" === r && 56 !== t && 57 !== t) ||
                                    (!this.strict && !e) ||
                                    this.invalidStringToken(
                                        this.pos - 1 - r.length,
                                        e ? "Octal literal in template string" : "Octal literal in strict mode"
                                    ),
                                String.fromCharCode(i)
                            );
                        }
                        return String.fromCharCode(t);
                }
            }),
            (Se.readHexChar = function (e) {
                var t = this.pos,
                    r = this.readInt(16, e);
                return null === r && this.invalidStringToken(t, "Bad character escape sequence"), r;
            }),
            (Se.readWord1 = function () {
                this.containsEsc = false;
                for (
                    var e = "", t = true, r = this.pos, i = this.options.ecmaVersion >= 6;
                    this.pos < this.input.length;

                ) {
                    var a = this.fullCharCodeAtPos();
                    if (d(a, i)) this.pos += a <= 65535 ? 1 : 2;
                    else {
                        if (92 !== a) break;
                        (this.containsEsc = true), (e += this.input.slice(r, this.pos));
                        var s = this.pos;
                        117 !== this.input.charCodeAt(++this.pos) &&
                            this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX"),
                            ++this.pos;
                        var n = this.readCodePoint();
                        (t ? u : d)(n, i) || this.invalidStringToken(s, "Invalid Unicode escape"),
                            (e += Ee(n)),
                            (r = this.pos);
                    }
                    t = false;
                }
                return e + this.input.slice(r, this.pos);
            }),
            (Se.readWord = function () {
                var e = this.readWord1(),
                    t = x.name;
                return (
                    this.keywords.test(e) &&
                        (this.containsEsc && this.raiseRecoverable(this.start, "Escape sequence in keyword " + e),
                        (t = v[e])),
                    this.finishToken(t, e)
                );
            });
        (e.version = "6.0.4"),
            (e.parse = function (e, t) {
                return G.parse(e, t);
            }),
            (e.parseExpressionAt = function (e, t, r) {
                return G.parseExpressionAt(e, t, r);
            }),
            (e.tokenizer = function (e, t) {
                return G.tokenizer(e, t);
            }),
            (e.Parser = G),
            (e.defaultOptions = U),
            (e.Position = N),
            (e.SourceLocation = L),
            (e.getLineInfo = M),
            (e.Node = ae),
            (e.TokenType = f),
            (e.tokTypes = x),
            (e.keywordTypes = v),
            (e.TokContext = oe),
            (e.tokContexts = pe),
            (e.isIdentifierChar = d),
            (e.isIdentifierStart = u),
            (e.Token = we),
            (e.isNewLine = S),
            (e.lineBreak = P),
            (e.lineBreakG = w),
            (e.nonASCIIwhitespace = E),
            Object.defineProperty(e, "__esModule", { value: true });
    })((e.acorn = {}));
})(this),
    (function (e, t) {
        var r = {};
        !(function (e) {
            Object.defineProperty(e, "__esModule", { value: true }),
                (e.generate = function (e, t) {
                    var r = new v(t);
                    return r.generator[e.type](e, r), r.output;
                });
            var t = JSON.stringify;
            if (!String.prototype.repeat)
                throw new Error(
                    "String.prototype.repeat is undefined, see https://github.com/davidbonnet/astring#installation"
                );
            if (!String.prototype.endsWith)
                throw new Error(
                    "String.prototype.endsWith is undefined, see https://github.com/davidbonnet/astring#installation"
                );
            var r = {
                    "||": 3,
                    "&&": 4,
                    "|": 5,
                    "^": 6,
                    "&": 7,
                    "==": 8,
                    "!=": 8,
                    "===": 8,
                    "!==": 8,
                    "<": 9,
                    ">": 9,
                    "<=": 9,
                    ">=": 9,
                    in: 9,
                    instanceof: 9,
                    "<<": 10,
                    ">>": 10,
                    ">>>": 10,
                    "+": 11,
                    "-": 11,
                    "*": 12,
                    "%": 12,
                    "/": 12,
                    "**": 13,
                },
                i = 17,
                a = {
                    ArrayExpression: 20,
                    TaggedTemplateExpression: 20,
                    ThisExpression: 20,
                    Identifier: 20,
                    Literal: 18,
                    TemplateLiteral: 20,
                    Super: 20,
                    SequenceExpression: 20,
                    MemberExpression: 19,
                    CallExpression: 19,
                    NewExpression: 19,
                    ArrowFunctionExpression: i,
                    ClassExpression: i,
                    FunctionExpression: i,
                    ObjectExpression: i,
                    UpdateExpression: 16,
                    UnaryExpression: 15,
                    BinaryExpression: 14,
                    LogicalExpression: 13,
                    ConditionalExpression: 4,
                    AssignmentExpression: 3,
                    AwaitExpression: 2,
                    YieldExpression: 2,
                    RestElement: 1,
                };
            function s(e, t) {
                var r = e.generator;
                if ((e.write("("), null != t && t.length > 0)) {
                    r[t[0].type](t[0], e);
                    for (var i = t.length, a = 1; a < i; a++) {
                        var s = t[a];
                        e.write(", "), r[s.type](s, e);
                    }
                }
                e.write(")");
            }
            function n(e, t, s, n) {
                var o = e.generator;
                !(function (e, t, s) {
                    var n = a[e.type];
                    if (n === i) return true;
                    var o = a[t.type];
                    if (n !== o) return n < o;
                    if (13 !== n && 14 !== n) return false;
                    if ("**" === e.operator && "**" === t.operator) return !s;
                    if (s) return r[e.operator] <= r[t.operator];
                    return r[e.operator] < r[t.operator];
                })(t, s, n)
                    ? o[t.type](t, e)
                    : (e.write("("), o[t.type](t, e), e.write(")"));
            }
            function o(e, t, r, i) {
                var a = t.split("\n"),
                    s = a.length - 1;
                if ((e.write(a[0].trim()), s > 0)) {
                    e.write(i);
                    for (var n = 1; n < s; n++) e.write(r + a[n].trim() + i);
                    e.write(r + a[s].trim());
                }
            }
            function p(e, t, r, i) {
                for (var a = t.length, s = 0; s < a; s++) {
                    var n = t[s];
                    e.write(r),
                        "L" === n.type[0]
                            ? e.write("// " + n.value.trim() + "\n")
                            : (e.write("/*"), o(e, n.value, r, i), e.write("*/" + i));
                }
            }
            function l(e, t) {
                var r = e.generator,
                    i = t.declarations;
                e.write(t.kind + " ");
                var a = i.length;
                if (a > 0) {
                    r.VariableDeclarator(i[0], e);
                    for (var s = 1; s < a; s++) e.write(", "), r.VariableDeclarator(i[s], e);
                }
            }
            var h = undefined,
                c = undefined,
                u = undefined,
                d = undefined,
                f = undefined,
                m = undefined,
                y = (e.baseGenerator = {
                    Program: function (e, t) {
                        var r = t.indent.repeat(t.indentLevel),
                            i = t.lineEnd,
                            a = t.writeComments;
                        a && null != e.comments && p(t, e.comments, r, i);
                        for (var s = e.body, n = s.length, o = 0; o < n; o++) {
                            var l = s[o];
                            a && null != l.comments && p(t, l.comments, r, i),
                                t.write(r),
                                this[l.type](l, t),
                                t.write(i);
                        }
                        a && null != e.trailingComments && p(t, e.trailingComments, r, i);
                    },
                    BlockStatement: (m = function (e, t) {
                        var r = t.indent.repeat(t.indentLevel++),
                            i = t.lineEnd,
                            a = t.writeComments,
                            s = r + t.indent;
                        t.write("{");
                        var n = e.body;
                        if (null != n && n.length > 0) {
                            t.write(i), a && null != e.comments && p(t, e.comments, s, i);
                            for (var o = n.length, l = 0; l < o; l++) {
                                var h = n[l];
                                a && null != h.comments && p(t, h.comments, s, i),
                                    t.write(s),
                                    this[h.type](h, t),
                                    t.write(i);
                            }
                            t.write(r);
                        } else a && null != e.comments && (t.write(i), p(t, e.comments, s, i), t.write(r));
                        a && null != e.trailingComments && p(t, e.trailingComments, s, i),
                            t.write("}"),
                            t.indentLevel--;
                    }),
                    ClassBody: m,
                    EmptyStatement: function (e, t) {
                        t.write(";");
                    },
                    ExpressionStatement: function (e, t) {
                        var r = a[e.expression.type];
                        r === i || (3 === r && "O" === e.expression.left.type[0])
                            ? (t.write("("), this[e.expression.type](e.expression, t), t.write(")"))
                            : this[e.expression.type](e.expression, t),
                            t.write(";");
                    },
                    IfStatement: function (e, t) {
                        t.write("if ("),
                            this[e.test.type](e.test, t),
                            t.write(") "),
                            this[e.consequent.type](e.consequent, t),
                            null != e.alternate && (t.write(" else "), this[e.alternate.type](e.alternate, t));
                    },
                    LabeledStatement: function (e, t) {
                        this[e.label.type](e.label, t), t.write(": "), this[e.body.type](e.body, t);
                    },
                    BreakStatement: function (e, t) {
                        t.write("break"),
                            null != e.label && (t.write(" "), this[e.label.type](e.label, t)),
                            t.write(";");
                    },
                    ContinueStatement: function (e, t) {
                        t.write("continue"),
                            null != e.label && (t.write(" "), this[e.label.type](e.label, t)),
                            t.write(";");
                    },
                    WithStatement: function (e, t) {
                        t.write("with ("),
                            this[e.object.type](e.object, t),
                            t.write(") "),
                            this[e.body.type](e.body, t);
                    },
                    SwitchStatement: function (e, t) {
                        var r = t.indent.repeat(t.indentLevel++),
                            i = t.lineEnd,
                            a = t.writeComments;
                        t.indentLevel++;
                        var s = r + t.indent,
                            n = s + t.indent;
                        t.write("switch ("), this[e.discriminant.type](e.discriminant, t), t.write(") {" + i);
                        for (var o = e.cases, l = o.length, h = 0; h < l; h++) {
                            var c = o[h];
                            a && null != c.comments && p(t, c.comments, s, i),
                                c.test
                                    ? (t.write(s + "case "), this[c.test.type](c.test, t), t.write(":" + i))
                                    : t.write(s + "default:" + i);
                            for (var u = c.consequent, d = u.length, f = 0; f < d; f++) {
                                var m = u[f];
                                a && null != m.comments && p(t, m.comments, n, i),
                                    t.write(n),
                                    this[m.type](m, t),
                                    t.write(i);
                            }
                        }
                        (t.indentLevel -= 2), t.write(r + "}");
                    },
                    ReturnStatement: function (e, t) {
                        t.write("return"),
                            e.argument && (t.write(" "), this[e.argument.type](e.argument, t)),
                            t.write(";");
                    },
                    ThrowStatement: function (e, t) {
                        t.write("throw "), this[e.argument.type](e.argument, t), t.write(";");
                    },
                    TryStatement: function (e, t) {
                        if ((t.write("try "), this[e.block.type](e.block, t), e.handler)) {
                            var r = e.handler;
                            t.write(" catch ("),
                                this[r.param.type](r.param, t),
                                t.write(") "),
                                this[r.body.type](r.body, t);
                        }
                        e.finalizer && (t.write(" finally "), this[e.finalizer.type](e.finalizer, t));
                    },
                    WhileStatement: function (e, t) {
                        t.write("while ("), this[e.test.type](e.test, t), t.write(") "), this[e.body.type](e.body, t);
                    },
                    DoWhileStatement: function (e, t) {
                        t.write("do "),
                            this[e.body.type](e.body, t),
                            t.write(" while ("),
                            this[e.test.type](e.test, t),
                            t.write(");");
                    },
                    ForStatement: function (e, t) {
                        if ((t.write("for ("), null != e.init)) {
                            var r = e.init;
                            "V" === r.type[0] ? l(t, r) : this[r.type](r, t);
                        }
                        t.write("; "),
                            e.test && this[e.test.type](e.test, t),
                            t.write("; "),
                            e.update && this[e.update.type](e.update, t),
                            t.write(") "),
                            this[e.body.type](e.body, t);
                    },
                    ForInStatement: (h = function (e, t) {
                        t.write("for (");
                        var r = e.left;
                        "V" === r.type[0] ? l(t, r) : this[r.type](r, t),
                            t.write("I" === e.type[3] ? " in " : " of "),
                            this[e.right.type](e.right, t),
                            t.write(") "),
                            this[e.body.type](e.body, t);
                    }),
                    ForOfStatement: h,
                    DebuggerStatement: function (e, t) {
                        t.write("debugger;" + t.lineEnd);
                    },
                    FunctionDeclaration: (c = function (e, t) {
                        t.write(
                            (e.async ? "async " : "") +
                                (e.generator ? "function* " : "function ") +
                                (e.id ? e.id.name : ""),
                            e
                        ),
                            s(t, e.params),
                            t.write(" "),
                            this[e.body.type](e.body, t);
                    }),
                    FunctionExpression: c,
                    VariableDeclaration: function (e, t) {
                        l(t, e), t.write(";");
                    },
                    VariableDeclarator: function (e, t) {
                        this[e.id.type](e.id, t), null != e.init && (t.write(" = "), this[e.init.type](e.init, t));
                    },
                    ClassDeclaration: function (e, t) {
                        t.write("class " + (e.id ? e.id.name + " " : ""), e),
                            e.superClass &&
                                (t.write("extends "), this[e.superClass.type](e.superClass, t), t.write(" ")),
                            this.ClassBody(e.body, t);
                    },
                    ImportDeclaration: function (e, t) {
                        t.write("import ");
                        var r = e.specifiers,
                            i = r.length,
                            a = 0;
                        if (i > 0) {
                            for (; a < i; ) {
                                a > 0 && t.write(", ");
                                var s = r[a],
                                    n = s.type[6];
                                if ("D" === n) t.write(s.local.name, s), a++;
                                else {
                                    if ("N" !== n) break;
                                    t.write("* as " + s.local.name, s), a++;
                                }
                            }
                            if (a < i) {
                                for (t.write("{"); ; ) {
                                    var o = r[a],
                                        p = o.imported.name;
                                    if (
                                        (t.write(p, o),
                                        p !== o.local.name && t.write(" as " + o.local.name),
                                        !(++a < i))
                                    )
                                        break;
                                    t.write(", ");
                                }
                                t.write("}");
                            }
                            t.write(" from ");
                        }
                        this.Literal(e.source, t), t.write(";");
                    },
                    ExportDefaultDeclaration: function (e, t) {
                        t.write("export default "),
                            this[e.declaration.type](e.declaration, t),
                            a[e.declaration.type] && "F" !== e.declaration.type[0] && t.write(";");
                    },
                    ExportNamedDeclaration: function (e, t) {
                        if ((t.write("export "), e.declaration)) this[e.declaration.type](e.declaration, t);
                        else {
                            t.write("{");
                            var r = e.specifiers,
                                i = r.length;
                            if (i > 0)
                                for (var a = 0; ; ) {
                                    var s = r[a],
                                        n = s.local.name;
                                    if (
                                        (t.write(n, s),
                                        n !== s.exported.name && t.write(" as " + s.exported.name),
                                        !(++a < i))
                                    )
                                        break;
                                    t.write(", ");
                                }
                            t.write("}"), e.source && (t.write(" from "), this.Literal(e.source, t)), t.write(";");
                        }
                    },
                    ExportAllDeclaration: function (e, t) {
                        t.write("export * from "), this.Literal(e.source, t), t.write(";");
                    },
                    MethodDefinition: function (e, t) {
                        e.static && t.write("static ");
                        var r = e.kind[0];
                        ("g" !== r && "s" !== r) || t.write(e.kind + " "),
                            e.value.async && t.write("async "),
                            e.value.generator && t.write("*"),
                            e.computed
                                ? (t.write("["), this[e.key.type](e.key, t), t.write("]"))
                                : this[e.key.type](e.key, t),
                            s(t, e.value.params),
                            t.write(" "),
                            this[e.value.body.type](e.value.body, t);
                    },
                    ClassExpression: function (e, t) {
                        this.ClassDeclaration(e, t);
                    },
                    ArrowFunctionExpression: function (e, t) {
                        t.write(e.async ? "async " : "", e);
                        var r = e.params;
                        null != r &&
                            (1 === r.length && "I" === r[0].type[0] ? t.write(r[0].name, r[0]) : s(t, e.params)),
                            t.write(" => "),
                            "O" === e.body.type[0]
                                ? (t.write("("), this.ObjectExpression(e.body, t), t.write(")"))
                                : this[e.body.type](e.body, t);
                    },
                    ThisExpression: function (e, t) {
                        t.write("this", e);
                    },
                    Super: function (e, t) {
                        t.write("super", e);
                    },
                    RestElement: (u = function (e, t) {
                        t.write("..."), this[e.argument.type](e.argument, t);
                    }),
                    SpreadElement: u,
                    YieldExpression: function (e, t) {
                        t.write(e.delegate ? "yield*" : "yield"),
                            e.argument && (t.write(" "), this[e.argument.type](e.argument, t));
                    },
                    AwaitExpression: function (e, t) {
                        t.write("await "), e.argument && this[e.argument.type](e.argument, t);
                    },
                    TemplateLiteral: function (e, t) {
                        var r = e.quasis,
                            i = e.expressions;
                        t.write("`");
                        for (var a = i.length, s = 0; s < a; s++) {
                            var n = i[s];
                            t.write(r[s].value.raw), t.write("${"), this[n.type](n, t), t.write("}");
                        }
                        t.write(r[r.length - 1].value.raw), t.write("`");
                    },
                    TaggedTemplateExpression: function (e, t) {
                        this[e.tag.type](e.tag, t), this[e.quasi.type](e.quasi, t);
                    },
                    ArrayExpression: (f = function (e, t) {
                        if ((t.write("["), e.elements.length > 0))
                            for (var r = e.elements, i = r.length, a = 0; ; ) {
                                var s = r[a];
                                if ((null != s && this[s.type](s, t), !(++a < i))) {
                                    null == s && t.write(", ");
                                    break;
                                }
                                t.write(", ");
                            }
                        t.write("]");
                    }),
                    ArrayPattern: f,
                    ObjectExpression: function (e, t) {
                        var r = t.indent.repeat(t.indentLevel++),
                            i = t.lineEnd,
                            a = t.writeComments,
                            s = r + t.indent;
                        if ((t.write("{"), e.properties.length > 0)) {
                            t.write(i), a && null != e.comments && p(t, e.comments, s, i);
                            for (var n = "," + i, o = e.properties, l = o.length, h = 0; ; ) {
                                var c = o[h];
                                if (
                                    (a && null != c.comments && p(t, c.comments, s, i),
                                    t.write(s),
                                    this.Property(c, t),
                                    !(++h < l))
                                )
                                    break;
                                t.write(n);
                            }
                            t.write(i),
                                a && null != e.trailingComments && p(t, e.trailingComments, s, i),
                                t.write(r + "}");
                        } else
                            a
                                ? null != e.comments
                                    ? (t.write(i),
                                      p(t, e.comments, s, i),
                                      null != e.trailingComments && p(t, e.trailingComments, s, i),
                                      t.write(r + "}"))
                                    : null != e.trailingComments
                                    ? (t.write(i), p(t, e.trailingComments, s, i), t.write(r + "}"))
                                    : t.write("}")
                                : t.write("}");
                        t.indentLevel--;
                    },
                    Property: function (e, t) {
                        e.method || "i" !== e.kind[0]
                            ? this.MethodDefinition(e, t)
                            : (e.shorthand ||
                                  (e.computed
                                      ? (t.write("["), this[e.key.type](e.key, t), t.write("]"))
                                      : this[e.key.type](e.key, t),
                                  t.write(": ")),
                              this[e.value.type](e.value, t));
                    },
                    ObjectPattern: function (e, t) {
                        if ((t.write("{"), e.properties.length > 0))
                            for (var r = e.properties, i = r.length, a = 0; this[r[a].type](r[a], t), ++a < i; )
                                t.write(", ");
                        t.write("}");
                    },
                    SequenceExpression: function (e, t) {
                        s(t, e.expressions);
                    },
                    UnaryExpression: function (e, t) {
                        e.prefix
                            ? (t.write(e.operator),
                              e.operator.length > 1 && t.write(" "),
                              a[e.argument.type] < a.UnaryExpression
                                  ? (t.write("("), this[e.argument.type](e.argument, t), t.write(")"))
                                  : this[e.argument.type](e.argument, t))
                            : (this[e.argument.type](e.argument, t), t.write(e.operator));
                    },
                    UpdateExpression: function (e, t) {
                        e.prefix
                            ? (t.write(e.operator), this[e.argument.type](e.argument, t))
                            : (this[e.argument.type](e.argument, t), t.write(e.operator));
                    },
                    AssignmentExpression: function (e, t) {
                        this[e.left.type](e.left, t), t.write(" " + e.operator + " "), this[e.right.type](e.right, t);
                    },
                    AssignmentPattern: function (e, t) {
                        this[e.left.type](e.left, t), t.write(" = "), this[e.right.type](e.right, t);
                    },
                    BinaryExpression: (d = function (e, t) {
                        "in" === e.operator
                            ? (t.write("("),
                              n(t, e.left, e, false),
                              t.write(" " + e.operator + " "),
                              n(t, e.right, e, true),
                              t.write(")"))
                            : (n(t, e.left, e, false), t.write(" " + e.operator + " "), n(t, e.right, e, true));
                    }),
                    LogicalExpression: d,
                    ConditionalExpression: function (e, t) {
                        a[e.test.type] > a.ConditionalExpression
                            ? this[e.test.type](e.test, t)
                            : (t.write("("), this[e.test.type](e.test, t), t.write(")")),
                            t.write(" ? "),
                            this[e.consequent.type](e.consequent, t),
                            t.write(" : "),
                            this[e.alternate.type](e.alternate, t);
                    },
                    NewExpression: function (e, t) {
                        t.write("new "),
                            a[e.callee.type] < a.CallExpression ||
                            (function (e) {
                                var t = e;
                                for (; null != t; ) {
                                    var r = t,
                                        i = r.type;
                                    if ("C" === i[0] && "a" === i[1]) return true;
                                    if ("M" !== i[0] || "e" !== i[1] || "m" !== i[2]) return false;
                                    t = t.object;
                                }
                            })(e.callee)
                                ? (t.write("("), this[e.callee.type](e.callee, t), t.write(")"))
                                : this[e.callee.type](e.callee, t),
                            s(t, e.arguments);
                    },
                    CallExpression: function (e, t) {
                        a[e.callee.type] < a.CallExpression
                            ? (t.write("("), this[e.callee.type](e.callee, t), t.write(")"))
                            : this[e.callee.type](e.callee, t),
                            s(t, e.arguments);
                    },
                    MemberExpression: function (e, t) {
                        a[e.object.type] < a.MemberExpression
                            ? (t.write("("), this[e.object.type](e.object, t), t.write(")"))
                            : this[e.object.type](e.object, t),
                            e.computed
                                ? (t.write("["), this[e.property.type](e.property, t), t.write("]"))
                                : (t.write("."), this[e.property.type](e.property, t));
                    },
                    MetaProperty: function (e, t) {
                        t.write(e.meta.name + "." + e.property.name, e);
                    },
                    Identifier: function (e, t) {
                        t.write(e.name, e);
                    },
                    Literal: function (e, r) {
                        null != e.raw
                            ? r.write(e.raw, e)
                            : null != e.regex
                            ? this.RegExpLiteral(e, r)
                            : r.write(t(e.value), e);
                    },
                    RegExpLiteral: function (e, t) {
                        var r = e.regex;
                        t.write("/" + r.pattern + "/" + r.flags, e);
                    },
                }),
                g = {},
                v = (function () {
                    function e(t) {
                        !(function (e, t) {
                            if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
                        })(this, e);
                        var r = null == t ? g : t;
                        (this.output = ""),
                            null != r.output
                                ? ((this.output = r.output), (this.write = this.writeToStream))
                                : (this.output = ""),
                            (this.generator = null != r.generator ? r.generator : y),
                            (this.indent = null != r.indent ? r.indent : "  "),
                            (this.lineEnd = null != r.lineEnd ? r.lineEnd : "\n"),
                            (this.indentLevel = null != r.startingIndentLevel ? r.startingIndentLevel : 0),
                            (this.writeComments = !!r.comments && r.comments),
                            null != r.sourceMap &&
                                ((this.write = null == r.output ? this.writeAndMap : this.writeToStreamAndMap),
                                (this.sourceMap = r.sourceMap),
                                (this.line = 1),
                                (this.column = 0),
                                (this.lineEndSize = this.lineEnd.split("\n").length - 1),
                                (this.mapping = {
                                    original: null,
                                    generated: this,
                                    name: undefined,
                                    source: r.sourceMap.file || r.sourceMap._file,
                                }));
                    }
                    return (
                        (e.prototype.write = function (e) {
                            this.output += e;
                        }),
                        (e.prototype.writeToStream = function (e) {
                            this.output.write(e);
                        }),
                        (e.prototype.writeAndMap = function (e, t) {
                            (this.output += e), this.map(e, t);
                        }),
                        (e.prototype.writeToStreamAndMap = function (e, t) {
                            this.output.write(e), this.map(e, t);
                        }),
                        (e.prototype.map = function (e, t) {
                            if (null != t && null != t.loc) {
                                var r = this.mapping;
                                (r.original = t.loc.start), (r.name = t.name), this.sourceMap.addMapping(r);
                            }
                            e.length > 0 &&
                                (this.lineEndSize > 0 && e.endsWith(this.lineEnd)
                                    ? ((this.line += this.lineEndSize), (this.column = 0))
                                    : "\n" === e[e.length - 1]
                                    ? (this.line++, (this.column = 0))
                                    : (this.column += e.length));
                        }),
                        (e.prototype.toString = function () {
                            return this.output;
                        }),
                        e
                    );
                })();
        })(r),
            (e.astring = r);
    })(this),
    (PZ.object = class {
        static getType(e) {
            if ("string" == typeof e && PZ[e] && PZ[e].prototype instanceof PZ.object) return PZ[e];
        }
        static getTypeString(e) {
            return e.baseTypeString;
        }
        constructor() {
            PZ.observable.defineObservableProp(this, "parent", "onParentChanged"),
                (this.parent = null),
                (this.children = null);
        }
        getAddress(e) {
            let t = this.parent ? this.parent.getAddress(this) : [];
            return e && t.push(this.children.indexOf(e)), t;
        }
        addressLookup(e, t) {
            let r = e[(t = t || 0)];
            return undefined === r ? this : this.children[r].addressLookup(e, t + 1);
        }
        forEachItemOfType(e, t) {
            if ((this instanceof e && t(this), this.children))
                for (let r = 0; r < this.children.length; r++) this.children[r].forEachItemOfType(e, t);
        }
        getParentOfType(e) {
            return this.parentObject instanceof e ? this.parentObject : this.parentObject.getParentOfType(e);
        }
        tryGetParentOfType(e) {
            return this.parent
                ? this.parentObject instanceof e
                    ? this.parentObject
                    : this.parentObject.tryGetParentOfType(e)
                : null;
        }
        get parentProject() {
            return this.getParentOfType(PZ.project);
        }
        get parentLayer() {
            return this.getParentOfType(PZ.layer);
        }
        get parentObject() {
            return this.parent instanceof PZ.object ? this.parent : this.parent.parentObject;
        }
        traverse(e) {
            if ((e(this), Array.isArray(this.children)))
                for (let t = 0; t < this.children.length; t++) this.children[t].traverse(e);
        }
        load() {}
        unload() {}
    }),
    (PZ.objectList = class extends Array {
        constructor(e, t) {
            super(),
                Object.defineProperties(this, {
                    name: { value: "", writable: true },
                    visible: { value: true, writable: true },
                    parent: { value: e || null },
                    type: { value: t || PZ.object },
                    onListChanged: { value: new PZ.observable() },
                    onObjectAdded: { value: new PZ.observable() },
                    onObjectRemoved: { value: new PZ.observable() },
                }),
                (this.name = (this.type.prototype.defaultName || "Object") + "s");
        }
        load(e) {
            for (let t = 0; t < this.length; t++) this[t].load(e[t]);
        }
        splice() {
            let e = super.splice.apply(this, arguments);
            for (let t = 0; t < e.length; t++)
                null !== this.parent && (e[t].parent = null), this.onObjectRemoved.update(e[t], arguments[0]);
            for (let e = 2; e < arguments.length; e++)
                null !== this.parent && (arguments[e].parent = this),
                    this.onObjectAdded.update(arguments[e], arguments[0] + e - 2);
            return this.onListChanged.update(), e;
        }
        push() {
            return this.splice(this.length, 0, ...arguments), this.length;
        }
        forEachItemOfType(e, t) {
            this instanceof e && t(this);
            for (let r = 0; r < this.length; r++) this[r].forEachItemOfType(e, t);
        }
        get parentObject() {
            return this.parent;
        }
        getAddress(e) {
            let t = this.parent.getAddress(this);
            return e && t.push(this.indexOf(e)), t;
        }
        addressLookup(e, t) {
            let r = e[(t = t || 0)];
            return undefined === r ? this : this[r].addressLookup(e, t + 1);
        }
        traverse(e) {
            for (let t = 0; t < this.length; t++) this[t].traverse(e);
        }
    }),
    (PZ.objectSingleton = class extends PZ.objectList {
        constructor(e, t) {
            super(e, t), (this.name = this.name.substr(0, this.name.length - 1));
        }
        splice() {
            return super.splice.apply(this, arguments);
        }
        push() {
            return super.push.apply(this, arguments);
        }
    }),
    (PZ.keyframe = class extends PZ.object {
        constructor(e = 0, t = 0, r = 1) {
            super(),
                (this.value = e),
                (this.frame = t),
                (this.controlPoints = [
                    [-10, 0],
                    [10, 0],
                ]),
                (this.continuousTangent = true),
                (this.tween = r);
        }
        load(e) {
            (this.value = Array.isArray(e.value) ? e.value.slice() : e.value),
                (this.frame = e.frame),
                (this.tween = e.tween),
                undefined !== e.controlPoints &&
                    ((this.controlPoints[0][0] = e.controlPoints[0][0]),
                    (this.controlPoints[0][1] = e.controlPoints[0][1]),
                    (this.controlPoints[1][0] = e.controlPoints[1][0]),
                    (this.controlPoints[1][1] = e.controlPoints[1][1])),
                undefined !== e.continuousTangent && (this.continuousTangent = e.continuousTangent);
        }
        get absoluteFrame() {
            return this.frame + this.parentObject.frameOffset;
        }
        toJSON() {
            let e = { value: this.value, frame: this.frame, tween: this.tween, controlPoints: this.controlPoints };
            return this.continuousTangent || (e.continuousTangent = this.continuousTangent), e;
        }
    }),
    (PZ.propertyList = class {
        constructor(e, t) {
            Object.defineProperties(this, {
                onListChanged: { value: new PZ.observable() },
                childListChanged_bound: { value: this.childListChanged.bind(this) },
                parent: {
                    set(e) {
                        Object.defineProperty(this, "_parent", { value: e }),
                            Object.defineProperty(this, "_parentClip", {
                                get() {
                                    let e = this._parent;
                                    for (; e && !(e instanceof PZ.clip); ) e = e.parent;
                                    return e;
                                },
                            });
                    },
                    get() {
                        return this._parent;
                    },
                },
                visible: { value: true, writable: true },
                type: { value: PZ.property },
                frameOffset: {
                    get() {
                        return this._parentClip ? this._parentClip.start - this._parentClip.offset : 0;
                    },
                },
            }),
                t && (this.parent = t),
                this.addAll(e);
        }
        toJSON() {
            let e = {},
                t = Object.keys(this);
            for (let r = 0; r < t.length; r++) {
                let i = this[t[r]];
                (i instanceof PZ.propertyList && i.parent !== this) || (e[t[r]] = i);
            }
            return e;
        }
        load(e) {
            e = e || Object.prototype;
            let t = Object.keys(this);
            for (let r = 0; r < t.length; r++) {
                this[t[r]].load(e[t[r]]);
            }
        }
        childListChanged() {
            this.onListChanged.update();
        }
        _add(e, t) {
            t instanceof PZ.property == false && t instanceof PZ.propertyList == false && (t = PZ.property.create(t)),
                (this[e] = t),
                t.parent || (t.parent = this),
                t instanceof PZ.propertyList && t.onListChanged.watch(this.childListChanged_bound);
        }
        add(e, t) {
            this._add(e, t), this.onListChanged.update();
        }
        addAll(e) {
            if (!e) return;
            let t = Object.keys(e);
            for (let r = 0; r < t.length; r++) this._add(t[r], e[t[r]]);
            this.onListChanged.update();
        }
        remove(e) {
            let t = this[e];
            delete this[e],
                t && t instanceof PZ.propertyList && t.onListChanged.unwatch(this.childListChanged_bound),
                this.onListChanged.update();
        }
        removeAll(e) {
            let t = Object.keys(this);
            for (let e = 0; e < t.length; e++) {
                let r = this[t[e]];
                delete this[t[e]], r instanceof PZ.propertyList && r.onListChanged.unwatch(this.childListChanged_bound);
            }
            this.onListChanged.update();
        }
        *[Symbol.iterator]() {
            let e = Object.keys(this);
            for (let t = 0; t < e.length; t++) {
                let r = this[e[t]];
                r instanceof PZ.propertyList ? yield* r : yield r;
            }
        }
        findKey(e) {
            let t = Object.keys(this);
            for (let r = 0; r < t.length; r++) if (e === this[t[r]]) return t[r];
        }
        forEachItemOfType(e, t) {
            this instanceof e && t(this);
            for (let r of this) r.forEachItemOfType(e, t);
        }
        getAddress(e) {
            let t = this.parent.getAddress(this);
            return e && t.push(this.findKey(e)), t;
        }
        addressLookup(e, t) {
            let r = e[t];
            return undefined === r ? this : this[r].addressLookup(e, t + 1);
        }
        get parentObject() {
            return this.parent instanceof PZ.propertyList ? this.parent.parentObject : this.parent;
        }
        get parentProject() {
            return this.parentObject.parentProject;
        }
        traverse(e) {
            for (let t of this) t.traverse(e);
        }
    }),
    (PZ.property = class extends PZ.object {
        static create(e) {
            let t;
            if (e.custom && e.dynamic && e.type > 0 && !e.objects) {
                let t, r, i;
                delete e.value,
                    (e.group = true),
                    (e.objects = []),
                    e.type === PZ.property.type.COLOR
                        ? ((t = 3), (i = 1), (r = ["R", "G", "B"]))
                        : ((t = e.type + 1), (i = 1), (r = ["X", "Y", "Z", "W"]));
                for (let a = 0; a < t; a++) {
                    let t = { dynamic: true, name: r[a], type: PZ.property.type.NUMBER, value: i };
                    e.type === PZ.property.type.COLOR && ((t.min = 0), (t.max = 1)), e.objects.push(t);
                }
            }
            return (t = e.dynamic
                ? e.group
                    ? new PZ.property.dynamic.group(e)
                    : new PZ.property.dynamic.keyframes(e)
                : new PZ.property.static(e));
        }
        constructor(e) {
            super(),
                (this.definition = e),
                (this.type = e),
                e.name ||
                    ((this.properties = new PZ.propertyList(null, this)),
                    (this.properties.visible = false),
                    (this.children = [this.properties]),
                    this.properties.addAll(PZ.property.propertyDefinitions));
        }
        load(e) {
            this.properties && this.properties.load(e && e.properties);
        }
        toJSON() {
            let e = {};
            return this.type.custom && (e.type = this.type), this.properties && (e.properties = this.properties), e;
        }
        getDefaultValue() {
            let e = this.definition.value;
            return Array.isArray(e) ? e.slice() : e;
        }
    }),
    (PZ.property.prototype.baseTypeString = "property"),
    (PZ.property.type = {
        NUMBER: 0,
        VECTOR2: 1,
        VECTOR3: 2,
        VECTOR4: 3,
        COLOR: 4,
        GRADIENT: 5,
        CURVE: 10,
        OPTION: 6,
        TEXT: 7,
        ASSET: 8,
        LIST: 9,
        SHADER: 11,
    }),
    (PZ.property.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Property" },
    }),
    (PZ.property.static = class extends PZ.property {
        constructor(e) {
            super(e),
                (this.onChanged = new PZ.observable()),
                e.changed && this.onChanged.watch(e.changed.bind(this)),
                (this.value = undefined);
        }
        get animated() {
            return false;
        }
        get interpolated() {
            return false;
        }
        toJSON() {
            let e = super.toJSON();
            return Object.keys(e).length ? (e.value = this.value) : (e = this.value), e;
        }
        load(e) {
            if ((super.load(e), e instanceof PZ.property)) e = e.value;
            else if ("object" == typeof e) e = e && e.value ? e.value : JSON.parse(JSON.stringify(e));
            else if (undefined === e && "function" == typeof (e = this.getDefaultValue())) return void e(this);
            this.set(e);
        }
        get() {
            return this.value;
        }
        set(e) {
            const t = this.value;
            (this.value = e), this.onChanged.update(t);
        }
    }),
    (PZ.property.dynamic = class extends PZ.property {
        constructor(e) {
            super(e),
                (this.onAnimatedChanged = new PZ.observable()),
                PZ.observable.defineObservableProp(this, "expression", "onExpressionChanged"),
                (this.expression = null),
                (this.value = null);
        }
        toJSON() {
            let e = super.toJSON();
            return this.expression && (e.expression = this.expression), e;
        }
        load(e) {
            super.load(e),
                e &&
                    ("string" == typeof e.expression
                        ? (this.expression = new PZ.expression(e.expression))
                        : e.expression instanceof PZ.expression &&
                          (this.expression = new PZ.expression(e.expression.source)));
        }
        get(e) {
            if (null !== this.expression) return this.expression.evaluate(e, this.parentObject);
        }
    }),
    (PZ.property.dynamic.staticBehavior = { CONSTANT: 0, LINEAR: 1 }),
    (PZ.property.dynamic.group = class extends PZ.property.dynamic {
        constructor(e) {
            super(e),
                (this.objects = new PZ.objectList(this, PZ.property.dynamic)),
                (this.children = this.children || []),
                this.children.push(this.objects),
                this.onExpressionChanged.watch((e) => {
                    !!e != !!this.expression && this.onAnimatedChanged.update();
                });
            let t = this.childAnimatedChanged.bind(this);
            for (let r = 0; r < e.objects.length; r++)
                this.objects.push(PZ.property.create(e.objects[r])), this.objects[r].onAnimatedChanged.watch(t);
            this.value = new Array(this.objects.length);
        }
        get animated() {
            return this.expression || this.objects.some((e) => e.animated);
        }
        get interpolated() {
            return true;
        }
        get frameOffset() {
            let e = this.tryGetParentOfType(PZ.clip);
            return e ? e.start : 0;
        }
        childAnimatedChanged() {
            this.onAnimatedChanged.update();
        }
        toJSON() {
            let e = super.toJSON();
            return (e.objects = this.objects), e;
        }
        load(e) {
            if ((super.load(e), e)) {
                if (
                    ((e.objects = e.objects || new Array(this.objects.length).fill(null).map((e) => new Object())),
                    undefined !== e.keyframes)
                )
                    for (let t = 0; t < e.objects.length; t++)
                        e.objects[t].keyframes = e.keyframes.map((e) => ({
                            frame: e.frame,
                            value: e.value[t],
                            tween: e.tween,
                        }));
                if (undefined !== e.animated)
                    for (let t = 0; t < e.objects.length; t++) e.objects[t].animated = e.animated;
                for (let t = 0; t < this.objects.length; t++) this.objects[t].load(e.objects[t]);
            } else for (let e = 0; e < this.objects.length; e++) this.objects[e].load();
        }
        get(e) {
            if (null !== this.expression) return this.expression.evaluate(e, this.parentObject);
            for (let t = 0; t < this.objects.length; t++) this.value[t] = this.objects[t].get(e);
            return this.value;
        }
        set(e, t) {
            for (let r = 0; r < this.objects.length; r++) this.objects[r].set(e[r], t);
        }
        hasKeyframe(e) {
            return this.objects.some((t) => t.hasKeyframe(e));
        }
        getPreviousKeyframe(e) {
            let t = null,
                r = Number.POSITIVE_INFINITY;
            for (let i = 0; i < this.objects.length; i++) {
                let a = this.objects[i].getPreviousKeyframe(e);
                if (!a) continue;
                let s = e - a.frame;
                s < r && s > 0 && ((t = a), (r = s));
            }
            return t;
        }
        getNextKeyframe(e) {
            let t = null,
                r = Number.POSITIVE_INFINITY;
            for (let i = 0; i < this.objects.length; i++) {
                let a = this.objects[i].getNextKeyframe(e);
                if (!a) continue;
                let s = a.frame - e;
                s < r && s > 0 && ((t = a), (r = s));
            }
            return t;
        }
    }),
    (PZ.property.dynamic.keyframes = class extends PZ.property.dynamic {
        constructor(e) {
            super(e),
                (this._animated = e.animated || false),
                (this.interpolated = e.type < 5),
                (this.defaultTween = this.interpolated ? 1 : 0),
                (this.keyframes = new PZ.objectList(this, PZ.keyframe)),
                (this.onKeyframeCreated = new PZ.observable()),
                (this.onKeyframeDeleted = new PZ.observable()),
                (this.onKeyframeMoved = new PZ.observable()),
                (this.onKeyframeChanged = new PZ.observable()),
                this.onExpressionChanged.watch((e) => {
                    !!e != !!this.expression && this.onAnimatedChanged.update();
                });
        }
        get animated() {
            return this.expression || this._animated;
        }
        set animated(e) {
            e !== this._animated && ((this._animated = e), this.onAnimatedChanged.update(!e));
        }
        get frameOffset() {
            let e = this.tryGetParentOfType(PZ.clip);
            return e ? e.start : 0;
        }
        toJSON() {
            let e = super.toJSON();
            return (e.animated = this.animated), (e.keyframes = this.keyframes), e;
        }
        load(e) {
            if ((super.load(e), e)) {
                if (e.keyframes) {
                    0;
                    for (let t = 0; t < e.keyframes.length; t++) {
                        let r = new PZ.keyframe();
                        r.load(e.keyframes[t]), this.keyframes.push(r);
                    }
                }
                this.animated = e.animated;
            } else {
                let e = this.getDefaultValue();
                "function" == typeof e
                    ? e(this)
                    : this.definition.allowEmpty || this.keyframes.push(new PZ.keyframe(e, 0, this.defaultTween));
            }
        }
        get(e) {
            if (null !== this.expression) return this.expression.evaluate(e, this.parentObject);
            let t,
                r = this.getClosestKeyframeIndex(e),
                i = this.keyframes[r];
            if (i.frame > e && r > 0) (t = i), (i = this.keyframes[--r]);
            else {
                if (!(i.frame < e)) return i.value;
                t = this.keyframes[r + 1];
            }
            if (!t || null === PZ.tween.easingList[255 & t.tween].fn) return i.value;
            let a = Math.max((e - i.frame) / (t.frame - i.frame), 0),
                s = PZ.tween.easingList[255 & t.tween].fn(a);
            if (t.tween >> 8 == 1) {
                let r,
                    a = PZ.property.dynamic.keyframes.o,
                    s = PZ.tween.correctCurve(i, t);
                return (r = PZ.tween.findZero(
                    e,
                    i.frame,
                    i.controlPoints[1][0] * s + i.frame,
                    t.controlPoints[0][0] * s + t.frame,
                    t.frame,
                    a
                )
                    ? PZ.tween.bezier(
                          i.value,
                          i.controlPoints[1][1] * s + i.value,
                          t.controlPoints[0][1] * s + t.value,
                          t.value,
                          a[0]
                      )
                    : i.value);
            }
            return PZ.tween.linear(i.value, t.value, s);
        }
        integrate(e) {
            let t = this.keyframes[0].value * Math.min(this.keyframes[0].frame, e);
            for (let r = 0; r < this.keyframes.length && !(this.keyframes[r].frame >= e); r++) {
                let i = this.keyframes[r],
                    a = this.keyframes[r + 1];
                if (a)
                    if (a.value === i.value || null === PZ.tween.easingList[255 & a.tween].fn) {
                        t += i.value * (Math.min(a.frame, e) - i.frame);
                    } else {
                        let r = (a.value - i.value) / (a.frame - i.frame),
                            s = Math.min(a.frame, e) - i.frame;
                        t += 0.5 * r * s * s + i.value * s;
                    }
                else {
                    t += i.value * (e - i.frame);
                }
                this.keyframes[r++] && this.keyframes;
            }
            return t;
        }
        set(e, t) {
            let r = this.getClosestKeyframeIndex(t);
            this.keyframes[r].value = e;
        }
        sortKeyframes() {
            this.keyframes.sort(function (e, t) {
                return e.frame < t.frame ? -1 : e.frame > t.frame ? 1 : 0;
            });
        }
        getKeyframeUnsorted(e) {
            for (let t = 0; t < this.keyframes.length; t++) if (this.keyframes[t].frame === e) return this.keyframes[t];
        }
        hasKeyframe(e) {
            return -1 !== this.getKeyframeIndex(e);
        }
        getKeyframe(e) {
            let t = this.getKeyframeIndex(e);
            return this.keyframes[t];
        }
        getKeyframeIndex(e) {
            let t = this.getClosestKeyframeIndex(e);
            return t >= 0 && this.keyframes[t].frame !== e ? -1 : t;
        }
        getClosestKeyframeIndex(e, t, r) {
            for (t |= 0, r = undefined === r ? this.keyframes.length - 1 : 0; ; ) {
                if (r <= t) return r;
                let i = t + ((r - t) >> 1),
                    a = this.keyframes[i].frame;
                if (a === e) return i;
                a > e ? (r = i) : a < e && (t = i + 1);
            }
        }
        getPreviousKeyframe(e) {
            let t = this.getClosestKeyframeIndex(e);
            return t < 0
                ? null
                : (this.keyframes[t].frame >= e && this.keyframes[t - 1] && (t -= 1), this.keyframes[t]);
        }
        getNextKeyframe(e) {
            let t = this.getClosestKeyframeIndex(e);
            return t < 0
                ? null
                : (this.keyframes[t].frame <= e && this.keyframes[t + 1] && (t += 1), this.keyframes[t]);
        }
        addKeyframe(e) {
            let t = e.frame,
                r = this.getClosestKeyframeIndex(t);
            return (r < 0 || this.keyframes[r].frame < t) && r++, this.keyframes.splice(r, 0, e), r;
        }
        deleteKeyframeIdx(e) {
            return this.keyframes.splice(e, 1)[0];
        }
        deleteKeyframe(e) {
            let t = this.getKeyframeIndex(e);
            if (!(t < 0)) return this.deleteKeyframeIdx(t);
        }
        shiftKeyframes(e) {
            for (let t = 0; t < this.keyframes.length; t++)
                (this.keyframes[t].frame += e), this.onKeyframeMoved.update(null, this.keyframes[t]);
        }
        scaleKeyframes(e) {
            for (let t = 0; t < this.keyframes.length; t++)
                (this.keyframes[t].frame *= e), this.onKeyframeMoved.update(null, this.keyframes[t]);
        }
        moveKeyframe() {
            this.onKeyframeMoved.update();
        }
    }),
    (PZ.property.dynamic.keyframes.o = new Array(32).fill(0)),
    (PZ.observable = function () {
        this.watchers = [];
    }),
    (PZ.observable.prototype.has = function (e) {
        return this.watchers.includes(e);
    }),
    (PZ.observable.prototype.watch = function (e, t) {
        this.watchers.push(e), t && e();
    }),
    (PZ.observable.prototype.unwatch = function (e) {
        var t = this.watchers.indexOf(e);
        t < 0 || this.watchers.splice(t, 1);
    }),
    (PZ.observable.prototype.update = function (...e) {
        for (var t = 0; t < this.watchers.length; t++) this.watchers[t](...e);
    }),
    (PZ.observable.defineObservableProp = function (e, t, r, i) {
        (e[r] = e[r] || new PZ.observable()),
            Object.defineProperty(e, t, {
                set(a) {
                    let s = e["_" + t];
                    (s !== a || i) && ((e["_" + t] = a), e[r].update(s));
                },
                get: () => e["_" + t],
            });
    }),
    (PZ.random = {}),
    (PZ.random.number = function (e, t, r) {
        var i = Math.random() * (t - e + (r ? 1 : 0)) + e;
        return r && (i = Math.floor(i)), i;
    }),
    (PZ.random.normal = function (e, t) {
        for (var r = 0, i = 0; i < 5; i++) r += Math.random();
        return (t * (r - 2.5)) / 2.5 + e;
    }),
    (PZ.random.color = function (e) {
        let t = [this.number(0, 1), this.number(0, 1), this.number(0, 1)];
        return e && t.push(this.number(0, 1)), t;
    }),
    (PZ.random.gradient = function () {
        return [
            { position: 0, color: this.htmlColor() },
            { position: 1, color: this.htmlColor() },
        ];
    }),
    (PZ.random.htmlColor = function (e) {
        var t = "rgba(";
        return (
            (t +=
                this.number(0, 255, true) +
                ", " +
                this.number(0, 255, true) +
                ", " +
                this.number(0, 255, true) +
                ", " +
                (e ? this.number(0, 1) : 1)),
            (t += ")")
        );
    }),
    (PZ.random.grayColor = function (e) {
        var t = "rgba(",
            r = this.number(0, 255, true);
        return (t += r + ", " + r + ", " + r + ", " + (e ? this.number(0, 1) : 1)), (t += ")");
    }),
    (PZ.tween = {}),
    (PZ.tween.easing = {
        Linear: {
            None: function (e) {
                return e;
            },
        },
        Quadratic: {
            In: function (e) {
                return e * e;
            },
            Out: function (e) {
                return e * (2 - e);
            },
            InOut: function (e) {
                return (e *= 2) < 1 ? 0.5 * e * e : -0.5 * (--e * (e - 2) - 1);
            },
        },
        Cubic: {
            In: function (e) {
                return e * e * e;
            },
            Out: function (e) {
                return --e * e * e + 1;
            },
            InOut: function (e) {
                return (e *= 2) < 1 ? 0.5 * e * e * e : 0.5 * ((e -= 2) * e * e + 2);
            },
            OutIn: function (e) {
                return 4 * (e -= 0.5) * e * e + 0.5;
            },
        },
        Quartic: {
            In: function (e) {
                return e * e * e * e;
            },
            Out: function (e) {
                return 1 - --e * e * e * e;
            },
            InOut: function (e) {
                return (e *= 2) < 1 ? 0.5 * e * e * e * e : -0.5 * ((e -= 2) * e * e * e - 2);
            },
        },
        Quintic: {
            In: function (e) {
                return e * e * e * e * e;
            },
            Out: function (e) {
                return --e * e * e * e * e + 1;
            },
            InOut: function (e) {
                return (e *= 2) < 1 ? 0.5 * e * e * e * e * e : 0.5 * ((e -= 2) * e * e * e * e + 2);
            },
        },
        Sinusoidal: {
            In: function (e) {
                return 1 - Math.cos((e * Math.PI) / 2);
            },
            Out: function (e) {
                return Math.sin((e * Math.PI) / 2);
            },
            InOut: function (e) {
                return 0.5 * (1 - Math.cos(Math.PI * e));
            },
        },
        Exponential: {
            In: function (e) {
                return 0 === e ? 0 : Math.pow(1024, e - 1);
            },
            Out: function (e) {
                return 1 === e ? 1 : 1 - Math.pow(2, -10 * e);
            },
            InOut: function (e) {
                return 0 === e
                    ? 0
                    : 1 === e
                    ? 1
                    : (e *= 2) < 1
                    ? 0.5 * Math.pow(1024, e - 1)
                    : 0.5 * (2 - Math.pow(2, -10 * (e - 1)));
            },
        },
        Circular: {
            In: function (e) {
                return 1 - Math.sqrt(1 - e * e);
            },
            Out: function (e) {
                return Math.sqrt(1 - --e * e);
            },
            InOut: function (e) {
                return (e *= 2) < 1 ? -0.5 * (Math.sqrt(1 - e * e) - 1) : 0.5 * (Math.sqrt(1 - (e -= 2) * e) + 1);
            },
        },
        Elastic: {
            In: function (e) {
                var t,
                    r = 0.1;
                return 0 === e
                    ? 0
                    : 1 === e
                    ? 1
                    : (!r || r < 1 ? ((r = 1), (t = 0.1)) : (t = (0.4 * Math.asin(1 / r)) / (2 * Math.PI)),
                      -r * Math.pow(2, 10 * (e -= 1)) * Math.sin(((e - t) * (2 * Math.PI)) / 0.4));
            },
            Out: function (e) {
                var t,
                    r = 0.1;
                return 0 === e
                    ? 0
                    : 1 === e
                    ? 1
                    : (!r || r < 1 ? ((r = 1), (t = 0.1)) : (t = (0.4 * Math.asin(1 / r)) / (2 * Math.PI)),
                      r * Math.pow(2, -10 * e) * Math.sin(((e - t) * (2 * Math.PI)) / 0.4) + 1);
            },
            InOut: function (e) {
                var t,
                    r = 0.1;
                return 0 === e
                    ? 0
                    : 1 === e
                    ? 1
                    : (!r || r < 1 ? ((r = 1), (t = 0.1)) : (t = (0.4 * Math.asin(1 / r)) / (2 * Math.PI)),
                      (e *= 2) < 1
                          ? r * Math.pow(2, 10 * (e -= 1)) * Math.sin(((e - t) * (2 * Math.PI)) / 0.4) * -0.5
                          : r * Math.pow(2, -10 * (e -= 1)) * Math.sin(((e - t) * (2 * Math.PI)) / 0.4) * 0.5 + 1);
            },
        },
        Back: {
            In: function (e) {
                var t = 1.70158;
                return e * e * ((t + 1) * e - t);
            },
            Out: function (e) {
                var t = 1.70158;
                return --e * e * ((t + 1) * e + t) + 1;
            },
            InOut: function (e) {
                var t = 2.5949095;
                return (e *= 2) < 1 ? e * e * ((t + 1) * e - t) * 0.5 : 0.5 * ((e -= 2) * e * ((t + 1) * e + t) + 2);
            },
        },
        Bounce: {
            In: function (e) {
                return 1 - PZ.tween.easing.Bounce.Out(1 - e);
            },
            Out: function (e) {
                return e < 1 / 2.75
                    ? 7.5625 * e * e
                    : e < 2 / 2.75
                    ? 7.5625 * (e -= 1.5 / 2.75) * e + 0.75
                    : e < 2.5 / 2.75
                    ? 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375
                    : 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
            },
            InOut: function (e) {
                return e < 0.5
                    ? 0.5 * PZ.tween.easing.Bounce.In(2 * e)
                    : 0.5 * PZ.tween.easing.Bounce.Out(2 * e - 1) + 0.5;
            },
        },
    }),
    (PZ.tween.easingList = [
        { name: "none", fn: null },
        { name: "linear", fn: PZ.tween.easing.Linear.None },
        { name: "quadratic in", fn: PZ.tween.easing.Quadratic.In },
        { name: "quadratic out", fn: PZ.tween.easing.Quadratic.Out },
        { name: "quadratic in-out", fn: PZ.tween.easing.Quadratic.InOut },
        { name: "cubic in", fn: PZ.tween.easing.Cubic.In },
        { name: "cubic out", fn: PZ.tween.easing.Cubic.Out },
        { name: "cubic in-out", fn: PZ.tween.easing.Cubic.InOut },
        { name: "quartic in", fn: PZ.tween.easing.Quartic.In },
        { name: "quartic out", fn: PZ.tween.easing.Quartic.Out },
        { name: "quartic in-out", fn: PZ.tween.easing.Quartic.InOut },
        { name: "quintic in", fn: PZ.tween.easing.Quintic.In },
        { name: "quintic out", fn: PZ.tween.easing.Quintic.Out },
        { name: "quintic in-out", fn: PZ.tween.easing.Quintic.InOut },
        { name: "sinusoidal in", fn: PZ.tween.easing.Sinusoidal.In },
        { name: "sinusoidal out", fn: PZ.tween.easing.Sinusoidal.Out },
        { name: "sinusoidal in-out", fn: PZ.tween.easing.Sinusoidal.InOut },
        { name: "exponential in", fn: PZ.tween.easing.Exponential.In },
        { name: "exponential out", fn: PZ.tween.easing.Exponential.Out },
        { name: "exponential in-out", fn: PZ.tween.easing.Exponential.InOut },
        { name: "circular in", fn: PZ.tween.easing.Circular.In },
        { name: "circular out", fn: PZ.tween.easing.Circular.Out },
        { name: "circular in-out", fn: PZ.tween.easing.Circular.InOut },
        { name: "elastic in", fn: PZ.tween.easing.Elastic.In },
        { name: "elastic out", fn: PZ.tween.easing.Elastic.Out },
        { name: "elastic in-out", fn: PZ.tween.easing.Elastic.InOut },
        { name: "back in", fn: PZ.tween.easing.Back.In },
        { name: "back out", fn: PZ.tween.easing.Back.Out },
        { name: "back in-out", fn: PZ.tween.easing.Back.InOut },
        { name: "bounce in", fn: PZ.tween.easing.Bounce.In },
        { name: "bounce out", fn: PZ.tween.easing.Bounce.Out },
        { name: "bounce in-out", fn: PZ.tween.easing.Bounce.InOut },
        { name: "cubic out-in", fn: PZ.tween.easing.Cubic.OutIn },
    ]),
    (PZ.tween.linear = function (e, t, r) {
        return (t - e) * r + e;
    }),
    (PZ.tween.catmullRom = function (e, t, r, i, a) {
        var s = a * a,
            n = 0.5 * (r - e),
            o = 0.5 * (i - t);
        return (2 * t - 2 * r + n + o) * (a * s) + (-3 * t + 3 * r - 2 * n - o) * s + n * a + t;
    }),
    (PZ.tween.curve = function (e, t, r, i, a, s, n) {
        let o = 0.5 * r,
            p = 0.5 * s - 4 * a + 10 * i - 3 * o - 6 * t - 10 * e,
            l = a - 4 * i + p + 2 * o + 3 * t + 4 * e;
        return (
            l * n * n * n * n * n +
            (s - 11 * i - 9 * l + 5 * p + 9 * o + 11 * t + 11 * e) * n * n * n * n +
            p * n * n * n +
            o * n * n +
            t * n +
            e
        );
    }),
    (PZ.tween.bezier = function (e, t, r, i, a) {
        let s, n, o, p;
        return (
            (s = e) + a * (n = 3 * (t - e)) + a * a * (o = 3 * (e - 2 * t + r)) + a * a * a * (p = i - e + 3 * (t - r))
        );
    }),
    (PZ.tween.findZero = function (e, t, r, i, a, s) {
        let n,
            o,
            p,
            l,
            h,
            c,
            u,
            d,
            f,
            m,
            y,
            g,
            v = 0,
            b = (e) => (0 === e ? 0 : e < 0 ? -Math.exp(Math.log(-e) / 3) : Math.exp(Math.log(e) / 3));
        if (((n = t - e), (o = 3 * (r - t)), (p = 3 * (t - 2 * r + i)), 0 !== (l = a - t + 3 * (r - i))))
            return (
                (h = p / l),
                (m =
                    (f = (2 * (h /= 3) * h * h - h * (c = o / l) + (u = n / l)) / 2) * f +
                    (d = c / 3 - h * h) * d * d) > 0
                    ? ((y = Math.sqrt(m)),
                      (s[0] = b(-f + y) + b(-f - y) - h),
                      s[0] >= -1e-10 && s[0] <= 1.000001 ? 1 : 0)
                    : 0 === m
                    ? ((y = b(-f)),
                      (s[0] = 2 * y - h),
                      s[0] >= -1e-10 && s[0] <= 1.000001 && v++,
                      (s[v] = -y - h),
                      s[v] >= -1e-10 && s[v] <= 1.000001 ? v + 1 : v)
                    : ((g = Math.acos(-f / Math.sqrt(-d * d * d))),
                      (y = Math.sqrt(-d)),
                      (d = Math.cos(g / 3)),
                      (f = Math.sqrt(3 - 3 * d * d)),
                      (s[0] = 2 * y * d - h),
                      s[0] >= -1e-10 && s[0] <= 1.000001 && v++,
                      (s[v] = -y * (d + f) - h),
                      s[v] >= -1e-10 && s[v] <= 1.000001 && v++,
                      (s[v] = -y * (d - f) - h),
                      s[v] >= -1e-10 && s[v] <= 1.000001 ? v + 1 : v)
            );
        if (((c = o), (u = n), 0 != (h = p))) {
            if ((d = c * c - 4 * h * u) > 0)
                return (
                    (d = Math.sqrt(d)),
                    (s[0] = (-c - d) / (2 * h)),
                    s[0] >= -1e-10 && s[0] <= 1.000001 && v++,
                    (s[v] = (-c + d) / (2 * h)),
                    s[v] >= -1e-10 && s[v] <= 1.000001 ? v + 1 : v
                );
            if (0 === d) return (s[0] = -c / (2 * h)), s[0] >= -1e-10 && s[0] <= 1.000001 ? 1 : 0;
        } else {
            if (0 !== c) return (s[0] = -u / c), s[0] >= -1e-10 && s[0] <= 1.000001 ? 1 : 0;
            if (0 === u) return (s[0] = 0), 1;
        }
        return 0;
    }),
    (PZ.tween.correctCurve = function (e, t) {
        let r = t.frame - e.frame,
            i = Math.abs(e.controlPoints[1][0]) + Math.abs(t.controlPoints[0][0]);
        return i > r ? r / i : 1;
    }),
    (PZ.archive = function () {
        (this.files = []), (this.worker = null);
    }),
    (PZ.archive.prototype.tar = async function () {
        for (var e = ["-czvf", "output/out", "-C", "blob"], t = 0; t < this.files.length; t++)
            e.push(this.files[t].name);
        return await this.callWorker(false, e, this.files);
    }),
    (PZ.archive.prototype.untar = async function (e) {
        await this.callWorker(
            true,
            ["-xvzf", "/blob/blob.pz", "-C", "/pz", "-s", "/pz//"],
            [{ name: "blob.pz", data: e }]
        );
    }),
    (PZ.archive.prototype.callWorker = function (e, t, r) {
        let i = this;
        return new Promise(function (a, s) {
            (i.worker = new Worker("worker/tar.js")),
                (i.worker.onerror = function (e) {
                    i.worker.terminate(), (i.worker = null), s();
                }),
                (i.worker.onmessage = function (s) {
                    var n = s.data;
                    if ("ready" === n.type)
                        i.worker.postMessage({
                            type: "command",
                            arguments: t,
                            wfiles: r,
                            useDevFile: false === e,
                            inputDirectory: e ? "input" : "pz",
                            outputDirectory: e ? "/pz" : "output",
                        });
                    else if ("stdout" === n.type) 0;
                    else if ("done" === n.type) {
                        var o;
                        if ((i.worker.terminate(), (i.worker = null), false !== e)) (i.files = n.data), a();
                        else
                            n.file
                                ? (o = n.file)
                                : n.data.length > 0 &&
                                  (o = n.data[0].data) &&
                                  (o = new Blob([o], { type: "application/octet-stream" })),
                                a(o);
                    }
                });
        });
    }),
    (PZ.archive.prototype.fileExists = function (e) {
        return !!this.files.find((t) => t.name === e);
    }),
    (PZ.archive.prototype.peekFile = function (e) {
        return this.files.find((t) => t.name === e);
    }),
    (PZ.archive.prototype.getFile = function (e) {
        let t = this.files.findIndex((t) => t.name === e);
        return t < 0 ? null : this.files.splice(t, 1)[0];
    }),
    (PZ.archive.prototype.getFileBlob = function (e, t) {
        var r = this.getFile(e);
        if (r) return undefined === t && (t = { type: "" }), new Blob([r.data], t);
    }),
    (PZ.archive.prototype.getFileString = function (e) {
        var t = this.getFile(e);
        if (t) {
            var r = new Uint8Array(t.data);
            return this.decodeString(r);
        }
    }),
    (PZ.archive.prototype.addFile = function (e, t) {
        this.files.push({ name: e, data: t });
    }),
    (PZ.archive.prototype.addFileString = function (e, t) {
        var r = this.encodeString(t);
        this.addFile(e, r);
    }),
    (PZ.archive.prototype.encodeString = function (e) {
        if ("undefined" != typeof TextEncoder) return new TextEncoder().encode(e);
        for (var t = [], r = 0; r < e.length; r++) {
            var i = e.charCodeAt(r);
            i < 128
                ? t.push(i)
                : i < 2048
                ? t.push(192 | (i >> 6), 128 | (63 & i))
                : i < 55296 || i >= 57344
                ? t.push(224 | (i >> 12), 128 | ((i >> 6) & 63), 128 | (63 & i))
                : (r++,
                  (i = 65536 + (((1023 & i) << 10) | (1023 & e.charCodeAt(r)))),
                  t.push(240 | (i >> 18), 128 | ((i >> 12) & 63), 128 | ((i >> 6) & 63), 128 | (63 & i)));
        }
        return Uint8Array.from(t);
    }),
    (PZ.archive.prototype.decodeString = function (e) {
        var t, r, i, a, s;
        if ("undefined" != typeof TextDecoder) return new TextDecoder().decode(e);
        for ("", r = e.length, t = 0; t < r; )
            switch ((i = e[t++]) >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    String.fromCharCode(i);
                    break;
                case 12:
                case 13:
                    (a = e[t++]), String.fromCharCode(((31 & i) << 6) | (63 & a));
                    break;
                case 14:
                    (a = e[t++]),
                        (s = e[t++]),
                        String.fromCharCode(((15 & i) << 12) | ((63 & a) << 6) | ((63 & s) << 0));
            }
    }),
    (PZ.av = {
        profiles: [
            { bitrate: 1, crf: 12, speed: 8, deadline: 2, lag: 0, abr: 1 },
            { bitrate: 1, crf: 10, speed: 4, deadline: 1, lag: 0, abr: 1 },
            { bitrate: 1, crf: 9, speed: 4, deadline: 1, lag: 0, abr: 1 },
            { bitrate: 1, crf: 8, speed: 1, deadline: 1, lag: 0, abr: 1 },
            { bitrate: 1, crf: 4, speed: 0, deadline: 0, lag: 0, abr: 1.5 },
        ],
        hasThreads: false,
        sharedHeap: null,
        syncBuffer: null,
        syncArray: null,
        audioBuffer: null,
        bufferStartSample: 0,
        worker: null,
        timerStart: 0,
        timeLoading: 0,
        timeRendering: 0,
        timeTotal: 0,
    }),
    (PZ.av.decode = function (e, t) {
        var r = new Worker("worker/av.js");
        r.onerror = function (e) {
            r.terminate();
            t();
        };
        r.onmessage = function (i) {
            var a = i.data;
            if (a.type === "ready") {
                [].push();
                this.postMessage(
                    {
                        type: "command",
                        options: { decode: true },
                        files: [{ name: "input", data: e }],
                    },
                    [e]
                );
            } else if (a.type === "stdout") {
            } else if (a.type === "done") {
                var s;
                var n;
                r.terminate();
                if (a.data.length > 0) {
                    s = a.data[0].data;
                    n = a.data[1].data;
                }
                t(s, n);
            }
        };
    });
PZ.av.encode = async function (e, t) {
    return new Promise(function (r, i) {
        function p(e, t, r) {
            PZ.av.timeRendering += performance.now() - PZ.av.timerStart;
            if (e && (r = Math.min(PZ.av.audioBuffer.length - PZ.av.bufferStartSample, t.num)) > 0) {
                var i = [];
                if (PZ.av.hasThreads) {
                    i[0] = new Float32Array(PZ.av.sharedHeap, t.xfer_ptrs[0], r);
                    i[1] = new Float32Array(PZ.av.sharedHeap, t.xfer_ptrs[1], r);
                } else {
                    i[0] = new Float32Array(t.xfer_buffer, t.xfer_ptrs[0], r);
                    i[1] = new Float32Array(t.xfer_buffer, t.xfer_ptrs[1], r);
                }
                for (var a = 0; a < 2; a++) {
                    PZ.av.audioBuffer.copyFromChannel(i[a], a, PZ.av.bufferStartSample);
                }
                PZ.av.bufferStartSample += r;
            }
            if (PZ.av.hasThreads) {
                PZ.av.syncArray[0] = r;
                Atomics.wake(PZ.av.syncArray, 0, 1);
                return;
            }
            PZ.av.worker.postMessage({ type: "callback", ret: r, xfer_buffer: t.xfer_buffer }, [t.xfer_buffer]);
        }
        var a = (t.width / 640) * (t.height / 360);
        a *= t.rate > 30 ? 1.5 : 1;
        a *= 1e6;
        var s = PZ.av.profiles[t.quality];
        var n = {
            filename: "matroska",
            haveVideo: 1,
            haveAudio: 1,
            frameWidth: t.width,
            frameHeight: t.height,
            frameRate: t.rate,
            videoBitrate: a * s.bitrate,
            audioBitrate: 64e3 * s.abr,
            cpu_used: s.speed,
            deadline: 1,
            lag_in_frames: 12 * s.lag,
            lossless: 0,
            crf: s.crf,
            video_codec: 0,
            totalFrames: t.length,
        };
        if (s.deadline === 0) {
            n.deadline = 0;
        } else if (s.deadline === 2) {
            n.deadline = 1e6;
        }
        console.log(
            "Video: " + n.frameWidth + "x" + n.frameHeight + " " + n.frameRate + "fps " + n.videoBitrate + "b/s"
        );
        console.log(
            "Encoder: cpu_used: " + n.cpu_used + " deadline: " + n.deadline + " lag_in_frames: " + n.lag_in_frames
        );
        PZ.av.timeTotal = performance.now();
        var o = n.frameWidth * n.frameHeight * 4;
        if (PZ.av.hasThreads) {
            PZ.av.syncBuffer = new SharedArrayBuffer(4);
            PZ.av.syncArray = new Int32Array(PZ.av.syncBuffer, 0, 1);
        }
        PZ.av.audioBuffer = null;
        PZ.av.bufferStartSample = 0;
        PZ.av.timeLoading = performance.now();
        PZ.av.worker = new Worker("worker/av.js");
        PZ.av.worker.onerror = function (e) {
            PZ.av.stop();
            i(e);
        };
        PZ.av.worker.onunhandledrejection = function (e) {
            PZ.av.stop();
            i(e.reason);
        };
        PZ.av.worker.onmessage = async function (t) {
            var a = t.data;
            if (a.type === "video") {
                PZ.av.timerStart = performance.now();
                if (PZ.av.hasThreads) {
                    var s = new Uint8Array(PZ.av.sharedHeap, a.xfer_ptrs[0], o);
                    p(false, null, await e.getVideoFrame(s));
                } else {
                    s = new Uint8Array(a.xfer_buffer, a.xfer_ptrs[0], o);
                    p(false, a, await e.getVideoFrame(s));
                }
            } else if (a.type === "audio") {
                PZ.av.timerStart = performance.now();
                if (PZ.av.audioBuffer === null || PZ.av.bufferStartSample >= PZ.av.audioBuffer.length) {
                    var l = await e.getAudioSamples(a.num);
                    PZ.av.audioBuffer = l;
                    PZ.av.bufferStartSample = 0;
                    p(true, a);
                } else {
                    p(true, a);
                }
            } else if (a.type === "read") {
                PZ.av.readOutput(a);
            } else if (a.type === "write") {
                PZ.av.writeOutput(a);
            } else if (a.type === "buffer") {
                PZ.av.sharedHeap = a.buffer;
            } else if (a.type === "remux") {
                var h;
                if (a.data.length > 0) {
                    h = a.data[0].data;
                }
                PZ.av.remuxCallback(h, a.offset);
            } else if (a.type === "ready") {
                PZ.av.timeLoading = performance.now() - PZ.av.timeLoading;
                if (PZ.av.hasThreads) {
                    this.postMessage({
                        type: "command",
                        syncBuffer: PZ.av.syncBuffer,
                        options: n,
                    });
                } else {
                    this.postMessage({ type: "command", options: n });
                }
            } else if (a.type === "stdout") {
            } else if (a.type === "error") {
                PZ.av.stop();
                i(new Error(a.data));
            } else if (a.type === "done") {
                var c;
                PZ.av.stop();
                if (a.file) {
                    c = a.file;
                    console.log("Output size: " + c.size / 1024 / 1024 + " MB");
                } else if (a.data.length > 0) {
                    c = a.data[0].data;
                    if (n.haveVideo === 1 && c) {
                        console.log("Output size: " + c.byteLength / 1024 / 1024 + " MB");
                        c = new Blob([c], { type: "video/webm" });
                    }
                }
                r(c);
            }
        };
    });
};
(PZ.av.remux = async function (e, t) {
    return new Promise(function (t, r) {
        (PZ.av.remuxCallback = function (e, r) {
            t({ buffer: e, offset: r });
        }),
            PZ.av.worker.postMessage({ type: "remux", options: e });
    });
}),
    (PZ.av.stop = function () {
        (PZ.av.timeTotal = performance.now() - this.timeTotal),
            console.log("Time loading: " + this.timeLoading),
            console.log("Time rendering: " + this.timeRendering),
            console.log("Time total: " + this.timeTotal),
            null !== this.worker &&
                (this.worker.terminate(),
                (this.worker.onmessage = null),
                (this.worker.onerror = null),
                (this.worker = null)),
            (this.audioBuffer = null),
            (this.sharedHeap = null),
            (this.syncBuffer = null),
            (this.syncArray = null);
    }),
    (PZ.av.readOutput = function (e) {
        var t = new Uint8Array(PZ.av.sharedHeap, e.offset, e.length);
        PZ.file.read(t, e.position, function () {
            (PZ.av.syncArray[0] = e.length), Atomics.wake(PZ.av.syncArray, 0, 1);
        });
    }),
    (PZ.av.writeOutput = function (e) {
        var t = new Uint8Array(PZ.av.sharedHeap, e.offset, e.length);
        PZ.file.write(t, e.position, function () {
            (PZ.av.syncArray[0] = e.length), Atomics.wake(PZ.av.syncArray, 0, 1);
        });
    }),
    (PZ.imageEncoder = class {
        static async encode(e, t) {
            let r = new Uint8ClampedArray(t.width * t.height * 4);
            await e.getVideoFrame(r);
            return await PZ.imageEncoder.canvasToBlob(e.renderer.domElement, t.format, t.quality);
        }
        static canvasToBlob(e, t, r) {
            return new Promise((i, a) => {
                if (((t = "image/" + t), undefined !== e.toBlob)) e.toBlob(i, t, r);
                else {
                    let a = e.toDataURL(t, r),
                        s = atob(a.substring(22)),
                        n = new Uint8Array(s.length);
                    for (let e = 0, t = s.length; e < t; ++e) n[e] = s.charCodeAt(e);
                    i(new Blob([n], t));
                }
            });
        }
        static async imageToBlob(e) {
            let t = document.createElement("canvas");
            (t.width = e.width),
                (t.height = e.height),
                t.getContext("2d").drawImage(e, 0, 0),
                await PZ.imageEncoder.canvasToBlob(t);
        }
    }),
    (PZ.file = {}),
    (PZ.file.getQuota = async function (e) {
        return (
            undefined === e && (e = 104857600),
            new Promise(function (t, r) {
                try {
                    navigator.webkitPersistentStorage.requestQuota(
                        e,
                        function (e) {
                            t();
                        },
                        function (e) {
                            t();
                        }
                    );
                } catch (e) {
                    t();
                }
            })
        );
    }),
    (PZ.file.cleanUp = function () {
        try {
            webkitRequestFileSystem(PERSISTENT, 0, function (e) {
                e.root.getFile("out", null, function (e) {
                    e.remove(function () {});
                });
            });
        } catch (e) {}
    }),
    (PZ.file.start = function (e) {
        window.webkitRequestFileSystem
            ? (PZ.file.fileWriter_init(e),
              (PZ.file.read = PZ.file.fileWriter_read),
              (PZ.file.write = PZ.file.fileWriter_write))
            : window.IDBMutableFile &&
              (PZ.file.mutableFile_init(e),
              (PZ.file.read = PZ.file.mutableFile_read),
              (PZ.file.write = PZ.file.mutableFile_write));
    }),
    (PZ.file.write = null),
    (PZ.file.finish = function () {
        this.fileEntry &&
            this.fileEntry.remove(
                function () {},
                function () {}
            );
    }),
    (PZ.file.fileWriter_init = function (e) {
        webkitRequestFileSystem(
            TEMPORARY,
            1073741824,
            function (t) {
                t.root.getFile(
                    "video.mp4",
                    { create: true },
                    function (t) {
                        (PZ.file.fileEntry = t), e();
                    },
                    function (e) {}
                );
            },
            function (e) {}
        );
    }),
    (PZ.file.fileWriter_read = function (e, t, r) {
        this.fileEntry.file(function (i) {
            var a = new FileReader();
            (a.onload = function (t) {
                e.set(new Uint8Array(t.target.result)), r();
            }),
                a.readAsArrayBuffer(i.slice(t, t + e.length));
        });
    }),
    (PZ.file.fileWriter_write = function (e, t, r) {
        this.fileEntry.createWriter(function (i) {
            i.seek(t),
                (i.onwriteend = function (e) {
                    r();
                });
            var a = new Blob([e]);
            i.write(a);
        });
    }),
    (PZ.file.mutableFile_init = function (e) {
        indexedDB.open("renderstorage").onsuccess = function () {
            this.result.mozCreateFileHandle("video.mp4", "video/mp4").onsuccess = function () {
                (PZ.file.fileHandle = this.result), e();
            };
        };
    }),
    (PZ.file.mutableFile_read = function (e, t, r) {
        var i = this.fileHandle.open("readonly");
        (i.location = t),
            (i.readAsArrayBuffer(e.length).onsuccess = function () {
                e.set(new Uint8Array(this.result)), r();
            });
    }),
    (PZ.file.mutableFile_write = function (e, t, r) {
        var i = this.fileHandle.open("readwrite"),
            a = new ArrayBuffer(e.length);
        new Uint8Array(a).set(e),
            (i.location = t),
            (i.write(a).onsuccess = function () {
                r();
            });
    }),
    (PZ.file.blob_init = function () {}),
    (PZ.file.blob_read = function (e, t, r) {}),
    (PZ.file.blob_write = function (e, t, r) {}),
    (function (e, t) {
        "object" == typeof exports && "undefined" != typeof module
            ? t(exports)
            : "function" == typeof define && define.amd
            ? define(["exports"], t)
            : t((e.opentype = {}));
    })(this, function (e) {
        var t, r;
        String.prototype.codePointAt ||
            ((t = (function () {
                try {
                    var e = {},
                        t = Object.defineProperty,
                        r = t(e, e, e) && t;
                } catch (e) {}
                return r;
            })()),
            (r = function (e) {
                if (null == this) throw TypeError();
                var t = String(this),
                    r = t.length,
                    i = e ? Number(e) : 0;
                if ((i != i && (i = 0), !(i < 0 || i >= r))) {
                    var a,
                        s = t.charCodeAt(i);
                    return s >= 55296 && s <= 56319 && r > i + 1 && (a = t.charCodeAt(i + 1)) >= 56320 && a <= 57343
                        ? 1024 * (s - 55296) + a - 56320 + 65536
                        : s;
                }
            }),
            t
                ? t(String.prototype, "codePointAt", { value: r, configurable: true, writable: true })
                : (String.prototype.codePointAt = r));
        var i = 0,
            a = -3;
        function s() {
            (this.table = new Uint16Array(16)), (this.trans = new Uint16Array(288));
        }
        var n = new s(),
            o = new s(),
            p = new Uint8Array(30),
            l = new Uint16Array(30),
            h = new Uint8Array(30),
            c = new Uint16Array(30),
            u = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]),
            d = new s(),
            f = new Uint8Array(320);
        function m(e, t, r, i) {
            var a, s;
            for (a = 0; a < r; ++a) e[a] = 0;
            for (a = 0; a < 30 - r; ++a) e[a + r] = (a / r) | 0;
            for (s = i, a = 0; a < 30; ++a) (t[a] = s), (s += 1 << e[a]);
        }
        var y = new Uint16Array(16);
        function g(e, t, r, i) {
            var a, s;
            for (a = 0; a < 16; ++a) e.table[a] = 0;
            for (a = 0; a < i; ++a) e.table[t[r + a]]++;
            for (e.table[0] = 0, s = 0, a = 0; a < 16; ++a) (y[a] = s), (s += e.table[a]);
            for (a = 0; a < i; ++a) t[r + a] && (e.trans[y[t[r + a]]++] = a);
        }
        function v(e) {
            e.bitcount-- || ((e.tag = e.source[e.sourceIndex++]), (e.bitcount = 7));
            var t = 1 & e.tag;
            return (e.tag >>>= 1), t;
        }
        function b(e, t, r) {
            if (!t) return r;
            for (; e.bitcount < 24; ) (e.tag |= e.source[e.sourceIndex++] << e.bitcount), (e.bitcount += 8);
            var i = e.tag & (65535 >>> (16 - t));
            return (e.tag >>>= t), (e.bitcount -= t), i + r;
        }
        function x(e, t) {
            for (; e.bitcount < 24; ) (e.tag |= e.source[e.sourceIndex++] << e.bitcount), (e.bitcount += 8);
            var r = 0,
                i = 0,
                a = 0,
                s = e.tag;
            do {
                (i = 2 * i + (1 & s)), (s >>>= 1), ++a, (r += t.table[a]), (i -= t.table[a]);
            } while (i >= 0);
            return (e.tag = s), (e.bitcount -= a), t.trans[r + i];
        }
        function P(e, t, r) {
            var i, a, s, n, o, p;
            for (i = b(e, 5, 257), a = b(e, 5, 1), s = b(e, 4, 4), n = 0; n < 19; ++n) f[n] = 0;
            for (n = 0; n < s; ++n) {
                var l = b(e, 3, 0);
                f[u[n]] = l;
            }
            for (g(d, f, 0, 19), o = 0; o < i + a; ) {
                var h = x(e, d);
                switch (h) {
                    case 16:
                        var c = f[o - 1];
                        for (p = b(e, 2, 3); p; --p) f[o++] = c;
                        break;
                    case 17:
                        for (p = b(e, 3, 3); p; --p) f[o++] = 0;
                        break;
                    case 18:
                        for (p = b(e, 7, 11); p; --p) f[o++] = 0;
                        break;
                    default:
                        f[o++] = h;
                }
            }
            g(t, f, 0, i), g(r, f, i, a);
        }
        function w(e, t, r) {
            for (;;) {
                var a,
                    s,
                    n,
                    o,
                    u = x(e, t);
                if (256 === u) return i;
                if (u < 256) e.dest[e.destLen++] = u;
                else
                    for (
                        a = b(e, p[(u -= 257)], l[u]), s = x(e, r), o = n = e.destLen - b(e, h[s], c[s]);
                        o < n + a;
                        ++o
                    )
                        e.dest[e.destLen++] = e.dest[o];
            }
        }
        function S(e) {
            for (var t, r; e.bitcount > 8; ) e.sourceIndex--, (e.bitcount -= 8);
            if (
                (t = 256 * (t = e.source[e.sourceIndex + 1]) + e.source[e.sourceIndex]) !==
                (65535 & ~(256 * e.source[e.sourceIndex + 3] + e.source[e.sourceIndex + 2]))
            )
                return a;
            for (e.sourceIndex += 4, r = t; r; --r) e.dest[e.destLen++] = e.source[e.sourceIndex++];
            return (e.bitcount = 0), i;
        }
        !(function (e, t) {
            var r;
            for (r = 0; r < 7; ++r) e.table[r] = 0;
            for (e.table[7] = 24, e.table[8] = 152, e.table[9] = 112, r = 0; r < 24; ++r) e.trans[r] = 256 + r;
            for (r = 0; r < 144; ++r) e.trans[24 + r] = r;
            for (r = 0; r < 8; ++r) e.trans[168 + r] = 280 + r;
            for (r = 0; r < 112; ++r) e.trans[176 + r] = 144 + r;
            for (r = 0; r < 5; ++r) t.table[r] = 0;
            for (t.table[5] = 32, r = 0; r < 32; ++r) t.trans[r] = r;
        })(n, o),
            m(p, l, 4, 3),
            m(h, c, 2, 1),
            (p[28] = 0),
            (l[28] = 258);
        var E = function (e, t) {
            var r,
                p,
                l = new (function (e, t) {
                    (this.source = e),
                        (this.sourceIndex = 0),
                        (this.tag = 0),
                        (this.bitcount = 0),
                        (this.dest = t),
                        (this.destLen = 0),
                        (this.ltree = new s()),
                        (this.dtree = new s());
                })(e, t);
            do {
                switch (((r = v(l)), b(l, 2, 0))) {
                    case 0:
                        p = S(l);
                        break;
                    case 1:
                        p = w(l, n, o);
                        break;
                    case 2:
                        P(l, l.ltree, l.dtree), (p = w(l, l.ltree, l.dtree));
                        break;
                    default:
                        p = a;
                }
                if (p !== i) throw new Error("Data error");
            } while (!r);
            return l.destLen < l.dest.length
                ? "function" == typeof l.dest.slice
                    ? l.dest.slice(0, l.destLen)
                    : l.dest.subarray(0, l.destLen)
                : l.dest;
        };
        function T(e, t, r, i, a) {
            return (
                Math.pow(1 - a, 3) * e +
                3 * Math.pow(1 - a, 2) * a * t +
                3 * (1 - a) * Math.pow(a, 2) * r +
                Math.pow(a, 3) * i
            );
        }
        function k() {
            (this.x1 = Number.NaN), (this.y1 = Number.NaN), (this.x2 = Number.NaN), (this.y2 = Number.NaN);
        }
        function O() {
            (this.commands = []), (this.fill = "black"), (this.stroke = null), (this.strokeWidth = 1);
        }
        function Z(e) {
            throw new Error(e);
        }
        function R(e, t) {
            e || Z(t);
        }
        (k.prototype.isEmpty = function () {
            return isNaN(this.x1) || isNaN(this.y1) || isNaN(this.x2) || isNaN(this.y2);
        }),
            (k.prototype.addPoint = function (e, t) {
                "number" == typeof e &&
                    ((isNaN(this.x1) || isNaN(this.x2)) && ((this.x1 = e), (this.x2 = e)),
                    e < this.x1 && (this.x1 = e),
                    e > this.x2 && (this.x2 = e)),
                    "number" == typeof t &&
                        ((isNaN(this.y1) || isNaN(this.y2)) && ((this.y1 = t), (this.y2 = t)),
                        t < this.y1 && (this.y1 = t),
                        t > this.y2 && (this.y2 = t));
            }),
            (k.prototype.addX = function (e) {
                this.addPoint(e, null);
            }),
            (k.prototype.addY = function (e) {
                this.addPoint(null, e);
            }),
            (k.prototype.addBezier = function (e, t, r, i, a, s, n, o) {
                var p = [e, t],
                    l = [r, i],
                    h = [a, s],
                    c = [n, o];
                this.addPoint(e, t), this.addPoint(n, o);
                for (var u = 0; u <= 1; u++) {
                    var d = 6 * p[u] - 12 * l[u] + 6 * h[u],
                        f = -3 * p[u] + 9 * l[u] - 9 * h[u] + 3 * c[u],
                        m = 3 * l[u] - 3 * p[u];
                    if (0 !== f) {
                        var y = Math.pow(d, 2) - 4 * m * f;
                        if (!(y < 0)) {
                            var g = (-d + Math.sqrt(y)) / (2 * f);
                            0 < g &&
                                g < 1 &&
                                (0 === u && this.addX(T(p[u], l[u], h[u], c[u], g)),
                                1 === u && this.addY(T(p[u], l[u], h[u], c[u], g)));
                            var v = (-d - Math.sqrt(y)) / (2 * f);
                            0 < v &&
                                v < 1 &&
                                (0 === u && this.addX(T(p[u], l[u], h[u], c[u], v)),
                                1 === u && this.addY(T(p[u], l[u], h[u], c[u], v)));
                        }
                    } else {
                        if (0 === d) continue;
                        var b = -m / d;
                        0 < b &&
                            b < 1 &&
                            (0 === u && this.addX(T(p[u], l[u], h[u], c[u], b)),
                            1 === u && this.addY(T(p[u], l[u], h[u], c[u], b)));
                    }
                }
            }),
            (k.prototype.addQuad = function (e, t, r, i, a, s) {
                var n = e + (2 / 3) * (r - e),
                    o = t + (2 / 3) * (i - t),
                    p = n + (1 / 3) * (a - e),
                    l = o + (1 / 3) * (s - t);
                this.addBezier(e, t, n, o, p, l, a, s);
            }),
            (O.prototype.moveTo = function (e, t) {
                this.commands.push({ type: "M", x: e, y: t });
            }),
            (O.prototype.lineTo = function (e, t) {
                this.commands.push({ type: "L", x: e, y: t });
            }),
            (O.prototype.curveTo = O.prototype.bezierCurveTo =
                function (e, t, r, i, a, s) {
                    this.commands.push({ type: "C", x1: e, y1: t, x2: r, y2: i, x: a, y: s });
                }),
            (O.prototype.quadTo = O.prototype.quadraticCurveTo =
                function (e, t, r, i) {
                    this.commands.push({ type: "Q", x1: e, y1: t, x: r, y: i });
                }),
            (O.prototype.close = O.prototype.closePath =
                function () {
                    this.commands.push({ type: "Z" });
                }),
            (O.prototype.extend = function (e) {
                if (e.commands) e = e.commands;
                else if (e instanceof k) {
                    var t = e;
                    return (
                        this.moveTo(t.x1, t.y1),
                        this.lineTo(t.x2, t.y1),
                        this.lineTo(t.x2, t.y2),
                        this.lineTo(t.x1, t.y2),
                        void this.close()
                    );
                }
                Array.prototype.push.apply(this.commands, e);
            }),
            (O.prototype.getBoundingBox = function () {
                for (var e = new k(), t = 0, r = 0, i = 0, a = 0, s = 0; s < this.commands.length; s++) {
                    var n = this.commands[s];
                    switch (n.type) {
                        case "M":
                            e.addPoint(n.x, n.y), (t = i = n.x), (r = a = n.y);
                            break;
                        case "L":
                            e.addPoint(n.x, n.y), (i = n.x), (a = n.y);
                            break;
                        case "Q":
                            e.addQuad(i, a, n.x1, n.y1, n.x, n.y), (i = n.x), (a = n.y);
                            break;
                        case "C":
                            e.addBezier(i, a, n.x1, n.y1, n.x2, n.y2, n.x, n.y), (i = n.x), (a = n.y);
                            break;
                        case "Z":
                            (i = t), (a = r);
                            break;
                        default:
                            throw new Error("Unexpected path command " + n.type);
                    }
                }
                return e.isEmpty() && e.addPoint(0, 0), e;
            }),
            (O.prototype.draw = function (e) {
                e.beginPath();
                for (var t = 0; t < this.commands.length; t += 1) {
                    var r = this.commands[t];
                    "M" === r.type
                        ? e.moveTo(r.x, r.y)
                        : "L" === r.type
                        ? e.lineTo(r.x, r.y)
                        : "C" === r.type
                        ? e.bezierCurveTo(r.x1, r.y1, r.x2, r.y2, r.x, r.y)
                        : "Q" === r.type
                        ? e.quadraticCurveTo(r.x1, r.y1, r.x, r.y)
                        : "Z" === r.type && e.closePath();
                }
                this.fill && ((e.fillStyle = this.fill), e.fill()),
                    this.stroke && ((e.strokeStyle = this.stroke), (e.lineWidth = this.strokeWidth), e.stroke());
            }),
            (O.prototype.toPathData = function (e) {
                function t(t) {
                    return Math.round(t) === t ? "" + Math.round(t) : t.toFixed(e);
                }
                function r() {
                    for (var e = arguments, r = "", i = 0; i < arguments.length; i += 1) {
                        var a = e[i];
                        a >= 0 && i > 0 && (r += " "), (r += t(a));
                    }
                    return r;
                }
                e = undefined !== e ? e : 2;
                for (var i = "", a = 0; a < this.commands.length; a += 1) {
                    var s = this.commands[a];
                    "M" === s.type
                        ? (i += "M" + r(s.x, s.y))
                        : "L" === s.type
                        ? (i += "L" + r(s.x, s.y))
                        : "C" === s.type
                        ? (i += "C" + r(s.x1, s.y1, s.x2, s.y2, s.x, s.y))
                        : "Q" === s.type
                        ? (i += "Q" + r(s.x1, s.y1, s.x, s.y))
                        : "Z" === s.type && (i += "Z");
                }
                return i;
            }),
            (O.prototype.toSVG = function (e) {
                var t = '<path d="';
                return (
                    (t += this.toPathData(e)),
                    (t += '"'),
                    this.fill &&
                        "black" !== this.fill &&
                        (null === this.fill ? (t += ' fill="none"') : (t += ' fill="' + this.fill + '"')),
                    this.stroke && (t += ' stroke="' + this.stroke + '" stroke-width="' + this.strokeWidth + '"'),
                    (t += "/>")
                );
            }),
            (O.prototype.toDOMElement = function (e) {
                var t = this.toPathData(e),
                    r = document.createElementNS("http://www.w3.org/2000/svg", "path");
                return r.setAttribute("d", t), r;
            });
        var C = { fail: Z, argument: R, assert: R },
            N = {},
            L = {},
            M = {};
        function U(e) {
            return function () {
                return e;
            };
        }
        (L.BYTE = function (e) {
            return C.argument(e >= 0 && e <= 255, "Byte value should be between 0 and 255."), [e];
        }),
            (M.BYTE = U(1)),
            (L.CHAR = function (e) {
                return [e.charCodeAt(0)];
            }),
            (M.CHAR = U(1)),
            (L.CHARARRAY = function (e) {
                for (var t = [], r = 0; r < e.length; r += 1) t[r] = e.charCodeAt(r);
                return t;
            }),
            (M.CHARARRAY = function (e) {
                return e.length;
            }),
            (L.USHORT = function (e) {
                return [(e >> 8) & 255, 255 & e];
            }),
            (M.USHORT = U(2)),
            (L.SHORT = function (e) {
                return e >= 32768 && (e = -(65536 - e)), [(e >> 8) & 255, 255 & e];
            }),
            (M.SHORT = U(2)),
            (L.UINT24 = function (e) {
                return [(e >> 16) & 255, (e >> 8) & 255, 255 & e];
            }),
            (M.UINT24 = U(3)),
            (L.ULONG = function (e) {
                return [(e >> 24) & 255, (e >> 16) & 255, (e >> 8) & 255, 255 & e];
            }),
            (M.ULONG = U(4)),
            (L.LONG = function (e) {
                return (
                    e >= 2147483648 && (e = -(4294967296 - e)),
                    [(e >> 24) & 255, (e >> 16) & 255, (e >> 8) & 255, 255 & e]
                );
            }),
            (M.LONG = U(4)),
            (L.FIXED = L.ULONG),
            (M.FIXED = M.ULONG),
            (L.FWORD = L.SHORT),
            (M.FWORD = M.SHORT),
            (L.UFWORD = L.USHORT),
            (M.UFWORD = M.USHORT),
            (L.LONGDATETIME = function (e) {
                return [0, 0, 0, 0, (e >> 24) & 255, (e >> 16) & 255, (e >> 8) & 255, 255 & e];
            }),
            (M.LONGDATETIME = U(8)),
            (L.TAG = function (e) {
                return (
                    C.argument(4 === e.length, "Tag should be exactly 4 ASCII characters."),
                    [e.charCodeAt(0), e.charCodeAt(1), e.charCodeAt(2), e.charCodeAt(3)]
                );
            }),
            (M.TAG = U(4)),
            (L.Card8 = L.BYTE),
            (M.Card8 = M.BYTE),
            (L.Card16 = L.USHORT),
            (M.Card16 = M.USHORT),
            (L.OffSize = L.BYTE),
            (M.OffSize = M.BYTE),
            (L.SID = L.USHORT),
            (M.SID = M.USHORT),
            (L.NUMBER = function (e) {
                return e >= -107 && e <= 107
                    ? [e + 139]
                    : e >= 108 && e <= 1131
                    ? [247 + ((e -= 108) >> 8), 255 & e]
                    : e >= -1131 && e <= -108
                    ? [251 + ((e = -e - 108) >> 8), 255 & e]
                    : e >= -32768 && e <= 32767
                    ? L.NUMBER16(e)
                    : L.NUMBER32(e);
            }),
            (M.NUMBER = function (e) {
                return L.NUMBER(e).length;
            }),
            (L.NUMBER16 = function (e) {
                return [28, (e >> 8) & 255, 255 & e];
            }),
            (M.NUMBER16 = U(3)),
            (L.NUMBER32 = function (e) {
                return [29, (e >> 24) & 255, (e >> 16) & 255, (e >> 8) & 255, 255 & e];
            }),
            (M.NUMBER32 = U(5)),
            (L.REAL = function (e) {
                var t = e.toString(),
                    r = /\.(\d*?)(?:9{5,20}|0{5,20})\d{0,2}(?:e(.+)|$)/.exec(t);
                if (r) {
                    var i = parseFloat("1e" + ((r[2] ? +r[2] : 0) + r[1].length));
                    t = (Math.round(e * i) / i).toString();
                }
                for (var a = "", s = 0, n = t.length; s < n; s += 1) {
                    var o = t[s];
                    a += "e" === o ? ("-" === t[++s] ? "c" : "b") : "." === o ? "a" : "-" === o ? "e" : o;
                }
                for (var p = [30], l = 0, h = (a += 1 & a.length ? "f" : "ff").length; l < h; l += 2)
                    p.push(parseInt(a.substr(l, 2), 16));
                return p;
            }),
            (M.REAL = function (e) {
                return L.REAL(e).length;
            }),
            (L.NAME = L.CHARARRAY),
            (M.NAME = M.CHARARRAY),
            (L.STRING = L.CHARARRAY),
            (M.STRING = M.CHARARRAY),
            (N.UTF8 = function (e, t, r) {
                for (var i = [], a = r, s = 0; s < a; s++, t += 1) i[s] = e.getUint8(t);
                return String.fromCharCode.apply(null, i);
            }),
            (N.UTF16 = function (e, t, r) {
                for (var i = [], a = r / 2, s = 0; s < a; s++, t += 2) i[s] = e.getUint16(t);
                return String.fromCharCode.apply(null, i);
            }),
            (L.UTF16 = function (e) {
                for (var t = [], r = 0; r < e.length; r += 1) {
                    var i = e.charCodeAt(r);
                    (t[t.length] = (i >> 8) & 255), (t[t.length] = 255 & i);
                }
                return t;
            }),
            (M.UTF16 = function (e) {
                return 2 * e.length;
            });
        var I = {
            "x-mac-croatian":
                "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®Š™´¨≠ŽØ∞±≤≥∆µ∂∑∏š∫ªºΩžø¿¡¬√ƒ≈Ć«Č… ÀÃÕŒœĐ—“”‘’÷◊©⁄€‹›Æ»–·‚„‰ÂćÁčÈÍÎÏÌÓÔđÒÚÛÙıˆ˜¯πË˚¸Êæˇ",
            "x-mac-cyrillic":
                "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°Ґ£§•¶І®©™Ђђ≠Ѓѓ∞±≤≥іµґЈЄєЇїЉљЊњјЅ¬√ƒ≈∆«»… ЋћЌќѕ–—“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю",
            "x-mac-gaelic":
                "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØḂ±≤≥ḃĊċḊḋḞḟĠġṀæøṁṖṗɼƒſṠ«»… ÀÃÕŒœ–—“”‘’ṡẛÿŸṪ€‹›Ŷŷṫ·Ỳỳ⁊ÂÊÁËÈÍÎÏÌÓÔ♣ÒÚÛÙıÝýŴŵẄẅẀẁẂẃ",
            "x-mac-greek":
                "Ä¹²É³ÖÜ΅àâä΄¨çéèêë£™îï•½‰ôö¦€ùûü†ΓΔΘΛΞΠß®©ΣΪ§≠°·Α±≤≥¥ΒΕΖΗΙΚΜΦΫΨΩάΝ¬ΟΡ≈Τ«»… ΥΧΆΈœ–―“”‘’÷ΉΊΌΎέήίόΏύαβψδεφγηιξκλμνοπώρστθωςχυζϊϋΐΰ­",
            "x-mac-icelandic":
                "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûüÝ°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€ÐðÞþý·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ",
            "x-mac-inuit":
                "ᐃᐄᐅᐆᐊᐋᐱᐲᐳᐴᐸᐹᑉᑎᑏᑐᑑᑕᑖᑦᑭᑮᑯᑰᑲᑳᒃᒋᒌᒍᒎᒐᒑ°ᒡᒥᒦ•¶ᒧ®©™ᒨᒪᒫᒻᓂᓃᓄᓅᓇᓈᓐᓯᓰᓱᓲᓴᓵᔅᓕᓖᓗᓘᓚᓛᓪᔨᔩᔪᔫᔭ… ᔮᔾᕕᕖᕗ–—“”‘’ᕘᕙᕚᕝᕆᕇᕈᕉᕋᕌᕐᕿᖀᖁᖂᖃᖄᖅᖏᖐᖑᖒᖓᖔᖕᙱᙲᙳᙴᙵᙶᖖᖠᖡᖢᖣᖤᖥᖦᕼŁł",
            "x-mac-ce":
                "ÄĀāÉĄÖÜáąČäčĆćéŹźĎíďĒēĖóėôöõúĚěü†°Ę£§•¶ß®©™ę¨≠ģĮįĪ≤≥īĶ∂∑łĻļĽľĹĺŅņŃ¬√ńŇ∆«»… ňŐÕőŌ–—“”‘’÷◊ōŔŕŘ‹›řŖŗŠ‚„šŚśÁŤťÍŽžŪÓÔūŮÚůŰűŲųÝýķŻŁżĢˇ",
            macintosh:
                "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›ﬁﬂ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ",
            "x-mac-romanian":
                "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ĂȘ∞±≤≥¥µ∂∑∏π∫ªºΩăș¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›Țț‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ",
            "x-mac-turkish":
                "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸĞğİıŞş‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙˆ˜¯˘˙˚¸˝˛ˇ",
        };
        N.MACSTRING = function (e, t, r, i) {
            var a = I[i];
            if (undefined !== a) {
                for (var s = "", n = 0; n < r; n++) {
                    var o = e.getUint8(t + n);
                    s += o <= 127 ? String.fromCharCode(o) : a[127 & o];
                }
                return s;
            }
        };
        var j,
            A = "function" == typeof WeakMap && new WeakMap();
        function D(e) {
            return e >= -128 && e <= 127;
        }
        function B(e, t, r) {
            for (var i = 0, a = e.length; t < a && i < 64 && 0 === e[t]; ) ++t, ++i;
            return r.push(128 | (i - 1)), t;
        }
        function _(e, t, r) {
            for (var i = 0, a = e.length, s = t; s < a && i < 64; ) {
                var n = e[s];
                if (!D(n)) break;
                if (0 === n && s + 1 < a && 0 === e[s + 1]) break;
                ++s, ++i;
            }
            r.push(i - 1);
            for (var o = t; o < s; ++o) r.push((e[o] + 256) & 255);
            return s;
        }
        function F(e, t, r) {
            for (var i = 0, a = e.length, s = t; s < a && i < 64; ) {
                var n = e[s];
                if (0 === n) break;
                if (D(n) && s + 1 < a && D(e[s + 1])) break;
                ++s, ++i;
            }
            r.push(64 | (i - 1));
            for (var o = t; o < s; ++o) {
                var p = e[o];
                r.push(((p + 65536) >> 8) & 255, (p + 256) & 255);
            }
            return s;
        }
        (L.MACSTRING = function (e, t) {
            var r = (function (e) {
                if (!j) for (var t in ((j = {}), I)) j[t] = new String(t);
                var r = j[e];
                if (undefined !== r) {
                    if (A) {
                        var i = A.get(r);
                        if (undefined !== i) return i;
                    }
                    var a = I[e];
                    if (undefined !== a) {
                        for (var s = {}, n = 0; n < a.length; n++) s[a.charCodeAt(n)] = n + 128;
                        return A && A.set(r, s), s;
                    }
                }
            })(t);
            if (undefined !== r) {
                for (var i = [], a = 0; a < e.length; a++) {
                    var s = e.charCodeAt(a);
                    if (s >= 128 && undefined === (s = r[s])) return;
                    i[a] = s;
                }
                return i;
            }
        }),
            (M.MACSTRING = function (e, t) {
                var r = L.MACSTRING(e, t);
                return undefined !== r ? r.length : 0;
            }),
            (L.VARDELTAS = function (e) {
                for (var t = 0, r = []; t < e.length; ) {
                    var i = e[t];
                    t = 0 === i ? B(e, t, r) : i >= -128 && i <= 127 ? _(e, t, r) : F(e, t, r);
                }
                return r;
            }),
            (L.INDEX = function (e) {
                for (var t = 1, r = [t], i = [], a = 0; a < e.length; a += 1) {
                    var s = L.OBJECT(e[a]);
                    Array.prototype.push.apply(i, s), (t += s.length), r.push(t);
                }
                if (0 === i.length) return [0, 0];
                for (
                    var n = [],
                        o = (1 + Math.floor(Math.log(t) / Math.log(2)) / 8) | 0,
                        p = [undefined, L.BYTE, L.USHORT, L.UINT24, L.ULONG][o],
                        l = 0;
                    l < r.length;
                    l += 1
                ) {
                    var h = p(r[l]);
                    Array.prototype.push.apply(n, h);
                }
                return Array.prototype.concat(L.Card16(e.length), L.OffSize(o), n, i);
            }),
            (M.INDEX = function (e) {
                return L.INDEX(e).length;
            }),
            (L.DICT = function (e) {
                for (var t = [], r = Object.keys(e), i = r.length, a = 0; a < i; a += 1) {
                    var s = parseInt(r[a], 0),
                        n = e[s];
                    t = (t = t.concat(L.OPERAND(n.value, n.type))).concat(L.OPERATOR(s));
                }
                return t;
            }),
            (M.DICT = function (e) {
                return L.DICT(e).length;
            }),
            (L.OPERATOR = function (e) {
                return e < 1200 ? [e] : [12, e - 1200];
            }),
            (L.OPERAND = function (e, t) {
                var r = [];
                if (Array.isArray(t))
                    for (var i = 0; i < t.length; i += 1)
                        C.argument(e.length === t.length, "Not enough arguments given for type" + t),
                            (r = r.concat(L.OPERAND(e[i], t[i])));
                else if ("SID" === t) r = r.concat(L.NUMBER(e));
                else if ("offset" === t) r = r.concat(L.NUMBER32(e));
                else if ("number" === t) r = r.concat(L.NUMBER(e));
                else {
                    if ("real" !== t) throw new Error("Unknown operand type " + t);
                    r = r.concat(L.REAL(e));
                }
                return r;
            }),
            (L.OP = L.BYTE),
            (M.OP = M.BYTE);
        var G = "function" == typeof WeakMap && new WeakMap();
        function V(e, t, r) {
            for (var i = 0; i < t.length; i += 1) {
                var a = t[i];
                this[a.name] = a.value;
            }
            if (((this.tableName = e), (this.fields = t), r))
                for (var s = Object.keys(r), n = 0; n < s.length; n += 1) {
                    var o = s[n],
                        p = r[o];
                    undefined !== this[o] && (this[o] = p);
                }
        }
        function H(e, t, r) {
            undefined === r && (r = t.length);
            var i = new Array(t.length + 1);
            i[0] = { name: e + "Count", type: "USHORT", value: r };
            for (var a = 0; a < t.length; a++) i[a + 1] = { name: e + a, type: "USHORT", value: t[a] };
            return i;
        }
        function z(e, t, r) {
            var i = t.length,
                a = new Array(i + 1);
            a[0] = { name: e + "Count", type: "USHORT", value: i };
            for (var s = 0; s < i; s++) a[s + 1] = { name: e + s, type: "TABLE", value: r(t[s], s) };
            return a;
        }
        function q(e, t, r) {
            var i = t.length,
                a = [];
            a[0] = { name: e + "Count", type: "USHORT", value: i };
            for (var s = 0; s < i; s++) a = a.concat(r(t[s], s));
            return a;
        }
        function W(e) {
            1 === e.format
                ? V.call(
                      this,
                      "coverageTable",
                      [{ name: "coverageFormat", type: "USHORT", value: 1 }].concat(H("glyph", e.glyphs))
                  )
                : C.assert(false, "Can't create coverage table format 2 yet.");
        }
        function X(e) {
            V.call(
                this,
                "scriptListTable",
                q("scriptRecord", e, function (e, t) {
                    var r = e.script,
                        i = r.defaultLangSys;
                    return (
                        C.assert(!!i, "Unable to write GSUB: script " + e.tag + " has no default language system."),
                        [
                            { name: "scriptTag" + t, type: "TAG", value: e.tag },
                            {
                                name: "script" + t,
                                type: "TABLE",
                                value: new V(
                                    "scriptTable",
                                    [
                                        {
                                            name: "defaultLangSys",
                                            type: "TABLE",
                                            value: new V(
                                                "defaultLangSys",
                                                [
                                                    { name: "lookupOrder", type: "USHORT", value: 0 },
                                                    {
                                                        name: "reqFeatureIndex",
                                                        type: "USHORT",
                                                        value: i.reqFeatureIndex,
                                                    },
                                                ].concat(H("featureIndex", i.featureIndexes))
                                            ),
                                        },
                                    ].concat(
                                        q("langSys", r.langSysRecords, function (e, t) {
                                            var r = e.langSys;
                                            return [
                                                { name: "langSysTag" + t, type: "TAG", value: e.tag },
                                                {
                                                    name: "langSys" + t,
                                                    type: "TABLE",
                                                    value: new V(
                                                        "langSys",
                                                        [
                                                            { name: "lookupOrder", type: "USHORT", value: 0 },
                                                            {
                                                                name: "reqFeatureIndex",
                                                                type: "USHORT",
                                                                value: r.reqFeatureIndex,
                                                            },
                                                        ].concat(H("featureIndex", r.featureIndexes))
                                                    ),
                                                },
                                            ];
                                        })
                                    )
                                ),
                            },
                        ]
                    );
                })
            );
        }
        function Y(e) {
            V.call(
                this,
                "featureListTable",
                q("featureRecord", e, function (e, t) {
                    var r = e.feature;
                    return [
                        { name: "featureTag" + t, type: "TAG", value: e.tag },
                        {
                            name: "feature" + t,
                            type: "TABLE",
                            value: new V(
                                "featureTable",
                                [{ name: "featureParams", type: "USHORT", value: r.featureParams }].concat(
                                    H("lookupListIndex", r.lookupListIndexes)
                                )
                            ),
                        },
                    ];
                })
            );
        }
        function J(e, t) {
            V.call(
                this,
                "lookupListTable",
                z("lookup", e, function (e) {
                    var r = t[e.lookupType];
                    return (
                        C.assert(!!r, "Unable to write GSUB lookup type " + e.lookupType + " tables."),
                        new V(
                            "lookupTable",
                            [
                                { name: "lookupType", type: "USHORT", value: e.lookupType },
                                { name: "lookupFlag", type: "USHORT", value: e.lookupFlag },
                            ].concat(z("subtable", e.subtables, r))
                        )
                    );
                })
            );
        }
        (L.CHARSTRING = function (e) {
            if (G) {
                var t = G.get(e);
                if (undefined !== t) return t;
            }
            for (var r = [], i = e.length, a = 0; a < i; a += 1) {
                var s = e[a];
                r = r.concat(L[s.type](s.value));
            }
            return G && G.set(e, r), r;
        }),
            (M.CHARSTRING = function (e) {
                return L.CHARSTRING(e).length;
            }),
            (L.OBJECT = function (e) {
                var t = L[e.type];
                return C.argument(undefined !== t, "No encoding function for type " + e.type), t(e.value);
            }),
            (M.OBJECT = function (e) {
                var t = M[e.type];
                return C.argument(undefined !== t, "No sizeOf function for type " + e.type), t(e.value);
            }),
            (L.TABLE = function (e) {
                for (var t = [], r = e.fields.length, i = [], a = [], s = 0; s < r; s += 1) {
                    var n = e.fields[s],
                        o = L[n.type];
                    C.argument(undefined !== o, "No encoding function for field type " + n.type + " (" + n.name + ")");
                    var p = e[n.name];
                    undefined === p && (p = n.value);
                    var l = o(p);
                    "TABLE" === n.type ? (a.push(t.length), (t = t.concat([0, 0])), i.push(l)) : (t = t.concat(l));
                }
                for (var h = 0; h < i.length; h += 1) {
                    var c = a[h],
                        u = t.length;
                    C.argument(u < 65536, "Table " + e.tableName + " too big."),
                        (t[c] = u >> 8),
                        (t[c + 1] = 255 & u),
                        (t = t.concat(i[h]));
                }
                return t;
            }),
            (M.TABLE = function (e) {
                for (var t = 0, r = e.fields.length, i = 0; i < r; i += 1) {
                    var a = e.fields[i],
                        s = M[a.type];
                    C.argument(undefined !== s, "No sizeOf function for field type " + a.type + " (" + a.name + ")");
                    var n = e[a.name];
                    undefined === n && (n = a.value), (t += s(n)), "TABLE" === a.type && (t += 2);
                }
                return t;
            }),
            (L.RECORD = L.TABLE),
            (M.RECORD = M.TABLE),
            (L.LITERAL = function (e) {
                return e;
            }),
            (M.LITERAL = function (e) {
                return e.length;
            }),
            (V.prototype.encode = function () {
                return L.TABLE(this);
            }),
            (V.prototype.sizeOf = function () {
                return M.TABLE(this);
            }),
            (W.prototype = Object.create(V.prototype)),
            (W.prototype.constructor = W),
            (X.prototype = Object.create(V.prototype)),
            (X.prototype.constructor = X),
            (Y.prototype = Object.create(V.prototype)),
            (Y.prototype.constructor = Y),
            (J.prototype = Object.create(V.prototype)),
            (J.prototype.constructor = J);
        var K = {
            Table: V,
            Record: V,
            Coverage: W,
            ScriptList: X,
            FeatureList: Y,
            LookupList: J,
            ushortList: H,
            tableList: z,
            recordList: q,
        };
        function Q(e, t) {
            return e.getUint8(t);
        }
        function $(e, t) {
            return e.getUint16(t, false);
        }
        function ee(e, t) {
            return e.getUint32(t, false);
        }
        function te(e, t) {
            return e.getInt16(t, false) + e.getUint16(t + 2, false) / 65535;
        }
        var re = { byte: 1, uShort: 2, short: 2, uLong: 4, fixed: 4, longDateTime: 8, tag: 4 };
        function ie(e, t) {
            (this.data = e), (this.offset = t), (this.relativeOffset = 0);
        }
        (ie.prototype.parseByte = function () {
            var e = this.data.getUint8(this.offset + this.relativeOffset);
            return (this.relativeOffset += 1), e;
        }),
            (ie.prototype.parseChar = function () {
                var e = this.data.getInt8(this.offset + this.relativeOffset);
                return (this.relativeOffset += 1), e;
            }),
            (ie.prototype.parseCard8 = ie.prototype.parseByte),
            (ie.prototype.parseUShort = function () {
                var e = this.data.getUint16(this.offset + this.relativeOffset);
                return (this.relativeOffset += 2), e;
            }),
            (ie.prototype.parseCard16 = ie.prototype.parseUShort),
            (ie.prototype.parseSID = ie.prototype.parseUShort),
            (ie.prototype.parseOffset16 = ie.prototype.parseUShort),
            (ie.prototype.parseShort = function () {
                var e = this.data.getInt16(this.offset + this.relativeOffset);
                return (this.relativeOffset += 2), e;
            }),
            (ie.prototype.parseF2Dot14 = function () {
                var e = this.data.getInt16(this.offset + this.relativeOffset) / 16384;
                return (this.relativeOffset += 2), e;
            }),
            (ie.prototype.parseULong = function () {
                var e = ee(this.data, this.offset + this.relativeOffset);
                return (this.relativeOffset += 4), e;
            }),
            (ie.prototype.parseOffset32 = ie.prototype.parseULong),
            (ie.prototype.parseFixed = function () {
                var e = te(this.data, this.offset + this.relativeOffset);
                return (this.relativeOffset += 4), e;
            }),
            (ie.prototype.parseString = function (e) {
                var t = this.data,
                    r = this.offset + this.relativeOffset,
                    i = "";
                this.relativeOffset += e;
                for (var a = 0; a < e; a++) i += String.fromCharCode(t.getUint8(r + a));
                return i;
            }),
            (ie.prototype.parseTag = function () {
                return this.parseString(4);
            }),
            (ie.prototype.parseLongDateTime = function () {
                var e = ee(this.data, this.offset + this.relativeOffset + 4);
                return (e -= 2082844800), (this.relativeOffset += 8), e;
            }),
            (ie.prototype.parseVersion = function (e) {
                var t = $(this.data, this.offset + this.relativeOffset),
                    r = $(this.data, this.offset + this.relativeOffset + 2);
                return (this.relativeOffset += 4), undefined === e && (e = 4096), t + r / e / 10;
            }),
            (ie.prototype.skip = function (e, t) {
                undefined === t && (t = 1), (this.relativeOffset += re[e] * t);
            }),
            (ie.prototype.parseULongList = function (e) {
                undefined === e && (e = this.parseULong());
                for (var t = new Array(e), r = this.data, i = this.offset + this.relativeOffset, a = 0; a < e; a++)
                    (t[a] = r.getUint32(i)), (i += 4);
                return (this.relativeOffset += 4 * e), t;
            }),
            (ie.prototype.parseOffset16List = ie.prototype.parseUShortList =
                function (e) {
                    undefined === e && (e = this.parseUShort());
                    for (var t = new Array(e), r = this.data, i = this.offset + this.relativeOffset, a = 0; a < e; a++)
                        (t[a] = r.getUint16(i)), (i += 2);
                    return (this.relativeOffset += 2 * e), t;
                }),
            (ie.prototype.parseShortList = function (e) {
                for (var t = new Array(e), r = this.data, i = this.offset + this.relativeOffset, a = 0; a < e; a++)
                    (t[a] = r.getInt16(i)), (i += 2);
                return (this.relativeOffset += 2 * e), t;
            }),
            (ie.prototype.parseByteList = function (e) {
                for (var t = new Array(e), r = this.data, i = this.offset + this.relativeOffset, a = 0; a < e; a++)
                    t[a] = r.getUint8(i++);
                return (this.relativeOffset += e), t;
            }),
            (ie.prototype.parseList = function (e, t) {
                t || ((t = e), (e = this.parseUShort()));
                for (var r = new Array(e), i = 0; i < e; i++) r[i] = t.call(this);
                return r;
            }),
            (ie.prototype.parseList32 = function (e, t) {
                t || ((t = e), (e = this.parseULong()));
                for (var r = new Array(e), i = 0; i < e; i++) r[i] = t.call(this);
                return r;
            }),
            (ie.prototype.parseRecordList = function (e, t) {
                t || ((t = e), (e = this.parseUShort()));
                for (var r = new Array(e), i = Object.keys(t), a = 0; a < e; a++) {
                    for (var s = {}, n = 0; n < i.length; n++) {
                        var o = i[n],
                            p = t[o];
                        s[o] = p.call(this);
                    }
                    r[a] = s;
                }
                return r;
            }),
            (ie.prototype.parseRecordList32 = function (e, t) {
                t || ((t = e), (e = this.parseULong()));
                for (var r = new Array(e), i = Object.keys(t), a = 0; a < e; a++) {
                    for (var s = {}, n = 0; n < i.length; n++) {
                        var o = i[n],
                            p = t[o];
                        s[o] = p.call(this);
                    }
                    r[a] = s;
                }
                return r;
            }),
            (ie.prototype.parseStruct = function (e) {
                if ("function" == typeof e) return e.call(this);
                for (var t = Object.keys(e), r = {}, i = 0; i < t.length; i++) {
                    var a = t[i],
                        s = e[a];
                    r[a] = s.call(this);
                }
                return r;
            }),
            (ie.prototype.parseValueRecord = function (e) {
                if ((undefined === e && (e = this.parseUShort()), 0 !== e)) {
                    var t = {};
                    return (
                        1 & e && (t.xPlacement = this.parseShort()),
                        2 & e && (t.yPlacement = this.parseShort()),
                        4 & e && (t.xAdvance = this.parseShort()),
                        8 & e && (t.yAdvance = this.parseShort()),
                        16 & e && ((t.xPlaDevice = undefined), this.parseShort()),
                        32 & e && ((t.yPlaDevice = undefined), this.parseShort()),
                        64 & e && ((t.xAdvDevice = undefined), this.parseShort()),
                        128 & e && ((t.yAdvDevice = undefined), this.parseShort()),
                        t
                    );
                }
            }),
            (ie.prototype.parseValueRecordList = function () {
                for (var e = this.parseUShort(), t = this.parseUShort(), r = new Array(t), i = 0; i < t; i++)
                    r[i] = this.parseValueRecord(e);
                return r;
            }),
            (ie.prototype.parsePointer = function (e) {
                var t = this.parseOffset16();
                if (t > 0) return new ie(this.data, this.offset + t).parseStruct(e);
            }),
            (ie.prototype.parsePointer32 = function (e) {
                var t = this.parseOffset32();
                if (t > 0) return new ie(this.data, this.offset + t).parseStruct(e);
            }),
            (ie.prototype.parseListOfLists = function (e) {
                for (
                    var t = this.parseOffset16List(), r = t.length, i = this.relativeOffset, a = new Array(r), s = 0;
                    s < r;
                    s++
                ) {
                    var n = t[s];
                    if (0 !== n)
                        if (((this.relativeOffset = n), e)) {
                            for (var o = this.parseOffset16List(), p = new Array(o.length), l = 0; l < o.length; l++)
                                (this.relativeOffset = n + o[l]), (p[l] = e.call(this));
                            a[s] = p;
                        } else a[s] = this.parseUShortList();
                    else a[s] = undefined;
                }
                return (this.relativeOffset = i), a;
            }),
            (ie.prototype.parseCoverage = function () {
                var e = this.offset + this.relativeOffset,
                    t = this.parseUShort(),
                    r = this.parseUShort();
                if (1 === t) return { format: 1, glyphs: this.parseUShortList(r) };
                if (2 === t) {
                    for (var i = new Array(r), a = 0; a < r; a++)
                        i[a] = { start: this.parseUShort(), end: this.parseUShort(), index: this.parseUShort() };
                    return { format: 2, ranges: i };
                }
                throw new Error("0x" + e.toString(16) + ": Coverage format must be 1 or 2.");
            }),
            (ie.prototype.parseClassDef = function () {
                var e = this.offset + this.relativeOffset,
                    t = this.parseUShort();
                if (1 === t) return { format: 1, startGlyph: this.parseUShort(), classes: this.parseUShortList() };
                if (2 === t)
                    return {
                        format: 2,
                        ranges: this.parseRecordList({ start: ie.uShort, end: ie.uShort, classId: ie.uShort }),
                    };
                throw new Error("0x" + e.toString(16) + ": ClassDef format must be 1 or 2.");
            }),
            (ie.list = function (e, t) {
                return function () {
                    return this.parseList(e, t);
                };
            }),
            (ie.list32 = function (e, t) {
                return function () {
                    return this.parseList32(e, t);
                };
            }),
            (ie.recordList = function (e, t) {
                return function () {
                    return this.parseRecordList(e, t);
                };
            }),
            (ie.recordList32 = function (e, t) {
                return function () {
                    return this.parseRecordList32(e, t);
                };
            }),
            (ie.pointer = function (e) {
                return function () {
                    return this.parsePointer(e);
                };
            }),
            (ie.pointer32 = function (e) {
                return function () {
                    return this.parsePointer32(e);
                };
            }),
            (ie.tag = ie.prototype.parseTag),
            (ie.byte = ie.prototype.parseByte),
            (ie.uShort = ie.offset16 = ie.prototype.parseUShort),
            (ie.uShortList = ie.prototype.parseUShortList),
            (ie.uLong = ie.offset32 = ie.prototype.parseULong),
            (ie.uLongList = ie.prototype.parseULongList),
            (ie.struct = ie.prototype.parseStruct),
            (ie.coverage = ie.prototype.parseCoverage),
            (ie.classDef = ie.prototype.parseClassDef);
        var ae = { reserved: ie.uShort, reqFeatureIndex: ie.uShort, featureIndexes: ie.uShortList };
        (ie.prototype.parseScriptList = function () {
            return (
                this.parsePointer(
                    ie.recordList({
                        tag: ie.tag,
                        script: ie.pointer({
                            defaultLangSys: ie.pointer(ae),
                            langSysRecords: ie.recordList({ tag: ie.tag, langSys: ie.pointer(ae) }),
                        }),
                    })
                ) || []
            );
        }),
            (ie.prototype.parseFeatureList = function () {
                return (
                    this.parsePointer(
                        ie.recordList({
                            tag: ie.tag,
                            feature: ie.pointer({ featureParams: ie.offset16, lookupListIndexes: ie.uShortList }),
                        })
                    ) || []
                );
            }),
            (ie.prototype.parseLookupList = function (e) {
                return (
                    this.parsePointer(
                        ie.list(
                            ie.pointer(function () {
                                var t = this.parseUShort();
                                C.argument(1 <= t && t <= 9, "GPOS/GSUB lookup type " + t + " unknown.");
                                var r = this.parseUShort(),
                                    i = 16 & r;
                                return {
                                    lookupType: t,
                                    lookupFlag: r,
                                    subtables: this.parseList(ie.pointer(e[t])),
                                    markFilteringSet: i ? this.parseUShort() : undefined,
                                };
                            })
                        )
                    ) || []
                );
            }),
            (ie.prototype.parseFeatureVariationsList = function () {
                return (
                    this.parsePointer32(function () {
                        var e = this.parseUShort(),
                            t = this.parseUShort();
                        return (
                            C.argument(1 === e && t < 1, "GPOS/GSUB feature variations table unknown."),
                            this.parseRecordList32({
                                conditionSetOffset: ie.offset32,
                                featureTableSubstitutionOffset: ie.offset32,
                            })
                        );
                    }) || []
                );
            });
        var se = {
            getByte: Q,
            getCard8: Q,
            getUShort: $,
            getCard16: $,
            getShort: function (e, t) {
                return e.getInt16(t, false);
            },
            getULong: ee,
            getFixed: te,
            getTag: function (e, t) {
                for (var r = "", i = t; i < t + 4; i += 1) r += String.fromCharCode(e.getInt8(i));
                return r;
            },
            getOffset: function (e, t, r) {
                for (var i = 0, a = 0; a < r; a += 1) (i <<= 8), (i += e.getUint8(t + a));
                return i;
            },
            getBytes: function (e, t, r) {
                for (var i = [], a = t; a < r; a += 1) i.push(e.getUint8(a));
                return i;
            },
            bytesToString: function (e) {
                for (var t = "", r = 0; r < e.length; r += 1) t += String.fromCharCode(e[r]);
                return t;
            },
            Parser: ie,
        };
        function ne(e, t, r) {
            e.segments.push({ end: t, start: t, delta: -(t - r), offset: 0, glyphIndex: r });
        }
        var oe = {
                parse: function (e, t) {
                    var r = {};
                    (r.version = se.getUShort(e, t)),
                        C.argument(0 === r.version, "cmap table version should be 0."),
                        (r.numTables = se.getUShort(e, t + 2));
                    for (var i = -1, a = r.numTables - 1; a >= 0; a -= 1) {
                        var s = se.getUShort(e, t + 4 + 8 * a),
                            n = se.getUShort(e, t + 4 + 8 * a + 2);
                        if (
                            (3 === s && (0 === n || 1 === n || 10 === n)) ||
                            (0 === s && (0 === n || 1 === n || 2 === n || 3 === n || 4 === n))
                        ) {
                            i = se.getULong(e, t + 4 + 8 * a + 4);
                            break;
                        }
                    }
                    if (-1 === i) throw new Error("No valid cmap sub-tables found.");
                    var o = new se.Parser(e, t + i);
                    if (((r.format = o.parseUShort()), 12 === r.format))
                        !(function (e, t) {
                            var r;
                            t.parseUShort(),
                                (e.length = t.parseULong()),
                                (e.language = t.parseULong()),
                                (e.groupCount = r = t.parseULong()),
                                (e.glyphIndexMap = {});
                            for (var i = 0; i < r; i += 1)
                                for (
                                    var a = t.parseULong(), s = t.parseULong(), n = t.parseULong(), o = a;
                                    o <= s;
                                    o += 1
                                )
                                    (e.glyphIndexMap[o] = n), n++;
                        })(r, o);
                    else {
                        if (4 !== r.format)
                            throw new Error(
                                "Only format 4 and 12 cmap tables are supported (found format " + r.format + ")."
                            );
                        !(function (e, t, r, i, a) {
                            var s;
                            (e.length = t.parseUShort()),
                                (e.language = t.parseUShort()),
                                (e.segCount = s = t.parseUShort() >> 1),
                                t.skip("uShort", 3),
                                (e.glyphIndexMap = {});
                            for (
                                var n = new se.Parser(r, i + a + 14),
                                    o = new se.Parser(r, i + a + 16 + 2 * s),
                                    p = new se.Parser(r, i + a + 16 + 4 * s),
                                    l = new se.Parser(r, i + a + 16 + 6 * s),
                                    h = i + a + 16 + 8 * s,
                                    c = 0;
                                c < s - 1;
                                c += 1
                            )
                                for (
                                    var u = undefined,
                                        d = n.parseUShort(),
                                        f = o.parseUShort(),
                                        m = p.parseShort(),
                                        y = l.parseUShort(),
                                        g = f;
                                    g <= d;
                                    g += 1
                                )
                                    0 !== y
                                        ? ((h = l.offset + l.relativeOffset - 2),
                                          (h += y),
                                          (h += 2 * (g - f)),
                                          0 !== (u = se.getUShort(r, h)) && (u = (u + m) & 65535))
                                        : (u = (g + m) & 65535),
                                        (e.glyphIndexMap[g] = u);
                        })(r, o, e, t, i);
                    }
                    return r;
                },
                make: function (e) {
                    var t,
                        r = true;
                    for (t = e.length - 1; t > 0; t -= 1)
                        if (e.get(t).unicode > 65535) {
                            console.log("Adding CMAP format 12 (needed!)"), (r = false);
                            break;
                        }
                    var i = [
                        { name: "version", type: "USHORT", value: 0 },
                        { name: "numTables", type: "USHORT", value: r ? 1 : 2 },
                        { name: "platformID", type: "USHORT", value: 3 },
                        { name: "encodingID", type: "USHORT", value: 1 },
                        { name: "offset", type: "ULONG", value: r ? 12 : 20 },
                    ];
                    r ||
                        (i = i.concat([
                            { name: "cmap12PlatformID", type: "USHORT", value: 3 },
                            { name: "cmap12EncodingID", type: "USHORT", value: 10 },
                            { name: "cmap12Offset", type: "ULONG", value: 0 },
                        ])),
                        (i = i.concat([
                            { name: "format", type: "USHORT", value: 4 },
                            { name: "cmap4Length", type: "USHORT", value: 0 },
                            { name: "language", type: "USHORT", value: 0 },
                            { name: "segCountX2", type: "USHORT", value: 0 },
                            { name: "searchRange", type: "USHORT", value: 0 },
                            { name: "entrySelector", type: "USHORT", value: 0 },
                            { name: "rangeShift", type: "USHORT", value: 0 },
                        ]));
                    var a = new K.Table("cmap", i);
                    for (a.segments = [], t = 0; t < e.length; t += 1) {
                        for (var s = e.get(t), n = 0; n < s.unicodes.length; n += 1) ne(a, s.unicodes[n], t);
                        a.segments = a.segments.sort(function (e, t) {
                            return e.start - t.start;
                        });
                    }
                    !(function (e) {
                        e.segments.push({ end: 65535, start: 65535, delta: 1, offset: 0 });
                    })(a);
                    var o = a.segments.length,
                        p = 0,
                        l = [],
                        h = [],
                        c = [],
                        u = [],
                        d = [],
                        f = [];
                    for (t = 0; t < o; t += 1) {
                        var m = a.segments[t];
                        m.end <= 65535 && m.start <= 65535
                            ? ((l = l.concat({ name: "end_" + t, type: "USHORT", value: m.end })),
                              (h = h.concat({ name: "start_" + t, type: "USHORT", value: m.start })),
                              (c = c.concat({ name: "idDelta_" + t, type: "SHORT", value: m.delta })),
                              (u = u.concat({ name: "idRangeOffset_" + t, type: "USHORT", value: m.offset })),
                              undefined !== m.glyphId &&
                                  (d = d.concat({ name: "glyph_" + t, type: "USHORT", value: m.glyphId })))
                            : (p += 1),
                            r ||
                                undefined === m.glyphIndex ||
                                (f = (f = (f = f.concat({
                                    name: "cmap12Start_" + t,
                                    type: "ULONG",
                                    value: m.start,
                                })).concat({ name: "cmap12End_" + t, type: "ULONG", value: m.end })).concat({
                                    name: "cmap12Glyph_" + t,
                                    type: "ULONG",
                                    value: m.glyphIndex,
                                }));
                    }
                    if (
                        ((a.segCountX2 = 2 * (o - p)),
                        (a.searchRange = 2 * Math.pow(2, Math.floor(Math.log(o - p) / Math.log(2)))),
                        (a.entrySelector = Math.log(a.searchRange / 2) / Math.log(2)),
                        (a.rangeShift = a.segCountX2 - a.searchRange),
                        (a.fields = a.fields.concat(l)),
                        a.fields.push({ name: "reservedPad", type: "USHORT", value: 0 }),
                        (a.fields = a.fields.concat(h)),
                        (a.fields = a.fields.concat(c)),
                        (a.fields = a.fields.concat(u)),
                        (a.fields = a.fields.concat(d)),
                        (a.cmap4Length =
                            14 + 2 * l.length + 2 + 2 * h.length + 2 * c.length + 2 * u.length + 2 * d.length),
                        !r)
                    ) {
                        var y = 16 + 4 * f.length;
                        (a.cmap12Offset = 20 + a.cmap4Length),
                            (a.fields = a.fields.concat([
                                { name: "cmap12Format", type: "USHORT", value: 12 },
                                { name: "cmap12Reserved", type: "USHORT", value: 0 },
                                { name: "cmap12Length", type: "ULONG", value: y },
                                { name: "cmap12Language", type: "ULONG", value: 0 },
                                { name: "cmap12nGroups", type: "ULONG", value: f.length / 3 },
                            ])),
                            (a.fields = a.fields.concat(f));
                    }
                    return a;
                },
            },
            pe = [
                ".notdef",
                "space",
                "exclam",
                "quotedbl",
                "numbersign",
                "dollar",
                "percent",
                "ampersand",
                "quoteright",
                "parenleft",
                "parenright",
                "asterisk",
                "plus",
                "comma",
                "hyphen",
                "period",
                "slash",
                "zero",
                "one",
                "two",
                "three",
                "four",
                "five",
                "six",
                "seven",
                "eight",
                "nine",
                "colon",
                "semicolon",
                "less",
                "equal",
                "greater",
                "question",
                "at",
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H",
                "I",
                "J",
                "K",
                "L",
                "M",
                "N",
                "O",
                "P",
                "Q",
                "R",
                "S",
                "T",
                "U",
                "V",
                "W",
                "X",
                "Y",
                "Z",
                "bracketleft",
                "backslash",
                "bracketright",
                "asciicircum",
                "underscore",
                "quoteleft",
                "a",
                "b",
                "c",
                "d",
                "e",
                "f",
                "g",
                "h",
                "i",
                "j",
                "k",
                "l",
                "m",
                "n",
                "o",
                "p",
                "q",
                "r",
                "s",
                "t",
                "u",
                "v",
                "w",
                "x",
                "y",
                "z",
                "braceleft",
                "bar",
                "braceright",
                "asciitilde",
                "exclamdown",
                "cent",
                "sterling",
                "fraction",
                "yen",
                "florin",
                "section",
                "currency",
                "quotesingle",
                "quotedblleft",
                "guillemotleft",
                "guilsinglleft",
                "guilsinglright",
                "fi",
                "fl",
                "endash",
                "dagger",
                "daggerdbl",
                "periodcentered",
                "paragraph",
                "bullet",
                "quotesinglbase",
                "quotedblbase",
                "quotedblright",
                "guillemotright",
                "ellipsis",
                "perthousand",
                "questiondown",
                "grave",
                "acute",
                "circumflex",
                "tilde",
                "macron",
                "breve",
                "dotaccent",
                "dieresis",
                "ring",
                "cedilla",
                "hungarumlaut",
                "ogonek",
                "caron",
                "emdash",
                "AE",
                "ordfeminine",
                "Lslash",
                "Oslash",
                "OE",
                "ordmasculine",
                "ae",
                "dotlessi",
                "lslash",
                "oslash",
                "oe",
                "germandbls",
                "onesuperior",
                "logicalnot",
                "mu",
                "trademark",
                "Eth",
                "onehalf",
                "plusminus",
                "Thorn",
                "onequarter",
                "divide",
                "brokenbar",
                "degree",
                "thorn",
                "threequarters",
                "twosuperior",
                "registered",
                "minus",
                "eth",
                "multiply",
                "threesuperior",
                "copyright",
                "Aacute",
                "Acircumflex",
                "Adieresis",
                "Agrave",
                "Aring",
                "Atilde",
                "Ccedilla",
                "Eacute",
                "Ecircumflex",
                "Edieresis",
                "Egrave",
                "Iacute",
                "Icircumflex",
                "Idieresis",
                "Igrave",
                "Ntilde",
                "Oacute",
                "Ocircumflex",
                "Odieresis",
                "Ograve",
                "Otilde",
                "Scaron",
                "Uacute",
                "Ucircumflex",
                "Udieresis",
                "Ugrave",
                "Yacute",
                "Ydieresis",
                "Zcaron",
                "aacute",
                "acircumflex",
                "adieresis",
                "agrave",
                "aring",
                "atilde",
                "ccedilla",
                "eacute",
                "ecircumflex",
                "edieresis",
                "egrave",
                "iacute",
                "icircumflex",
                "idieresis",
                "igrave",
                "ntilde",
                "oacute",
                "ocircumflex",
                "odieresis",
                "ograve",
                "otilde",
                "scaron",
                "uacute",
                "ucircumflex",
                "udieresis",
                "ugrave",
                "yacute",
                "ydieresis",
                "zcaron",
                "exclamsmall",
                "Hungarumlautsmall",
                "dollaroldstyle",
                "dollarsuperior",
                "ampersandsmall",
                "Acutesmall",
                "parenleftsuperior",
                "parenrightsuperior",
                "266 ff",
                "onedotenleader",
                "zerooldstyle",
                "oneoldstyle",
                "twooldstyle",
                "threeoldstyle",
                "fouroldstyle",
                "fiveoldstyle",
                "sixoldstyle",
                "sevenoldstyle",
                "eightoldstyle",
                "nineoldstyle",
                "commasuperior",
                "threequartersemdash",
                "periodsuperior",
                "questionsmall",
                "asuperior",
                "bsuperior",
                "centsuperior",
                "dsuperior",
                "esuperior",
                "isuperior",
                "lsuperior",
                "msuperior",
                "nsuperior",
                "osuperior",
                "rsuperior",
                "ssuperior",
                "tsuperior",
                "ff",
                "ffi",
                "ffl",
                "parenleftinferior",
                "parenrightinferior",
                "Circumflexsmall",
                "hyphensuperior",
                "Gravesmall",
                "Asmall",
                "Bsmall",
                "Csmall",
                "Dsmall",
                "Esmall",
                "Fsmall",
                "Gsmall",
                "Hsmall",
                "Ismall",
                "Jsmall",
                "Ksmall",
                "Lsmall",
                "Msmall",
                "Nsmall",
                "Osmall",
                "Psmall",
                "Qsmall",
                "Rsmall",
                "Ssmall",
                "Tsmall",
                "Usmall",
                "Vsmall",
                "Wsmall",
                "Xsmall",
                "Ysmall",
                "Zsmall",
                "colonmonetary",
                "onefitted",
                "rupiah",
                "Tildesmall",
                "exclamdownsmall",
                "centoldstyle",
                "Lslashsmall",
                "Scaronsmall",
                "Zcaronsmall",
                "Dieresissmall",
                "Brevesmall",
                "Caronsmall",
                "Dotaccentsmall",
                "Macronsmall",
                "figuredash",
                "hypheninferior",
                "Ogoneksmall",
                "Ringsmall",
                "Cedillasmall",
                "questiondownsmall",
                "oneeighth",
                "threeeighths",
                "fiveeighths",
                "seveneighths",
                "onethird",
                "twothirds",
                "zerosuperior",
                "foursuperior",
                "fivesuperior",
                "sixsuperior",
                "sevensuperior",
                "eightsuperior",
                "ninesuperior",
                "zeroinferior",
                "oneinferior",
                "twoinferior",
                "threeinferior",
                "fourinferior",
                "fiveinferior",
                "sixinferior",
                "seveninferior",
                "eightinferior",
                "nineinferior",
                "centinferior",
                "dollarinferior",
                "periodinferior",
                "commainferior",
                "Agravesmall",
                "Aacutesmall",
                "Acircumflexsmall",
                "Atildesmall",
                "Adieresissmall",
                "Aringsmall",
                "AEsmall",
                "Ccedillasmall",
                "Egravesmall",
                "Eacutesmall",
                "Ecircumflexsmall",
                "Edieresissmall",
                "Igravesmall",
                "Iacutesmall",
                "Icircumflexsmall",
                "Idieresissmall",
                "Ethsmall",
                "Ntildesmall",
                "Ogravesmall",
                "Oacutesmall",
                "Ocircumflexsmall",
                "Otildesmall",
                "Odieresissmall",
                "OEsmall",
                "Oslashsmall",
                "Ugravesmall",
                "Uacutesmall",
                "Ucircumflexsmall",
                "Udieresissmall",
                "Yacutesmall",
                "Thornsmall",
                "Ydieresissmall",
                "001.000",
                "001.001",
                "001.002",
                "001.003",
                "Black",
                "Bold",
                "Book",
                "Light",
                "Medium",
                "Regular",
                "Roman",
                "Semibold",
            ],
            le = [
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "space",
                "exclam",
                "quotedbl",
                "numbersign",
                "dollar",
                "percent",
                "ampersand",
                "quoteright",
                "parenleft",
                "parenright",
                "asterisk",
                "plus",
                "comma",
                "hyphen",
                "period",
                "slash",
                "zero",
                "one",
                "two",
                "three",
                "four",
                "five",
                "six",
                "seven",
                "eight",
                "nine",
                "colon",
                "semicolon",
                "less",
                "equal",
                "greater",
                "question",
                "at",
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H",
                "I",
                "J",
                "K",
                "L",
                "M",
                "N",
                "O",
                "P",
                "Q",
                "R",
                "S",
                "T",
                "U",
                "V",
                "W",
                "X",
                "Y",
                "Z",
                "bracketleft",
                "backslash",
                "bracketright",
                "asciicircum",
                "underscore",
                "quoteleft",
                "a",
                "b",
                "c",
                "d",
                "e",
                "f",
                "g",
                "h",
                "i",
                "j",
                "k",
                "l",
                "m",
                "n",
                "o",
                "p",
                "q",
                "r",
                "s",
                "t",
                "u",
                "v",
                "w",
                "x",
                "y",
                "z",
                "braceleft",
                "bar",
                "braceright",
                "asciitilde",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "exclamdown",
                "cent",
                "sterling",
                "fraction",
                "yen",
                "florin",
                "section",
                "currency",
                "quotesingle",
                "quotedblleft",
                "guillemotleft",
                "guilsinglleft",
                "guilsinglright",
                "fi",
                "fl",
                "",
                "endash",
                "dagger",
                "daggerdbl",
                "periodcentered",
                "",
                "paragraph",
                "bullet",
                "quotesinglbase",
                "quotedblbase",
                "quotedblright",
                "guillemotright",
                "ellipsis",
                "perthousand",
                "",
                "questiondown",
                "",
                "grave",
                "acute",
                "circumflex",
                "tilde",
                "macron",
                "breve",
                "dotaccent",
                "dieresis",
                "",
                "ring",
                "cedilla",
                "",
                "hungarumlaut",
                "ogonek",
                "caron",
                "emdash",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "AE",
                "",
                "ordfeminine",
                "",
                "",
                "",
                "",
                "Lslash",
                "Oslash",
                "OE",
                "ordmasculine",
                "",
                "",
                "",
                "",
                "",
                "ae",
                "",
                "",
                "",
                "dotlessi",
                "",
                "",
                "lslash",
                "oslash",
                "oe",
                "germandbls",
            ],
            he = [
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "space",
                "exclamsmall",
                "Hungarumlautsmall",
                "",
                "dollaroldstyle",
                "dollarsuperior",
                "ampersandsmall",
                "Acutesmall",
                "parenleftsuperior",
                "parenrightsuperior",
                "twodotenleader",
                "onedotenleader",
                "comma",
                "hyphen",
                "period",
                "fraction",
                "zerooldstyle",
                "oneoldstyle",
                "twooldstyle",
                "threeoldstyle",
                "fouroldstyle",
                "fiveoldstyle",
                "sixoldstyle",
                "sevenoldstyle",
                "eightoldstyle",
                "nineoldstyle",
                "colon",
                "semicolon",
                "commasuperior",
                "threequartersemdash",
                "periodsuperior",
                "questionsmall",
                "",
                "asuperior",
                "bsuperior",
                "centsuperior",
                "dsuperior",
                "esuperior",
                "",
                "",
                "isuperior",
                "",
                "",
                "lsuperior",
                "msuperior",
                "nsuperior",
                "osuperior",
                "",
                "",
                "rsuperior",
                "ssuperior",
                "tsuperior",
                "",
                "ff",
                "fi",
                "fl",
                "ffi",
                "ffl",
                "parenleftinferior",
                "",
                "parenrightinferior",
                "Circumflexsmall",
                "hyphensuperior",
                "Gravesmall",
                "Asmall",
                "Bsmall",
                "Csmall",
                "Dsmall",
                "Esmall",
                "Fsmall",
                "Gsmall",
                "Hsmall",
                "Ismall",
                "Jsmall",
                "Ksmall",
                "Lsmall",
                "Msmall",
                "Nsmall",
                "Osmall",
                "Psmall",
                "Qsmall",
                "Rsmall",
                "Ssmall",
                "Tsmall",
                "Usmall",
                "Vsmall",
                "Wsmall",
                "Xsmall",
                "Ysmall",
                "Zsmall",
                "colonmonetary",
                "onefitted",
                "rupiah",
                "Tildesmall",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "exclamdownsmall",
                "centoldstyle",
                "Lslashsmall",
                "",
                "",
                "Scaronsmall",
                "Zcaronsmall",
                "Dieresissmall",
                "Brevesmall",
                "Caronsmall",
                "",
                "Dotaccentsmall",
                "",
                "",
                "Macronsmall",
                "",
                "",
                "figuredash",
                "hypheninferior",
                "",
                "",
                "Ogoneksmall",
                "Ringsmall",
                "Cedillasmall",
                "",
                "",
                "",
                "onequarter",
                "onehalf",
                "threequarters",
                "questiondownsmall",
                "oneeighth",
                "threeeighths",
                "fiveeighths",
                "seveneighths",
                "onethird",
                "twothirds",
                "",
                "",
                "zerosuperior",
                "onesuperior",
                "twosuperior",
                "threesuperior",
                "foursuperior",
                "fivesuperior",
                "sixsuperior",
                "sevensuperior",
                "eightsuperior",
                "ninesuperior",
                "zeroinferior",
                "oneinferior",
                "twoinferior",
                "threeinferior",
                "fourinferior",
                "fiveinferior",
                "sixinferior",
                "seveninferior",
                "eightinferior",
                "nineinferior",
                "centinferior",
                "dollarinferior",
                "periodinferior",
                "commainferior",
                "Agravesmall",
                "Aacutesmall",
                "Acircumflexsmall",
                "Atildesmall",
                "Adieresissmall",
                "Aringsmall",
                "AEsmall",
                "Ccedillasmall",
                "Egravesmall",
                "Eacutesmall",
                "Ecircumflexsmall",
                "Edieresissmall",
                "Igravesmall",
                "Iacutesmall",
                "Icircumflexsmall",
                "Idieresissmall",
                "Ethsmall",
                "Ntildesmall",
                "Ogravesmall",
                "Oacutesmall",
                "Ocircumflexsmall",
                "Otildesmall",
                "Odieresissmall",
                "OEsmall",
                "Oslashsmall",
                "Ugravesmall",
                "Uacutesmall",
                "Ucircumflexsmall",
                "Udieresissmall",
                "Yacutesmall",
                "Thornsmall",
                "Ydieresissmall",
            ],
            ce = [
                ".notdef",
                ".null",
                "nonmarkingreturn",
                "space",
                "exclam",
                "quotedbl",
                "numbersign",
                "dollar",
                "percent",
                "ampersand",
                "quotesingle",
                "parenleft",
                "parenright",
                "asterisk",
                "plus",
                "comma",
                "hyphen",
                "period",
                "slash",
                "zero",
                "one",
                "two",
                "three",
                "four",
                "five",
                "six",
                "seven",
                "eight",
                "nine",
                "colon",
                "semicolon",
                "less",
                "equal",
                "greater",
                "question",
                "at",
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H",
                "I",
                "J",
                "K",
                "L",
                "M",
                "N",
                "O",
                "P",
                "Q",
                "R",
                "S",
                "T",
                "U",
                "V",
                "W",
                "X",
                "Y",
                "Z",
                "bracketleft",
                "backslash",
                "bracketright",
                "asciicircum",
                "underscore",
                "grave",
                "a",
                "b",
                "c",
                "d",
                "e",
                "f",
                "g",
                "h",
                "i",
                "j",
                "k",
                "l",
                "m",
                "n",
                "o",
                "p",
                "q",
                "r",
                "s",
                "t",
                "u",
                "v",
                "w",
                "x",
                "y",
                "z",
                "braceleft",
                "bar",
                "braceright",
                "asciitilde",
                "Adieresis",
                "Aring",
                "Ccedilla",
                "Eacute",
                "Ntilde",
                "Odieresis",
                "Udieresis",
                "aacute",
                "agrave",
                "acircumflex",
                "adieresis",
                "atilde",
                "aring",
                "ccedilla",
                "eacute",
                "egrave",
                "ecircumflex",
                "edieresis",
                "iacute",
                "igrave",
                "icircumflex",
                "idieresis",
                "ntilde",
                "oacute",
                "ograve",
                "ocircumflex",
                "odieresis",
                "otilde",
                "uacute",
                "ugrave",
                "ucircumflex",
                "udieresis",
                "dagger",
                "degree",
                "cent",
                "sterling",
                "section",
                "bullet",
                "paragraph",
                "germandbls",
                "registered",
                "copyright",
                "trademark",
                "acute",
                "dieresis",
                "notequal",
                "AE",
                "Oslash",
                "infinity",
                "plusminus",
                "lessequal",
                "greaterequal",
                "yen",
                "mu",
                "partialdiff",
                "summation",
                "product",
                "pi",
                "integral",
                "ordfeminine",
                "ordmasculine",
                "Omega",
                "ae",
                "oslash",
                "questiondown",
                "exclamdown",
                "logicalnot",
                "radical",
                "florin",
                "approxequal",
                "Delta",
                "guillemotleft",
                "guillemotright",
                "ellipsis",
                "nonbreakingspace",
                "Agrave",
                "Atilde",
                "Otilde",
                "OE",
                "oe",
                "endash",
                "emdash",
                "quotedblleft",
                "quotedblright",
                "quoteleft",
                "quoteright",
                "divide",
                "lozenge",
                "ydieresis",
                "Ydieresis",
                "fraction",
                "currency",
                "guilsinglleft",
                "guilsinglright",
                "fi",
                "fl",
                "daggerdbl",
                "periodcentered",
                "quotesinglbase",
                "quotedblbase",
                "perthousand",
                "Acircumflex",
                "Ecircumflex",
                "Aacute",
                "Edieresis",
                "Egrave",
                "Iacute",
                "Icircumflex",
                "Idieresis",
                "Igrave",
                "Oacute",
                "Ocircumflex",
                "apple",
                "Ograve",
                "Uacute",
                "Ucircumflex",
                "Ugrave",
                "dotlessi",
                "circumflex",
                "tilde",
                "macron",
                "breve",
                "dotaccent",
                "ring",
                "cedilla",
                "hungarumlaut",
                "ogonek",
                "caron",
                "Lslash",
                "lslash",
                "Scaron",
                "scaron",
                "Zcaron",
                "zcaron",
                "brokenbar",
                "Eth",
                "eth",
                "Yacute",
                "yacute",
                "Thorn",
                "thorn",
                "minus",
                "multiply",
                "onesuperior",
                "twosuperior",
                "threesuperior",
                "onehalf",
                "onequarter",
                "threequarters",
                "franc",
                "Gbreve",
                "gbreve",
                "Idotaccent",
                "Scedilla",
                "scedilla",
                "Cacute",
                "cacute",
                "Ccaron",
                "ccaron",
                "dcroat",
            ];
        function ue(e) {
            this.font = e;
        }
        function de(e) {
            this.cmap = e;
        }
        function fe(e, t) {
            (this.encoding = e), (this.charset = t);
        }
        function me(e) {
            switch (e.version) {
                case 1:
                    this.names = ce.slice();
                    break;
                case 2:
                    this.names = new Array(e.numberOfGlyphs);
                    for (var t = 0; t < e.numberOfGlyphs; t++)
                        e.glyphNameIndex[t] < ce.length
                            ? (this.names[t] = ce[e.glyphNameIndex[t]])
                            : (this.names[t] = e.names[e.glyphNameIndex[t] - ce.length]);
                    break;
                case 2.5:
                    this.names = new Array(e.numberOfGlyphs);
                    for (var r = 0; r < e.numberOfGlyphs; r++) this.names[r] = ce[r + e.glyphNameIndex[r]];
                    break;
                case 3:
                default:
                    this.names = [];
            }
        }
        (ue.prototype.charToGlyphIndex = function (e) {
            var t = e.codePointAt(0),
                r = this.font.glyphs;
            if (r)
                for (var i = 0; i < r.length; i += 1)
                    for (var a = r.get(i), s = 0; s < a.unicodes.length; s += 1) if (a.unicodes[s] === t) return i;
            return null;
        }),
            (de.prototype.charToGlyphIndex = function (e) {
                return this.cmap.glyphIndexMap[e.codePointAt(0)] || 0;
            }),
            (fe.prototype.charToGlyphIndex = function (e) {
                var t = e.codePointAt(0),
                    r = this.encoding[t];
                return this.charset.indexOf(r);
            }),
            (me.prototype.nameToGlyphIndex = function (e) {
                return this.names.indexOf(e);
            }),
            (me.prototype.glyphIndexToName = function (e) {
                return this.names[e];
            });
        var ye = {
            line: function (e, t, r, i, a) {
                e.beginPath(), e.moveTo(t, r), e.lineTo(i, a), e.stroke();
            },
        };
        function ge(e) {
            this.bindConstructorValues(e);
        }
        function ve(e, t, r) {
            Object.defineProperty(e, t, {
                get: function () {
                    return e.path, e[r];
                },
                set: function (t) {
                    e[r] = t;
                },
                enumerable: true,
                configurable: true,
            });
        }
        function be(e, t) {
            if (((this.font = e), (this.glyphs = {}), Array.isArray(t)))
                for (var r = 0; r < t.length; r++) this.glyphs[r] = t[r];
            this.length = (t && t.length) || 0;
        }
        (ge.prototype.bindConstructorValues = function (e) {
            var t, r;
            (this.index = e.index || 0),
                (this.name = e.name || null),
                (this.unicode = e.unicode || undefined),
                (this.unicodes = e.unicodes || undefined !== e.unicode ? [e.unicode] : []),
                e.xMin && (this.xMin = e.xMin),
                e.yMin && (this.yMin = e.yMin),
                e.xMax && (this.xMax = e.xMax),
                e.yMax && (this.yMax = e.yMax),
                e.advanceWidth && (this.advanceWidth = e.advanceWidth),
                Object.defineProperty(
                    this,
                    "path",
                    ((t = e.path),
                    (r = t || new O()),
                    {
                        configurable: true,
                        get: function () {
                            return "function" == typeof r && (r = r()), r;
                        },
                        set: function (e) {
                            r = e;
                        },
                    })
                );
        }),
            (ge.prototype.addUnicode = function (e) {
                0 === this.unicodes.length && (this.unicode = e), this.unicodes.push(e);
            }),
            (ge.prototype.getBoundingBox = function () {
                return this.path.getBoundingBox();
            }),
            (ge.prototype.getPath = function (e, t, r, i, a) {
                var s, n;
                (e = undefined !== e ? e : 0),
                    (t = undefined !== t ? t : 0),
                    (r = undefined !== r ? r : 72),
                    i || (i = {});
                var o = i.xScale,
                    p = i.yScale;
                if ((i.hinting && a && a.hinting && (n = this.path && a.hinting.exec(this, r)), n))
                    (s = a.hinting.getCommands(n)), (e = Math.round(e)), (t = Math.round(t)), (o = p = 1);
                else {
                    s = this.path.commands;
                    var l = (1 / this.path.unitsPerEm) * r;
                    undefined === o && (o = l), undefined === p && (p = l);
                }
                for (var h = new O(), c = 0; c < s.length; c += 1) {
                    var u = s[c];
                    "M" === u.type
                        ? h.moveTo(e + u.x * o, t + -u.y * p)
                        : "L" === u.type
                        ? h.lineTo(e + u.x * o, t + -u.y * p)
                        : "Q" === u.type
                        ? h.quadraticCurveTo(e + u.x1 * o, t + -u.y1 * p, e + u.x * o, t + -u.y * p)
                        : "C" === u.type
                        ? h.curveTo(e + u.x1 * o, t + -u.y1 * p, e + u.x2 * o, t + -u.y2 * p, e + u.x * o, t + -u.y * p)
                        : "Z" === u.type && h.closePath();
                }
                return h;
            }),
            (ge.prototype.getContours = function () {
                if (undefined === this.points) return [];
                for (var e = [], t = [], r = 0; r < this.points.length; r += 1) {
                    var i = this.points[r];
                    t.push(i), i.lastPointOfContour && (e.push(t), (t = []));
                }
                return C.argument(0 === t.length, "There are still points left in the current contour."), e;
            }),
            (ge.prototype.getMetrics = function () {
                for (var e = this.path.commands, t = [], r = [], i = 0; i < e.length; i += 1) {
                    var a = e[i];
                    "Z" !== a.type && (t.push(a.x), r.push(a.y)),
                        ("Q" !== a.type && "C" !== a.type) || (t.push(a.x1), r.push(a.y1)),
                        "C" === a.type && (t.push(a.x2), r.push(a.y2));
                }
                var s = {
                    xMin: Math.min.apply(null, t),
                    yMin: Math.min.apply(null, r),
                    xMax: Math.max.apply(null, t),
                    yMax: Math.max.apply(null, r),
                    leftSideBearing: this.leftSideBearing,
                };
                return (
                    isFinite(s.xMin) || (s.xMin = 0),
                    isFinite(s.xMax) || (s.xMax = this.advanceWidth),
                    isFinite(s.yMin) || (s.yMin = 0),
                    isFinite(s.yMax) || (s.yMax = 0),
                    (s.rightSideBearing = this.advanceWidth - s.leftSideBearing - (s.xMax - s.xMin)),
                    s
                );
            }),
            (ge.prototype.draw = function (e, t, r, i, a) {
                this.getPath(t, r, i, a).draw(e);
            }),
            (ge.prototype.drawPoints = function (e, t, r, i) {
                function a(t, r, i, a) {
                    var s = 2 * Math.PI;
                    e.beginPath();
                    for (var n = 0; n < t.length; n += 1)
                        e.moveTo(r + t[n].x * a, i + t[n].y * a), e.arc(r + t[n].x * a, i + t[n].y * a, 2, 0, s, false);
                    e.closePath(), e.fill();
                }
                (t = undefined !== t ? t : 0), (r = undefined !== r ? r : 0), (i = undefined !== i ? i : 24);
                for (
                    var s = (1 / this.path.unitsPerEm) * i, n = [], o = [], p = this.path, l = 0;
                    l < p.commands.length;
                    l += 1
                ) {
                    var h = p.commands[l];
                    undefined !== h.x && n.push({ x: h.x, y: -h.y }),
                        undefined !== h.x1 && o.push({ x: h.x1, y: -h.y1 }),
                        undefined !== h.x2 && o.push({ x: h.x2, y: -h.y2 });
                }
                (e.fillStyle = "blue"), a(n, t, r, s), (e.fillStyle = "red"), a(o, t, r, s);
            }),
            (ge.prototype.drawMetrics = function (e, t, r, i) {
                var a;
                (t = undefined !== t ? t : 0),
                    (r = undefined !== r ? r : 0),
                    (i = undefined !== i ? i : 24),
                    (a = (1 / this.path.unitsPerEm) * i),
                    (e.lineWidth = 1),
                    (e.strokeStyle = "black"),
                    ye.line(e, t, -1e4, t, 1e4),
                    ye.line(e, -1e4, r, 1e4, r);
                var s = this.xMin || 0,
                    n = this.yMin || 0,
                    o = this.xMax || 0,
                    p = this.yMax || 0,
                    l = this.advanceWidth || 0;
                (e.strokeStyle = "blue"),
                    ye.line(e, t + s * a, -1e4, t + s * a, 1e4),
                    ye.line(e, t + o * a, -1e4, t + o * a, 1e4),
                    ye.line(e, -1e4, r + -n * a, 1e4, r + -n * a),
                    ye.line(e, -1e4, r + -p * a, 1e4, r + -p * a),
                    (e.strokeStyle = "green"),
                    ye.line(e, t + l * a, -1e4, t + l * a, 1e4);
            }),
            (be.prototype.get = function (e) {
                return "function" == typeof this.glyphs[e] && (this.glyphs[e] = this.glyphs[e]()), this.glyphs[e];
            }),
            (be.prototype.push = function (e, t) {
                (this.glyphs[e] = t), this.length++;
            });
        var xe = {
            GlyphSet: be,
            glyphLoader: function (e, t) {
                return new ge({ index: t, font: e });
            },
            ttfGlyphLoader: function (e, t, r, i, a, s) {
                return function () {
                    var n = new ge({ index: t, font: e });
                    return (
                        (n.path = function () {
                            r(n, i, a);
                            var t = s(e.glyphs, n);
                            return (t.unitsPerEm = e.unitsPerEm), t;
                        }),
                        ve(n, "xMin", "_xMin"),
                        ve(n, "xMax", "_xMax"),
                        ve(n, "yMin", "_yMin"),
                        ve(n, "yMax", "_yMax"),
                        n
                    );
                };
            },
            cffGlyphLoader: function (e, t, r, i) {
                return function () {
                    var a = new ge({ index: t, font: e });
                    return (
                        (a.path = function () {
                            var t = r(e, a, i);
                            return (t.unitsPerEm = e.unitsPerEm), t;
                        }),
                        a
                    );
                };
            },
        };
        function Pe(e, t) {
            if (e === t) return true;
            if (Array.isArray(e) && Array.isArray(t)) {
                if (e.length !== t.length) return false;
                for (var r = 0; r < e.length; r += 1) if (!Pe(e[r], t[r])) return false;
                return true;
            }
            return false;
        }
        function we(e) {
            return e.length < 1240 ? 107 : e.length < 33900 ? 1131 : 32768;
        }
        function Se(e, t, r) {
            var i,
                a,
                s = [],
                n = [],
                o = se.getCard16(e, t);
            if (0 !== o) {
                var p = se.getByte(e, t + 2);
                i = t + (o + 1) * p + 2;
                for (var l = t + 3, h = 0; h < o + 1; h += 1) s.push(se.getOffset(e, l, p)), (l += p);
                a = i + s[o];
            } else a = t + 2;
            for (var c = 0; c < s.length - 1; c += 1) {
                var u = se.getBytes(e, i + s[c], i + s[c + 1]);
                r && (u = r(u)), n.push(u);
            }
            return { objects: n, startOffset: t, endOffset: a };
        }
        function Ee(e, t) {
            if (28 === t) return (e.parseByte() << 8) | e.parseByte();
            if (29 === t) return (e.parseByte() << 24) | (e.parseByte() << 16) | (e.parseByte() << 8) | e.parseByte();
            if (30 === t)
                return (function (e) {
                    for (
                        var t = "", r = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "E", "E-", null, "-"];
                        ;

                    ) {
                        var i = e.parseByte(),
                            a = i >> 4,
                            s = 15 & i;
                        if (15 === a) break;
                        if (((t += r[a]), 15 === s)) break;
                        t += r[s];
                    }
                    return parseFloat(t);
                })(e);
            if (t >= 32 && t <= 246) return t - 139;
            if (t >= 247 && t <= 250) return 256 * (t - 247) + e.parseByte() + 108;
            if (t >= 251 && t <= 254) return 256 * -(t - 251) - e.parseByte() - 108;
            throw new Error("Invalid b0 " + t);
        }
        function Te(e, t, r) {
            t = undefined !== t ? t : 0;
            var i = new se.Parser(e, t),
                a = [],
                s = [];
            for (r = undefined !== r ? r : e.length; i.relativeOffset < r; ) {
                var n = i.parseByte();
                n <= 21 ? (12 === n && (n = 1200 + i.parseByte()), a.push([n, s]), (s = [])) : s.push(Ee(i, n));
            }
            return (function (e) {
                for (var t = {}, r = 0; r < e.length; r += 1) {
                    var i = e[r][0],
                        a = e[r][1],
                        s = undefined;
                    if (((s = 1 === a.length ? a[0] : a), t.hasOwnProperty(i) && !isNaN(t[i])))
                        throw new Error("Object " + t + " already has key " + i);
                    t[i] = s;
                }
                return t;
            })(a);
        }
        function ke(e, t) {
            return (t = t <= 390 ? pe[t] : e[t - 391]);
        }
        function Oe(e, t, r) {
            for (var i, a = {}, s = 0; s < t.length; s += 1) {
                var n = t[s];
                if (Array.isArray(n.type)) {
                    var o = [];
                    o.length = n.type.length;
                    for (var p = 0; p < n.type.length; p++)
                        undefined === (i = undefined !== e[n.op] ? e[n.op][p] : undefined) &&
                            (i = undefined !== n.value && undefined !== n.value[p] ? n.value[p] : null),
                            "SID" === n.type[p] && (i = ke(r, i)),
                            (o[p] = i);
                    a[n.name] = o;
                } else
                    undefined === (i = e[n.op]) && (i = undefined !== n.value ? n.value : null),
                        "SID" === n.type && (i = ke(r, i)),
                        (a[n.name] = i);
            }
            return a;
        }
        var Ze = [
                { name: "version", op: 0, type: "SID" },
                { name: "notice", op: 1, type: "SID" },
                { name: "copyright", op: 1200, type: "SID" },
                { name: "fullName", op: 2, type: "SID" },
                { name: "familyName", op: 3, type: "SID" },
                { name: "weight", op: 4, type: "SID" },
                { name: "isFixedPitch", op: 1201, type: "number", value: 0 },
                { name: "italicAngle", op: 1202, type: "number", value: 0 },
                { name: "underlinePosition", op: 1203, type: "number", value: -100 },
                { name: "underlineThickness", op: 1204, type: "number", value: 50 },
                { name: "paintType", op: 1205, type: "number", value: 0 },
                { name: "charstringType", op: 1206, type: "number", value: 2 },
                {
                    name: "fontMatrix",
                    op: 1207,
                    type: ["real", "real", "real", "real", "real", "real"],
                    value: [0.001, 0, 0, 0.001, 0, 0],
                },
                { name: "uniqueId", op: 13, type: "number" },
                { name: "fontBBox", op: 5, type: ["number", "number", "number", "number"], value: [0, 0, 0, 0] },
                { name: "strokeWidth", op: 1208, type: "number", value: 0 },
                { name: "xuid", op: 14, type: [], value: null },
                { name: "charset", op: 15, type: "offset", value: 0 },
                { name: "encoding", op: 16, type: "offset", value: 0 },
                { name: "charStrings", op: 17, type: "offset", value: 0 },
                { name: "private", op: 18, type: ["number", "offset"], value: [0, 0] },
                { name: "ros", op: 1230, type: ["SID", "SID", "number"] },
                { name: "cidFontVersion", op: 1231, type: "number", value: 0 },
                { name: "cidFontRevision", op: 1232, type: "number", value: 0 },
                { name: "cidFontType", op: 1233, type: "number", value: 0 },
                { name: "cidCount", op: 1234, type: "number", value: 8720 },
                { name: "uidBase", op: 1235, type: "number" },
                { name: "fdArray", op: 1236, type: "offset" },
                { name: "fdSelect", op: 1237, type: "offset" },
                { name: "fontName", op: 1238, type: "SID" },
            ],
            Re = [
                { name: "subrs", op: 19, type: "offset", value: 0 },
                { name: "defaultWidthX", op: 20, type: "number", value: 0 },
                { name: "nominalWidthX", op: 21, type: "number", value: 0 },
            ];
        function Ce(e, t) {
            return Oe(Te(e, 0, e.byteLength), Ze, t);
        }
        function Ne(e, t, r, i) {
            return Oe(Te(e, t, r), Re, i);
        }
        function Le(e, t, r, i) {
            for (var a = [], s = 0; s < r.length; s += 1) {
                var n = Ce(new DataView(new Uint8Array(r[s]).buffer), i);
                (n._subrs = []), (n._subrsBias = 0);
                var o = n.private[0],
                    p = n.private[1];
                if (0 !== o && 0 !== p) {
                    var l = Ne(e, p + t, o, i);
                    if (((n._defaultWidthX = l.defaultWidthX), (n._nominalWidthX = l.nominalWidthX), 0 !== l.subrs)) {
                        var h = Se(e, p + l.subrs + t);
                        (n._subrs = h.objects), (n._subrsBias = we(n._subrs));
                    }
                    n._privateDict = l;
                }
                a.push(n);
            }
            return a;
        }
        function Me(e, t, r) {
            var i,
                a,
                s,
                n,
                o,
                p,
                l,
                h,
                c = new O(),
                u = [],
                d = 0,
                f = false,
                m = false,
                y = 0,
                g = 0;
            if (e.isCIDFont) {
                var v = e.tables.cff.topDict._fdSelect[t.index],
                    b = e.tables.cff.topDict._fdArray[v];
                (o = b._subrs), (p = b._subrsBias), (l = b._defaultWidthX), (h = b._nominalWidthX);
            } else (o = e.tables.cff.topDict._subrs), (p = e.tables.cff.topDict._subrsBias), (l = e.tables.cff.topDict._defaultWidthX), (h = e.tables.cff.topDict._nominalWidthX);
            var x = l;
            function P(e, t) {
                m && c.closePath(), c.moveTo(e, t), (m = true);
            }
            function w() {
                u.length % 2 != 0 && !f && (x = u.shift() + h), (d += u.length >> 1), (u.length = 0), (f = true);
            }
            return (
                (function r(l) {
                    for (var v, b, S, E, T, k, O, Z, R, C, N, L, M = 0; M < l.length; ) {
                        var U = l[M];
                        switch (((M += 1), U)) {
                            case 1:
                            case 3:
                                w();
                                break;
                            case 4:
                                u.length > 1 && !f && ((x = u.shift() + h), (f = true)), (g += u.pop()), P(y, g);
                                break;
                            case 5:
                                for (; u.length > 0; ) (y += u.shift()), (g += u.shift()), c.lineTo(y, g);
                                break;
                            case 6:
                                for (; u.length > 0 && ((y += u.shift()), c.lineTo(y, g), 0 !== u.length); )
                                    (g += u.shift()), c.lineTo(y, g);
                                break;
                            case 7:
                                for (; u.length > 0 && ((g += u.shift()), c.lineTo(y, g), 0 !== u.length); )
                                    (y += u.shift()), c.lineTo(y, g);
                                break;
                            case 8:
                                for (; u.length > 0; )
                                    (i = y + u.shift()),
                                        (a = g + u.shift()),
                                        (s = i + u.shift()),
                                        (n = a + u.shift()),
                                        (y = s + u.shift()),
                                        (g = n + u.shift()),
                                        c.curveTo(i, a, s, n, y, g);
                                break;
                            case 10:
                                (T = u.pop() + p), (k = o[T]) && r(k);
                                break;
                            case 11:
                                return;
                            case 12:
                                switch (((U = l[M]), (M += 1), U)) {
                                    case 35:
                                        (i = y + u.shift()),
                                            (a = g + u.shift()),
                                            (s = i + u.shift()),
                                            (n = a + u.shift()),
                                            (O = s + u.shift()),
                                            (Z = n + u.shift()),
                                            (R = O + u.shift()),
                                            (C = Z + u.shift()),
                                            (N = R + u.shift()),
                                            (L = C + u.shift()),
                                            (y = N + u.shift()),
                                            (g = L + u.shift()),
                                            u.shift(),
                                            c.curveTo(i, a, s, n, O, Z),
                                            c.curveTo(R, C, N, L, y, g);
                                        break;
                                    case 34:
                                        (i = y + u.shift()),
                                            (a = g),
                                            (s = i + u.shift()),
                                            (n = a + u.shift()),
                                            (O = s + u.shift()),
                                            (Z = n),
                                            (R = O + u.shift()),
                                            (C = n),
                                            (N = R + u.shift()),
                                            (L = g),
                                            (y = N + u.shift()),
                                            c.curveTo(i, a, s, n, O, Z),
                                            c.curveTo(R, C, N, L, y, g);
                                        break;
                                    case 36:
                                        (i = y + u.shift()),
                                            (a = g + u.shift()),
                                            (s = i + u.shift()),
                                            (n = a + u.shift()),
                                            (O = s + u.shift()),
                                            (Z = n),
                                            (R = O + u.shift()),
                                            (C = n),
                                            (N = R + u.shift()),
                                            (L = C + u.shift()),
                                            (y = N + u.shift()),
                                            c.curveTo(i, a, s, n, O, Z),
                                            c.curveTo(R, C, N, L, y, g);
                                        break;
                                    case 37:
                                        (i = y + u.shift()),
                                            (a = g + u.shift()),
                                            (s = i + u.shift()),
                                            (n = a + u.shift()),
                                            (O = s + u.shift()),
                                            (Z = n + u.shift()),
                                            (R = O + u.shift()),
                                            (C = Z + u.shift()),
                                            (N = R + u.shift()),
                                            (L = C + u.shift()),
                                            Math.abs(N - y) > Math.abs(L - g)
                                                ? (y = N + u.shift())
                                                : (g = L + u.shift()),
                                            c.curveTo(i, a, s, n, O, Z),
                                            c.curveTo(R, C, N, L, y, g);
                                        break;
                                    default:
                                        console.log("Glyph " + t.index + ": unknown operator 1200" + U), (u.length = 0);
                                }
                                break;
                            case 14:
                                u.length > 0 && !f && ((x = u.shift() + h), (f = true)),
                                    m && (c.closePath(), (m = false));
                                break;
                            case 18:
                                w();
                                break;
                            case 19:
                            case 20:
                                w(), (M += (d + 7) >> 3);
                                break;
                            case 21:
                                u.length > 2 && !f && ((x = u.shift() + h), (f = true)),
                                    (g += u.pop()),
                                    P((y += u.pop()), g);
                                break;
                            case 22:
                                u.length > 1 && !f && ((x = u.shift() + h), (f = true)), P((y += u.pop()), g);
                                break;
                            case 23:
                                w();
                                break;
                            case 24:
                                for (; u.length > 2; )
                                    (i = y + u.shift()),
                                        (a = g + u.shift()),
                                        (s = i + u.shift()),
                                        (n = a + u.shift()),
                                        (y = s + u.shift()),
                                        (g = n + u.shift()),
                                        c.curveTo(i, a, s, n, y, g);
                                (y += u.shift()), (g += u.shift()), c.lineTo(y, g);
                                break;
                            case 25:
                                for (; u.length > 6; ) (y += u.shift()), (g += u.shift()), c.lineTo(y, g);
                                (i = y + u.shift()),
                                    (a = g + u.shift()),
                                    (s = i + u.shift()),
                                    (n = a + u.shift()),
                                    (y = s + u.shift()),
                                    (g = n + u.shift()),
                                    c.curveTo(i, a, s, n, y, g);
                                break;
                            case 26:
                                for (u.length % 2 && (y += u.shift()); u.length > 0; )
                                    (i = y),
                                        (a = g + u.shift()),
                                        (s = i + u.shift()),
                                        (n = a + u.shift()),
                                        (y = s),
                                        (g = n + u.shift()),
                                        c.curveTo(i, a, s, n, y, g);
                                break;
                            case 27:
                                for (u.length % 2 && (g += u.shift()); u.length > 0; )
                                    (i = y + u.shift()),
                                        (a = g),
                                        (s = i + u.shift()),
                                        (n = a + u.shift()),
                                        (y = s + u.shift()),
                                        (g = n),
                                        c.curveTo(i, a, s, n, y, g);
                                break;
                            case 28:
                                (v = l[M]), (b = l[M + 1]), u.push(((v << 24) | (b << 16)) >> 16), (M += 2);
                                break;
                            case 29:
                                (T = u.pop() + e.gsubrsBias), (k = e.gsubrs[T]) && r(k);
                                break;
                            case 30:
                                for (
                                    ;
                                    u.length > 0 &&
                                    ((i = y),
                                    (a = g + u.shift()),
                                    (s = i + u.shift()),
                                    (n = a + u.shift()),
                                    (y = s + u.shift()),
                                    (g = n + (1 === u.length ? u.shift() : 0)),
                                    c.curveTo(i, a, s, n, y, g),
                                    0 !== u.length);

                                )
                                    (i = y + u.shift()),
                                        (a = g),
                                        (s = i + u.shift()),
                                        (n = a + u.shift()),
                                        (g = n + u.shift()),
                                        (y = s + (1 === u.length ? u.shift() : 0)),
                                        c.curveTo(i, a, s, n, y, g);
                                break;
                            case 31:
                                for (
                                    ;
                                    u.length > 0 &&
                                    ((i = y + u.shift()),
                                    (a = g),
                                    (s = i + u.shift()),
                                    (n = a + u.shift()),
                                    (g = n + u.shift()),
                                    (y = s + (1 === u.length ? u.shift() : 0)),
                                    c.curveTo(i, a, s, n, y, g),
                                    0 !== u.length);

                                )
                                    (i = y),
                                        (a = g + u.shift()),
                                        (s = i + u.shift()),
                                        (n = a + u.shift()),
                                        (y = s + u.shift()),
                                        (g = n + (1 === u.length ? u.shift() : 0)),
                                        c.curveTo(i, a, s, n, y, g);
                                break;
                            default:
                                U < 32
                                    ? console.log("Glyph " + t.index + ": unknown operator " + U)
                                    : U < 247
                                    ? u.push(U - 139)
                                    : U < 251
                                    ? ((v = l[M]), (M += 1), u.push(256 * (U - 247) + v + 108))
                                    : U < 255
                                    ? ((v = l[M]), (M += 1), u.push(256 * -(U - 251) - v - 108))
                                    : ((v = l[M]),
                                      (b = l[M + 1]),
                                      (S = l[M + 2]),
                                      (E = l[M + 3]),
                                      (M += 4),
                                      u.push(((v << 24) | (b << 16) | (S << 8) | E) / 65536));
                        }
                    }
                })(r),
                (t.advanceWidth = x),
                c
            );
        }
        function Ue(e, t) {
            var r,
                i = pe.indexOf(e);
            return (
                i >= 0 && (r = i),
                (i = t.indexOf(e)) >= 0 ? (r = i + pe.length) : ((r = pe.length + t.length), t.push(e)),
                r
            );
        }
        function Ie(e, t, r) {
            for (var i = {}, a = 0; a < e.length; a += 1) {
                var s = e[a],
                    n = t[s.name];
                undefined === n ||
                    Pe(n, s.value) ||
                    ("SID" === s.type && (n = Ue(n, r)), (i[s.op] = { name: s.name, type: s.type, value: n }));
            }
            return i;
        }
        function je(e, t) {
            var r = new K.Record("Top DICT", [{ name: "dict", type: "DICT", value: {} }]);
            return (r.dict = Ie(Ze, e, t)), r;
        }
        function Ae(e) {
            var t = new K.Record("Top DICT INDEX", [{ name: "topDicts", type: "INDEX", value: [] }]);
            return (t.topDicts = [{ name: "topDict_0", type: "TABLE", value: e }]), t;
        }
        function De(e) {
            var t = [],
                r = e.path;
            t.push({ name: "width", type: "NUMBER", value: e.advanceWidth });
            for (var i = 0, a = 0, s = 0; s < r.commands.length; s += 1) {
                var n = undefined,
                    o = undefined,
                    p = r.commands[s];
                if ("Q" === p.type) {
                    p = {
                        type: "C",
                        x: p.x,
                        y: p.y,
                        x1: (1 / 3) * i + (2 / 3) * p.x1,
                        y1: (1 / 3) * a + (2 / 3) * p.y1,
                        x2: (1 / 3) * p.x + (2 / 3) * p.x1,
                        y2: (1 / 3) * p.y + (2 / 3) * p.y1,
                    };
                }
                if ("M" === p.type)
                    (n = Math.round(p.x - i)),
                        (o = Math.round(p.y - a)),
                        t.push({ name: "dx", type: "NUMBER", value: n }),
                        t.push({ name: "dy", type: "NUMBER", value: o }),
                        t.push({ name: "rmoveto", type: "OP", value: 21 }),
                        (i = Math.round(p.x)),
                        (a = Math.round(p.y));
                else if ("L" === p.type)
                    (n = Math.round(p.x - i)),
                        (o = Math.round(p.y - a)),
                        t.push({ name: "dx", type: "NUMBER", value: n }),
                        t.push({ name: "dy", type: "NUMBER", value: o }),
                        t.push({ name: "rlineto", type: "OP", value: 5 }),
                        (i = Math.round(p.x)),
                        (a = Math.round(p.y));
                else if ("C" === p.type) {
                    var l = Math.round(p.x1 - i),
                        h = Math.round(p.y1 - a),
                        c = Math.round(p.x2 - p.x1),
                        u = Math.round(p.y2 - p.y1);
                    (n = Math.round(p.x - p.x2)),
                        (o = Math.round(p.y - p.y2)),
                        t.push({ name: "dx1", type: "NUMBER", value: l }),
                        t.push({ name: "dy1", type: "NUMBER", value: h }),
                        t.push({ name: "dx2", type: "NUMBER", value: c }),
                        t.push({ name: "dy2", type: "NUMBER", value: u }),
                        t.push({ name: "dx", type: "NUMBER", value: n }),
                        t.push({ name: "dy", type: "NUMBER", value: o }),
                        t.push({ name: "rrcurveto", type: "OP", value: 8 }),
                        (i = Math.round(p.x)),
                        (a = Math.round(p.y));
                }
            }
            return t.push({ name: "endchar", type: "OP", value: 14 }), t;
        }
        var Be = {
            parse: function (e, t, r) {
                r.tables.cff = {};
                var i = Se(
                        e,
                        Se(
                            e,
                            (function (e, t) {
                                var r = {};
                                return (
                                    (r.formatMajor = se.getCard8(e, t)),
                                    (r.formatMinor = se.getCard8(e, t + 1)),
                                    (r.size = se.getCard8(e, t + 2)),
                                    (r.offsetSize = se.getCard8(e, t + 3)),
                                    (r.startOffset = t),
                                    (r.endOffset = t + 4),
                                    r
                                );
                            })(e, t).endOffset,
                            se.bytesToString
                        ).endOffset
                    ),
                    a = Se(e, i.endOffset, se.bytesToString),
                    s = Se(e, a.endOffset);
                (r.gsubrs = s.objects), (r.gsubrsBias = we(r.gsubrs));
                var n = Le(e, t, i.objects, a.objects);
                if (1 !== n.length)
                    throw new Error(
                        "CFF table has too many fonts in 'FontSet' - count of fonts NameIndex.length = " + n.length
                    );
                var o = n[0];
                if (
                    ((r.tables.cff.topDict = o),
                    o._privateDict &&
                        ((r.defaultWidthX = o._privateDict.defaultWidthX),
                        (r.nominalWidthX = o._privateDict.nominalWidthX)),
                    undefined !== o.ros[0] && undefined !== o.ros[1] && (r.isCIDFont = true),
                    r.isCIDFont)
                ) {
                    var p = o.fdArray,
                        l = o.fdSelect;
                    if (0 === p || 0 === l)
                        throw new Error(
                            "Font is marked as a CID font, but FDArray and/or FDSelect information is missing"
                        );
                    var h = Le(e, t, Se(e, (p += t)).objects, a.objects);
                    (o._fdArray = h),
                        (l += t),
                        (o._fdSelect = (function (e, t, r, i) {
                            var a,
                                s = [],
                                n = new se.Parser(e, t),
                                o = n.parseCard8();
                            if (0 === o)
                                for (var p = 0; p < r; p++) {
                                    if ((a = n.parseCard8()) >= i)
                                        throw new Error(
                                            "CFF table CID Font FDSelect has bad FD index value " +
                                                a +
                                                " (FD count " +
                                                i +
                                                ")"
                                        );
                                    s.push(a);
                                }
                            else {
                                if (3 !== o)
                                    throw new Error("CFF Table CID Font FDSelect table has unsupported format " + o);
                                var l,
                                    h = n.parseCard16(),
                                    c = n.parseCard16();
                                if (0 !== c)
                                    throw new Error(
                                        "CFF Table CID Font FDSelect format 3 range has bad initial GID " + c
                                    );
                                for (var u = 0; u < h; u++) {
                                    if (((a = n.parseCard8()), (l = n.parseCard16()), a >= i))
                                        throw new Error(
                                            "CFF table CID Font FDSelect has bad FD index value " +
                                                a +
                                                " (FD count " +
                                                i +
                                                ")"
                                        );
                                    if (l > r)
                                        throw new Error("CFF Table CID Font FDSelect format 3 range has bad GID " + l);
                                    for (; c < l; c++) s.push(a);
                                    c = l;
                                }
                                if (l !== r)
                                    throw new Error(
                                        "CFF Table CID Font FDSelect format 3 range has bad final GID " + l
                                    );
                            }
                            return s;
                        })(e, l, r.numGlyphs, h.length));
                }
                var c = t + o.private[1],
                    u = Ne(e, c, o.private[0], a.objects);
                if (((r.defaultWidthX = u.defaultWidthX), (r.nominalWidthX = u.nominalWidthX), 0 !== u.subrs)) {
                    var d = Se(e, c + u.subrs);
                    (r.subrs = d.objects), (r.subrsBias = we(r.subrs));
                } else (r.subrs = []), (r.subrsBias = 0);
                var f = Se(e, t + o.charStrings);
                r.nGlyphs = f.objects.length;
                var m = (function (e, t, r, i) {
                    var a,
                        s,
                        n = new se.Parser(e, t);
                    r -= 1;
                    var o = [".notdef"],
                        p = n.parseCard8();
                    if (0 === p) for (var l = 0; l < r; l += 1) (a = n.parseSID()), o.push(ke(i, a));
                    else if (1 === p)
                        for (; o.length <= r; ) {
                            (a = n.parseSID()), (s = n.parseCard8());
                            for (var h = 0; h <= s; h += 1) o.push(ke(i, a)), (a += 1);
                        }
                    else {
                        if (2 !== p) throw new Error("Unknown charset format " + p);
                        for (; o.length <= r; ) {
                            (a = n.parseSID()), (s = n.parseCard16());
                            for (var c = 0; c <= s; c += 1) o.push(ke(i, a)), (a += 1);
                        }
                    }
                    return o;
                })(e, t + o.charset, r.nGlyphs, a.objects);
                0 === o.encoding
                    ? (r.cffEncoding = new fe(le, m))
                    : 1 === o.encoding
                    ? (r.cffEncoding = new fe(he, m))
                    : (r.cffEncoding = (function (e, t, r) {
                          var i,
                              a = {},
                              s = new se.Parser(e, t),
                              n = s.parseCard8();
                          if (0 === n) for (var o = s.parseCard8(), p = 0; p < o; p += 1) a[(i = s.parseCard8())] = p;
                          else {
                              if (1 !== n) throw new Error("Unknown encoding format " + n);
                              var l = s.parseCard8();
                              i = 1;
                              for (var h = 0; h < l; h += 1)
                                  for (var c = s.parseCard8(), u = s.parseCard8(), d = c; d <= c + u; d += 1)
                                      (a[d] = i), (i += 1);
                          }
                          return new fe(a, r);
                      })(e, t + o.encoding, m)),
                    (r.encoding = r.encoding || r.cffEncoding),
                    (r.glyphs = new xe.GlyphSet(r));
                for (var y = 0; y < r.nGlyphs; y += 1) {
                    var g = f.objects[y];
                    r.glyphs.push(y, xe.cffGlyphLoader(r, y, Me, g));
                }
            },
            make: function (e, t) {
                for (
                    var r,
                        i = new K.Table("CFF ", [
                            { name: "header", type: "RECORD" },
                            { name: "nameIndex", type: "RECORD" },
                            { name: "topDictIndex", type: "RECORD" },
                            { name: "stringIndex", type: "RECORD" },
                            { name: "globalSubrIndex", type: "RECORD" },
                            { name: "charsets", type: "RECORD" },
                            { name: "charStringsIndex", type: "RECORD" },
                            { name: "privateDict", type: "RECORD" },
                        ]),
                        a = 1 / t.unitsPerEm,
                        s = {
                            version: t.version,
                            fullName: t.fullName,
                            familyName: t.familyName,
                            weight: t.weightName,
                            fontBBox: t.fontBBox || [0, 0, 0, 0],
                            fontMatrix: [a, 0, 0, a, 0, 0],
                            charset: 999,
                            encoding: 0,
                            charStrings: 999,
                            private: [0, 999],
                        },
                        n = [],
                        o = 1;
                    o < e.length;
                    o += 1
                )
                    (r = e.get(o)), n.push(r.name);
                var p = [];
                (i.header = new K.Record("Header", [
                    { name: "major", type: "Card8", value: 1 },
                    { name: "minor", type: "Card8", value: 0 },
                    { name: "hdrSize", type: "Card8", value: 4 },
                    { name: "major", type: "Card8", value: 1 },
                ])),
                    (i.nameIndex = (function (e) {
                        var t = new K.Record("Name INDEX", [{ name: "names", type: "INDEX", value: [] }]);
                        t.names = [];
                        for (var r = 0; r < e.length; r += 1)
                            t.names.push({ name: "name_" + r, type: "NAME", value: e[r] });
                        return t;
                    })([t.postScriptName]));
                var l = je(s, p);
                (i.topDictIndex = Ae(l)),
                    (i.globalSubrIndex = new K.Record("Global Subr INDEX", [
                        { name: "subrs", type: "INDEX", value: [] },
                    ])),
                    (i.charsets = (function (e, t) {
                        for (
                            var r = new K.Record("Charsets", [{ name: "format", type: "Card8", value: 0 }]), i = 0;
                            i < e.length;
                            i += 1
                        ) {
                            var a = Ue(e[i], t);
                            r.fields.push({ name: "glyph_" + i, type: "SID", value: a });
                        }
                        return r;
                    })(n, p)),
                    (i.charStringsIndex = (function (e) {
                        for (
                            var t = new K.Record("CharStrings INDEX", [
                                    { name: "charStrings", type: "INDEX", value: [] },
                                ]),
                                r = 0;
                            r < e.length;
                            r += 1
                        ) {
                            var i = e.get(r),
                                a = De(i);
                            t.charStrings.push({ name: i.name, type: "CHARSTRING", value: a });
                        }
                        return t;
                    })(e)),
                    (i.privateDict = (function (e, t) {
                        var r = new K.Record("Private DICT", [{ name: "dict", type: "DICT", value: {} }]);
                        return (r.dict = Ie(Re, e, t)), r;
                    })({}, p)),
                    (i.stringIndex = (function (e) {
                        var t = new K.Record("String INDEX", [{ name: "strings", type: "INDEX", value: [] }]);
                        t.strings = [];
                        for (var r = 0; r < e.length; r += 1)
                            t.strings.push({ name: "string_" + r, type: "STRING", value: e[r] });
                        return t;
                    })(p));
                var h =
                    i.header.sizeOf() +
                    i.nameIndex.sizeOf() +
                    i.topDictIndex.sizeOf() +
                    i.stringIndex.sizeOf() +
                    i.globalSubrIndex.sizeOf();
                return (
                    (s.charset = h),
                    (s.encoding = 0),
                    (s.charStrings = s.charset + i.charsets.sizeOf()),
                    (s.private[1] = s.charStrings + i.charStringsIndex.sizeOf()),
                    (l = je(s, p)),
                    (i.topDictIndex = Ae(l)),
                    i
                );
            },
        };
        var _e = {
            parse: function (e, t) {
                var r = {},
                    i = new se.Parser(e, t);
                return (
                    (r.version = i.parseVersion()),
                    (r.fontRevision = Math.round(1e3 * i.parseFixed()) / 1e3),
                    (r.checkSumAdjustment = i.parseULong()),
                    (r.magicNumber = i.parseULong()),
                    C.argument(1594834165 === r.magicNumber, "Font header has wrong magic number."),
                    (r.flags = i.parseUShort()),
                    (r.unitsPerEm = i.parseUShort()),
                    (r.created = i.parseLongDateTime()),
                    (r.modified = i.parseLongDateTime()),
                    (r.xMin = i.parseShort()),
                    (r.yMin = i.parseShort()),
                    (r.xMax = i.parseShort()),
                    (r.yMax = i.parseShort()),
                    (r.macStyle = i.parseUShort()),
                    (r.lowestRecPPEM = i.parseUShort()),
                    (r.fontDirectionHint = i.parseShort()),
                    (r.indexToLocFormat = i.parseShort()),
                    (r.glyphDataFormat = i.parseShort()),
                    r
                );
            },
            make: function (e) {
                var t = Math.round(new Date().getTime() / 1e3) + 2082844800,
                    r = t;
                return (
                    e.createdTimestamp && (r = e.createdTimestamp + 2082844800),
                    new K.Table(
                        "head",
                        [
                            { name: "version", type: "FIXED", value: 65536 },
                            { name: "fontRevision", type: "FIXED", value: 65536 },
                            { name: "checkSumAdjustment", type: "ULONG", value: 0 },
                            { name: "magicNumber", type: "ULONG", value: 1594834165 },
                            { name: "flags", type: "USHORT", value: 0 },
                            { name: "unitsPerEm", type: "USHORT", value: 1e3 },
                            { name: "created", type: "LONGDATETIME", value: r },
                            { name: "modified", type: "LONGDATETIME", value: t },
                            { name: "xMin", type: "SHORT", value: 0 },
                            { name: "yMin", type: "SHORT", value: 0 },
                            { name: "xMax", type: "SHORT", value: 0 },
                            { name: "yMax", type: "SHORT", value: 0 },
                            { name: "macStyle", type: "USHORT", value: 0 },
                            { name: "lowestRecPPEM", type: "USHORT", value: 0 },
                            { name: "fontDirectionHint", type: "SHORT", value: 2 },
                            { name: "indexToLocFormat", type: "SHORT", value: 0 },
                            { name: "glyphDataFormat", type: "SHORT", value: 0 },
                        ],
                        e
                    )
                );
            },
        };
        var Fe = {
            parse: function (e, t) {
                var r = {},
                    i = new se.Parser(e, t);
                return (
                    (r.version = i.parseVersion()),
                    (r.ascender = i.parseShort()),
                    (r.descender = i.parseShort()),
                    (r.lineGap = i.parseShort()),
                    (r.advanceWidthMax = i.parseUShort()),
                    (r.minLeftSideBearing = i.parseShort()),
                    (r.minRightSideBearing = i.parseShort()),
                    (r.xMaxExtent = i.parseShort()),
                    (r.caretSlopeRise = i.parseShort()),
                    (r.caretSlopeRun = i.parseShort()),
                    (r.caretOffset = i.parseShort()),
                    (i.relativeOffset += 8),
                    (r.metricDataFormat = i.parseShort()),
                    (r.numberOfHMetrics = i.parseUShort()),
                    r
                );
            },
            make: function (e) {
                return new K.Table(
                    "hhea",
                    [
                        { name: "version", type: "FIXED", value: 65536 },
                        { name: "ascender", type: "FWORD", value: 0 },
                        { name: "descender", type: "FWORD", value: 0 },
                        { name: "lineGap", type: "FWORD", value: 0 },
                        { name: "advanceWidthMax", type: "UFWORD", value: 0 },
                        { name: "minLeftSideBearing", type: "FWORD", value: 0 },
                        { name: "minRightSideBearing", type: "FWORD", value: 0 },
                        { name: "xMaxExtent", type: "FWORD", value: 0 },
                        { name: "caretSlopeRise", type: "SHORT", value: 1 },
                        { name: "caretSlopeRun", type: "SHORT", value: 0 },
                        { name: "caretOffset", type: "SHORT", value: 0 },
                        { name: "reserved1", type: "SHORT", value: 0 },
                        { name: "reserved2", type: "SHORT", value: 0 },
                        { name: "reserved3", type: "SHORT", value: 0 },
                        { name: "reserved4", type: "SHORT", value: 0 },
                        { name: "metricDataFormat", type: "SHORT", value: 0 },
                        { name: "numberOfHMetrics", type: "USHORT", value: 0 },
                    ],
                    e
                );
            },
        };
        var Ge = {
            parse: function (e, t, r, i, a) {
                for (var s, n, o = new se.Parser(e, t), p = 0; p < i; p += 1) {
                    p < r && ((s = o.parseUShort()), (n = o.parseShort()));
                    var l = a.get(p);
                    (l.advanceWidth = s), (l.leftSideBearing = n);
                }
            },
            make: function (e) {
                for (var t = new K.Table("hmtx", []), r = 0; r < e.length; r += 1) {
                    var i = e.get(r),
                        a = i.advanceWidth || 0,
                        s = i.leftSideBearing || 0;
                    t.fields.push({ name: "advanceWidth_" + r, type: "USHORT", value: a }),
                        t.fields.push({ name: "leftSideBearing_" + r, type: "SHORT", value: s });
                }
                return t;
            },
        };
        var Ve = {
            make: function (e) {
                for (
                    var t = new K.Table("ltag", [
                            { name: "version", type: "ULONG", value: 1 },
                            { name: "flags", type: "ULONG", value: 0 },
                            { name: "numTags", type: "ULONG", value: e.length },
                        ]),
                        r = "",
                        i = 12 + 4 * e.length,
                        a = 0;
                    a < e.length;
                    ++a
                ) {
                    var s = r.indexOf(e[a]);
                    s < 0 && ((s = r.length), (r += e[a])),
                        t.fields.push({ name: "offset " + a, type: "USHORT", value: i + s }),
                        t.fields.push({ name: "length " + a, type: "USHORT", value: e[a].length });
                }
                return t.fields.push({ name: "stringPool", type: "CHARARRAY", value: r }), t;
            },
            parse: function (e, t) {
                var r = new se.Parser(e, t),
                    i = r.parseULong();
                C.argument(1 === i, "Unsupported ltag table version."), r.skip("uLong", 1);
                for (var a = r.parseULong(), s = [], n = 0; n < a; n++) {
                    for (var o = "", p = t + r.parseUShort(), l = r.parseUShort(), h = p; h < p + l; ++h)
                        o += String.fromCharCode(e.getInt8(h));
                    s.push(o);
                }
                return s;
            },
        };
        var He = {
                parse: function (e, t) {
                    var r = {},
                        i = new se.Parser(e, t);
                    return (
                        (r.version = i.parseVersion()),
                        (r.numGlyphs = i.parseUShort()),
                        1 === r.version &&
                            ((r.maxPoints = i.parseUShort()),
                            (r.maxContours = i.parseUShort()),
                            (r.maxCompositePoints = i.parseUShort()),
                            (r.maxCompositeContours = i.parseUShort()),
                            (r.maxZones = i.parseUShort()),
                            (r.maxTwilightPoints = i.parseUShort()),
                            (r.maxStorage = i.parseUShort()),
                            (r.maxFunctionDefs = i.parseUShort()),
                            (r.maxInstructionDefs = i.parseUShort()),
                            (r.maxStackElements = i.parseUShort()),
                            (r.maxSizeOfInstructions = i.parseUShort()),
                            (r.maxComponentElements = i.parseUShort()),
                            (r.maxComponentDepth = i.parseUShort())),
                        r
                    );
                },
                make: function (e) {
                    return new K.Table("maxp", [
                        { name: "version", type: "FIXED", value: 20480 },
                        { name: "numGlyphs", type: "USHORT", value: e },
                    ]);
                },
            },
            ze = [
                "copyright",
                "fontFamily",
                "fontSubfamily",
                "uniqueID",
                "fullName",
                "version",
                "postScriptName",
                "trademark",
                "manufacturer",
                "designer",
                "description",
                "manufacturerURL",
                "designerURL",
                "license",
                "licenseURL",
                "reserved",
                "preferredFamily",
                "preferredSubfamily",
                "compatibleFullName",
                "sampleText",
                "postScriptFindFontName",
                "wwsFamily",
                "wwsSubfamily",
            ],
            qe = {
                0: "en",
                1: "fr",
                2: "de",
                3: "it",
                4: "nl",
                5: "sv",
                6: "es",
                7: "da",
                8: "pt",
                9: "no",
                10: "he",
                11: "ja",
                12: "ar",
                13: "fi",
                14: "el",
                15: "is",
                16: "mt",
                17: "tr",
                18: "hr",
                19: "zh-Hant",
                20: "ur",
                21: "hi",
                22: "th",
                23: "ko",
                24: "lt",
                25: "pl",
                26: "hu",
                27: "es",
                28: "lv",
                29: "se",
                30: "fo",
                31: "fa",
                32: "ru",
                33: "zh",
                34: "nl-BE",
                35: "ga",
                36: "sq",
                37: "ro",
                38: "cz",
                39: "sk",
                40: "si",
                41: "yi",
                42: "sr",
                43: "mk",
                44: "bg",
                45: "uk",
                46: "be",
                47: "uz",
                48: "kk",
                49: "az-Cyrl",
                50: "az-Arab",
                51: "hy",
                52: "ka",
                53: "mo",
                54: "ky",
                55: "tg",
                56: "tk",
                57: "mn-CN",
                58: "mn",
                59: "ps",
                60: "ks",
                61: "ku",
                62: "sd",
                63: "bo",
                64: "ne",
                65: "sa",
                66: "mr",
                67: "bn",
                68: "as",
                69: "gu",
                70: "pa",
                71: "or",
                72: "ml",
                73: "kn",
                74: "ta",
                75: "te",
                76: "si",
                77: "my",
                78: "km",
                79: "lo",
                80: "vi",
                81: "id",
                82: "tl",
                83: "ms",
                84: "ms-Arab",
                85: "am",
                86: "ti",
                87: "om",
                88: "so",
                89: "sw",
                90: "rw",
                91: "rn",
                92: "ny",
                93: "mg",
                94: "eo",
                128: "cy",
                129: "eu",
                130: "ca",
                131: "la",
                132: "qu",
                133: "gn",
                134: "ay",
                135: "tt",
                136: "ug",
                137: "dz",
                138: "jv",
                139: "su",
                140: "gl",
                141: "af",
                142: "br",
                143: "iu",
                144: "gd",
                145: "gv",
                146: "ga",
                147: "to",
                148: "el-polyton",
                149: "kl",
                150: "az",
                151: "nn",
            },
            We = {
                0: 0,
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
                7: 0,
                8: 0,
                9: 0,
                10: 5,
                11: 1,
                12: 4,
                13: 0,
                14: 6,
                15: 0,
                16: 0,
                17: 0,
                18: 0,
                19: 2,
                20: 4,
                21: 9,
                22: 21,
                23: 3,
                24: 29,
                25: 29,
                26: 29,
                27: 29,
                28: 29,
                29: 0,
                30: 0,
                31: 4,
                32: 7,
                33: 25,
                34: 0,
                35: 0,
                36: 0,
                37: 0,
                38: 29,
                39: 29,
                40: 0,
                41: 5,
                42: 7,
                43: 7,
                44: 7,
                45: 7,
                46: 7,
                47: 7,
                48: 7,
                49: 7,
                50: 4,
                51: 24,
                52: 23,
                53: 7,
                54: 7,
                55: 7,
                56: 7,
                57: 27,
                58: 7,
                59: 4,
                60: 4,
                61: 4,
                62: 4,
                63: 26,
                64: 9,
                65: 9,
                66: 9,
                67: 13,
                68: 13,
                69: 11,
                70: 10,
                71: 12,
                72: 17,
                73: 16,
                74: 14,
                75: 15,
                76: 18,
                77: 19,
                78: 20,
                79: 22,
                80: 30,
                81: 0,
                82: 0,
                83: 0,
                84: 4,
                85: 28,
                86: 28,
                87: 28,
                88: 0,
                89: 0,
                90: 0,
                91: 0,
                92: 0,
                93: 0,
                94: 0,
                128: 0,
                129: 0,
                130: 0,
                131: 0,
                132: 0,
                133: 0,
                134: 0,
                135: 7,
                136: 4,
                137: 26,
                138: 0,
                139: 0,
                140: 0,
                141: 0,
                142: 0,
                143: 28,
                144: 0,
                145: 0,
                146: 0,
                147: 0,
                148: 6,
                149: 0,
                150: 0,
                151: 0,
            },
            Xe = {
                1078: "af",
                1052: "sq",
                1156: "gsw",
                1118: "am",
                5121: "ar-DZ",
                15361: "ar-BH",
                3073: "ar",
                2049: "ar-IQ",
                11265: "ar-JO",
                13313: "ar-KW",
                12289: "ar-LB",
                4097: "ar-LY",
                6145: "ary",
                8193: "ar-OM",
                16385: "ar-QA",
                1025: "ar-SA",
                10241: "ar-SY",
                7169: "aeb",
                14337: "ar-AE",
                9217: "ar-YE",
                1067: "hy",
                1101: "as",
                2092: "az-Cyrl",
                1068: "az",
                1133: "ba",
                1069: "eu",
                1059: "be",
                2117: "bn",
                1093: "bn-IN",
                8218: "bs-Cyrl",
                5146: "bs",
                1150: "br",
                1026: "bg",
                1027: "ca",
                3076: "zh-HK",
                5124: "zh-MO",
                2052: "zh",
                4100: "zh-SG",
                1028: "zh-TW",
                1155: "co",
                1050: "hr",
                4122: "hr-BA",
                1029: "cs",
                1030: "da",
                1164: "prs",
                1125: "dv",
                2067: "nl-BE",
                1043: "nl",
                3081: "en-AU",
                10249: "en-BZ",
                4105: "en-CA",
                9225: "en-029",
                16393: "en-IN",
                6153: "en-IE",
                8201: "en-JM",
                17417: "en-MY",
                5129: "en-NZ",
                13321: "en-PH",
                18441: "en-SG",
                7177: "en-ZA",
                11273: "en-TT",
                2057: "en-GB",
                1033: "en",
                12297: "en-ZW",
                1061: "et",
                1080: "fo",
                1124: "fil",
                1035: "fi",
                2060: "fr-BE",
                3084: "fr-CA",
                1036: "fr",
                5132: "fr-LU",
                6156: "fr-MC",
                4108: "fr-CH",
                1122: "fy",
                1110: "gl",
                1079: "ka",
                3079: "de-AT",
                1031: "de",
                5127: "de-LI",
                4103: "de-LU",
                2055: "de-CH",
                1032: "el",
                1135: "kl",
                1095: "gu",
                1128: "ha",
                1037: "he",
                1081: "hi",
                1038: "hu",
                1039: "is",
                1136: "ig",
                1057: "id",
                1117: "iu",
                2141: "iu-Latn",
                2108: "ga",
                1076: "xh",
                1077: "zu",
                1040: "it",
                2064: "it-CH",
                1041: "ja",
                1099: "kn",
                1087: "kk",
                1107: "km",
                1158: "quc",
                1159: "rw",
                1089: "sw",
                1111: "kok",
                1042: "ko",
                1088: "ky",
                1108: "lo",
                1062: "lv",
                1063: "lt",
                2094: "dsb",
                1134: "lb",
                1071: "mk",
                2110: "ms-BN",
                1086: "ms",
                1100: "ml",
                1082: "mt",
                1153: "mi",
                1146: "arn",
                1102: "mr",
                1148: "moh",
                1104: "mn",
                2128: "mn-CN",
                1121: "ne",
                1044: "nb",
                2068: "nn",
                1154: "oc",
                1096: "or",
                1123: "ps",
                1045: "pl",
                1046: "pt",
                2070: "pt-PT",
                1094: "pa",
                1131: "qu-BO",
                2155: "qu-EC",
                3179: "qu",
                1048: "ro",
                1047: "rm",
                1049: "ru",
                9275: "smn",
                4155: "smj-NO",
                5179: "smj",
                3131: "se-FI",
                1083: "se",
                2107: "se-SE",
                8251: "sms",
                6203: "sma-NO",
                7227: "sms",
                1103: "sa",
                7194: "sr-Cyrl-BA",
                3098: "sr",
                6170: "sr-Latn-BA",
                2074: "sr-Latn",
                1132: "nso",
                1074: "tn",
                1115: "si",
                1051: "sk",
                1060: "sl",
                11274: "es-AR",
                16394: "es-BO",
                13322: "es-CL",
                9226: "es-CO",
                5130: "es-CR",
                7178: "es-DO",
                12298: "es-EC",
                17418: "es-SV",
                4106: "es-GT",
                18442: "es-HN",
                2058: "es-MX",
                19466: "es-NI",
                6154: "es-PA",
                15370: "es-PY",
                10250: "es-PE",
                20490: "es-PR",
                3082: "es",
                1034: "es",
                21514: "es-US",
                14346: "es-UY",
                8202: "es-VE",
                2077: "sv-FI",
                1053: "sv",
                1114: "syr",
                1064: "tg",
                2143: "tzm",
                1097: "ta",
                1092: "tt",
                1098: "te",
                1054: "th",
                1105: "bo",
                1055: "tr",
                1090: "tk",
                1152: "ug",
                1058: "uk",
                1070: "hsb",
                1056: "ur",
                2115: "uz-Cyrl",
                1091: "uz",
                1066: "vi",
                1106: "cy",
                1160: "wo",
                1157: "sah",
                1144: "ii",
                1130: "yo",
            };
        function Ye(e, t, r) {
            switch (e) {
                case 0:
                    if (65535 === t) return "und";
                    if (r) return r[t];
                    break;
                case 1:
                    return qe[t];
                case 3:
                    return Xe[t];
            }
        }
        var Je = "utf-16",
            Ke = {
                0: "macintosh",
                1: "x-mac-japanese",
                2: "x-mac-chinesetrad",
                3: "x-mac-korean",
                6: "x-mac-greek",
                7: "x-mac-cyrillic",
                9: "x-mac-devanagai",
                10: "x-mac-gurmukhi",
                11: "x-mac-gujarati",
                12: "x-mac-oriya",
                13: "x-mac-bengali",
                14: "x-mac-tamil",
                15: "x-mac-telugu",
                16: "x-mac-kannada",
                17: "x-mac-malayalam",
                18: "x-mac-sinhalese",
                19: "x-mac-burmese",
                20: "x-mac-khmer",
                21: "x-mac-thai",
                22: "x-mac-lao",
                23: "x-mac-georgian",
                24: "x-mac-armenian",
                25: "x-mac-chinesesimp",
                26: "x-mac-tibetan",
                27: "x-mac-mongolian",
                28: "x-mac-ethiopic",
                29: "x-mac-ce",
                30: "x-mac-vietnamese",
                31: "x-mac-extarabic",
            },
            Qe = {
                15: "x-mac-icelandic",
                17: "x-mac-turkish",
                18: "x-mac-croatian",
                24: "x-mac-ce",
                25: "x-mac-ce",
                26: "x-mac-ce",
                27: "x-mac-ce",
                28: "x-mac-ce",
                30: "x-mac-icelandic",
                37: "x-mac-romanian",
                38: "x-mac-ce",
                39: "x-mac-ce",
                40: "x-mac-ce",
                143: "x-mac-inuit",
                146: "x-mac-gaelic",
            };
        function $e(e, t, r) {
            switch (e) {
                case 0:
                    return Je;
                case 1:
                    return Qe[r] || Ke[t];
                case 3:
                    if (1 === t || 10 === t) return Je;
            }
        }
        function et(e) {
            var t = {};
            for (var r in e) t[e[r]] = parseInt(r);
            return t;
        }
        function tt(e, t, r, i, a, s) {
            return new K.Record("NameRecord", [
                { name: "platformID", type: "USHORT", value: e },
                { name: "encodingID", type: "USHORT", value: t },
                { name: "languageID", type: "USHORT", value: r },
                { name: "nameID", type: "USHORT", value: i },
                { name: "length", type: "USHORT", value: a },
                { name: "offset", type: "USHORT", value: s },
            ]);
        }
        function rt(e, t) {
            var r = (function (e, t) {
                var r = e.length,
                    i = t.length - r + 1;
                e: for (var a = 0; a < i; a++)
                    for (; a < i; a++) {
                        for (var s = 0; s < r; s++) if (t[a + s] !== e[s]) continue e;
                        return a;
                    }
                return -1;
            })(e, t);
            if (r < 0) {
                r = t.length;
                for (var i = 0, a = e.length; i < a; ++i) t.push(e[i]);
            }
            return r;
        }
        var it = {
                parse: function (e, t, r) {
                    for (
                        var i = {},
                            a = new se.Parser(e, t),
                            s = a.parseUShort(),
                            n = a.parseUShort(),
                            o = a.offset + a.parseUShort(),
                            p = 0;
                        p < n;
                        p++
                    ) {
                        var l = a.parseUShort(),
                            h = a.parseUShort(),
                            c = a.parseUShort(),
                            u = a.parseUShort(),
                            d = ze[u] || u,
                            f = a.parseUShort(),
                            m = a.parseUShort(),
                            y = Ye(l, c, r),
                            g = $e(l, h, c);
                        if (undefined !== g && undefined !== y) {
                            var v = undefined;
                            if ((v = g === Je ? N.UTF16(e, o + m, f) : N.MACSTRING(e, o + m, f, g))) {
                                var b = i[d];
                                undefined === b && (b = i[d] = {}), (b[y] = v);
                            }
                        }
                    }
                    return 1 === s && a.parseUShort(), i;
                },
                make: function (e, t) {
                    var r,
                        i = [],
                        a = {},
                        s = et(ze);
                    for (var n in e) {
                        var o = s[n];
                        if ((undefined === o && (o = n), (r = parseInt(o)), isNaN(r)))
                            throw new Error(
                                'Name table entry "' + n + '" does not exist, see nameTableNames for complete list.'
                            );
                        (a[r] = e[n]), i.push(r);
                    }
                    for (var p = et(qe), l = et(Xe), h = [], c = [], u = 0; u < i.length; u++) {
                        var d = a[(r = i[u])];
                        for (var f in d) {
                            var m = d[f],
                                y = 1,
                                g = p[f],
                                v = We[g],
                                b = $e(y, v, g),
                                x = L.MACSTRING(m, b);
                            undefined === x &&
                                ((y = 0),
                                (g = t.indexOf(f)) < 0 && ((g = t.length), t.push(f)),
                                (v = 4),
                                (x = L.UTF16(m)));
                            var P = rt(x, c);
                            h.push(tt(y, v, g, r, x.length, P));
                            var w = l[f];
                            if (undefined !== w) {
                                var S = L.UTF16(m),
                                    E = rt(S, c);
                                h.push(tt(3, 1, w, r, S.length, E));
                            }
                        }
                    }
                    h.sort(function (e, t) {
                        return (
                            e.platformID - t.platformID ||
                            e.encodingID - t.encodingID ||
                            e.languageID - t.languageID ||
                            e.nameID - t.nameID
                        );
                    });
                    for (
                        var T = new K.Table("name", [
                                { name: "format", type: "USHORT", value: 0 },
                                { name: "count", type: "USHORT", value: h.length },
                                { name: "stringOffset", type: "USHORT", value: 6 + 12 * h.length },
                            ]),
                            k = 0;
                        k < h.length;
                        k++
                    )
                        T.fields.push({ name: "record_" + k, type: "RECORD", value: h[k] });
                    return T.fields.push({ name: "strings", type: "LITERAL", value: c }), T;
                },
            },
            at = [
                { begin: 0, end: 127 },
                { begin: 128, end: 255 },
                { begin: 256, end: 383 },
                { begin: 384, end: 591 },
                { begin: 592, end: 687 },
                { begin: 688, end: 767 },
                { begin: 768, end: 879 },
                { begin: 880, end: 1023 },
                { begin: 11392, end: 11519 },
                { begin: 1024, end: 1279 },
                { begin: 1328, end: 1423 },
                { begin: 1424, end: 1535 },
                { begin: 42240, end: 42559 },
                { begin: 1536, end: 1791 },
                { begin: 1984, end: 2047 },
                { begin: 2304, end: 2431 },
                { begin: 2432, end: 2559 },
                { begin: 2560, end: 2687 },
                { begin: 2688, end: 2815 },
                { begin: 2816, end: 2943 },
                { begin: 2944, end: 3071 },
                { begin: 3072, end: 3199 },
                { begin: 3200, end: 3327 },
                { begin: 3328, end: 3455 },
                { begin: 3584, end: 3711 },
                { begin: 3712, end: 3839 },
                { begin: 4256, end: 4351 },
                { begin: 6912, end: 7039 },
                { begin: 4352, end: 4607 },
                { begin: 7680, end: 7935 },
                { begin: 7936, end: 8191 },
                { begin: 8192, end: 8303 },
                { begin: 8304, end: 8351 },
                { begin: 8352, end: 8399 },
                { begin: 8400, end: 8447 },
                { begin: 8448, end: 8527 },
                { begin: 8528, end: 8591 },
                { begin: 8592, end: 8703 },
                { begin: 8704, end: 8959 },
                { begin: 8960, end: 9215 },
                { begin: 9216, end: 9279 },
                { begin: 9280, end: 9311 },
                { begin: 9312, end: 9471 },
                { begin: 9472, end: 9599 },
                { begin: 9600, end: 9631 },
                { begin: 9632, end: 9727 },
                { begin: 9728, end: 9983 },
                { begin: 9984, end: 10175 },
                { begin: 12288, end: 12351 },
                { begin: 12352, end: 12447 },
                { begin: 12448, end: 12543 },
                { begin: 12544, end: 12591 },
                { begin: 12592, end: 12687 },
                { begin: 43072, end: 43135 },
                { begin: 12800, end: 13055 },
                { begin: 13056, end: 13311 },
                { begin: 44032, end: 55215 },
                { begin: 55296, end: 57343 },
                { begin: 67840, end: 67871 },
                { begin: 19968, end: 40959 },
                { begin: 57344, end: 63743 },
                { begin: 12736, end: 12783 },
                { begin: 64256, end: 64335 },
                { begin: 64336, end: 65023 },
                { begin: 65056, end: 65071 },
                { begin: 65040, end: 65055 },
                { begin: 65104, end: 65135 },
                { begin: 65136, end: 65279 },
                { begin: 65280, end: 65519 },
                { begin: 65520, end: 65535 },
                { begin: 3840, end: 4095 },
                { begin: 1792, end: 1871 },
                { begin: 1920, end: 1983 },
                { begin: 3456, end: 3583 },
                { begin: 4096, end: 4255 },
                { begin: 4608, end: 4991 },
                { begin: 5024, end: 5119 },
                { begin: 5120, end: 5759 },
                { begin: 5760, end: 5791 },
                { begin: 5792, end: 5887 },
                { begin: 6016, end: 6143 },
                { begin: 6144, end: 6319 },
                { begin: 10240, end: 10495 },
                { begin: 40960, end: 42127 },
                { begin: 5888, end: 5919 },
                { begin: 66304, end: 66351 },
                { begin: 66352, end: 66383 },
                { begin: 66560, end: 66639 },
                { begin: 118784, end: 119039 },
                { begin: 119808, end: 120831 },
                { begin: 1044480, end: 1048573 },
                { begin: 65024, end: 65039 },
                { begin: 917504, end: 917631 },
                { begin: 6400, end: 6479 },
                { begin: 6480, end: 6527 },
                { begin: 6528, end: 6623 },
                { begin: 6656, end: 6687 },
                { begin: 11264, end: 11359 },
                { begin: 11568, end: 11647 },
                { begin: 19904, end: 19967 },
                { begin: 43008, end: 43055 },
                { begin: 65536, end: 65663 },
                { begin: 65856, end: 65935 },
                { begin: 66432, end: 66463 },
                { begin: 66464, end: 66527 },
                { begin: 66640, end: 66687 },
                { begin: 66688, end: 66735 },
                { begin: 67584, end: 67647 },
                { begin: 68096, end: 68191 },
                { begin: 119552, end: 119647 },
                { begin: 73728, end: 74751 },
                { begin: 119648, end: 119679 },
                { begin: 7040, end: 7103 },
                { begin: 7168, end: 7247 },
                { begin: 7248, end: 7295 },
                { begin: 43136, end: 43231 },
                { begin: 43264, end: 43311 },
                { begin: 43312, end: 43359 },
                { begin: 43520, end: 43615 },
                { begin: 65936, end: 65999 },
                { begin: 66e3, end: 66047 },
                { begin: 66208, end: 66271 },
                { begin: 127024, end: 127135 },
            ];
        var st = {
            parse: function (e, t) {
                var r = {},
                    i = new se.Parser(e, t);
                (r.version = i.parseUShort()),
                    (r.xAvgCharWidth = i.parseShort()),
                    (r.usWeightClass = i.parseUShort()),
                    (r.usWidthClass = i.parseUShort()),
                    (r.fsType = i.parseUShort()),
                    (r.ySubscriptXSize = i.parseShort()),
                    (r.ySubscriptYSize = i.parseShort()),
                    (r.ySubscriptXOffset = i.parseShort()),
                    (r.ySubscriptYOffset = i.parseShort()),
                    (r.ySuperscriptXSize = i.parseShort()),
                    (r.ySuperscriptYSize = i.parseShort()),
                    (r.ySuperscriptXOffset = i.parseShort()),
                    (r.ySuperscriptYOffset = i.parseShort()),
                    (r.yStrikeoutSize = i.parseShort()),
                    (r.yStrikeoutPosition = i.parseShort()),
                    (r.sFamilyClass = i.parseShort()),
                    (r.panose = []);
                for (var a = 0; a < 10; a++) r.panose[a] = i.parseByte();
                return (
                    (r.ulUnicodeRange1 = i.parseULong()),
                    (r.ulUnicodeRange2 = i.parseULong()),
                    (r.ulUnicodeRange3 = i.parseULong()),
                    (r.ulUnicodeRange4 = i.parseULong()),
                    (r.achVendID = String.fromCharCode(i.parseByte(), i.parseByte(), i.parseByte(), i.parseByte())),
                    (r.fsSelection = i.parseUShort()),
                    (r.usFirstCharIndex = i.parseUShort()),
                    (r.usLastCharIndex = i.parseUShort()),
                    (r.sTypoAscender = i.parseShort()),
                    (r.sTypoDescender = i.parseShort()),
                    (r.sTypoLineGap = i.parseShort()),
                    (r.usWinAscent = i.parseUShort()),
                    (r.usWinDescent = i.parseUShort()),
                    r.version >= 1 && ((r.ulCodePageRange1 = i.parseULong()), (r.ulCodePageRange2 = i.parseULong())),
                    r.version >= 2 &&
                        ((r.sxHeight = i.parseShort()),
                        (r.sCapHeight = i.parseShort()),
                        (r.usDefaultChar = i.parseUShort()),
                        (r.usBreakChar = i.parseUShort()),
                        (r.usMaxContent = i.parseUShort())),
                    r
                );
            },
            make: function (e) {
                return new K.Table(
                    "OS/2",
                    [
                        { name: "version", type: "USHORT", value: 3 },
                        { name: "xAvgCharWidth", type: "SHORT", value: 0 },
                        { name: "usWeightClass", type: "USHORT", value: 0 },
                        { name: "usWidthClass", type: "USHORT", value: 0 },
                        { name: "fsType", type: "USHORT", value: 0 },
                        { name: "ySubscriptXSize", type: "SHORT", value: 650 },
                        { name: "ySubscriptYSize", type: "SHORT", value: 699 },
                        { name: "ySubscriptXOffset", type: "SHORT", value: 0 },
                        { name: "ySubscriptYOffset", type: "SHORT", value: 140 },
                        { name: "ySuperscriptXSize", type: "SHORT", value: 650 },
                        { name: "ySuperscriptYSize", type: "SHORT", value: 699 },
                        { name: "ySuperscriptXOffset", type: "SHORT", value: 0 },
                        { name: "ySuperscriptYOffset", type: "SHORT", value: 479 },
                        { name: "yStrikeoutSize", type: "SHORT", value: 49 },
                        { name: "yStrikeoutPosition", type: "SHORT", value: 258 },
                        { name: "sFamilyClass", type: "SHORT", value: 0 },
                        { name: "bFamilyType", type: "BYTE", value: 0 },
                        { name: "bSerifStyle", type: "BYTE", value: 0 },
                        { name: "bWeight", type: "BYTE", value: 0 },
                        { name: "bProportion", type: "BYTE", value: 0 },
                        { name: "bContrast", type: "BYTE", value: 0 },
                        { name: "bStrokeVariation", type: "BYTE", value: 0 },
                        { name: "bArmStyle", type: "BYTE", value: 0 },
                        { name: "bLetterform", type: "BYTE", value: 0 },
                        { name: "bMidline", type: "BYTE", value: 0 },
                        { name: "bXHeight", type: "BYTE", value: 0 },
                        { name: "ulUnicodeRange1", type: "ULONG", value: 0 },
                        { name: "ulUnicodeRange2", type: "ULONG", value: 0 },
                        { name: "ulUnicodeRange3", type: "ULONG", value: 0 },
                        { name: "ulUnicodeRange4", type: "ULONG", value: 0 },
                        { name: "achVendID", type: "CHARARRAY", value: "XXXX" },
                        { name: "fsSelection", type: "USHORT", value: 0 },
                        { name: "usFirstCharIndex", type: "USHORT", value: 0 },
                        { name: "usLastCharIndex", type: "USHORT", value: 0 },
                        { name: "sTypoAscender", type: "SHORT", value: 0 },
                        { name: "sTypoDescender", type: "SHORT", value: 0 },
                        { name: "sTypoLineGap", type: "SHORT", value: 0 },
                        { name: "usWinAscent", type: "USHORT", value: 0 },
                        { name: "usWinDescent", type: "USHORT", value: 0 },
                        { name: "ulCodePageRange1", type: "ULONG", value: 0 },
                        { name: "ulCodePageRange2", type: "ULONG", value: 0 },
                        { name: "sxHeight", type: "SHORT", value: 0 },
                        { name: "sCapHeight", type: "SHORT", value: 0 },
                        { name: "usDefaultChar", type: "USHORT", value: 0 },
                        { name: "usBreakChar", type: "USHORT", value: 0 },
                        { name: "usMaxContext", type: "USHORT", value: 0 },
                    ],
                    e
                );
            },
            unicodeRanges: at,
            getUnicodeRange: function (e) {
                for (var t = 0; t < at.length; t += 1) {
                    var r = at[t];
                    if (e >= r.begin && e < r.end) return t;
                }
                return -1;
            },
        };
        var nt = {
                parse: function (e, t) {
                    var r = {},
                        i = new se.Parser(e, t);
                    switch (
                        ((r.version = i.parseVersion()),
                        (r.italicAngle = i.parseFixed()),
                        (r.underlinePosition = i.parseShort()),
                        (r.underlineThickness = i.parseShort()),
                        (r.isFixedPitch = i.parseULong()),
                        (r.minMemType42 = i.parseULong()),
                        (r.maxMemType42 = i.parseULong()),
                        (r.minMemType1 = i.parseULong()),
                        (r.maxMemType1 = i.parseULong()),
                        r.version)
                    ) {
                        case 1:
                            r.names = ce.slice();
                            break;
                        case 2:
                            (r.numberOfGlyphs = i.parseUShort()), (r.glyphNameIndex = new Array(r.numberOfGlyphs));
                            for (var a = 0; a < r.numberOfGlyphs; a++) r.glyphNameIndex[a] = i.parseUShort();
                            r.names = [];
                            for (var s = 0; s < r.numberOfGlyphs; s++)
                                if (r.glyphNameIndex[s] >= ce.length) {
                                    var n = i.parseChar();
                                    r.names.push(i.parseString(n));
                                }
                            break;
                        case 2.5:
                            (r.numberOfGlyphs = i.parseUShort()), (r.offset = new Array(r.numberOfGlyphs));
                            for (var o = 0; o < r.numberOfGlyphs; o++) r.offset[o] = i.parseChar();
                    }
                    return r;
                },
                make: function () {
                    return new K.Table("post", [
                        { name: "version", type: "FIXED", value: 196608 },
                        { name: "italicAngle", type: "FIXED", value: 0 },
                        { name: "underlinePosition", type: "FWORD", value: 0 },
                        { name: "underlineThickness", type: "FWORD", value: 0 },
                        { name: "isFixedPitch", type: "ULONG", value: 0 },
                        { name: "minMemType42", type: "ULONG", value: 0 },
                        { name: "maxMemType42", type: "ULONG", value: 0 },
                        { name: "minMemType1", type: "ULONG", value: 0 },
                        { name: "maxMemType1", type: "ULONG", value: 0 },
                    ]);
                },
            },
            ot = new Array(9);
        (ot[1] = function () {
            var e = this.offset + this.relativeOffset,
                t = this.parseUShort();
            return 1 === t
                ? { substFormat: 1, coverage: this.parsePointer(ie.coverage), deltaGlyphId: this.parseUShort() }
                : 2 === t
                ? { substFormat: 2, coverage: this.parsePointer(ie.coverage), substitute: this.parseOffset16List() }
                : void C.assert(false, "0x" + e.toString(16) + ": lookup type 1 format must be 1 or 2.");
        }),
            (ot[2] = function () {
                var e = this.parseUShort();
                return (
                    C.argument(1 === e, "GSUB Multiple Substitution Subtable identifier-format must be 1"),
                    { substFormat: e, coverage: this.parsePointer(ie.coverage), sequences: this.parseListOfLists() }
                );
            }),
            (ot[3] = function () {
                var e = this.parseUShort();
                return (
                    C.argument(1 === e, "GSUB Alternate Substitution Subtable identifier-format must be 1"),
                    { substFormat: e, coverage: this.parsePointer(ie.coverage), alternateSets: this.parseListOfLists() }
                );
            }),
            (ot[4] = function () {
                var e = this.parseUShort();
                return (
                    C.argument(1 === e, "GSUB ligature table identifier-format must be 1"),
                    {
                        substFormat: e,
                        coverage: this.parsePointer(ie.coverage),
                        ligatureSets: this.parseListOfLists(function () {
                            return {
                                ligGlyph: this.parseUShort(),
                                components: this.parseUShortList(this.parseUShort() - 1),
                            };
                        }),
                    }
                );
            });
        var pt = { sequenceIndex: ie.uShort, lookupListIndex: ie.uShort };
        (ot[5] = function () {
            var e = this.offset + this.relativeOffset,
                t = this.parseUShort();
            if (1 === t)
                return {
                    substFormat: t,
                    coverage: this.parsePointer(ie.coverage),
                    ruleSets: this.parseListOfLists(function () {
                        var e = this.parseUShort(),
                            t = this.parseUShort();
                        return { input: this.parseUShortList(e - 1), lookupRecords: this.parseRecordList(t, pt) };
                    }),
                };
            if (2 === t)
                return {
                    substFormat: t,
                    coverage: this.parsePointer(ie.coverage),
                    classDef: this.parsePointer(ie.classDef),
                    classSets: this.parseListOfLists(function () {
                        var e = this.parseUShort(),
                            t = this.parseUShort();
                        return { classes: this.parseUShortList(e - 1), lookupRecords: this.parseRecordList(t, pt) };
                    }),
                };
            if (3 === t) {
                var r = this.parseUShort(),
                    i = this.parseUShort();
                return {
                    substFormat: t,
                    coverages: this.parseList(r, ie.pointer(ie.coverage)),
                    lookupRecords: this.parseRecordList(i, pt),
                };
            }
            C.assert(false, "0x" + e.toString(16) + ": lookup type 5 format must be 1, 2 or 3.");
        }),
            (ot[6] = function () {
                var e = this.offset + this.relativeOffset,
                    t = this.parseUShort();
                return 1 === t
                    ? {
                          substFormat: 1,
                          coverage: this.parsePointer(ie.coverage),
                          chainRuleSets: this.parseListOfLists(function () {
                              return {
                                  backtrack: this.parseUShortList(),
                                  input: this.parseUShortList(this.parseShort() - 1),
                                  lookahead: this.parseUShortList(),
                                  lookupRecords: this.parseRecordList(pt),
                              };
                          }),
                      }
                    : 2 === t
                    ? {
                          substFormat: 2,
                          coverage: this.parsePointer(ie.coverage),
                          backtrackClassDef: this.parsePointer(ie.classDef),
                          inputClassDef: this.parsePointer(ie.classDef),
                          lookaheadClassDef: this.parsePointer(ie.classDef),
                          chainClassSet: this.parseListOfLists(function () {
                              return {
                                  backtrack: this.parseUShortList(),
                                  input: this.parseUShortList(this.parseShort() - 1),
                                  lookahead: this.parseUShortList(),
                                  lookupRecords: this.parseRecordList(pt),
                              };
                          }),
                      }
                    : 3 === t
                    ? {
                          substFormat: 3,
                          backtrackCoverage: this.parseList(ie.pointer(ie.coverage)),
                          inputCoverage: this.parseList(ie.pointer(ie.coverage)),
                          lookaheadCoverage: this.parseList(ie.pointer(ie.coverage)),
                          lookupRecords: this.parseRecordList(pt),
                      }
                    : void C.assert(false, "0x" + e.toString(16) + ": lookup type 6 format must be 1, 2 or 3.");
            }),
            (ot[7] = function () {
                var e = this.parseUShort();
                C.argument(1 === e, "GSUB Extension Substitution subtable identifier-format must be 1");
                var t = this.parseUShort(),
                    r = new ie(this.data, this.offset + this.parseULong());
                return { substFormat: 1, lookupType: t, extension: ot[t].call(r) };
            }),
            (ot[8] = function () {
                var e = this.parseUShort();
                return (
                    C.argument(
                        1 === e,
                        "GSUB Reverse Chaining Contextual Single Substitution Subtable identifier-format must be 1"
                    ),
                    {
                        substFormat: e,
                        coverage: this.parsePointer(ie.coverage),
                        backtrackCoverage: this.parseList(ie.pointer(ie.coverage)),
                        lookaheadCoverage: this.parseList(ie.pointer(ie.coverage)),
                        substitutes: this.parseUShortList(),
                    }
                );
            });
        var lt = new Array(9);
        (lt[1] = function (e) {
            return 1 === e.substFormat
                ? new K.Table("substitutionTable", [
                      { name: "substFormat", type: "USHORT", value: 1 },
                      { name: "coverage", type: "TABLE", value: new K.Coverage(e.coverage) },
                      { name: "deltaGlyphID", type: "USHORT", value: e.deltaGlyphId },
                  ])
                : new K.Table(
                      "substitutionTable",
                      [
                          { name: "substFormat", type: "USHORT", value: 2 },
                          { name: "coverage", type: "TABLE", value: new K.Coverage(e.coverage) },
                      ].concat(K.ushortList("substitute", e.substitute))
                  );
        }),
            (lt[3] = function (e) {
                return (
                    C.assert(1 === e.substFormat, "Lookup type 3 substFormat must be 1."),
                    new K.Table(
                        "substitutionTable",
                        [
                            { name: "substFormat", type: "USHORT", value: 1 },
                            { name: "coverage", type: "TABLE", value: new K.Coverage(e.coverage) },
                        ].concat(
                            K.tableList("altSet", e.alternateSets, function (e) {
                                return new K.Table("alternateSetTable", K.ushortList("alternate", e));
                            })
                        )
                    )
                );
            }),
            (lt[4] = function (e) {
                return (
                    C.assert(1 === e.substFormat, "Lookup type 4 substFormat must be 1."),
                    new K.Table(
                        "substitutionTable",
                        [
                            { name: "substFormat", type: "USHORT", value: 1 },
                            { name: "coverage", type: "TABLE", value: new K.Coverage(e.coverage) },
                        ].concat(
                            K.tableList("ligSet", e.ligatureSets, function (e) {
                                return new K.Table(
                                    "ligatureSetTable",
                                    K.tableList("ligature", e, function (e) {
                                        return new K.Table(
                                            "ligatureTable",
                                            [{ name: "ligGlyph", type: "USHORT", value: e.ligGlyph }].concat(
                                                K.ushortList("component", e.components, e.components.length + 1)
                                            )
                                        );
                                    })
                                );
                            })
                        )
                    )
                );
            });
        var ht = {
            parse: function (e, t) {
                var r = new ie(e, (t = t || 0)),
                    i = r.parseVersion(1);
                return (
                    C.argument(1 === i || 1.1 === i, "Unsupported GSUB table version."),
                    1 === i
                        ? {
                              version: i,
                              scripts: r.parseScriptList(),
                              features: r.parseFeatureList(),
                              lookups: r.parseLookupList(ot),
                          }
                        : {
                              version: i,
                              scripts: r.parseScriptList(),
                              features: r.parseFeatureList(),
                              lookups: r.parseLookupList(ot),
                              variations: r.parseFeatureVariationsList(),
                          }
                );
            },
            make: function (e) {
                return new K.Table("GSUB", [
                    { name: "version", type: "ULONG", value: 65536 },
                    { name: "scripts", type: "TABLE", value: new K.ScriptList(e.scripts) },
                    { name: "features", type: "TABLE", value: new K.FeatureList(e.features) },
                    { name: "lookups", type: "TABLE", value: new K.LookupList(e.lookups, lt) },
                ]);
            },
        };
        var ct = {
            parse: function (e, t) {
                var r = new se.Parser(e, t),
                    i = r.parseULong();
                C.argument(1 === i, "Unsupported META table version."), r.parseULong(), r.parseULong();
                for (var a = r.parseULong(), s = {}, n = 0; n < a; n++) {
                    var o = r.parseTag(),
                        p = r.parseULong(),
                        l = r.parseULong(),
                        h = N.UTF8(e, t + p, l);
                    s[o] = h;
                }
                return s;
            },
            make: function (e) {
                var t = Object.keys(e).length,
                    r = "",
                    i = 16 + 12 * t,
                    a = new K.Table("meta", [
                        { name: "version", type: "ULONG", value: 1 },
                        { name: "flags", type: "ULONG", value: 0 },
                        { name: "offset", type: "ULONG", value: i },
                        { name: "numTags", type: "ULONG", value: t },
                    ]);
                for (var s in e) {
                    var n = r.length;
                    (r += e[s]),
                        a.fields.push({ name: "tag " + s, type: "TAG", value: s }),
                        a.fields.push({ name: "offset " + s, type: "ULONG", value: i + n }),
                        a.fields.push({ name: "length " + s, type: "ULONG", value: e[s].length });
                }
                return a.fields.push({ name: "stringPool", type: "CHARARRAY", value: r }), a;
            },
        };
        function ut(e) {
            return (Math.log(e) / Math.log(2)) | 0;
        }
        function dt(e) {
            for (; e.length % 4 != 0; ) e.push(0);
            for (var t = 0, r = 0; r < e.length; r += 4)
                t += (e[r] << 24) + (e[r + 1] << 16) + (e[r + 2] << 8) + e[r + 3];
            return (t %= Math.pow(2, 32));
        }
        function ft(e, t, r, i) {
            return new K.Record("Table Record", [
                { name: "tag", type: "TAG", value: undefined !== e ? e : "" },
                { name: "checkSum", type: "ULONG", value: undefined !== t ? t : 0 },
                { name: "offset", type: "ULONG", value: undefined !== r ? r : 0 },
                { name: "length", type: "ULONG", value: undefined !== i ? i : 0 },
            ]);
        }
        function mt(e) {
            var t = new K.Table("sfnt", [
                { name: "version", type: "TAG", value: "OTTO" },
                { name: "numTables", type: "USHORT", value: 0 },
                { name: "searchRange", type: "USHORT", value: 0 },
                { name: "entrySelector", type: "USHORT", value: 0 },
                { name: "rangeShift", type: "USHORT", value: 0 },
            ]);
            (t.tables = e), (t.numTables = e.length);
            var r = Math.pow(2, ut(t.numTables));
            (t.searchRange = 16 * r), (t.entrySelector = ut(r)), (t.rangeShift = 16 * t.numTables - t.searchRange);
            for (var i = [], a = [], s = t.sizeOf() + ft().sizeOf() * t.numTables; s % 4 != 0; )
                (s += 1), a.push({ name: "padding", type: "BYTE", value: 0 });
            for (var n = 0; n < e.length; n += 1) {
                var o = e[n];
                C.argument(4 === o.tableName.length, "Table name" + o.tableName + " is invalid.");
                var p = o.sizeOf(),
                    l = ft(o.tableName, dt(o.encode()), s, p);
                for (
                    i.push({ name: l.tag + " Table Record", type: "RECORD", value: l }),
                        a.push({ name: o.tableName + " table", type: "RECORD", value: o }),
                        s += p,
                        C.argument(!isNaN(s), "Something went wrong calculating the offset.");
                    s % 4 != 0;

                )
                    (s += 1), a.push({ name: "padding", type: "BYTE", value: 0 });
            }
            return (
                i.sort(function (e, t) {
                    return e.value.tag > t.value.tag ? 1 : -1;
                }),
                (t.fields = t.fields.concat(i)),
                (t.fields = t.fields.concat(a)),
                t
            );
        }
        function yt(e, t, r) {
            for (var i = 0; i < t.length; i += 1) {
                var a = e.charToGlyphIndex(t[i]);
                if (a > 0) return e.glyphs.get(a).getMetrics();
            }
            return r;
        }
        var gt = {
            make: mt,
            fontToTable: function (e) {
                for (
                    var t,
                        r = [],
                        i = [],
                        a = [],
                        s = [],
                        n = [],
                        o = [],
                        p = [],
                        l = 0,
                        h = 0,
                        c = 0,
                        u = 0,
                        d = 0,
                        f = 0;
                    f < e.glyphs.length;
                    f += 1
                ) {
                    var m = e.glyphs.get(f),
                        y = 0 | m.unicode;
                    if (isNaN(m.advanceWidth))
                        throw new Error("Glyph " + m.name + " (" + f + "): advanceWidth is not a number.");
                    (t > y || undefined === t) && y > 0 && (t = y), l < y && (l = y);
                    var g = st.getUnicodeRange(y);
                    if (g < 32) h |= 1 << g;
                    else if (g < 64) c |= 1 << (g - 32);
                    else if (g < 96) u |= 1 << (g - 64);
                    else {
                        if (!(g < 123)) throw new Error("Unicode ranges bits > 123 are reserved for internal usage");
                        d |= 1 << (g - 96);
                    }
                    if (".notdef" !== m.name) {
                        var v = m.getMetrics();
                        r.push(v.xMin),
                            i.push(v.yMin),
                            a.push(v.xMax),
                            s.push(v.yMax),
                            o.push(v.leftSideBearing),
                            p.push(v.rightSideBearing),
                            n.push(m.advanceWidth);
                    }
                }
                var b = {
                    xMin: Math.min.apply(null, r),
                    yMin: Math.min.apply(null, i),
                    xMax: Math.max.apply(null, a),
                    yMax: Math.max.apply(null, s),
                    advanceWidthMax: Math.max.apply(null, n),
                    advanceWidthAvg: (function (e) {
                        for (var t = 0, r = 0; r < e.length; r += 1) t += e[r];
                        return t / e.length;
                    })(n),
                    minLeftSideBearing: Math.min.apply(null, o),
                    maxLeftSideBearing: Math.max.apply(null, o),
                    minRightSideBearing: Math.min.apply(null, p),
                };
                (b.ascender = e.ascender), (b.descender = e.descender);
                var x = _e.make({
                        flags: 3,
                        unitsPerEm: e.unitsPerEm,
                        xMin: b.xMin,
                        yMin: b.yMin,
                        xMax: b.xMax,
                        yMax: b.yMax,
                        lowestRecPPEM: 3,
                        createdTimestamp: e.createdTimestamp,
                    }),
                    P = Fe.make({
                        ascender: b.ascender,
                        descender: b.descender,
                        advanceWidthMax: b.advanceWidthMax,
                        minLeftSideBearing: b.minLeftSideBearing,
                        minRightSideBearing: b.minRightSideBearing,
                        xMaxExtent: b.maxLeftSideBearing + (b.xMax - b.xMin),
                        numberOfHMetrics: e.glyphs.length,
                    }),
                    w = He.make(e.glyphs.length),
                    S = st.make({
                        xAvgCharWidth: Math.round(b.advanceWidthAvg),
                        usWeightClass: e.tables.os2.usWeightClass,
                        usWidthClass: e.tables.os2.usWidthClass,
                        usFirstCharIndex: t,
                        usLastCharIndex: l,
                        ulUnicodeRange1: h,
                        ulUnicodeRange2: c,
                        ulUnicodeRange3: u,
                        ulUnicodeRange4: d,
                        fsSelection: e.tables.os2.fsSelection,
                        sTypoAscender: b.ascender,
                        sTypoDescender: b.descender,
                        sTypoLineGap: 0,
                        usWinAscent: b.yMax,
                        usWinDescent: Math.abs(b.yMin),
                        ulCodePageRange1: 1,
                        sxHeight: yt(e, "xyvw", { yMax: Math.round(b.ascender / 2) }).yMax,
                        sCapHeight: yt(e, "HIKLEFJMNTZBDPRAGOQSUVWXY", b).yMax,
                        usDefaultChar: e.hasChar(" ") ? 32 : 0,
                        usBreakChar: e.hasChar(" ") ? 32 : 0,
                    }),
                    E = Ge.make(e.glyphs),
                    T = oe.make(e.glyphs),
                    k = e.getEnglishName("fontFamily"),
                    O = e.getEnglishName("fontSubfamily"),
                    Z = k + " " + O,
                    R = e.getEnglishName("postScriptName");
                R || (R = k.replace(/\s/g, "") + "-" + O);
                var C = {};
                for (var N in e.names) C[N] = e.names[N];
                C.uniqueID || (C.uniqueID = { en: e.getEnglishName("manufacturer") + ":" + Z }),
                    C.postScriptName || (C.postScriptName = { en: R }),
                    C.preferredFamily || (C.preferredFamily = e.names.fontFamily),
                    C.preferredSubfamily || (C.preferredSubfamily = e.names.fontSubfamily);
                var L = [],
                    M = it.make(C, L),
                    U = L.length > 0 ? Ve.make(L) : undefined,
                    I = nt.make(),
                    j = Be.make(e.glyphs, {
                        version: e.getEnglishName("version"),
                        fullName: Z,
                        familyName: k,
                        weightName: O,
                        postScriptName: R,
                        unitsPerEm: e.unitsPerEm,
                        fontBBox: [0, b.yMin, b.ascender, b.advanceWidthMax],
                    }),
                    A = e.metas && Object.keys(e.metas).length > 0 ? ct.make(e.metas) : undefined,
                    D = [x, P, w, S, M, T, I, j, E];
                U && D.push(U), e.tables.gsub && D.push(ht.make(e.tables.gsub)), A && D.push(A);
                for (var B = mt(D), _ = dt(B.encode()), F = B.fields, G = false, V = 0; V < F.length; V += 1)
                    if ("head table" === F[V].name) {
                        (F[V].value.checkSumAdjustment = 2981146554 - _), (G = true);
                        break;
                    }
                if (!G) throw new Error("Could not find head table with checkSum to adjust.");
                return B;
            },
            computeCheckSum: dt,
        };
        function vt(e, t) {
            for (var r = 0, i = e.length - 1; r <= i; ) {
                var a = (r + i) >>> 1,
                    s = e[a].tag;
                if (s === t) return a;
                s < t ? (r = a + 1) : (i = a - 1);
            }
            return -r - 1;
        }
        function bt(e, t) {
            for (var r = 0, i = e.length - 1; r <= i; ) {
                var a = (r + i) >>> 1,
                    s = e[a];
                if (s === t) return a;
                s < t ? (r = a + 1) : (i = a - 1);
            }
            return -r - 1;
        }
        function xt(e, t) {
            for (var r, i = 0, a = e.length - 1; i <= a; ) {
                var s = (i + a) >>> 1,
                    n = (r = e[s]).start;
                if (n === t) return r;
                n < t ? (i = s + 1) : (a = s - 1);
            }
            if (i > 0) return t > (r = e[i - 1]).end ? 0 : r;
        }
        function Pt(e, t) {
            (this.font = e), (this.tableName = t);
        }
        function wt(e) {
            Pt.call(this, e, "gpos");
        }
        function St(e) {
            Pt.call(this, e, "gsub");
        }
        function Et(e, t) {
            var r = e.length;
            if (r !== t.length) return false;
            for (var i = 0; i < r; i++) if (e[i] !== t[i]) return false;
            return true;
        }
        function Tt(e, t, r) {
            for (var i = e.subtables, a = 0; a < i.length; a++) {
                var s = i[a];
                if (s.substFormat === t) return s;
            }
            if (r) return i.push(r), r;
        }
        function kt(e) {
            for (var t = new ArrayBuffer(e.length), r = new Uint8Array(t), i = 0; i < e.length; ++i) r[i] = e[i];
            return t;
        }
        function Ot(e, t) {
            if (!e) throw t;
        }
        function Zt(e, t, r, i, a) {
            var s;
            return (
                (t & i) > 0
                    ? ((s = e.parseByte()), 0 == (t & a) && (s = -s), (s = r + s))
                    : (s = (t & a) > 0 ? r : r + e.parseShort()),
                s
            );
        }
        function Rt(e, t, r) {
            var i,
                a,
                s = new se.Parser(t, r);
            if (
                ((e.numberOfContours = s.parseShort()),
                (e._xMin = s.parseShort()),
                (e._yMin = s.parseShort()),
                (e._xMax = s.parseShort()),
                (e._yMax = s.parseShort()),
                e.numberOfContours > 0)
            ) {
                for (var n = (e.endPointIndices = []), o = 0; o < e.numberOfContours; o += 1) n.push(s.parseUShort());
                (e.instructionLength = s.parseUShort()), (e.instructions = []);
                for (var p = 0; p < e.instructionLength; p += 1) e.instructions.push(s.parseByte());
                var l = n[n.length - 1] + 1;
                i = [];
                for (var h = 0; h < l; h += 1)
                    if (((a = s.parseByte()), i.push(a), (8 & a) > 0))
                        for (var c = s.parseByte(), u = 0; u < c; u += 1) i.push(a), (h += 1);
                if ((C.argument(i.length === l, "Bad flags."), n.length > 0)) {
                    var d,
                        f = [];
                    if (l > 0) {
                        for (var m = 0; m < l; m += 1)
                            (a = i[m]),
                                ((d = {}).onCurve = !!(1 & a)),
                                (d.lastPointOfContour = n.indexOf(m) >= 0),
                                f.push(d);
                        for (var y = 0, g = 0; g < l; g += 1)
                            (a = i[g]), ((d = f[g]).x = Zt(s, a, y, 2, 16)), (y = d.x);
                        for (var v = 0, b = 0; b < l; b += 1)
                            (a = i[b]), ((d = f[b]).y = Zt(s, a, v, 4, 32)), (v = d.y);
                    }
                    e.points = f;
                } else e.points = [];
            } else if (0 === e.numberOfContours) e.points = [];
            else {
                (e.isComposite = true), (e.points = []), (e.components = []);
                for (var x = true; x; ) {
                    i = s.parseUShort();
                    var P = { glyphIndex: s.parseUShort(), xScale: 1, scale01: 0, scale10: 0, yScale: 1, dx: 0, dy: 0 };
                    (1 & i) > 0
                        ? (2 & i) > 0
                            ? ((P.dx = s.parseShort()), (P.dy = s.parseShort()))
                            : (P.matchedPoints = [s.parseUShort(), s.parseUShort()])
                        : (2 & i) > 0
                        ? ((P.dx = s.parseChar()), (P.dy = s.parseChar()))
                        : (P.matchedPoints = [s.parseByte(), s.parseByte()]),
                        (8 & i) > 0
                            ? (P.xScale = P.yScale = s.parseF2Dot14())
                            : (64 & i) > 0
                            ? ((P.xScale = s.parseF2Dot14()), (P.yScale = s.parseF2Dot14()))
                            : (128 & i) > 0 &&
                              ((P.xScale = s.parseF2Dot14()),
                              (P.scale01 = s.parseF2Dot14()),
                              (P.scale10 = s.parseF2Dot14()),
                              (P.yScale = s.parseF2Dot14())),
                        e.components.push(P),
                        (x = !!(32 & i));
                }
                if (256 & i) {
                    (e.instructionLength = s.parseUShort()), (e.instructions = []);
                    for (var w = 0; w < e.instructionLength; w += 1) e.instructions.push(s.parseByte());
                }
            }
        }
        function Ct(e, t) {
            for (var r = [], i = 0; i < e.length; i += 1) {
                var a = e[i],
                    s = {
                        x: t.xScale * a.x + t.scale01 * a.y + t.dx,
                        y: t.scale10 * a.x + t.yScale * a.y + t.dy,
                        onCurve: a.onCurve,
                        lastPointOfContour: a.lastPointOfContour,
                    };
                r.push(s);
            }
            return r;
        }
        function Nt(e) {
            var t = new O();
            if (!e) return t;
            for (
                var r = (function (e) {
                        for (var t = [], r = [], i = 0; i < e.length; i += 1) {
                            var a = e[i];
                            r.push(a), a.lastPointOfContour && (t.push(r), (r = []));
                        }
                        return C.argument(0 === r.length, "There are still points left in the current contour."), t;
                    })(e),
                    i = 0;
                i < r.length;
                ++i
            ) {
                var a = r[i],
                    s = null,
                    n = a[a.length - 1],
                    o = a[0];
                if (n.onCurve) t.moveTo(n.x, n.y);
                else if (o.onCurve) t.moveTo(o.x, o.y);
                else {
                    var p = { x: 0.5 * (n.x + o.x), y: 0.5 * (n.y + o.y) };
                    t.moveTo(p.x, p.y);
                }
                for (var l = 0; l < a.length; ++l)
                    if (((s = n), (n = o), (o = a[(l + 1) % a.length]), n.onCurve)) t.lineTo(n.x, n.y);
                    else {
                        var h = o;
                        s.onCurve || { x: 0.5 * (n.x + s.x), y: 0.5 * (n.y + s.y) },
                            o.onCurve || (h = { x: 0.5 * (n.x + o.x), y: 0.5 * (n.y + o.y) }),
                            t.quadraticCurveTo(n.x, n.y, h.x, h.y);
                    }
                t.closePath();
            }
            return t;
        }
        function Lt(e, t) {
            if (t.isComposite)
                for (var r = 0; r < t.components.length; r += 1) {
                    var i = t.components[r],
                        a = e.get(i.glyphIndex);
                    if ((a.getPath(), a.points)) {
                        var s = undefined;
                        if (undefined === i.matchedPoints) s = Ct(a.points, i);
                        else {
                            if (i.matchedPoints[0] > t.points.length - 1 || i.matchedPoints[1] > a.points.length - 1)
                                throw Error("Matched points out of range in " + t.name);
                            var n = t.points[i.matchedPoints[0]],
                                o = a.points[i.matchedPoints[1]],
                                p = {
                                    xScale: i.xScale,
                                    scale01: i.scale01,
                                    scale10: i.scale10,
                                    yScale: i.yScale,
                                    dx: 0,
                                    dy: 0,
                                };
                            (o = Ct([o], p)[0]), (p.dx = n.x - o.x), (p.dy = n.y - o.y), (s = Ct(a.points, p));
                        }
                        t.points = t.points.concat(s);
                    }
                }
            return Nt(t.points);
        }
        (Pt.prototype = {
            searchTag: vt,
            binSearch: bt,
            getTable: function (e) {
                var t = this.font.tables[this.tableName];
                return !t && e && (t = this.font.tables[this.tableName] = this.createDefaultTable()), t;
            },
            getScriptNames: function () {
                var e = this.getTable();
                return e
                    ? e.scripts.map(function (e) {
                          return e.tag;
                      })
                    : [];
            },
            getDefaultScriptName: function () {
                var e = this.getTable();
                if (e) {
                    for (var t = false, r = 0; r < e.scripts.length; r++) {
                        var i = e.scripts[r].tag;
                        if ("DFLT" === i) return i;
                        "latn" === i && (t = true);
                    }
                    return t ? "latn" : undefined;
                }
            },
            getScriptTable: function (e, t) {
                var r = this.getTable(t);
                if (r) {
                    e = e || "DFLT";
                    var i = r.scripts,
                        a = vt(r.scripts, e);
                    if (a >= 0) return i[a].script;
                    if (t) {
                        var s = {
                            tag: e,
                            script: {
                                defaultLangSys: { reserved: 0, reqFeatureIndex: 65535, featureIndexes: [] },
                                langSysRecords: [],
                            },
                        };
                        return i.splice(-1 - a, 0, s), s.script;
                    }
                }
            },
            getLangSysTable: function (e, t, r) {
                var i = this.getScriptTable(e, r);
                if (i) {
                    if (!t || "dflt" === t || "DFLT" === t) return i.defaultLangSys;
                    var a = vt(i.langSysRecords, t);
                    if (a >= 0) return i.langSysRecords[a].langSys;
                    if (r) {
                        var s = { tag: t, langSys: { reserved: 0, reqFeatureIndex: 65535, featureIndexes: [] } };
                        return i.langSysRecords.splice(-1 - a, 0, s), s.langSys;
                    }
                }
            },
            getFeatureTable: function (e, t, r, i) {
                var a = this.getLangSysTable(e, t, i);
                if (a) {
                    for (
                        var s, n = a.featureIndexes, o = this.font.tables[this.tableName].features, p = 0;
                        p < n.length;
                        p++
                    )
                        if ((s = o[n[p]]).tag === r) return s.feature;
                    if (i) {
                        var l = o.length;
                        return (
                            C.assert(0 === l || r >= o[l - 1].tag, "Features must be added in alphabetical order."),
                            (s = { tag: r, feature: { params: 0, lookupListIndexes: [] } }),
                            o.push(s),
                            n.push(l),
                            s.feature
                        );
                    }
                }
            },
            getLookupTables: function (e, t, r, i, a) {
                var s = this.getFeatureTable(e, t, r, a),
                    n = [];
                if (s) {
                    for (
                        var o, p = s.lookupListIndexes, l = this.font.tables[this.tableName].lookups, h = 0;
                        h < p.length;
                        h++
                    )
                        (o = l[p[h]]).lookupType === i && n.push(o);
                    if (0 === n.length && a) {
                        o = { lookupType: i, lookupFlag: 0, subtables: [], markFilteringSet: undefined };
                        var c = l.length;
                        return l.push(o), p.push(c), [o];
                    }
                }
                return n;
            },
            getGlyphClass: function (e, t) {
                switch (e.format) {
                    case 1:
                        return e.startGlyph <= t && t < e.startGlyph + e.classes.length
                            ? e.classes[t - e.startGlyph]
                            : 0;
                    case 2:
                        var r = xt(e.ranges, t);
                        return r ? r.classId : 0;
                }
            },
            getCoverageIndex: function (e, t) {
                switch (e.format) {
                    case 1:
                        var r = bt(e.glyphs, t);
                        return r >= 0 ? r : -1;
                    case 2:
                        var i = xt(e.ranges, t);
                        return i ? i.index + t - i.start : -1;
                }
            },
            expandCoverage: function (e) {
                if (1 === e.format) return e.glyphs;
                for (var t = [], r = e.ranges, i = 0; i < r.length; i++)
                    for (var a = r[i], s = a.start, n = a.end, o = s; o <= n; o++) t.push(o);
                return t;
            },
        }),
            (wt.prototype = Pt.prototype),
            (wt.prototype.init = function () {
                var e = this.getDefaultScriptName();
                this.defaultKerningTables = this.getKerningTables(e);
            }),
            (wt.prototype.getKerningValue = function (e, t, r) {
                for (var i = 0; i < e.length; i++)
                    for (var a = e[i].subtables, s = 0; s < a.length; s++) {
                        var n = a[s],
                            o = this.getCoverageIndex(n.coverage, t);
                        if (!(o < 0))
                            switch (n.posFormat) {
                                case 1:
                                    for (var p = n.pairSets[o], l = 0; l < p.length; l++) {
                                        var h = p[l];
                                        if (h.secondGlyph === r) return (h.value1 && h.value1.xAdvance) || 0;
                                    }
                                    break;
                                case 2:
                                    var c = this.getGlyphClass(n.classDef1, t),
                                        u = this.getGlyphClass(n.classDef2, r),
                                        d = n.classRecords[c][u];
                                    return (d.value1 && d.value1.xAdvance) || 0;
                            }
                    }
                return 0;
            }),
            (wt.prototype.getKerningTables = function (e, t) {
                if (this.font.tables.gpos) return this.getLookupTables(e, t, "kern", 2);
            }),
            (St.prototype = Pt.prototype),
            (St.prototype.createDefaultTable = function () {
                return {
                    version: 1,
                    scripts: [
                        {
                            tag: "DFLT",
                            script: {
                                defaultLangSys: { reserved: 0, reqFeatureIndex: 65535, featureIndexes: [] },
                                langSysRecords: [],
                            },
                        },
                    ],
                    features: [],
                    lookups: [],
                };
            }),
            (St.prototype.getSingle = function (e, t, r) {
                for (var i = [], a = this.getLookupTables(t, r, e, 1), s = 0; s < a.length; s++)
                    for (var n = a[s].subtables, o = 0; o < n.length; o++) {
                        var p = n[o],
                            l = this.expandCoverage(p.coverage),
                            h = undefined;
                        if (1 === p.substFormat) {
                            var c = p.deltaGlyphId;
                            for (h = 0; h < l.length; h++) {
                                var u = l[h];
                                i.push({ sub: u, by: u + c });
                            }
                        } else {
                            var d = p.substitute;
                            for (h = 0; h < l.length; h++) i.push({ sub: l[h], by: d[h] });
                        }
                    }
                return i;
            }),
            (St.prototype.getAlternates = function (e, t, r) {
                for (var i = [], a = this.getLookupTables(t, r, e, 3), s = 0; s < a.length; s++)
                    for (var n = a[s].subtables, o = 0; o < n.length; o++)
                        for (
                            var p = n[o], l = this.expandCoverage(p.coverage), h = p.alternateSets, c = 0;
                            c < l.length;
                            c++
                        )
                            i.push({ sub: l[c], by: h[c] });
                return i;
            }),
            (St.prototype.getLigatures = function (e, t, r) {
                for (var i = [], a = this.getLookupTables(t, r, e, 4), s = 0; s < a.length; s++)
                    for (var n = a[s].subtables, o = 0; o < n.length; o++)
                        for (
                            var p = n[o], l = this.expandCoverage(p.coverage), h = p.ligatureSets, c = 0;
                            c < l.length;
                            c++
                        )
                            for (var u = l[c], d = h[c], f = 0; f < d.length; f++) {
                                var m = d[f];
                                i.push({ sub: [u].concat(m.components), by: m.ligGlyph });
                            }
                return i;
            }),
            (St.prototype.addSingle = function (e, t, r, i) {
                var a = Tt(this.getLookupTables(r, i, e, 1, true)[0], 2, {
                    substFormat: 2,
                    coverage: { format: 1, glyphs: [] },
                    substitute: [],
                });
                C.assert(
                    1 === a.coverage.format,
                    "Ligature: unable to modify coverage table format " + a.coverage.format
                );
                var s = t.sub,
                    n = this.binSearch(a.coverage.glyphs, s);
                n < 0 && ((n = -1 - n), a.coverage.glyphs.splice(n, 0, s), a.substitute.splice(n, 0, 0)),
                    (a.substitute[n] = t.by);
            }),
            (St.prototype.addAlternate = function (e, t, r, i) {
                var a = Tt(this.getLookupTables(r, i, e, 3, true)[0], 1, {
                    substFormat: 1,
                    coverage: { format: 1, glyphs: [] },
                    alternateSets: [],
                });
                C.assert(
                    1 === a.coverage.format,
                    "Ligature: unable to modify coverage table format " + a.coverage.format
                );
                var s = t.sub,
                    n = this.binSearch(a.coverage.glyphs, s);
                n < 0 && ((n = -1 - n), a.coverage.glyphs.splice(n, 0, s), a.alternateSets.splice(n, 0, 0)),
                    (a.alternateSets[n] = t.by);
            }),
            (St.prototype.addLigature = function (e, t, r, i) {
                var a = this.getLookupTables(r, i, e, 4, true)[0],
                    s = a.subtables[0];
                s ||
                    ((s = { substFormat: 1, coverage: { format: 1, glyphs: [] }, ligatureSets: [] }),
                    (a.subtables[0] = s)),
                    C.assert(
                        1 === s.coverage.format,
                        "Ligature: unable to modify coverage table format " + s.coverage.format
                    );
                var n = t.sub[0],
                    o = t.sub.slice(1),
                    p = { ligGlyph: t.by, components: o },
                    l = this.binSearch(s.coverage.glyphs, n);
                if (l >= 0) {
                    for (var h = s.ligatureSets[l], c = 0; c < h.length; c++) if (Et(h[c].components, o)) return;
                    h.push(p);
                } else (l = -1 - l), s.coverage.glyphs.splice(l, 0, n), s.ligatureSets.splice(l, 0, [p]);
            }),
            (St.prototype.getFeature = function (e, t, r) {
                if (/ss\d\d/.test(e)) return this.getSingle(e, t, r);
                switch (e) {
                    case "aalt":
                    case "salt":
                        return this.getSingle(e, t, r).concat(this.getAlternates(e, t, r));
                    case "dlig":
                    case "liga":
                    case "rlig":
                        return this.getLigatures(e, t, r);
                }
            }),
            (St.prototype.add = function (e, t, r, i) {
                if (/ss\d\d/.test(e)) return this.addSingle(e, t, r, i);
                switch (e) {
                    case "aalt":
                    case "salt":
                        return "number" == typeof t.by ? this.addSingle(e, t, r, i) : this.addAlternate(e, t, r, i);
                    case "dlig":
                    case "liga":
                    case "rlig":
                        return this.addLigature(e, t, r, i);
                }
            });
        var Mt,
            Ut,
            It,
            jt,
            At = {
                getPath: Nt,
                parse: function (e, t, r, i) {
                    for (var a = new xe.GlyphSet(i), s = 0; s < r.length - 1; s += 1) {
                        var n = r[s];
                        n !== r[s + 1]
                            ? a.push(s, xe.ttfGlyphLoader(i, s, Rt, e, t + n, Lt))
                            : a.push(s, xe.glyphLoader(i, s));
                    }
                    return a;
                },
            };
        function Dt(e) {
            (this.font = e),
                (this.getCommands = function (e) {
                    return At.getPath(e).commands;
                }),
                (this._fpgmState = this._prepState = undefined),
                (this._errorState = 0);
        }
        function Bt(e) {
            return e;
        }
        function _t(e) {
            return Math.sign(e) * Math.round(Math.abs(e));
        }
        function Ft(e) {
            return (Math.sign(e) * Math.round(Math.abs(2 * e))) / 2;
        }
        function Gt(e) {
            return Math.sign(e) * (Math.round(Math.abs(e) + 0.5) - 0.5);
        }
        function Vt(e) {
            return Math.sign(e) * Math.ceil(Math.abs(e));
        }
        function Ht(e) {
            return Math.sign(e) * Math.floor(Math.abs(e));
        }
        var zt = function (e) {
                var t = this.srPeriod,
                    r = this.srPhase,
                    i = this.srThreshold,
                    a = 1;
                return (
                    e < 0 && ((e = -e), (a = -1)),
                    (e += i - r),
                    (e = Math.trunc(e / t) * t),
                    (e += r) < 0 ? r * a : e * a
                );
            },
            qt = {
                x: 1,
                y: 0,
                axis: "x",
                distance: function (e, t, r, i) {
                    return (r ? e.xo : e.x) - (i ? t.xo : t.x);
                },
                interpolate: function (e, t, r, i) {
                    var a, s, n, o, p, l, h;
                    if (!i || i === this)
                        return (
                            (a = e.xo - t.xo),
                            (s = e.xo - r.xo),
                            (p = t.x - t.xo),
                            (l = r.x - r.xo),
                            0 === (h = (n = Math.abs(a)) + (o = Math.abs(s)))
                                ? void (e.x = e.xo + (p + l) / 2)
                                : void (e.x = e.xo + (p * o + l * n) / h)
                        );
                    (a = i.distance(e, t, true, true)),
                        (s = i.distance(e, r, true, true)),
                        (p = i.distance(t, t, false, true)),
                        (l = i.distance(r, r, false, true)),
                        0 !== (h = (n = Math.abs(a)) + (o = Math.abs(s)))
                            ? qt.setRelative(e, e, (p * o + l * n) / h, i, true)
                            : qt.setRelative(e, e, (p + l) / 2, i, true);
                },
                normalSlope: Number.NEGATIVE_INFINITY,
                setRelative: function (e, t, r, i, a) {
                    if (i && i !== this) {
                        var s = a ? t.xo : t.x,
                            n = a ? t.yo : t.y,
                            o = s + r * i.x,
                            p = n + r * i.y;
                        e.x = o + (e.y - p) / i.normalSlope;
                    } else e.x = (a ? t.xo : t.x) + r;
                },
                slope: 0,
                touch: function (e) {
                    e.xTouched = true;
                },
                touched: function (e) {
                    return e.xTouched;
                },
                untouch: function (e) {
                    e.xTouched = false;
                },
            },
            Wt = {
                x: 0,
                y: 1,
                axis: "y",
                distance: function (e, t, r, i) {
                    return (r ? e.yo : e.y) - (i ? t.yo : t.y);
                },
                interpolate: function (e, t, r, i) {
                    var a, s, n, o, p, l, h;
                    if (!i || i === this)
                        return (
                            (a = e.yo - t.yo),
                            (s = e.yo - r.yo),
                            (p = t.y - t.yo),
                            (l = r.y - r.yo),
                            0 === (h = (n = Math.abs(a)) + (o = Math.abs(s)))
                                ? void (e.y = e.yo + (p + l) / 2)
                                : void (e.y = e.yo + (p * o + l * n) / h)
                        );
                    (a = i.distance(e, t, true, true)),
                        (s = i.distance(e, r, true, true)),
                        (p = i.distance(t, t, false, true)),
                        (l = i.distance(r, r, false, true)),
                        0 !== (h = (n = Math.abs(a)) + (o = Math.abs(s)))
                            ? Wt.setRelative(e, e, (p * o + l * n) / h, i, true)
                            : Wt.setRelative(e, e, (p + l) / 2, i, true);
                },
                normalSlope: 0,
                setRelative: function (e, t, r, i, a) {
                    if (i && i !== this) {
                        var s = a ? t.xo : t.x,
                            n = a ? t.yo : t.y,
                            o = s + r * i.x,
                            p = n + r * i.y;
                        e.y = p + i.normalSlope * (e.x - o);
                    } else e.y = (a ? t.yo : t.y) + r;
                },
                slope: Number.POSITIVE_INFINITY,
                touch: function (e) {
                    e.yTouched = true;
                },
                touched: function (e) {
                    return e.yTouched;
                },
                untouch: function (e) {
                    e.yTouched = false;
                },
            };
        function Xt(e, t) {
            (this.x = e),
                (this.y = t),
                (this.axis = undefined),
                (this.slope = t / e),
                (this.normalSlope = -e / t),
                Object.freeze(this);
        }
        function Yt(e, t) {
            var r = Math.sqrt(e * e + t * t);
            return (t /= r), 1 === (e /= r) && 0 === t ? qt : 0 === e && 1 === t ? Wt : new Xt(e, t);
        }
        function Jt(e, t, r, i) {
            (this.x = this.xo = Math.round(64 * e) / 64),
                (this.y = this.yo = Math.round(64 * t) / 64),
                (this.lastPointOfContour = r),
                (this.onCurve = i),
                (this.prevPointOnContour = undefined),
                (this.nextPointOnContour = undefined),
                (this.xTouched = false),
                (this.yTouched = false),
                Object.preventExtensions(this);
        }
        Object.freeze(qt),
            Object.freeze(Wt),
            (Xt.prototype.distance = function (e, t, r, i) {
                return this.x * qt.distance(e, t, r, i) + this.y * Wt.distance(e, t, r, i);
            }),
            (Xt.prototype.interpolate = function (e, t, r, i) {
                var a, s, n, o, p, l, h;
                (n = i.distance(e, t, true, true)),
                    (o = i.distance(e, r, true, true)),
                    (a = i.distance(t, t, false, true)),
                    (s = i.distance(r, r, false, true)),
                    0 !== (h = (p = Math.abs(n)) + (l = Math.abs(o)))
                        ? this.setRelative(e, e, (a * l + s * p) / h, i, true)
                        : this.setRelative(e, e, (a + s) / 2, i, true);
            }),
            (Xt.prototype.setRelative = function (e, t, r, i, a) {
                i = i || this;
                var s = a ? t.xo : t.x,
                    n = a ? t.yo : t.y,
                    o = s + r * i.x,
                    p = n + r * i.y,
                    l = i.normalSlope,
                    h = this.slope,
                    c = e.x,
                    u = e.y;
                (e.x = (h * c - l * o + p - u) / (h - l)), (e.y = h * (e.x - c) + u);
            }),
            (Xt.prototype.touch = function (e) {
                (e.xTouched = true), (e.yTouched = true);
            }),
            (Jt.prototype.nextTouched = function (e) {
                for (var t = this.nextPointOnContour; !e.touched(t) && t !== this; ) t = t.nextPointOnContour;
                return t;
            }),
            (Jt.prototype.prevTouched = function (e) {
                for (var t = this.prevPointOnContour; !e.touched(t) && t !== this; ) t = t.prevPointOnContour;
                return t;
            });
        var Kt = Object.freeze(new Jt(0, 0)),
            Qt = { cvCutIn: 17 / 16, deltaBase: 9, deltaShift: 0.125, loop: 1, minDis: 1, autoFlip: true };
        function $t(e, t) {
            switch (((this.env = e), (this.stack = []), (this.prog = t), e)) {
                case "glyf":
                    (this.zp0 = this.zp1 = this.zp2 = 1), (this.rp0 = this.rp1 = this.rp2 = 0);
                case "prep":
                    (this.fv = this.pv = this.dpv = qt), (this.round = _t);
            }
        }
        function er(e) {
            for (var t = (e.tZone = new Array(e.gZone.length)), r = 0; r < t.length; r++) t[r] = new Jt(0, 0);
        }
        function tr(e, t) {
            var r,
                i = e.prog,
                a = e.ip,
                s = 1;
            do {
                if (88 === (r = i[++a])) s++;
                else if (89 === r) s--;
                else if (64 === r) a += i[a + 1] + 1;
                else if (65 === r) a += 2 * i[a + 1] + 1;
                else if (r >= 176 && r <= 183) a += r - 176 + 1;
                else if (r >= 184 && r <= 191) a += 2 * (r - 184 + 1);
                else if (t && 1 === s && 27 === r) break;
            } while (s > 0);
            e.ip = a;
        }
        function rr(t, r) {
            e.DEBUG && console.log(r.step, "SVTCA[" + t.axis + "]"), (r.fv = r.pv = r.dpv = t);
        }
        function ir(t, r) {
            e.DEBUG && console.log(r.step, "SPVTCA[" + t.axis + "]"), (r.pv = r.dpv = t);
        }
        function ar(t, r) {
            e.DEBUG && console.log(r.step, "SFVTCA[" + t.axis + "]"), (r.fv = t);
        }
        function sr(t, r) {
            var i,
                a,
                s = r.stack,
                n = s.pop(),
                o = s.pop(),
                p = r.z2[n],
                l = r.z1[o];
            e.DEBUG && console.log("SPVTL[" + t + "]", n, o),
                t ? ((i = p.y - l.y), (a = l.x - p.x)) : ((i = l.x - p.x), (a = l.y - p.y)),
                (r.pv = r.dpv = Yt(i, a));
        }
        function nr(t, r) {
            var i,
                a,
                s = r.stack,
                n = s.pop(),
                o = s.pop(),
                p = r.z2[n],
                l = r.z1[o];
            e.DEBUG && console.log("SFVTL[" + t + "]", n, o),
                t ? ((i = p.y - l.y), (a = l.x - p.x)) : ((i = l.x - p.x), (a = l.y - p.y)),
                (r.fv = Yt(i, a));
        }
        function or(t) {
            e.DEBUG && console.log(t.step, "POP[]"), t.stack.pop();
        }
        function pr(t, r) {
            var i = r.stack.pop(),
                a = r.z0[i],
                s = r.fv,
                n = r.pv;
            e.DEBUG && console.log(r.step, "MDAP[" + t + "]", i);
            var o = n.distance(a, Kt);
            t && (o = r.round(o)), s.setRelative(a, Kt, o, n), s.touch(a), (r.rp0 = r.rp1 = i);
        }
        function lr(t, r) {
            var i,
                a,
                s,
                n = r.z2,
                o = n.length - 2;
            e.DEBUG && console.log(r.step, "IUP[" + t.axis + "]");
            for (var p = 0; p < o; p++)
                (i = n[p]),
                    t.touched(i) ||
                        ((a = i.prevTouched(t)) !== i &&
                            (a === (s = i.nextTouched(t)) &&
                                t.setRelative(i, i, t.distance(a, a, false, true), t, true),
                            t.interpolate(i, a, s, t)));
        }
        function hr(t, r) {
            for (
                var i = r.stack,
                    a = t ? r.rp1 : r.rp2,
                    s = (t ? r.z0 : r.z1)[a],
                    n = r.fv,
                    o = r.pv,
                    p = r.loop,
                    l = r.z2;
                p--;

            ) {
                var h = i.pop(),
                    c = l[h],
                    u = o.distance(s, s, false, true);
                n.setRelative(c, c, u, o),
                    n.touch(c),
                    e.DEBUG &&
                        console.log(
                            r.step,
                            (r.loop > 1 ? "loop " + (r.loop - p) + ": " : "") + "SHP[" + (t ? "rp1" : "rp2") + "]",
                            h
                        );
            }
            r.loop = 1;
        }
        function cr(t, r) {
            var i = r.stack,
                a = t ? r.rp1 : r.rp2,
                s = (t ? r.z0 : r.z1)[a],
                n = r.fv,
                o = r.pv,
                p = i.pop(),
                l = r.z2[r.contours[p]],
                h = l;
            e.DEBUG && console.log(r.step, "SHC[" + t + "]", p);
            var c = o.distance(s, s, false, true);
            do {
                h !== s && n.setRelative(h, h, c, o), (h = h.nextPointOnContour);
            } while (h !== l);
        }
        function ur(t, r) {
            var i,
                a,
                s = r.stack,
                n = t ? r.rp1 : r.rp2,
                o = (t ? r.z0 : r.z1)[n],
                p = r.fv,
                l = r.pv,
                h = s.pop();
            switch ((e.DEBUG && console.log(r.step, "SHZ[" + t + "]", h), h)) {
                case 0:
                    i = r.tZone;
                    break;
                case 1:
                    i = r.gZone;
                    break;
                default:
                    throw new Error("Invalid zone");
            }
            for (var c = l.distance(o, o, false, true), u = i.length - 2, d = 0; d < u; d++)
                (a = i[d]), p.setRelative(a, a, c, l);
        }
        function dr(t, r) {
            var i = r.stack,
                a = i.pop() / 64,
                s = i.pop(),
                n = r.z1[s],
                o = r.z0[r.rp0],
                p = r.fv,
                l = r.pv;
            p.setRelative(n, o, a, l),
                p.touch(n),
                e.DEBUG && console.log(r.step, "MSIRP[" + t + "]", a, s),
                (r.rp1 = r.rp0),
                (r.rp2 = s),
                t && (r.rp0 = s);
        }
        function fr(t, r) {
            var i = r.stack,
                a = i.pop(),
                s = i.pop(),
                n = r.z0[s],
                o = r.fv,
                p = r.pv,
                l = r.cvt[a];
            e.DEBUG && console.log(r.step, "MIAP[" + t + "]", a, "(", l, ")", s);
            var h = p.distance(n, Kt);
            t && (Math.abs(h - l) < r.cvCutIn && (h = l), (h = r.round(h))),
                o.setRelative(n, Kt, h, p),
                0 === r.zp0 && ((n.xo = n.x), (n.yo = n.y)),
                o.touch(n),
                (r.rp0 = r.rp1 = s);
        }
        function mr(t, r) {
            var i = r.stack,
                a = i.pop(),
                s = r.z2[a];
            e.DEBUG && console.log(r.step, "GC[" + t + "]", a), i.push(64 * r.dpv.distance(s, Kt, t, false));
        }
        function yr(t, r) {
            var i = r.stack,
                a = i.pop(),
                s = i.pop(),
                n = r.z1[a],
                o = r.z0[s],
                p = r.dpv.distance(o, n, t, t);
            e.DEBUG && console.log(r.step, "MD[" + t + "]", a, s, "->", p), r.stack.push(Math.round(64 * p));
        }
        function gr(t, r) {
            var i = r.stack,
                a = i.pop(),
                s = r.fv,
                n = r.pv,
                o = r.ppem,
                p = r.deltaBase + 16 * (t - 1),
                l = r.deltaShift,
                h = r.z0;
            e.DEBUG && console.log(r.step, "DELTAP[" + t + "]", a, i);
            for (var c = 0; c < a; c++) {
                var u = i.pop(),
                    d = i.pop();
                if (p + ((240 & d) >> 4) === o) {
                    var f = (15 & d) - 8;
                    f >= 0 && f++, e.DEBUG && console.log(r.step, "DELTAPFIX", u, "by", f * l);
                    var m = h[u];
                    s.setRelative(m, m, f * l, n);
                }
            }
        }
        function vr(t, r) {
            var i = r.stack,
                a = i.pop();
            e.DEBUG && console.log(r.step, "ROUND[]"), i.push(64 * r.round(a / 64));
        }
        function br(t, r) {
            var i = r.stack,
                a = i.pop(),
                s = r.ppem,
                n = r.deltaBase + 16 * (t - 1),
                o = r.deltaShift;
            e.DEBUG && console.log(r.step, "DELTAC[" + t + "]", a, i);
            for (var p = 0; p < a; p++) {
                var l = i.pop(),
                    h = i.pop();
                if (n + ((240 & h) >> 4) === s) {
                    var c = (15 & h) - 8;
                    c >= 0 && c++;
                    var u = c * o;
                    e.DEBUG && console.log(r.step, "DELTACFIX", l, "by", u), (r.cvt[l] += u);
                }
            }
        }
        function xr(t, r) {
            var i,
                a,
                s = r.stack,
                n = s.pop(),
                o = s.pop(),
                p = r.z2[n],
                l = r.z1[o];
            e.DEBUG && console.log(r.step, "SDPVTL[" + t + "]", n, o),
                t ? ((i = p.y - l.y), (a = l.x - p.x)) : ((i = l.x - p.x), (a = l.y - p.y)),
                (r.dpv = Yt(i, a));
        }
        function Pr(t, r) {
            var i = r.stack,
                a = r.prog,
                s = r.ip;
            e.DEBUG && console.log(r.step, "PUSHB[" + t + "]");
            for (var n = 0; n < t; n++) i.push(a[++s]);
            r.ip = s;
        }
        function wr(t, r) {
            var i = r.ip,
                a = r.prog,
                s = r.stack;
            e.DEBUG && console.log(r.ip, "PUSHW[" + t + "]");
            for (var n = 0; n < t; n++) {
                var o = (a[++i] << 8) | a[++i];
                32768 & o && (o = -(1 + (65535 ^ o))), s.push(o);
            }
            r.ip = i;
        }
        function Sr(t, r, i, a, s, n) {
            var o,
                p,
                l,
                h,
                c = n.stack,
                u = t && c.pop(),
                d = c.pop(),
                f = n.rp0,
                m = n.z0[f],
                y = n.z1[d],
                g = n.minDis,
                v = n.fv,
                b = n.dpv;
            (l = (p = o = b.distance(y, m, true, true)) >= 0 ? 1 : -1),
                (p = Math.abs(p)),
                t && ((h = n.cvt[u]), a && Math.abs(p - h) < n.cvCutIn && (p = h)),
                i && p < g && (p = g),
                a && (p = n.round(p)),
                v.setRelative(y, m, l * p, b),
                v.touch(y),
                e.DEBUG &&
                    console.log(
                        n.step,
                        (t ? "MIRP[" : "MDRP[") +
                            (r ? "M" : "m") +
                            (i ? ">" : "_") +
                            (a ? "R" : "_") +
                            (0 === s ? "Gr" : 1 === s ? "Bl" : 2 === s ? "Wh" : "") +
                            "]",
                        t ? u + "(" + n.cvt[u] + "," + h + ")" : "",
                        d,
                        "(d =",
                        o,
                        "->",
                        l * p,
                        ")"
                    ),
                (n.rp1 = n.rp0),
                (n.rp2 = d),
                r && (n.rp0 = d);
        }
        function Er(e) {
            (this.char = e), (this.state = {}), (this.activeState = null);
        }
        function Tr(e, t, r) {
            (this.contextName = r), (this.startIndex = e), (this.endOffset = t);
        }
        function kr(e, t) {
            (this.context = e),
                (this.index = t),
                (this.length = e.length),
                (this.current = e[t]),
                (this.backtrack = e.slice(0, t)),
                (this.lookahead = e.slice(t + 1));
        }
        function Or(e) {
            (this.eventId = e), (this.subscribers = []);
        }
        function Zr(e) {
            (this.tokens = []),
                (this.registeredContexts = {}),
                (this.contextCheckers = []),
                (this.events = {}),
                (this.registeredModifiers = []),
                function (e) {
                    var t = this,
                        r = [
                            "start",
                            "end",
                            "next",
                            "newToken",
                            "contextStart",
                            "contextEnd",
                            "insertToken",
                            "removeToken",
                            "removeRange",
                            "replaceToken",
                            "replaceRange",
                            "composeRUD",
                            "updateContextsRanges",
                        ];
                    r.forEach(function (e) {
                        Object.defineProperty(t.events, e, { value: new Or(e) });
                    }),
                        e &&
                            r.forEach(function (r) {
                                var i = e[r];
                                "function" == typeof i && t.events[r].subscribe(i);
                            }),
                        [
                            "insertToken",
                            "removeToken",
                            "removeRange",
                            "replaceToken",
                            "replaceRange",
                            "composeRUD",
                        ].forEach(function (e) {
                            t.events[e].subscribe(t.updateContextsRanges);
                        });
                }.call(this, e);
        }
        function Rr(e) {
            return /[\u0600-\u065F\u066A-\u06D2\u06FA-\u06FF]/.test(e);
        }
        function Cr(e) {
            return /[\u0630\u0690\u0621\u0631\u0661\u0671\u0622\u0632\u0672\u0692\u06C2\u0623\u0673\u0693\u06C3\u0624\u0694\u06C4\u0625\u0675\u0695\u06C5\u06E5\u0676\u0696\u06C6\u0627\u0677\u0697\u06C7\u0648\u0688\u0698\u06C8\u0689\u0699\u06C9\u068A\u06CA\u066B\u068B\u06CB\u068C\u068D\u06CD\u06FD\u068E\u06EE\u06FE\u062F\u068F\u06CF\u06EF]/.test(
                e
            );
        }
        function Nr(e) {
            return /[\u0600-\u0605\u060C-\u060E\u0610-\u061B\u061E\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/.test(
                e
            );
        }
        (Dt.prototype.exec = function (t, r) {
            if ("number" != typeof r) throw new Error("Point size is not a number!");
            if (!(this._errorState > 2)) {
                var i = this.font,
                    a = this._prepState;
                if (!a || a.ppem !== r) {
                    var s = this._fpgmState;
                    if (!s) {
                        ($t.prototype = Qt),
                            ((s = this._fpgmState = new $t("fpgm", i.tables.fpgm)).funcs = []),
                            (s.font = i),
                            e.DEBUG && (console.log("---EXEC FPGM---"), (s.step = -1));
                        try {
                            Ut(s);
                        } catch (e) {
                            return console.log("Hinting error in FPGM:" + e), void (this._errorState = 3);
                        }
                    }
                    ($t.prototype = s), ((a = this._prepState = new $t("prep", i.tables.prep)).ppem = r);
                    var n = i.tables.cvt;
                    if (n)
                        for (var o = (a.cvt = new Array(n.length)), p = r / i.unitsPerEm, l = 0; l < n.length; l++)
                            o[l] = n[l] * p;
                    else a.cvt = [];
                    e.DEBUG && (console.log("---EXEC PREP---"), (a.step = -1));
                    try {
                        Ut(a);
                    } catch (e) {
                        this._errorState < 2 && console.log("Hinting error in PREP:" + e), (this._errorState = 2);
                    }
                }
                if (!(this._errorState > 1))
                    try {
                        return It(t, a);
                    } catch (e) {
                        return (
                            this._errorState < 1 &&
                                (console.log("Hinting error:" + e),
                                console.log("Note: further hinting errors are silenced")),
                            void (this._errorState = 1)
                        );
                    }
            }
        }),
            (It = function (t, r) {
                var i,
                    a,
                    s,
                    n = r.ppem / r.font.unitsPerEm,
                    o = n,
                    p = t.components;
                if ((($t.prototype = r), p)) {
                    var l = r.font;
                    (a = []), (i = []);
                    for (var h = 0; h < p.length; h++) {
                        var c = p[h],
                            u = l.glyphs.get(c.glyphIndex);
                        (s = new $t("glyf", u.instructions)),
                            e.DEBUG && (console.log("---EXEC COMP " + h + "---"), (s.step = -1)),
                            jt(u, s, n, o);
                        for (
                            var d = Math.round(c.dx * n), f = Math.round(c.dy * o), m = s.gZone, y = s.contours, g = 0;
                            g < m.length;
                            g++
                        ) {
                            var v = m[g];
                            (v.xTouched = v.yTouched = false), (v.xo = v.x = v.x + d), (v.yo = v.y = v.y + f);
                        }
                        var b = a.length;
                        a.push.apply(a, m);
                        for (var x = 0; x < y.length; x++) i.push(y[x] + b);
                    }
                    t.instructions &&
                        !s.inhibitGridFit &&
                        (((s = new $t("glyf", t.instructions)).gZone = s.z0 = s.z1 = s.z2 = a),
                        (s.contours = i),
                        a.push(new Jt(0, 0), new Jt(Math.round(t.advanceWidth * n), 0)),
                        e.DEBUG && (console.log("---EXEC COMPOSITE---"), (s.step = -1)),
                        Ut(s),
                        (a.length -= 2));
                } else
                    (s = new $t("glyf", t.instructions)),
                        e.DEBUG && (console.log("---EXEC GLYPH---"), (s.step = -1)),
                        jt(t, s, n, o),
                        (a = s.gZone);
                return a;
            }),
            (jt = function (t, r, i, a) {
                for (
                    var s,
                        n,
                        o,
                        p = t.points || [],
                        l = p.length,
                        h = (r.gZone = r.z0 = r.z1 = r.z2 = []),
                        c = (r.contours = []),
                        u = 0;
                    u < l;
                    u++
                )
                    (s = p[u]), (h[u] = new Jt(s.x * i, s.y * a, s.lastPointOfContour, s.onCurve));
                for (var d = 0; d < l; d++)
                    (s = h[d]),
                        n || ((n = s), c.push(d)),
                        s.lastPointOfContour
                            ? ((s.nextPointOnContour = n), (n.prevPointOnContour = s), (n = undefined))
                            : ((o = h[d + 1]), (s.nextPointOnContour = o), (o.prevPointOnContour = s));
                if (!r.inhibitGridFit) {
                    if (e.DEBUG) {
                        console.log("PROCESSING GLYPH", r.stack);
                        for (var f = 0; f < l; f++) console.log(f, h[f].x, h[f].y);
                    }
                    if (
                        (h.push(new Jt(0, 0), new Jt(Math.round(t.advanceWidth * i), 0)),
                        Ut(r),
                        (h.length -= 2),
                        e.DEBUG)
                    ) {
                        console.log("FINISHED GLYPH", r.stack);
                        for (var m = 0; m < l; m++) console.log(m, h[m].x, h[m].y);
                    }
                }
            }),
            (Ut = function (t) {
                var r = t.prog;
                if (r) {
                    var i,
                        a = r.length;
                    for (t.ip = 0; t.ip < a; t.ip++) {
                        if ((e.DEBUG && t.step++, !(i = Mt[r[t.ip]])))
                            throw new Error("unknown instruction: 0x" + Number(r[t.ip]).toString(16));
                        i(t);
                    }
                }
            }),
            (Mt = [
                rr.bind(undefined, Wt),
                rr.bind(undefined, qt),
                ir.bind(undefined, Wt),
                ir.bind(undefined, qt),
                ar.bind(undefined, Wt),
                ar.bind(undefined, qt),
                sr.bind(undefined, 0),
                sr.bind(undefined, 1),
                nr.bind(undefined, 0),
                nr.bind(undefined, 1),
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "SPVFS[]", i, a), (t.pv = t.dpv = Yt(a, i));
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "SPVFS[]", i, a), (t.fv = Yt(a, i));
                },
                function (t) {
                    var r = t.stack,
                        i = t.pv;
                    e.DEBUG && console.log(t.step, "GPV[]"), r.push(16384 * i.x), r.push(16384 * i.y);
                },
                function (t) {
                    var r = t.stack,
                        i = t.fv;
                    e.DEBUG && console.log(t.step, "GFV[]"), r.push(16384 * i.x), r.push(16384 * i.y);
                },
                function (t) {
                    (t.fv = t.pv), e.DEBUG && console.log(t.step, "SFVTPV[]");
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop(),
                        s = r.pop(),
                        n = r.pop(),
                        o = r.pop(),
                        p = t.z0,
                        l = t.z1,
                        h = p[i],
                        c = p[a],
                        u = l[s],
                        d = l[n],
                        f = t.z2[o];
                    e.DEBUG && console.log("ISECT[], ", i, a, s, n, o);
                    var m = h.x,
                        y = h.y,
                        g = c.x,
                        v = c.y,
                        b = u.x,
                        x = u.y,
                        P = d.x,
                        w = d.y,
                        S = (m - g) * (x - w) - (y - v) * (b - P),
                        E = m * v - y * g,
                        T = b * w - x * P;
                    (f.x = (E * (b - P) - T * (m - g)) / S), (f.y = (E * (x - w) - T * (y - v)) / S);
                },
                function (t) {
                    (t.rp0 = t.stack.pop()), e.DEBUG && console.log(t.step, "SRP0[]", t.rp0);
                },
                function (t) {
                    (t.rp1 = t.stack.pop()), e.DEBUG && console.log(t.step, "SRP1[]", t.rp1);
                },
                function (t) {
                    (t.rp2 = t.stack.pop()), e.DEBUG && console.log(t.step, "SRP2[]", t.rp2);
                },
                function (t) {
                    var r = t.stack.pop();
                    switch ((e.DEBUG && console.log(t.step, "SZP0[]", r), (t.zp0 = r), r)) {
                        case 0:
                            t.tZone || er(t), (t.z0 = t.tZone);
                            break;
                        case 1:
                            t.z0 = t.gZone;
                            break;
                        default:
                            throw new Error("Invalid zone pointer");
                    }
                },
                function (t) {
                    var r = t.stack.pop();
                    switch ((e.DEBUG && console.log(t.step, "SZP1[]", r), (t.zp1 = r), r)) {
                        case 0:
                            t.tZone || er(t), (t.z1 = t.tZone);
                            break;
                        case 1:
                            t.z1 = t.gZone;
                            break;
                        default:
                            throw new Error("Invalid zone pointer");
                    }
                },
                function (t) {
                    var r = t.stack.pop();
                    switch ((e.DEBUG && console.log(t.step, "SZP2[]", r), (t.zp2 = r), r)) {
                        case 0:
                            t.tZone || er(t), (t.z2 = t.tZone);
                            break;
                        case 1:
                            t.z2 = t.gZone;
                            break;
                        default:
                            throw new Error("Invalid zone pointer");
                    }
                },
                function (t) {
                    var r = t.stack.pop();
                    switch ((e.DEBUG && console.log(t.step, "SZPS[]", r), (t.zp0 = t.zp1 = t.zp2 = r), r)) {
                        case 0:
                            t.tZone || er(t), (t.z0 = t.z1 = t.z2 = t.tZone);
                            break;
                        case 1:
                            t.z0 = t.z1 = t.z2 = t.gZone;
                            break;
                        default:
                            throw new Error("Invalid zone pointer");
                    }
                },
                function (t) {
                    (t.loop = t.stack.pop()), e.DEBUG && console.log(t.step, "SLOOP[]", t.loop);
                },
                function (t) {
                    e.DEBUG && console.log(t.step, "RTG[]"), (t.round = _t);
                },
                function (t) {
                    e.DEBUG && console.log(t.step, "RTHG[]"), (t.round = Gt);
                },
                function (t) {
                    var r = t.stack.pop();
                    e.DEBUG && console.log(t.step, "SMD[]", r), (t.minDis = r / 64);
                },
                function (t) {
                    e.DEBUG && console.log(t.step, "ELSE[]"), tr(t, false);
                },
                function (t) {
                    var r = t.stack.pop();
                    e.DEBUG && console.log(t.step, "JMPR[]", r), (t.ip += r - 1);
                },
                function (t) {
                    var r = t.stack.pop();
                    e.DEBUG && console.log(t.step, "SCVTCI[]", r), (t.cvCutIn = r / 64);
                },
                undefined,
                undefined,
                function (t) {
                    var r = t.stack;
                    e.DEBUG && console.log(t.step, "DUP[]"), r.push(r[r.length - 1]);
                },
                or,
                function (t) {
                    e.DEBUG && console.log(t.step, "CLEAR[]"), (t.stack.length = 0);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "SWAP[]"), r.push(i), r.push(a);
                },
                function (t) {
                    var r = t.stack;
                    e.DEBUG && console.log(t.step, "DEPTH[]"), r.push(r.length);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop();
                    e.DEBUG && console.log(t.step, "CINDEX[]", i), r.push(r[r.length - i]);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop();
                    e.DEBUG && console.log(t.step, "MINDEX[]", i), r.push(r.splice(r.length - i, 1)[0]);
                },
                undefined,
                undefined,
                undefined,
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "LOOPCALL[]", i, a);
                    var s = t.ip,
                        n = t.prog;
                    t.prog = t.funcs[i];
                    for (var o = 0; o < a; o++)
                        Ut(t), e.DEBUG && console.log(++t.step, o + 1 < a ? "next loopcall" : "done loopcall", o);
                    (t.ip = s), (t.prog = n);
                },
                function (t) {
                    var r = t.stack.pop();
                    e.DEBUG && console.log(t.step, "CALL[]", r);
                    var i = t.ip,
                        a = t.prog;
                    (t.prog = t.funcs[r]),
                        Ut(t),
                        (t.ip = i),
                        (t.prog = a),
                        e.DEBUG && console.log(++t.step, "returning from", r);
                },
                function (t) {
                    if ("fpgm" !== t.env) throw new Error("FDEF not allowed here");
                    var r = t.stack,
                        i = t.prog,
                        a = t.ip,
                        s = r.pop(),
                        n = a;
                    for (e.DEBUG && console.log(t.step, "FDEF[]", s); 45 !== i[++a]; );
                    (t.ip = a), (t.funcs[s] = i.slice(n + 1, a));
                },
                undefined,
                pr.bind(undefined, 0),
                pr.bind(undefined, 1),
                lr.bind(undefined, Wt),
                lr.bind(undefined, qt),
                hr.bind(undefined, 0),
                hr.bind(undefined, 1),
                cr.bind(undefined, 0),
                cr.bind(undefined, 1),
                ur.bind(undefined, 0),
                ur.bind(undefined, 1),
                function (t) {
                    for (var r = t.stack, i = t.loop, a = t.fv, s = r.pop() / 64, n = t.z2; i--; ) {
                        var o = r.pop(),
                            p = n[o];
                        e.DEBUG &&
                            console.log(t.step, (t.loop > 1 ? "loop " + (t.loop - i) + ": " : "") + "SHPIX[]", o, s),
                            a.setRelative(p, p, s),
                            a.touch(p);
                    }
                    t.loop = 1;
                },
                function (t) {
                    for (
                        var r = t.stack,
                            i = t.rp1,
                            a = t.rp2,
                            s = t.loop,
                            n = t.z0[i],
                            o = t.z1[a],
                            p = t.fv,
                            l = t.dpv,
                            h = t.z2;
                        s--;

                    ) {
                        var c = r.pop(),
                            u = h[c];
                        e.DEBUG &&
                            console.log(
                                t.step,
                                (t.loop > 1 ? "loop " + (t.loop - s) + ": " : "") + "IP[]",
                                c,
                                i,
                                "<->",
                                a
                            ),
                            p.interpolate(u, n, o, l),
                            p.touch(u);
                    }
                    t.loop = 1;
                },
                dr.bind(undefined, 0),
                dr.bind(undefined, 1),
                function (t) {
                    for (var r = t.stack, i = t.rp0, a = t.z0[i], s = t.loop, n = t.fv, o = t.pv, p = t.z1; s--; ) {
                        var l = r.pop(),
                            h = p[l];
                        e.DEBUG &&
                            console.log(t.step, (t.loop > 1 ? "loop " + (t.loop - s) + ": " : "") + "ALIGNRP[]", l),
                            n.setRelative(h, a, 0, o),
                            n.touch(h);
                    }
                    t.loop = 1;
                },
                function (t) {
                    e.DEBUG && console.log(t.step, "RTDG[]"), (t.round = Ft);
                },
                fr.bind(undefined, 0),
                fr.bind(undefined, 1),
                function (t) {
                    var r = t.prog,
                        i = t.ip,
                        a = t.stack,
                        s = r[++i];
                    e.DEBUG && console.log(t.step, "NPUSHB[]", s);
                    for (var n = 0; n < s; n++) a.push(r[++i]);
                    t.ip = i;
                },
                function (t) {
                    var r = t.ip,
                        i = t.prog,
                        a = t.stack,
                        s = i[++r];
                    e.DEBUG && console.log(t.step, "NPUSHW[]", s);
                    for (var n = 0; n < s; n++) {
                        var o = (i[++r] << 8) | i[++r];
                        32768 & o && (o = -(1 + (65535 ^ o))), a.push(o);
                    }
                    t.ip = r;
                },
                function (t) {
                    var r = t.stack,
                        i = t.store;
                    i || (i = t.store = []);
                    var a = r.pop(),
                        s = r.pop();
                    e.DEBUG && console.log(t.step, "WS", a, s), (i[s] = a);
                },
                function (t) {
                    var r = t.stack,
                        i = t.store,
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "RS", a);
                    var s = (i && i[a]) || 0;
                    r.push(s);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "WCVTP", i, a), (t.cvt[a] = i / 64);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop();
                    e.DEBUG && console.log(t.step, "RCVT", i), r.push(64 * t.cvt[i]);
                },
                mr.bind(undefined, 0),
                mr.bind(undefined, 1),
                undefined,
                yr.bind(undefined, 0),
                yr.bind(undefined, 1),
                function (t) {
                    e.DEBUG && console.log(t.step, "MPPEM[]"), t.stack.push(t.ppem);
                },
                undefined,
                function (t) {
                    e.DEBUG && console.log(t.step, "FLIPON[]"), (t.autoFlip = true);
                },
                undefined,
                undefined,
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "LT[]", i, a), r.push(a < i ? 1 : 0);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "LTEQ[]", i, a), r.push(a <= i ? 1 : 0);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "GT[]", i, a), r.push(a > i ? 1 : 0);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "GTEQ[]", i, a), r.push(a >= i ? 1 : 0);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "EQ[]", i, a), r.push(i === a ? 1 : 0);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "NEQ[]", i, a), r.push(i !== a ? 1 : 0);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop();
                    e.DEBUG && console.log(t.step, "ODD[]", i), r.push(Math.trunc(i) % 2 ? 1 : 0);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop();
                    e.DEBUG && console.log(t.step, "EVEN[]", i), r.push(Math.trunc(i) % 2 ? 0 : 1);
                },
                function (t) {
                    var r = t.stack.pop();
                    e.DEBUG && console.log(t.step, "IF[]", r),
                        r || (tr(t, true), e.DEBUG && console.log(t.step, "EIF[]"));
                },
                function (t) {
                    e.DEBUG && console.log(t.step, "EIF[]");
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "AND[]", i, a), r.push(i && a ? 1 : 0);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "OR[]", i, a), r.push(i || a ? 1 : 0);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop();
                    e.DEBUG && console.log(t.step, "NOT[]", i), r.push(i ? 0 : 1);
                },
                gr.bind(undefined, 1),
                function (t) {
                    var r = t.stack.pop();
                    e.DEBUG && console.log(t.step, "SDB[]", r), (t.deltaBase = r);
                },
                function (t) {
                    var r = t.stack.pop();
                    e.DEBUG && console.log(t.step, "SDS[]", r), (t.deltaShift = Math.pow(0.5, r));
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "ADD[]", i, a), r.push(a + i);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "SUB[]", i, a), r.push(a - i);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "DIV[]", i, a), r.push((64 * a) / i);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "MUL[]", i, a), r.push((a * i) / 64);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop();
                    e.DEBUG && console.log(t.step, "ABS[]", i), r.push(Math.abs(i));
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop();
                    e.DEBUG && console.log(t.step, "NEG[]", i), r.push(-i);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop();
                    e.DEBUG && console.log(t.step, "FLOOR[]", i), r.push(64 * Math.floor(i / 64));
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop();
                    e.DEBUG && console.log(t.step, "CEILING[]", i), r.push(64 * Math.ceil(i / 64));
                },
                vr.bind(undefined, 0),
                vr.bind(undefined, 1),
                vr.bind(undefined, 2),
                vr.bind(undefined, 3),
                undefined,
                undefined,
                undefined,
                undefined,
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "WCVTF[]", i, a), (t.cvt[a] = (i * t.ppem) / t.font.unitsPerEm);
                },
                gr.bind(undefined, 2),
                gr.bind(undefined, 3),
                br.bind(undefined, 1),
                br.bind(undefined, 2),
                br.bind(undefined, 3),
                function (t) {
                    var r,
                        i = t.stack.pop();
                    switch ((e.DEBUG && console.log(t.step, "SROUND[]", i), (t.round = zt), 192 & i)) {
                        case 0:
                            r = 0.5;
                            break;
                        case 64:
                            r = 1;
                            break;
                        case 128:
                            r = 2;
                            break;
                        default:
                            throw new Error("invalid SROUND value");
                    }
                    switch (((t.srPeriod = r), 48 & i)) {
                        case 0:
                            t.srPhase = 0;
                            break;
                        case 16:
                            t.srPhase = 0.25 * r;
                            break;
                        case 32:
                            t.srPhase = 0.5 * r;
                            break;
                        case 48:
                            t.srPhase = 0.75 * r;
                            break;
                        default:
                            throw new Error("invalid SROUND value");
                    }
                    (i &= 15), (t.srThreshold = 0 === i ? 0 : (i / 8 - 0.5) * r);
                },
                function (t) {
                    var r,
                        i = t.stack.pop();
                    switch ((e.DEBUG && console.log(t.step, "S45ROUND[]", i), (t.round = zt), 192 & i)) {
                        case 0:
                            r = Math.sqrt(2) / 2;
                            break;
                        case 64:
                            r = Math.sqrt(2);
                            break;
                        case 128:
                            r = 2 * Math.sqrt(2);
                            break;
                        default:
                            throw new Error("invalid S45ROUND value");
                    }
                    switch (((t.srPeriod = r), 48 & i)) {
                        case 0:
                            t.srPhase = 0;
                            break;
                        case 16:
                            t.srPhase = 0.25 * r;
                            break;
                        case 32:
                            t.srPhase = 0.5 * r;
                            break;
                        case 48:
                            t.srPhase = 0.75 * r;
                            break;
                        default:
                            throw new Error("invalid S45ROUND value");
                    }
                    (i &= 15), (t.srThreshold = 0 === i ? 0 : (i / 8 - 0.5) * r);
                },
                undefined,
                undefined,
                function (t) {
                    e.DEBUG && console.log(t.step, "ROFF[]"), (t.round = Bt);
                },
                undefined,
                function (t) {
                    e.DEBUG && console.log(t.step, "RUTG[]"), (t.round = Vt);
                },
                function (t) {
                    e.DEBUG && console.log(t.step, "RDTG[]"), (t.round = Ht);
                },
                or,
                or,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                function (t) {
                    var r = t.stack.pop();
                    e.DEBUG && console.log(t.step, "SCANCTRL[]", r);
                },
                xr.bind(undefined, 0),
                xr.bind(undefined, 1),
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = 0;
                    e.DEBUG && console.log(t.step, "GETINFO[]", i), 1 & i && (a = 35), 32 & i && (a |= 4096), r.push(a);
                },
                undefined,
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop(),
                        s = r.pop();
                    e.DEBUG && console.log(t.step, "ROLL[]"), r.push(a), r.push(i), r.push(s);
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "MAX[]", i, a), r.push(Math.max(a, i));
                },
                function (t) {
                    var r = t.stack,
                        i = r.pop(),
                        a = r.pop();
                    e.DEBUG && console.log(t.step, "MIN[]", i, a), r.push(Math.min(a, i));
                },
                function (t) {
                    var r = t.stack.pop();
                    e.DEBUG && console.log(t.step, "SCANTYPE[]", r);
                },
                function (t) {
                    var r = t.stack.pop(),
                        i = t.stack.pop();
                    switch ((e.DEBUG && console.log(t.step, "INSTCTRL[]", r, i), r)) {
                        case 1:
                            return void (t.inhibitGridFit = !!i);
                        case 2:
                            return void (t.ignoreCvt = !!i);
                        default:
                            throw new Error("invalid INSTCTRL[] selector");
                    }
                },
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                Pr.bind(undefined, 1),
                Pr.bind(undefined, 2),
                Pr.bind(undefined, 3),
                Pr.bind(undefined, 4),
                Pr.bind(undefined, 5),
                Pr.bind(undefined, 6),
                Pr.bind(undefined, 7),
                Pr.bind(undefined, 8),
                wr.bind(undefined, 1),
                wr.bind(undefined, 2),
                wr.bind(undefined, 3),
                wr.bind(undefined, 4),
                wr.bind(undefined, 5),
                wr.bind(undefined, 6),
                wr.bind(undefined, 7),
                wr.bind(undefined, 8),
                Sr.bind(undefined, 0, 0, 0, 0, 0),
                Sr.bind(undefined, 0, 0, 0, 0, 1),
                Sr.bind(undefined, 0, 0, 0, 0, 2),
                Sr.bind(undefined, 0, 0, 0, 0, 3),
                Sr.bind(undefined, 0, 0, 0, 1, 0),
                Sr.bind(undefined, 0, 0, 0, 1, 1),
                Sr.bind(undefined, 0, 0, 0, 1, 2),
                Sr.bind(undefined, 0, 0, 0, 1, 3),
                Sr.bind(undefined, 0, 0, 1, 0, 0),
                Sr.bind(undefined, 0, 0, 1, 0, 1),
                Sr.bind(undefined, 0, 0, 1, 0, 2),
                Sr.bind(undefined, 0, 0, 1, 0, 3),
                Sr.bind(undefined, 0, 0, 1, 1, 0),
                Sr.bind(undefined, 0, 0, 1, 1, 1),
                Sr.bind(undefined, 0, 0, 1, 1, 2),
                Sr.bind(undefined, 0, 0, 1, 1, 3),
                Sr.bind(undefined, 0, 1, 0, 0, 0),
                Sr.bind(undefined, 0, 1, 0, 0, 1),
                Sr.bind(undefined, 0, 1, 0, 0, 2),
                Sr.bind(undefined, 0, 1, 0, 0, 3),
                Sr.bind(undefined, 0, 1, 0, 1, 0),
                Sr.bind(undefined, 0, 1, 0, 1, 1),
                Sr.bind(undefined, 0, 1, 0, 1, 2),
                Sr.bind(undefined, 0, 1, 0, 1, 3),
                Sr.bind(undefined, 0, 1, 1, 0, 0),
                Sr.bind(undefined, 0, 1, 1, 0, 1),
                Sr.bind(undefined, 0, 1, 1, 0, 2),
                Sr.bind(undefined, 0, 1, 1, 0, 3),
                Sr.bind(undefined, 0, 1, 1, 1, 0),
                Sr.bind(undefined, 0, 1, 1, 1, 1),
                Sr.bind(undefined, 0, 1, 1, 1, 2),
                Sr.bind(undefined, 0, 1, 1, 1, 3),
                Sr.bind(undefined, 1, 0, 0, 0, 0),
                Sr.bind(undefined, 1, 0, 0, 0, 1),
                Sr.bind(undefined, 1, 0, 0, 0, 2),
                Sr.bind(undefined, 1, 0, 0, 0, 3),
                Sr.bind(undefined, 1, 0, 0, 1, 0),
                Sr.bind(undefined, 1, 0, 0, 1, 1),
                Sr.bind(undefined, 1, 0, 0, 1, 2),
                Sr.bind(undefined, 1, 0, 0, 1, 3),
                Sr.bind(undefined, 1, 0, 1, 0, 0),
                Sr.bind(undefined, 1, 0, 1, 0, 1),
                Sr.bind(undefined, 1, 0, 1, 0, 2),
                Sr.bind(undefined, 1, 0, 1, 0, 3),
                Sr.bind(undefined, 1, 0, 1, 1, 0),
                Sr.bind(undefined, 1, 0, 1, 1, 1),
                Sr.bind(undefined, 1, 0, 1, 1, 2),
                Sr.bind(undefined, 1, 0, 1, 1, 3),
                Sr.bind(undefined, 1, 1, 0, 0, 0),
                Sr.bind(undefined, 1, 1, 0, 0, 1),
                Sr.bind(undefined, 1, 1, 0, 0, 2),
                Sr.bind(undefined, 1, 1, 0, 0, 3),
                Sr.bind(undefined, 1, 1, 0, 1, 0),
                Sr.bind(undefined, 1, 1, 0, 1, 1),
                Sr.bind(undefined, 1, 1, 0, 1, 2),
                Sr.bind(undefined, 1, 1, 0, 1, 3),
                Sr.bind(undefined, 1, 1, 1, 0, 0),
                Sr.bind(undefined, 1, 1, 1, 0, 1),
                Sr.bind(undefined, 1, 1, 1, 0, 2),
                Sr.bind(undefined, 1, 1, 1, 0, 3),
                Sr.bind(undefined, 1, 1, 1, 1, 0),
                Sr.bind(undefined, 1, 1, 1, 1, 1),
                Sr.bind(undefined, 1, 1, 1, 1, 2),
                Sr.bind(undefined, 1, 1, 1, 1, 3),
            ]),
            (Er.prototype.setState = function (e, t) {
                return (this.state[e] = t), (this.activeState = { key: e, value: this.state[e] }), this.activeState;
            }),
            (Er.prototype.getState = function (e) {
                return this.state[e] || null;
            }),
            (Zr.prototype.inboundIndex = function (e) {
                return e >= 0 && e < this.tokens.length;
            }),
            (Zr.prototype.composeRUD = function (e) {
                var t = this,
                    r = e.map(function (e) {
                        return t[e[0]].apply(t, e.slice(1).concat(true));
                    }),
                    i = function (e) {
                        return "object" == typeof e && e.hasOwnProperty("FAIL");
                    };
                if (r.every(i))
                    return {
                        FAIL: "composeRUD: one or more operations hasn't completed successfully",
                        report: r.filter(i),
                    };
                this.dispatch("composeRUD", [
                    r.filter(function (e) {
                        return !i(e);
                    }),
                ]);
            }),
            (Zr.prototype.replaceRange = function (e, t, r, i) {
                t = null !== t ? t : this.tokens.length;
                var a = r.every(function (e) {
                    return e instanceof Er;
                });
                if (!isNaN(e) && this.inboundIndex(e) && a) {
                    var s = this.tokens.splice.apply(this.tokens, [e, t].concat(r));
                    return i || this.dispatch("replaceToken", [e, t, r]), [s, r];
                }
                return { FAIL: "replaceRange: invalid tokens or startIndex." };
            }),
            (Zr.prototype.replaceToken = function (e, t, r) {
                if (!isNaN(e) && this.inboundIndex(e) && t instanceof Er) {
                    var i = this.tokens.splice(e, 1, t);
                    return r || this.dispatch("replaceToken", [e, t]), [i[0], t];
                }
                return { FAIL: "replaceToken: invalid token or index." };
            }),
            (Zr.prototype.removeRange = function (e, t, r) {
                t = isNaN(t) ? this.tokens.length : t;
                var i = this.tokens.splice(e, t);
                return r || this.dispatch("removeRange", [i, e, t]), i;
            }),
            (Zr.prototype.removeToken = function (e, t) {
                if (!isNaN(e) && this.inboundIndex(e)) {
                    var r = this.tokens.splice(e, 1);
                    return t || this.dispatch("removeToken", [r, e]), r;
                }
                return { FAIL: "removeToken: invalid token index." };
            }),
            (Zr.prototype.insertToken = function (e, t, r) {
                return e.every(function (e) {
                    return e instanceof Er;
                })
                    ? (this.tokens.splice.apply(this.tokens, [t, 0].concat(e)),
                      r || this.dispatch("insertToken", [e, t]),
                      e)
                    : { FAIL: "insertToken: invalid token(s)." };
            }),
            (Zr.prototype.registerModifier = function (e, t, r) {
                this.events.newToken.subscribe(function (i, a) {
                    var s = [i, a],
                        n = [i, a];
                    if (null === t || true === t.apply(this, s)) {
                        var o = r.apply(this, n);
                        i.setState(e, o);
                    }
                }),
                    this.registeredModifiers.push(e);
            }),
            (Or.prototype.subscribe = function (e) {
                return "function" == typeof e
                    ? this.subscribers.push(e) - 1
                    : { FAIL: "invalid '" + this.eventId + "' event handler" };
            }),
            (Or.prototype.unsubscribe = function (e) {
                this.subscribers.splice(e, 1);
            }),
            (kr.prototype.setCurrentIndex = function (e) {
                (this.index = e),
                    (this.current = this.context[e]),
                    (this.backtrack = this.context.slice(0, e)),
                    (this.lookahead = this.context.slice(e + 1));
            }),
            (kr.prototype.get = function (e) {
                switch (true) {
                    case 0 === e:
                        return this.current;
                    case e < 0 && Math.abs(e) <= this.backtrack.length:
                        return this.backtrack.slice(e)[0];
                    case e > 0 && e <= this.lookahead.length:
                        return this.lookahead[e - 1];
                    default:
                        return null;
                }
            }),
            (Zr.prototype.rangeToText = function (e) {
                if (e instanceof Tr)
                    return this.getRangeTokens(e)
                        .map(function (e) {
                            return e.char;
                        })
                        .join("");
            }),
            (Zr.prototype.getText = function () {
                return this.tokens
                    .map(function (e) {
                        return e.char;
                    })
                    .join("");
            }),
            (Zr.prototype.getContext = function (e) {
                var t = this.registeredContexts[e];
                return t || null;
            }),
            (Zr.prototype.on = function (e, t) {
                var r = this.events[e];
                return r ? r.subscribe(t) : null;
            }),
            (Zr.prototype.dispatch = function (e, t) {
                var r = this,
                    i = this.events[e];
                i instanceof Or &&
                    i.subscribers.forEach(function (e) {
                        e.apply(r, t || []);
                    });
            }),
            (Zr.prototype.registerContextChecker = function (e, t, r) {
                if (this.getContext(e)) return { FAIL: "context name '" + e + "' is already registered." };
                if ("function" != typeof t) return { FAIL: "missing context start check." };
                if ("function" != typeof r) return { FAIL: "missing context end check." };
                var i = new (function (e, t, r) {
                    (this.contextName = e),
                        (this.openRange = null),
                        (this.ranges = []),
                        (this.checkStart = t),
                        (this.checkEnd = r);
                })(e, t, r);
                return (this.registeredContexts[e] = i), this.contextCheckers.push(i), i;
            }),
            (Zr.prototype.getRangeTokens = function (e) {
                var t = e.startIndex + e.endOffset;
                return [].concat(this.tokens.slice(e.startIndex, t));
            }),
            (Zr.prototype.getContextRanges = function (e) {
                var t = this.getContext(e);
                return t ? t.ranges : { FAIL: "context checker '" + e + "' is not registered." };
            }),
            (Zr.prototype.resetContextsRanges = function () {
                var e = this.registeredContexts;
                for (var t in e) {
                    if (e.hasOwnProperty(t)) e[t].ranges = [];
                }
            }),
            (Zr.prototype.updateContextsRanges = function () {
                this.resetContextsRanges();
                for (
                    var e = this.tokens.map(function (e) {
                            return e.char;
                        }),
                        t = 0;
                    t < e.length;
                    t++
                ) {
                    var r = new kr(e, t);
                    this.runContextCheck(r);
                }
                this.dispatch("updateContextsRanges", [this.registeredContexts]);
            }),
            (Zr.prototype.setEndOffset = function (e, t) {
                var r = new Tr(this.getContext(t).openRange.startIndex, e, t),
                    i = this.getContext(t).ranges;
                return (r.rangeId = t + "." + i.length), i.push(r), (this.getContext(t).openRange = null), r;
            }),
            (Zr.prototype.runContextCheck = function (e) {
                var t = this,
                    r = e.index;
                this.contextCheckers.forEach(function (i) {
                    var a = i.contextName,
                        s = t.getContext(a).openRange;
                    if (
                        (!s &&
                            i.checkStart(e) &&
                            ((s = new Tr(r, null, a)),
                            (t.getContext(a).openRange = s),
                            t.dispatch("contextStart", [a, r])),
                        s && i.checkEnd(e))
                    ) {
                        var n = r - s.startIndex + 1,
                            o = t.setEndOffset(n, a);
                        t.dispatch("contextEnd", [a, o]);
                    }
                });
            }),
            (Zr.prototype.tokenize = function (e) {
                (this.tokens = []), this.resetContextsRanges();
                var t = Array.from(e);
                this.dispatch("start");
                for (var r = 0; r < t.length; r++) {
                    var i = t[r],
                        a = new kr(t, r);
                    this.dispatch("next", [a]), this.runContextCheck(a);
                    var s = new Er(i);
                    this.tokens.push(s), this.dispatch("newToken", [s, a]);
                }
                return this.dispatch("end", [this.tokens]), this.tokens;
            });
        var Lr = {
            arabicWordStartCheck: function (e) {
                var t = e.current,
                    r = e.get(-1);
                return (null === r && Rr(t)) || (!Rr(r) && Rr(t));
            },
            arabicWordEndCheck: function (e) {
                var t = e.get(1);
                return null === t || !Rr(t);
            },
        };
        var Mr = {
            arabicSentenceStartCheck: function (e) {
                var t = e.current,
                    r = e.get(-1);
                return (Rr(t) || Nr(t)) && !Rr(r);
            },
            arabicSentenceEndCheck: function (e) {
                var t = e.get(1);
                switch (true) {
                    case null === t:
                        return true;
                    case !Rr(t) && !Nr(t):
                        var r = /\s/.test(t);
                        if (!r) return true;
                        if (
                            r &&
                            !e.lookahead.some(function (e) {
                                return Rr(e) || Nr(e);
                            })
                        )
                            return true;
                        break;
                    default:
                        return false;
                }
            },
        };
        function Ur(e) {
            var t = this.features.arab,
                r = this.tokenizer.getRangeTokens(e);
            if (1 !== r.length) {
                var i = function (e, r, i) {
                        if (t.hasOwnProperty(e)) {
                            var a = (function (e) {
                                return 1 === e.length && 12 === e[0].id && e[0].substitution;
                            })(t[e].lookup(i) || null)[0];
                            return a >= 0 ? r.setState(e, a) : undefined;
                        }
                    },
                    a = new kr(r, 0),
                    s = new kr(
                        r.map(function (e) {
                            return e.char;
                        }),
                        0
                    );
                r.forEach(function (e, t) {
                    if (!Nr(e.char)) {
                        a.setCurrentIndex(t), s.setCurrentIndex(t);
                        var r = 0;
                        switch (
                            ((function (e) {
                                for (var t = [].concat(e.backtrack), r = t.length - 1; r >= 0; r--) {
                                    var i = t[r],
                                        a = Cr(i),
                                        s = Nr(i);
                                    if (!a && !s) return true;
                                    if (a) return false;
                                }
                                return false;
                            })(s) && (r |= 1),
                            (function (e) {
                                if (Cr(e.current)) return false;
                                for (var t = 0; t < e.lookahead.length; t++) if (!Nr(e.lookahead[t])) return true;
                                return false;
                            })(s) && (r |= 2),
                            r)
                        ) {
                            case 0:
                                return;
                            case 1:
                                i("fina", e, a);
                                break;
                            case 2:
                                i("init", e, a);
                                break;
                            case 3:
                                i("medi", e, a);
                        }
                    }
                });
            }
        }
        function Ir(e) {
            (this.baseDir = e || "ltr"), (this.tokenizer = new Zr()), (this.features = []);
        }
        function jr() {
            if (-1 === this.tokenizer.registeredModifiers.indexOf("glyphIndex"))
                throw new Error("glyphIndex modifier is required to apply arabic presentation features.");
        }
        function Ar() {
            var e = this;
            this.features.hasOwnProperty("arab") &&
                this.features.arab.hasOwnProperty("rlig") &&
                (jr.call(this),
                this.tokenizer.getContextRanges("arabicWord").forEach(function (t) {
                    (function (e) {
                        var t = this.features.arab;
                        if (t.hasOwnProperty("rlig"))
                            for (var r = this.tokenizer.getRangeTokens(e), i = 0; i < r.length; i++) {
                                var a = new kr(r, i),
                                    s = t.rlig.lookup(a) || null,
                                    n = 1 === s.length && 63 === s[0].id && s[0].substitution,
                                    o = 1 === s.length && 41 === s[0].id && s[0].substitution[0],
                                    p = r[i];
                                if (o) {
                                    p.setState("rlig", [o.ligGlyph]);
                                    for (var l = 0; l < o.components.length; l++) {
                                        var h = o.components[l],
                                            c = a.get(l + 1);
                                        c.activeState.value === h && (c.state.deleted = true);
                                    }
                                } else if (n) {
                                    var u = n && 1 === n.length && 12 === n[0].id && n[0].substitution;
                                    u && u >= 0 && p.setState("rlig", u);
                                }
                            }
                    }).call(e, t);
                }));
        }
        (Ir.prototype.setText = function (e) {
            this.text = e;
        }),
            (Ir.prototype.contextChecks = { arabicWordCheck: Lr, arabicSentenceCheck: Mr }),
            (Ir.prototype.subscribeArabicForms = function (e) {
                var t = this;
                this.tokenizer.events.contextEnd.subscribe(function (r, i) {
                    if ("arabicWord" === r) return Ur.call(t.tokenizer, i, e);
                });
            }),
            (Ir.prototype.applyFeatures = function (e) {
                for (var t = 0; t < e.length; t++) {
                    var r = e[t];
                    if (r) {
                        var i = r.script;
                        this.features[i] || (this.features[i] = {}), (this.features[i][r.tag] = r);
                    }
                }
            }),
            (Ir.prototype.registerModifier = function (e, t, r) {
                this.tokenizer.registerModifier(e, t, r);
            }),
            (Ir.prototype.processText = function (e) {
                (this.text && this.text === e) ||
                    (this.setText(e),
                    function () {
                        return (
                            function () {
                                var e = this.contextChecks.arabicWordCheck;
                                return this.tokenizer.registerContextChecker(
                                    "arabicWord",
                                    e.arabicWordStartCheck,
                                    e.arabicWordEndCheck
                                );
                            }.call(this),
                            function () {
                                var e = this.contextChecks.arabicSentenceCheck;
                                return this.tokenizer.registerContextChecker(
                                    "arabicSentence",
                                    e.arabicSentenceStartCheck,
                                    e.arabicSentenceEndCheck
                                );
                            }.call(this),
                            this.tokenizer.tokenize(this.text)
                        );
                    }.call(this),
                    function () {
                        var e = this;
                        this.features.hasOwnProperty("arab") &&
                            (jr.call(this),
                            this.tokenizer.getContextRanges("arabicWord").forEach(function (t) {
                                Ur.call(e, t);
                            }));
                    }.call(this),
                    Ar.call(this),
                    function () {
                        var e = this;
                        this.tokenizer.getContextRanges("arabicSentence").forEach(function (t) {
                            var r = e.tokenizer.getRangeTokens(t);
                            e.tokenizer.replaceRange(t.startIndex, t.endOffset, r.reverse());
                        });
                    }.call(this));
            }),
            (Ir.prototype.getBidiText = function (e) {
                return this.processText(e), this.tokenizer.getText();
            }),
            (Ir.prototype.getTextGlyphs = function (e) {
                this.processText(e);
                for (var t = [], r = 0; r < this.tokenizer.tokens.length; r++) {
                    var i = this.tokenizer.tokens[r];
                    if (!i.state.deleted) {
                        var a = i.activeState.value;
                        t.push(Array.isArray(a) ? a[0] : a);
                    }
                }
                return t;
            });
        var Dr = "ltr";
        function Br(e, t) {
            (this.font = e), (this.features = {}), (Dr = t || Dr);
        }
        function _r(e, t, r, i) {
            (this.tag = e), (this.featureRef = t), (this.lookups = r.lookups), (this.script = i);
        }
        function Fr(e) {
            this.table = e;
        }
        function Gr(e) {
            this.ligatureSets = e;
        }
        function Vr(e, t, r) {
            (this.lookups = e),
                (this.subtable = r),
                (this.lookupTable = t),
                r.hasOwnProperty("coverage") && (this.coverage = new Fr(r.coverage)),
                r.hasOwnProperty("inputCoverage") &&
                    (this.inputCoverage = r.inputCoverage.map(function (e) {
                        return new Fr(e);
                    })),
                r.hasOwnProperty("backtrackCoverage") &&
                    (this.backtrackCoverage = r.backtrackCoverage.map(function (e) {
                        return new Fr(e);
                    })),
                r.hasOwnProperty("lookaheadCoverage") &&
                    (this.lookaheadCoverage = r.lookaheadCoverage.map(function (e) {
                        return new Fr(e);
                    })),
                r.hasOwnProperty("ligatureSets") && (this.ligatureSets = new Gr(r.ligatureSets));
        }
        function Hr(e, t) {
            (this.index = e),
                (this.subtables = t[e].subtables.map(function (r) {
                    return new Vr(t, t[e], r);
                }));
        }
        function zr(e, t) {
            this.lookups = t.map(function (t) {
                return new Hr(t, e);
            });
        }
        function qr(e, t) {
            for (var r = [], i = 0; i < e.length; i++) {
                var a = e[i],
                    s = t.current.activeState.value;
                s = Array.isArray(s) ? s[0] : s;
                var n = a.lookup(s);
                -1 !== n && r.push(n);
            }
            return r.length !== e.length ? -1 : r;
        }
        function Wr(e) {
            (e = e || {}).empty ||
                (Ot(e.familyName, "When creating a new Font object, familyName is required."),
                Ot(e.styleName, "When creating a new Font object, styleName is required."),
                Ot(e.unitsPerEm, "When creating a new Font object, unitsPerEm is required."),
                Ot(e.ascender, "When creating a new Font object, ascender is required."),
                Ot(e.descender, "When creating a new Font object, descender is required."),
                Ot(e.descender < 0, "Descender should be negative (e.g. -512)."),
                (this.names = {
                    fontFamily: { en: e.familyName || " " },
                    fontSubfamily: { en: e.styleName || " " },
                    fullName: { en: e.fullName || e.familyName + " " + e.styleName },
                    postScriptName: { en: e.postScriptName || (e.familyName + e.styleName).replace(/\s/g, "") },
                    designer: { en: e.designer || " " },
                    designerURL: { en: e.designerURL || " " },
                    manufacturer: { en: e.manufacturer || " " },
                    manufacturerURL: { en: e.manufacturerURL || " " },
                    license: { en: e.license || " " },
                    licenseURL: { en: e.licenseURL || " " },
                    version: { en: e.version || "Version 0.1" },
                    description: { en: e.description || " " },
                    copyright: { en: e.copyright || " " },
                    trademark: { en: e.trademark || " " },
                }),
                (this.unitsPerEm = e.unitsPerEm || 1e3),
                (this.ascender = e.ascender),
                (this.descender = e.descender),
                (this.createdTimestamp = e.createdTimestamp),
                (this.tables = {
                    os2: {
                        usWeightClass: e.weightClass || this.usWeightClasses.MEDIUM,
                        usWidthClass: e.widthClass || this.usWidthClasses.MEDIUM,
                        fsSelection: e.fsSelection || this.fsSelectionValues.REGULAR,
                    },
                })),
                (this.supported = true),
                (this.glyphs = new xe.GlyphSet(this, e.glyphs || [])),
                (this.encoding = new ue(this)),
                (this.position = new wt(this)),
                (this.substitution = new St(this)),
                (this.tables = this.tables || {}),
                Object.defineProperty(this, "hinting", {
                    get: function () {
                        return this._hinting
                            ? this._hinting
                            : "truetype" === this.outlinesFormat
                            ? (this._hinting = new Dt(this))
                            : undefined;
                    },
                });
        }
        function Xr(e, t) {
            var r = JSON.stringify(e),
                i = 256;
            for (var a in t) {
                var s = parseInt(a);
                if (s && !(s < 256)) {
                    if (JSON.stringify(t[a]) === r) return s;
                    i <= s && (i = s + 1);
                }
            }
            return (t[i] = e), i;
        }
        function Yr(e, t, r) {
            var i = Xr(t.name, r);
            return [
                { name: "tag_" + e, type: "TAG", value: t.tag },
                { name: "minValue_" + e, type: "FIXED", value: t.minValue << 16 },
                { name: "defaultValue_" + e, type: "FIXED", value: t.defaultValue << 16 },
                { name: "maxValue_" + e, type: "FIXED", value: t.maxValue << 16 },
                { name: "flags_" + e, type: "USHORT", value: 0 },
                { name: "nameID_" + e, type: "USHORT", value: i },
            ];
        }
        function Jr(e, t, r) {
            var i = {},
                a = new se.Parser(e, t);
            return (
                (i.tag = a.parseTag()),
                (i.minValue = a.parseFixed()),
                (i.defaultValue = a.parseFixed()),
                (i.maxValue = a.parseFixed()),
                a.skip("uShort", 1),
                (i.name = r[a.parseUShort()] || {}),
                i
            );
        }
        function Kr(e, t, r, i) {
            for (
                var a = [
                        { name: "nameID_" + e, type: "USHORT", value: Xr(t.name, i) },
                        { name: "flags_" + e, type: "USHORT", value: 0 },
                    ],
                    s = 0;
                s < r.length;
                ++s
            ) {
                var n = r[s].tag;
                a.push({ name: "axis_" + e + " " + n, type: "FIXED", value: t.coordinates[n] << 16 });
            }
            return a;
        }
        function Qr(e, t, r, i) {
            var a = {},
                s = new se.Parser(e, t);
            (a.name = i[s.parseUShort()] || {}), s.skip("uShort", 1), (a.coordinates = {});
            for (var n = 0; n < r.length; ++n) a.coordinates[r[n].tag] = s.parseFixed();
            return a;
        }
        (Gr.prototype.lookup = function (e, t) {
            for (
                var r = this.ligatureSets[t],
                    i = function (e, t) {
                        if (e.length > t.length) return null;
                        for (var r = 0; r < e.length; r++) {
                            if (e[r] !== t[r]) return false;
                        }
                        return true;
                    },
                    a = 0;
                a < r.length;
                a++
            ) {
                var s = r[a],
                    n = e.lookahead.map(function (e) {
                        return e.activeState.value;
                    });
                if (("rtl" === Dr && n.reverse(), i(s.components, n))) return s;
            }
            return null;
        }),
            (Hr.prototype.lookup = function (e) {
                for (var t = [], r = 0; r < this.subtables.length; r++) {
                    var i = this.subtables[r].lookup(e);
                    (null !== i || i.length) && (t = t.concat(i));
                }
                return t;
            }),
            (Vr.prototype.lookup = function (e) {
                var t = [],
                    r = this.lookupTable.lookupType,
                    i = this.subtable.substFormat;
                if (1 === r && 2 === i) {
                    var a = function (e) {
                        var t = e.current.activeState.value;
                        t = Array.isArray(t) ? t[0] : t;
                        var r = this.coverage.lookup(t);
                        return -1 === r ? [] : [this.subtable.substitute[r]];
                    }.call(this, e);
                    a.length > 0 && t.push({ id: 12, substitution: a });
                }
                if (6 === r && 3 === i) {
                    var s = function (e) {
                        var t =
                            this.inputCoverage.length + this.lookaheadCoverage.length + this.backtrackCoverage.length;
                        if (e.context.length < t) return [];
                        var r = qr(this.inputCoverage, e);
                        if (-1 === r) return [];
                        var i = this.inputCoverage.length - 1;
                        if (e.lookahead.length < this.lookaheadCoverage.length) return [];
                        for (var a = e.lookahead.slice(i); a.length && Nr(a[0].char); ) a.shift();
                        var s = new kr(a, 0),
                            n = qr(this.lookaheadCoverage, s),
                            o = [].concat(e.backtrack);
                        for (o.reverse(); o.length && Nr(o[0].char); ) o.shift();
                        if (o.length < this.backtrackCoverage.length) return [];
                        var p = new kr(o, 0),
                            l = qr(this.backtrackCoverage, p),
                            h = [];
                        if (
                            r.length === this.inputCoverage.length &&
                            n.length === this.lookaheadCoverage.length &&
                            l.length === this.backtrackCoverage.length
                        )
                            for (var c = this.subtable.lookupRecords, u = 0; u < c.length; u++)
                                for (var d = c[u], f = 0; f < r.length; f++) {
                                    var m = new kr([e.get(f)], 0),
                                        y = new Hr(d.lookupListIndex, this.lookups).lookup(m);
                                    h = h.concat(y);
                                }
                        return h;
                    }.call(this, e);
                    s.length > 0 && t.push({ id: 63, substitution: s });
                }
                if (4 === r && 1 === i) {
                    var n = function (e) {
                        var t = e.current.activeState.value,
                            r = this.coverage.lookup(t);
                        if (-1 === r) return [];
                        var i = this.ligatureSets.lookup(e, r);
                        return i ? [i] : [];
                    }.call(this, e);
                    n.length > 0 && t.push({ id: 41, substitution: n });
                }
                return t;
            }),
            (Fr.prototype.lookup = function (e) {
                if (!e) return -1;
                switch (this.table.format) {
                    case 1:
                        return this.table.glyphs.indexOf(e);
                    case 2:
                        for (var t = this.table.ranges, r = 0; r < t.length; r++) {
                            var i = t[r];
                            if (e >= i.start && e <= i.end) {
                                var a = e - i.start;
                                return i.index + a;
                            }
                        }
                        break;
                    default:
                        return -1;
                }
                return -1;
            }),
            (_r.prototype.lookup = function (e) {
                for (var t = [], r = 0; r < this.lookups.length; r++) {
                    var i = this.lookups[r].lookup(e);
                    (null !== i || i.length) && (t = t.concat(i));
                }
                return t;
            }),
            (Br.prototype.getScriptFeaturesIndexes = function (e) {
                if (!e) return [];
                if (!this.font.tables.gsub) return [];
                for (var t = this.font.tables.gsub.scripts, r = 0; r < t.length; r++) {
                    var i = t[r];
                    if (i.tag === e) return i.script.defaultLangSys.featureIndexes;
                    var a = i.langSysRecords;
                    if (a)
                        for (var s = 0; s < a.length; s++) {
                            var n = a[s];
                            if (n.tag === e) return n.langSys.featureIndexes;
                        }
                }
                return [];
            }),
            (Br.prototype.mapTagsToFeatures = function (e, t) {
                for (var r = {}, i = 0; i < e.length; i++) {
                    var a = e[i].feature,
                        s = e[i].tag,
                        n = new zr(this.font.tables.gsub.lookups, a.lookupListIndexes);
                    r[s] = new _r(s, a, n, t);
                }
                this.features[t].tags = r;
            }),
            (Br.prototype.getScriptFeatures = function (e) {
                var t = this.features[e];
                if (this.features.hasOwnProperty(e)) return t;
                var r = this.getScriptFeaturesIndexes(e);
                if (!r) return null;
                var i = this.font.tables.gsub;
                return (
                    (t = r.map(function (e) {
                        return i.features[e];
                    })),
                    (this.features[e] = t),
                    this.mapTagsToFeatures(t, e),
                    t
                );
            }),
            (Br.prototype.getFeature = function (e) {
                return this.font
                    ? (this.features.hasOwnProperty(e.script) || this.getScriptFeatures(e.script),
                      this.features[e.script].tags[e.tag] || null)
                    : { FAIL: "No font was found" };
            }),
            (Wr.prototype.hasChar = function (e) {
                return null !== this.encoding.charToGlyphIndex(e);
            }),
            (Wr.prototype.charToGlyphIndex = function (e) {
                return this.encoding.charToGlyphIndex(e);
            }),
            (Wr.prototype.charToGlyph = function (e) {
                var t = this.charToGlyphIndex(e),
                    r = this.glyphs.get(t);
                return r || (r = this.glyphs.get(0)), r;
            }),
            (Wr.prototype.stringToGlyphs = function (e, t) {
                var r = this;
                t = t || this.defaultRenderOptions;
                var i = new Ir();
                i.registerModifier("glyphIndex", null, function (e) {
                    return r.charToGlyphIndex(e.char);
                });
                var a = new Br(this);
                i.applyFeatures(
                    ["init", "medi", "fina", "rlig"].map(function (e) {
                        var t = { tag: e, script: "arab" },
                            r = a.getFeature(t);
                        if (r) return r;
                    })
                );
                var s = i.getTextGlyphs(e),
                    n = s.length;
                if (t.features) {
                    var o = t.script || this.substitution.getDefaultScriptName(),
                        p = [];
                    t.features.liga && (p = p.concat(this.substitution.getFeature("liga", o, t.language))),
                        t.features.rlig && (p = p.concat(this.substitution.getFeature("rlig", o, t.language)));
                    for (var l = 0; l < n; l += 1)
                        for (var h = 0; h < p.length; h++) {
                            for (var c = p[h], u = c.sub, d = u.length, f = 0; f < d && u[f] === s[l + f]; ) f++;
                            f === d && (s.splice(l, d, c.by), (n = n - d + 1));
                        }
                }
                for (var m = new Array(n), y = this.glyphs.get(0), g = 0; g < n; g += 1) m[g] = r.glyphs.get(s[g]) || y;
                return m;
            }),
            (Wr.prototype.nameToGlyphIndex = function (e) {
                return this.glyphNames.nameToGlyphIndex(e);
            }),
            (Wr.prototype.nameToGlyph = function (e) {
                var t = this.nameToGlyphIndex(e),
                    r = this.glyphs.get(t);
                return r || (r = this.glyphs.get(0)), r;
            }),
            (Wr.prototype.glyphIndexToName = function (e) {
                return this.glyphNames.glyphIndexToName ? this.glyphNames.glyphIndexToName(e) : "";
            }),
            (Wr.prototype.getKerningValue = function (e, t) {
                (e = e.index || e), (t = t.index || t);
                var r = this.position.defaultKerningTables;
                return r ? this.position.getKerningValue(r, e, t) : this.kerningPairs[e + "," + t] || 0;
            }),
            (Wr.prototype.defaultRenderOptions = { kerning: true, features: { liga: true, rlig: true } }),
            (Wr.prototype.forEachGlyph = function (e, t, r, i, a, s) {
                (t = undefined !== t ? t : 0),
                    (r = undefined !== r ? r : 0),
                    (i = undefined !== i ? i : 72),
                    (a = a || this.defaultRenderOptions);
                var n,
                    o = (1 / this.unitsPerEm) * i,
                    p = this.stringToGlyphs(e, a);
                if (a.kerning) {
                    var l = a.script || this.position.getDefaultScriptName();
                    n = this.position.getKerningTables(l, a.language);
                }
                for (var h = 0; h < p.length; h += 1) {
                    var c = p[h];
                    if (
                        (s.call(this, c, t, r, i, a),
                        c.advanceWidth && (t += c.advanceWidth * o),
                        a.kerning && h < p.length - 1)
                    )
                        t +=
                            (n
                                ? this.position.getKerningValue(n, c.index, p[h + 1].index)
                                : this.getKerningValue(c, p[h + 1])) * o;
                    a.letterSpacing ? (t += a.letterSpacing * i) : a.tracking && (t += (a.tracking / 1e3) * i);
                }
                return t;
            }),
            (Wr.prototype.getPath = function (e, t, r, i, a) {
                var s = new O();
                return (
                    this.forEachGlyph(e, t, r, i, a, function (e, t, r, i) {
                        var n = e.getPath(t, r, i, a, this);
                        s.extend(n);
                    }),
                    s
                );
            }),
            (Wr.prototype.getPaths = function (e, t, r, i, a) {
                var s = [];
                return (
                    this.forEachGlyph(e, t, r, i, a, function (e, t, r, i) {
                        var n = e.getPath(t, r, i, a, this);
                        s.push(n);
                    }),
                    s
                );
            }),
            (Wr.prototype.getAdvanceWidth = function (e, t, r) {
                return this.forEachGlyph(e, 0, 0, t, r, function () {});
            }),
            (Wr.prototype.draw = function (e, t, r, i, a, s) {
                this.getPath(t, r, i, a, s).draw(e);
            }),
            (Wr.prototype.drawPoints = function (e, t, r, i, a, s) {
                this.forEachGlyph(t, r, i, a, s, function (t, r, i, a) {
                    t.drawPoints(e, r, i, a);
                });
            }),
            (Wr.prototype.drawMetrics = function (e, t, r, i, a, s) {
                this.forEachGlyph(t, r, i, a, s, function (t, r, i, a) {
                    t.drawMetrics(e, r, i, a);
                });
            }),
            (Wr.prototype.getEnglishName = function (e) {
                var t = this.names[e];
                if (t) return t.en;
            }),
            (Wr.prototype.validate = function () {
                var e = this;
                function t(t) {
                    var r = e.getEnglishName(t);
                    r && r.trim().length;
                }
                t("fontFamily"), t("weightName"), t("manufacturer"), t("copyright"), t("version"), this.unitsPerEm;
            }),
            (Wr.prototype.toTables = function () {
                return gt.fontToTable(this);
            }),
            (Wr.prototype.toBuffer = function () {
                return (
                    console.warn("Font.toBuffer is deprecated. Use Font.toArrayBuffer instead."), this.toArrayBuffer()
                );
            }),
            (Wr.prototype.toArrayBuffer = function () {
                for (
                    var e = this.toTables().encode(), t = new ArrayBuffer(e.length), r = new Uint8Array(t), i = 0;
                    i < e.length;
                    i++
                )
                    r[i] = e[i];
                return t;
            }),
            (Wr.prototype.download = function (e) {
                var t = this.getEnglishName("fontFamily"),
                    r = this.getEnglishName("fontSubfamily");
                e = e || t.replace(/\s/g, "") + "-" + r + ".otf";
                var i = this.toArrayBuffer();
                if ("undefined" != typeof window)
                    if (((window.URL = window.URL || window.webkitURL), window.URL)) {
                        var a = new DataView(i),
                            s = new Blob([a], { type: "font/opentype" }),
                            n = document.createElement("a");
                        (n.href = window.URL.createObjectURL(s)), (n.download = e);
                        var o = document.createEvent("MouseEvents");
                        o.initEvent("click", true, false), n.dispatchEvent(o);
                    } else console.warn("Font file could not be downloaded. Try using a different browser.");
                else {
                    var p = require("fs"),
                        l = (function (e) {
                            for (var t = new Buffer(e.byteLength), r = new Uint8Array(e), i = 0; i < t.length; ++i)
                                t[i] = r[i];
                            return t;
                        })(i);
                    p.writeFileSync(e, l);
                }
            }),
            (Wr.prototype.fsSelectionValues = {
                ITALIC: 1,
                UNDERSCORE: 2,
                NEGATIVE: 4,
                OUTLINED: 8,
                STRIKEOUT: 16,
                BOLD: 32,
                REGULAR: 64,
                USER_TYPO_METRICS: 128,
                WWS: 256,
                OBLIQUE: 512,
            }),
            (Wr.prototype.usWidthClasses = {
                ULTRA_CONDENSED: 1,
                EXTRA_CONDENSED: 2,
                CONDENSED: 3,
                SEMI_CONDENSED: 4,
                MEDIUM: 5,
                SEMI_EXPANDED: 6,
                EXPANDED: 7,
                EXTRA_EXPANDED: 8,
                ULTRA_EXPANDED: 9,
            }),
            (Wr.prototype.usWeightClasses = {
                THIN: 100,
                EXTRA_LIGHT: 200,
                LIGHT: 300,
                NORMAL: 400,
                MEDIUM: 500,
                SEMI_BOLD: 600,
                BOLD: 700,
                EXTRA_BOLD: 800,
                BLACK: 900,
            });
        var $r = {
                make: function (e, t) {
                    var r = new K.Table("fvar", [
                        { name: "version", type: "ULONG", value: 65536 },
                        { name: "offsetToData", type: "USHORT", value: 0 },
                        { name: "countSizePairs", type: "USHORT", value: 2 },
                        { name: "axisCount", type: "USHORT", value: e.axes.length },
                        { name: "axisSize", type: "USHORT", value: 20 },
                        { name: "instanceCount", type: "USHORT", value: e.instances.length },
                        { name: "instanceSize", type: "USHORT", value: 4 + 4 * e.axes.length },
                    ]);
                    r.offsetToData = r.sizeOf();
                    for (var i = 0; i < e.axes.length; i++) r.fields = r.fields.concat(Yr(i, e.axes[i], t));
                    for (var a = 0; a < e.instances.length; a++)
                        r.fields = r.fields.concat(Kr(a, e.instances[a], e.axes, t));
                    return r;
                },
                parse: function (e, t, r) {
                    var i = new se.Parser(e, t),
                        a = i.parseULong();
                    C.argument(65536 === a, "Unsupported fvar table version.");
                    var s = i.parseOffset16();
                    i.skip("uShort", 1);
                    for (
                        var n = i.parseUShort(),
                            o = i.parseUShort(),
                            p = i.parseUShort(),
                            l = i.parseUShort(),
                            h = [],
                            c = 0;
                        c < n;
                        c++
                    )
                        h.push(Jr(e, t + s + c * o, r));
                    for (var u = [], d = t + s + n * o, f = 0; f < p; f++) u.push(Qr(e, d + f * l, h, r));
                    return { axes: h, instances: u };
                },
            },
            ei = new Array(10);
        (ei[1] = function () {
            var e = this.offset + this.relativeOffset,
                t = this.parseUShort();
            return 1 === t
                ? { posFormat: 1, coverage: this.parsePointer(ie.coverage), value: this.parseValueRecord() }
                : 2 === t
                ? { posFormat: 2, coverage: this.parsePointer(ie.coverage), values: this.parseValueRecordList() }
                : void C.assert(false, "0x" + e.toString(16) + ": GPOS lookup type 1 format must be 1 or 2.");
        }),
            (ei[2] = function () {
                var e = this.offset + this.relativeOffset,
                    t = this.parseUShort();
                C.assert(1 === t || 2 === t, "0x" + e.toString(16) + ": GPOS lookup type 2 format must be 1 or 2.");
                var r = this.parsePointer(ie.coverage),
                    i = this.parseUShort(),
                    a = this.parseUShort();
                if (1 === t)
                    return {
                        posFormat: t,
                        coverage: r,
                        valueFormat1: i,
                        valueFormat2: a,
                        pairSets: this.parseList(
                            ie.pointer(
                                ie.list(function () {
                                    return {
                                        secondGlyph: this.parseUShort(),
                                        value1: this.parseValueRecord(i),
                                        value2: this.parseValueRecord(a),
                                    };
                                })
                            )
                        ),
                    };
                if (2 === t) {
                    var s = this.parsePointer(ie.classDef),
                        n = this.parsePointer(ie.classDef),
                        o = this.parseUShort(),
                        p = this.parseUShort();
                    return {
                        posFormat: t,
                        coverage: r,
                        valueFormat1: i,
                        valueFormat2: a,
                        classDef1: s,
                        classDef2: n,
                        class1Count: o,
                        class2Count: p,
                        classRecords: this.parseList(
                            o,
                            ie.list(p, function () {
                                return { value1: this.parseValueRecord(i), value2: this.parseValueRecord(a) };
                            })
                        ),
                    };
                }
            }),
            (ei[3] = function () {
                return { error: "GPOS Lookup 3 not supported" };
            }),
            (ei[4] = function () {
                return { error: "GPOS Lookup 4 not supported" };
            }),
            (ei[5] = function () {
                return { error: "GPOS Lookup 5 not supported" };
            }),
            (ei[6] = function () {
                return { error: "GPOS Lookup 6 not supported" };
            }),
            (ei[7] = function () {
                return { error: "GPOS Lookup 7 not supported" };
            }),
            (ei[8] = function () {
                return { error: "GPOS Lookup 8 not supported" };
            }),
            (ei[9] = function () {
                return { error: "GPOS Lookup 9 not supported" };
            });
        var ti = new Array(10);
        var ri = {
            parse: function (e, t) {
                var r = new ie(e, (t = t || 0)),
                    i = r.parseVersion(1);
                return (
                    C.argument(1 === i || 1.1 === i, "Unsupported GPOS table version " + i),
                    1 === i
                        ? {
                              version: i,
                              scripts: r.parseScriptList(),
                              features: r.parseFeatureList(),
                              lookups: r.parseLookupList(ei),
                          }
                        : {
                              version: i,
                              scripts: r.parseScriptList(),
                              features: r.parseFeatureList(),
                              lookups: r.parseLookupList(ei),
                              variations: r.parseFeatureVariationsList(),
                          }
                );
            },
            make: function (e) {
                return new K.Table("GPOS", [
                    { name: "version", type: "ULONG", value: 65536 },
                    { name: "scripts", type: "TABLE", value: new K.ScriptList(e.scripts) },
                    { name: "features", type: "TABLE", value: new K.FeatureList(e.features) },
                    { name: "lookups", type: "TABLE", value: new K.LookupList(e.lookups, ti) },
                ]);
            },
        };
        var ii = {
            parse: function (e, t) {
                var r = new se.Parser(e, t),
                    i = r.parseUShort();
                if (0 === i)
                    return (function (e) {
                        var t = {};
                        e.skip("uShort");
                        var r = e.parseUShort();
                        C.argument(0 === r, "Unsupported kern sub-table version."), e.skip("uShort", 2);
                        var i = e.parseUShort();
                        e.skip("uShort", 3);
                        for (var a = 0; a < i; a += 1) {
                            var s = e.parseUShort(),
                                n = e.parseUShort(),
                                o = e.parseShort();
                            t[s + "," + n] = o;
                        }
                        return t;
                    })(r);
                if (1 === i)
                    return (function (e) {
                        var t = {};
                        e.skip("uShort"),
                            e.parseULong() > 1 && console.warn("Only the first kern subtable is supported."),
                            e.skip("uLong");
                        var r = 255 & e.parseUShort();
                        if ((e.skip("uShort"), 0 === r)) {
                            var i = e.parseUShort();
                            e.skip("uShort", 3);
                            for (var a = 0; a < i; a += 1) {
                                var s = e.parseUShort(),
                                    n = e.parseUShort(),
                                    o = e.parseShort();
                                t[s + "," + n] = o;
                            }
                        }
                        return t;
                    })(r);
                throw new Error("Unsupported kern table version (" + i + ").");
            },
        };
        var ai = {
            parse: function (e, t, r, i) {
                for (
                    var a = new se.Parser(e, t), s = i ? a.parseUShort : a.parseULong, n = [], o = 0;
                    o < r + 1;
                    o += 1
                ) {
                    var p = s.call(a);
                    i && (p *= 2), n.push(p);
                }
                return n;
            },
        };
        function si(e, t) {
            require("fs").readFile(e, function (e, r) {
                if (e) return t(e.message);
                t(null, kt(r));
            });
        }
        function ni(e, t) {
            var r = new XMLHttpRequest();
            r.open("get", e, true),
                (r.responseType = "arraybuffer"),
                (r.onload = function () {
                    return r.response ? t(null, r.response) : t("Font could not be loaded: " + r.statusText);
                }),
                (r.onerror = function () {
                    t("Font could not be loaded");
                }),
                r.send();
        }
        function oi(e, t) {
            for (var r = [], i = 12, a = 0; a < t; a += 1) {
                var s = se.getTag(e, i),
                    n = se.getULong(e, i + 4),
                    o = se.getULong(e, i + 8),
                    p = se.getULong(e, i + 12);
                r.push({ tag: s, checksum: n, offset: o, length: p, compression: false }), (i += 16);
            }
            return r;
        }
        function pi(e, t) {
            if ("WOFF" === t.compression) {
                var r = new Uint8Array(e.buffer, t.offset + 2, t.compressedLength - 2),
                    i = new Uint8Array(t.length);
                if ((E(r, i), i.byteLength !== t.length))
                    throw new Error(
                        "Decompression error: " + t.tag + " decompressed length doesn't match recorded length"
                    );
                return { data: new DataView(i.buffer, 0), offset: 0 };
            }
            return { data: e, offset: t.offset };
        }
        function li(e) {
            var t,
                r,
                i,
                a,
                s,
                n,
                o,
                p,
                l,
                h,
                c,
                u,
                d,
                f,
                m = new Wr({ empty: true }),
                y = new DataView(e, 0),
                g = [],
                v = se.getTag(y, 0);
            if (v === String.fromCharCode(0, 1, 0, 0) || "true" === v || "typ1" === v)
                (m.outlinesFormat = "truetype"), (g = oi(y, (i = se.getUShort(y, 4))));
            else if ("OTTO" === v) (m.outlinesFormat = "cff"), (g = oi(y, (i = se.getUShort(y, 4))));
            else {
                if ("wOFF" !== v) throw new Error("Unsupported OpenType signature " + v);
                var b = se.getTag(y, 4);
                if (b === String.fromCharCode(0, 1, 0, 0)) m.outlinesFormat = "truetype";
                else {
                    if ("OTTO" !== b) throw new Error("Unsupported OpenType flavor " + v);
                    m.outlinesFormat = "cff";
                }
                g = (function (e, t) {
                    for (var r = [], i = 44, a = 0; a < t; a += 1) {
                        var s = se.getTag(e, i),
                            n = se.getULong(e, i + 4),
                            o = se.getULong(e, i + 8),
                            p = se.getULong(e, i + 12),
                            l = undefined;
                        (l = o < p && "WOFF"),
                            r.push({ tag: s, offset: n, compression: l, compressedLength: o, length: p }),
                            (i += 20);
                    }
                    return r;
                })(y, (i = se.getUShort(y, 12)));
            }
            for (var x = 0; x < i; x += 1) {
                var P = g[x],
                    w = undefined;
                switch (P.tag) {
                    case "cmap":
                        (w = pi(y, P)),
                            (m.tables.cmap = oe.parse(w.data, w.offset)),
                            (m.encoding = new de(m.tables.cmap));
                        break;
                    case "cvt ":
                        (w = pi(y, P)),
                            (f = new se.Parser(w.data, w.offset)),
                            (m.tables.cvt = f.parseShortList(P.length / 2));
                        break;
                    case "fvar":
                        s = P;
                        break;
                    case "fpgm":
                        (w = pi(y, P)),
                            (f = new se.Parser(w.data, w.offset)),
                            (m.tables.fpgm = f.parseByteList(P.length));
                        break;
                    case "head":
                        (w = pi(y, P)),
                            (m.tables.head = _e.parse(w.data, w.offset)),
                            (m.unitsPerEm = m.tables.head.unitsPerEm),
                            (t = m.tables.head.indexToLocFormat);
                        break;
                    case "hhea":
                        (w = pi(y, P)),
                            (m.tables.hhea = Fe.parse(w.data, w.offset)),
                            (m.ascender = m.tables.hhea.ascender),
                            (m.descender = m.tables.hhea.descender),
                            (m.numberOfHMetrics = m.tables.hhea.numberOfHMetrics);
                        break;
                    case "hmtx":
                        l = P;
                        break;
                    case "ltag":
                        (w = pi(y, P)), (r = Ve.parse(w.data, w.offset));
                        break;
                    case "maxp":
                        (w = pi(y, P)),
                            (m.tables.maxp = He.parse(w.data, w.offset)),
                            (m.numGlyphs = m.tables.maxp.numGlyphs);
                        break;
                    case "name":
                        u = P;
                        break;
                    case "OS/2":
                        (w = pi(y, P)), (m.tables.os2 = st.parse(w.data, w.offset));
                        break;
                    case "post":
                        (w = pi(y, P)),
                            (m.tables.post = nt.parse(w.data, w.offset)),
                            (m.glyphNames = new me(m.tables.post));
                        break;
                    case "prep":
                        (w = pi(y, P)),
                            (f = new se.Parser(w.data, w.offset)),
                            (m.tables.prep = f.parseByteList(P.length));
                        break;
                    case "glyf":
                        n = P;
                        break;
                    case "loca":
                        c = P;
                        break;
                    case "CFF ":
                        a = P;
                        break;
                    case "kern":
                        h = P;
                        break;
                    case "GPOS":
                        o = P;
                        break;
                    case "GSUB":
                        p = P;
                        break;
                    case "meta":
                        d = P;
                }
            }
            var S = pi(y, u);
            if (((m.tables.name = it.parse(S.data, S.offset, r)), (m.names = m.tables.name), n && c)) {
                var E = 0 === t,
                    T = pi(y, c),
                    k = ai.parse(T.data, T.offset, m.numGlyphs, E),
                    O = pi(y, n);
                m.glyphs = At.parse(O.data, O.offset, k, m);
            } else {
                if (!a) throw new Error("Font doesn't contain TrueType or CFF outlines.");
                var Z = pi(y, a);
                Be.parse(Z.data, Z.offset, m);
            }
            var R = pi(y, l);
            if (
                (Ge.parse(R.data, R.offset, m.numberOfHMetrics, m.numGlyphs, m.glyphs),
                (function (e) {
                    for (var t, r = e.tables.cmap.glyphIndexMap, i = Object.keys(r), a = 0; a < i.length; a += 1) {
                        var s = i[a],
                            n = r[s];
                        (t = e.glyphs.get(n)).addUnicode(parseInt(s));
                    }
                    for (var o = 0; o < e.glyphs.length; o += 1)
                        (t = e.glyphs.get(o)),
                            e.cffEncoding
                                ? e.isCIDFont
                                    ? (t.name = "gid" + o)
                                    : (t.name = e.cffEncoding.charset[o])
                                : e.glyphNames.names && (t.name = e.glyphNames.glyphIndexToName(o));
                })(m),
                h)
            ) {
                var C = pi(y, h);
                m.kerningPairs = ii.parse(C.data, C.offset);
            } else m.kerningPairs = {};
            if (o) {
                var N = pi(y, o);
                (m.tables.gpos = ri.parse(N.data, N.offset)), m.position.init();
            }
            if (p) {
                var L = pi(y, p);
                m.tables.gsub = ht.parse(L.data, L.offset);
            }
            if (s) {
                var M = pi(y, s);
                m.tables.fvar = $r.parse(M.data, M.offset, m.names);
            }
            if (d) {
                var U = pi(y, d);
                (m.tables.meta = ct.parse(U.data, U.offset)), (m.metas = m.tables.meta);
            }
            return m;
        }
        (e.Font = Wr),
            (e.Glyph = ge),
            (e.Path = O),
            (e.BoundingBox = k),
            (e._parse = se),
            (e.parse = li),
            (e.load = function (e, t) {
                ("undefined" == typeof window ? si : ni)(e, function (e, r) {
                    if (e) return t(e);
                    var i;
                    try {
                        i = li(r);
                    } catch (e) {
                        return t(e, null);
                    }
                    return t(null, i);
                });
            }),
            (e.loadSync = function (e) {
                return li(kt(require("fs").readFileSync(e)));
            }),
            Object.defineProperty(e, "__esModule", { value: true });
    }),
    (function (e) {
        function t() {
            console.log.apply(console, arguments);
        }
        var r = {
            id: null,
            caseSensitive: false,
            include: [],
            shouldSort: true,
            searchFn: s,
            sortFn: function (e, t) {
                return e.score - t.score;
            },
            getFn: function e(t, r, i) {
                var s;
                var n;
                var o;
                var p;
                var l;
                var h;
                if (r) {
                    if (
                        (-1 !== (o = r.indexOf(".")) ? ((s = r.slice(0, o)), (n = r.slice(o + 1))) : (s = r),
                        null !== (p = t[s]) && undefined !== p)
                    )
                        if (n || ("string" != typeof p && "number" != typeof p))
                            if (a(p)) for (l = 0, h = p.length; l < h; l++) e(p[l], n, i);
                            else n && e(p, n, i);
                        else i.push(p);
                } else i.push(t);
                return i;
            },
            keys: [],
            verbose: false,
            tokenize: false,
            matchAllTokens: false,
            tokenSeparator: / +/g,
            minMatchCharLength: 1,
            findAllMatches: false,
        };
        function i(e, t) {
            var i;
            for (i in ((this.list = e), (this.options = t = t || {}), r))
                r.hasOwnProperty(i) &&
                    ("boolean" == typeof r[i]
                        ? (this.options[i] = i in t ? t[i] : r[i])
                        : (this.options[i] = t[i] || r[i]));
        }
        function a(e) {
            return "[object Array]" === Object.prototype.toString.call(e);
        }
        function s(e, t) {
            (t = t || {}),
                (this.options = t),
                (this.options.location = t.location || s.defaultOptions.location),
                (this.options.distance = "distance" in t ? t.distance : s.defaultOptions.distance),
                (this.options.threshold = "threshold" in t ? t.threshold : s.defaultOptions.threshold),
                (this.options.maxPatternLength = t.maxPatternLength || s.defaultOptions.maxPatternLength),
                (this.pattern = t.caseSensitive ? e : e.toLowerCase()),
                (this.patternLen = e.length),
                this.patternLen <= this.options.maxPatternLength &&
                    ((this.matchmask = 1 << (this.patternLen - 1)),
                    (this.patternAlphabet = this._calculatePatternAlphabet()));
        }
        (i.VERSION = "2.6.0"),
            (i.prototype.set = function (e) {
                return (this.list = e), e;
            }),
            (i.prototype.search = function (e) {
                return (
                    this.options.verbose && t("\nSearch term:", e, "\n"),
                    (this.pattern = e),
                    (this.results = []),
                    (this.resultMap = {}),
                    (this._keyMap = null),
                    this._prepareSearchers(),
                    this._startSearch(),
                    this._computeScore(),
                    this._sort(),
                    this._format()
                );
            }),
            (i.prototype._prepareSearchers = function () {
                var e = this.options,
                    t = this.pattern,
                    r = e.searchFn,
                    i = t.split(e.tokenSeparator),
                    a = 0,
                    s = i.length;
                if (this.options.tokenize)
                    for (this.tokenSearchers = []; a < s; a++) this.tokenSearchers.push(new r(i[a], e));
                this.fullSeacher = new r(t, e);
            }),
            (i.prototype._startSearch = function () {
                var e,
                    t,
                    r,
                    i,
                    a = this.options.getFn,
                    s = this.list,
                    n = s.length,
                    o = this.options.keys,
                    p = o.length,
                    l = null;
                if ("string" == typeof s[0]) for (r = 0; r < n; r++) this._analyze("", s[r], r, r);
                else
                    for (this._keyMap = {}, r = 0; r < n; r++)
                        for (l = s[r], i = 0; i < p; i++) {
                            if ("string" != typeof (e = o[i])) {
                                if (
                                    ((t = 1 - e.weight || 1),
                                    (this._keyMap[e.name] = { weight: t }),
                                    e.weight <= 0 || e.weight > 1)
                                )
                                    throw new Error("Key weight has to be > 0 and <= 1");
                                e = e.name;
                            } else this._keyMap[e] = { weight: 1 };
                            this._analyze(e, a(l, e, []), l, r);
                        }
            }),
            (i.prototype._analyze = function (e, r, i, s) {
                var n,
                    o,
                    p,
                    l,
                    h,
                    c,
                    u,
                    d,
                    f,
                    m,
                    y,
                    g,
                    v,
                    b,
                    x,
                    P = this.options,
                    w = false;
                if (undefined !== r && null !== r) {
                    o = [];
                    var S = 0;
                    if ("string" == typeof r) {
                        if (
                            ((n = r.split(P.tokenSeparator)),
                            P.verbose && t("---------\nKey:", e),
                            this.options.tokenize)
                        ) {
                            for (b = 0; b < this.tokenSearchers.length; b++) {
                                for (
                                    d = this.tokenSearchers[b],
                                        P.verbose && t("Pattern:", d.pattern),
                                        f = [],
                                        g = false,
                                        x = 0;
                                    x < n.length;
                                    x++
                                ) {
                                    m = n[x];
                                    var E = {};
                                    (y = d.search(m)).isMatch
                                        ? ((E[m] = y.score), (w = true), (g = true), o.push(y.score))
                                        : ((E[m] = 1), this.options.matchAllTokens || o.push(1)),
                                        f.push(E);
                                }
                                g && S++, P.verbose && t("Token scores:", f);
                            }
                            for (l = o[0], c = o.length, b = 1; b < c; b++) l += o[b];
                            (l /= c), P.verbose && t("Token score average:", l);
                        }
                        (u = this.fullSeacher.search(r)),
                            P.verbose && t("Full text score:", u.score),
                            (h = u.score),
                            undefined !== l && (h = (h + l) / 2),
                            P.verbose && t("Score average:", h),
                            (v =
                                !this.options.tokenize ||
                                !this.options.matchAllTokens ||
                                S >= this.tokenSearchers.length),
                            P.verbose && t("Check Matches", v),
                            (w || u.isMatch) &&
                                v &&
                                ((p = this.resultMap[s])
                                    ? p.output.push({ key: e, score: h, matchedIndices: u.matchedIndices })
                                    : ((this.resultMap[s] = {
                                          item: i,
                                          output: [{ key: e, score: h, matchedIndices: u.matchedIndices }],
                                      }),
                                      this.results.push(this.resultMap[s])));
                    } else if (a(r)) for (b = 0; b < r.length; b++) this._analyze(e, r[b], i, s);
                }
            }),
            (i.prototype._computeScore = function () {
                var e,
                    r,
                    i,
                    a,
                    s,
                    n,
                    o,
                    p,
                    l = this._keyMap,
                    h = this.results;
                for (this.options.verbose && t("\n\nComputing score:\n"), e = 0; e < h.length; e++) {
                    for (i = 0, s = (a = h[e].output).length, o = 1, r = 0; r < s; r++)
                        (p = a[r].score * (n = l ? l[a[r].key].weight : 1)),
                            1 !== n ? (o = Math.min(o, p)) : ((i += p), (a[r].nScore = p));
                    (h[e].score = 1 === o ? i / s : o), this.options.verbose && t(h[e]);
                }
            }),
            (i.prototype._sort = function () {
                var e = this.options;
                e.shouldSort && (e.verbose && t("\n\nSorting...."), this.results.sort(e.sortFn));
            }),
            (i.prototype._format = function () {
                var e,
                    r,
                    i,
                    a,
                    s,
                    n = this.options,
                    o = n.getFn,
                    p = [],
                    l = this.results,
                    h = n.include;
                for (
                    n.verbose && t("\n\nOutput:\n\n", l),
                        a = n.id
                            ? function (e) {
                                  l[e].item = o(l[e].item, n.id, [])[0];
                              }
                            : function () {},
                        s = function (e) {
                            var t,
                                r,
                                i,
                                a,
                                s,
                                n = l[e];
                            if (h.length > 0) {
                                if (((t = { item: n.item }), -1 !== h.indexOf("matches")))
                                    for (i = n.output, t.matches = [], r = 0; r < i.length; r++)
                                        (s = { indices: (a = i[r]).matchedIndices }),
                                            a.key && (s.key = a.key),
                                            t.matches.push(s);
                                -1 !== h.indexOf("score") && (t.score = l[e].score);
                            } else t = n.item;
                            return t;
                        },
                        r = 0,
                        i = l.length;
                    r < i;
                    r++
                )
                    a(r), (e = s(r)), p.push(e);
                return p;
            }),
            (s.defaultOptions = { location: 0, distance: 100, threshold: 0.6, maxPatternLength: 32 }),
            (s.prototype._calculatePatternAlphabet = function () {
                var e = {},
                    t = 0;
                for (t = 0; t < this.patternLen; t++) e[this.pattern.charAt(t)] = 0;
                for (t = 0; t < this.patternLen; t++) e[this.pattern.charAt(t)] |= 1 << (this.pattern.length - t - 1);
                return e;
            }),
            (s.prototype._bitapScore = function (e, t) {
                var r = e / this.patternLen,
                    i = Math.abs(this.options.location - t);
                return this.options.distance ? r + i / this.options.distance : i ? 1 : r;
            }),
            (s.prototype.search = function (e) {
                var t,
                    r,
                    i,
                    a,
                    s,
                    n,
                    o,
                    p,
                    l,
                    h,
                    c,
                    u,
                    d,
                    f,
                    m,
                    y,
                    g,
                    v,
                    b,
                    x,
                    P,
                    w,
                    S,
                    E = this.options;
                if (((e = E.caseSensitive ? e : e.toLowerCase()), this.pattern === e))
                    return { isMatch: true, score: 0, matchedIndices: [[0, e.length - 1]] };
                if (this.patternLen > E.maxPatternLength) {
                    if ((b = !!(v = e.match(new RegExp(this.pattern.replace(E.tokenSeparator, "|"))))))
                        for (P = [], t = 0, w = v.length; t < w; t++) (S = v[t]), P.push([e.indexOf(S), S.length - 1]);
                    return { isMatch: b, score: b ? 0.5 : 1, matchedIndices: P };
                }
                for (
                    a = E.findAllMatches,
                        s = E.location,
                        i = e.length,
                        n = E.threshold,
                        o = e.indexOf(this.pattern, s),
                        x = [],
                        t = 0;
                    t < i;
                    t++
                )
                    x[t] = 0;
                for (
                    -1 != o &&
                        ((n = Math.min(this._bitapScore(0, o), n)),
                        -1 != (o = e.lastIndexOf(this.pattern, s + this.patternLen)) &&
                            (n = Math.min(this._bitapScore(0, o), n))),
                        o = -1,
                        y = 1,
                        g = [],
                        h = this.patternLen + i,
                        t = 0;
                    t < this.patternLen;
                    t++
                ) {
                    for (p = 0, l = h; p < l; )
                        this._bitapScore(t, s + l) <= n ? (p = l) : (h = l), (l = Math.floor((h - p) / 2 + p));
                    for (
                        h = l,
                            c = Math.max(1, s - l + 1),
                            u = a ? i : Math.min(s + l, i) + this.patternLen,
                            (d = Array(u + 2))[u + 1] = (1 << t) - 1,
                            r = u;
                        r >= c;
                        r--
                    )
                        if (
                            ((m = this.patternAlphabet[e.charAt(r - 1)]) && (x[r - 1] = 1),
                            (d[r] =
                                0 === t
                                    ? ((d[r + 1] << 1) | 1) & m
                                    : (((d[r + 1] << 1) | 1) & m) | ((f[r + 1] | f[r]) << 1) | 1 | f[r + 1]),
                            d[r] & this.matchmask && (y = this._bitapScore(t, r - 1)) <= n)
                        ) {
                            if (((n = y), (o = r - 1), g.push(o), !(o > s))) break;
                            c = Math.max(1, 2 * s - o);
                        }
                    if (this._bitapScore(t + 1, s) > n) break;
                    f = d;
                }
                return (
                    (P = this._getMatchedIndices(x)), { isMatch: o >= 0, score: 0 === y ? 0.001 : y, matchedIndices: P }
                );
            }),
            (s.prototype._getMatchedIndices = function (e) {
                for (var t, r = [], i = -1, a = -1, s = 0, n = e.length; s < n; s++)
                    (t = e[s]) && -1 === i
                        ? (i = s)
                        : t ||
                          -1 === i ||
                          ((a = s - 1) - i + 1 >= this.options.minMatchCharLength && r.push([i, a]), (i = -1));
                return e[s - 1] && s - 1 - i + 1 >= this.options.minMatchCharLength && r.push([i, s - 1]), r;
            }),
            "object" == typeof exports
                ? (module.exports = i)
                : "function" == typeof define && define.amd
                ? define(function () {
                      return i;
                  })
                : (e.Fuse = i);
    })(this);
PZ.compositor = function (renderer, width, height) {
    this.renderer = renderer;
    this.bufferParams = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
    this.accumParams = {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        depthBuffer: false,
        stencilBuffer: false,
    };
    this.readBuffer = null;
    this.writeBuffer = null;
    this.screenBuffers = [null];
    this.accumBuffers = [null, null];
    var i = this;
    Object.defineProperty(this, "sequence", {
        set: function (e) {
            i._sequence = e;
            i._sequence.properties.resolution.onChanged.watch(function () {
                let e = i._sequence.properties.resolution.get();
                i.camera = new THREE.OrthographicCamera(0.5 * -e[0], 0.5 * e[0], 0.5 * e[1], 0.5 * -e[1], 0, 1);
            }, true);
        },
    });
    this.copyPass = new THREE.ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(THREE.CopyShader.uniforms),
            fragmentShader: THREE.CopyShader.fragmentShader,
            vertexShader: THREE.CopyShader.vertexShader,
        })
    );
    this.copyPass.material.transparent = true;
    this.mixPass = new THREE.MixPass();
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.setSize(width, height);
    this.compositeAverageTime = new Array(100);
    this.compositeAverageIdx = 0;
};
PZ.compositor.prototype = {
    swapBuffers: function () {
        var e = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = e;
    },
    swapScreenBuffer: function (e) {
        var t = this.screenBuffers[e];
        this.screenBuffers[e] = this.writeBuffer;
        this.writeBuffer = t;
    },
    swapReadBuffer: function (e) {
        var t = this.screenBuffers[e];
        this.screenBuffers[e] = this.readBuffer;
        this.readBuffer = t;
    },
    swapAccumBuffers: function () {
        let e = this.accumBuffers[0];
        this.accumBuffers[0] = this.accumBuffers[1];
        this.accumBuffers[1] = e;
    },
    clear: function (e) {
        this.renderer.clearTarget(this.screenBuffers[e], true, true, true);
    },
    renderSequence: function (e) {
        this.ratio = this.readBuffer.width / this._sequence.properties.resolution.get()[0];
        this.renderer.clearTarget(this.accumBuffers[0], true, true, true);
        var t = this._sequence.videoTracks;
        for (var r = 0; r < t.length; r++) {
            t[r].skip = true;
            let e = t[r].layer;
            if (e) {
                if (
                    (!(e instanceof PZ.layer.scene) || !!e.pass.camera) &&
                    (!(e instanceof PZ.layer.composite) || !!e.objects.length)
                ) {
                    t[r].skip = false;
                }
            }
        }
        let i = Math.floor(this._sequence.properties.motionBlurSamples.get(e));
        if (this._sequence.properties.motionBlur.get() === 0) {
            i = 1;
        }
        let a = this._sequence.properties.motionBlurShutter.get(e);
        for (var s = 0; s < i; s++) {
            this.renderer.setClearColor(0, 1);
            this.clear(0);
            this.renderer.setClearColor(0, 0);
            for (r = 0; r < t.length; r++) {
                if (t[r].skip) {
                    continue;
                }
                let n = t[r].layer;
                n.update(e - n.parent.start + (s / i) * a);
                this.renderLayer(n, 0, false);
            }
            this.mixPass.render(this.renderer, this.accumBuffers[1], this.accumBuffers[0], this.screenBuffers[0], true);
            this.swapAccumBuffers();
        }
        this.copyPass.uniforms.tDiffuse.value = this.accumBuffers[0].texture;
        this.copyPass.uniforms.opacity.value = 1 / i;
        this.copyPass.render(this.renderer, null, null, true);
        this.copyPass.uniforms.opacity.value = 1;
    },
    renderEffects: function (e, t, r) {
        console.assert(!!e);
        let i;
        let a;
        let s;
        let n = e.length;
        for (s = 0; s < n; s++) {
            if ((i = e[s]) instanceof PZ.effect.group) {
                if (i.enabled) {
                    this.renderEffects(i.objects, t, r);
                }
            } else if ((a = i.pass) && a.enabled) {
                if (a.uniforms.uvScale) {
                    a.uniforms.uvScale.value.set(t, r);
                }
                a.render(this.renderer, this.writeBuffer, this.readBuffer, true);
                if (a.needsSwap) {
                    this.swapBuffers();
                }
            }
        }
    },
    renderLayer: function (e, t, r) {
        let i = this.screenBuffers[t];
        e.composite.scene;
        let a = e.properties.resolution.get();
        let s = Math.min(Math.ceil(a[0] * this.ratio), i.width);
        let n = Math.min(Math.ceil(a[1] * this.ratio), i.height);
        var o = s / i.width;
        var p = n / i.height;
        this.readBuffer.viewport.set(0, 0, s, n);
        if (e.texture instanceof THREE.Texture) {
            this.copyPass.uniforms.tDiffuse.value = e.texture;
            this.copyPass.render(this.renderer, this.readBuffer, null, true);
        } else if (e instanceof PZ.layer.adjustment) {
            this.copyPass.render(this.renderer, this.readBuffer, i, true);
        } else if (e instanceof PZ.layer.shape) {
            let t = this.canvas.getContext("2d");
            e.draw(t);
            if (ISNODE) {
                let e = t.getImageData(0, 0, this.canvas.width, this.canvas.height);
                this.canvasTexture.image.data.set(e.data);
                this.copyPass.uniforms.uvScale.value.set(1, -1);
                this.copyPass.uniforms.uvOffset.value.set(0, 1);
            }
            this.canvasTexture.needsUpdate = true;
            this.copyPass.uniforms.tDiffuse.value = this.canvasTexture;
            this.copyPass.render(this.renderer, this.readBuffer, null, true);
            if (ISNODE) {
                this.copyPass.uniforms.uvOffset.value.set(0, 0);
                this.copyPass.uniforms.uvScale.value.set(1, 1);
            }
        } else if (e instanceof PZ.layer.composite) {
            if (!this.screenBuffers[t + 1]) {
                this.screenBuffers[t + 1] = this.readBuffer.clone();
            }
            this.clear(t + 1);
            for (var l = e.objects.length - 1; l >= 0; l--) {
                let r = e.objects[l];
                if (
                    (!(r instanceof PZ.layer.scene) || !!r.pass.camera) &&
                    (!(r instanceof PZ.layer.composite) || !!r.objects.length)
                ) {
                    this.renderLayer(r, t + 1);
                }
            }
            this.swapReadBuffer(t + 1);
        } else if (e.pass) {
            e.pass.uniforms;
            e.pass.render(this.renderer, this.readBuffer, null, true);
        }
        this.writeBuffer.viewport.set(0, 0, s, n);
        this.renderEffects(e.effects, o, p);
        if (e.composite.quad.material.uniforms && e.composite.quad.material.uniforms.tDiffuse) {
            e.composite.quad.material.uniforms.tBG.value = i.texture;
            e.composite.quad.material.uniforms.tDiffuse.value = this.readBuffer.texture;
            e.composite.quad.material.uniforms.uvScale.value.set(o, p);
        }
        this.scene.add(e.composite.group);
        this.compositeScene(r, i);
        this.swapScreenBuffer(t);
    },
    compositeScene: function (e, t) {
        this.scene.background = t.texture;
        this.writeBuffer.viewport.set(0, 0, t.width, t.height);
        for (
            this.renderer.render(this.scene, this.camera, e ? null : this.writeBuffer, true);
            this.scene.children[0];

        ) {
            this.scene.remove(this.scene.children[0]);
        }
    },
    reset: function (e, t) {
        this.unload();
        let r = new THREE.WebGLRenderTarget(e, t, this.bufferParams);
        this.readBuffer = r;
        this.writeBuffer = r.clone();
        for (let e = 0; e < this.screenBuffers.length; e++) {
            this.screenBuffers[e] = r.clone();
        }
        for (let r = 0; r < this.accumBuffers.length; r++) {
            this.accumBuffers[r] = new THREE.WebGLRenderTarget(e, t, this.accumParams);
        }
        if (this.canvasTexture) {
            this.canvasTexture.dispose();
        }
        if (ISNODE) {
            this.canvas = createCanvas(e, t);
            this.canvasTexture = new THREE.DataTexture();
            this.canvasTexture.image = { data: new Uint8Array(e * t * 4), width: e, height: t };
            this.canvasTexture.minFilter = this.canvasTexture.magFilter = THREE.LinearFilter;
            this.canvasTexture.premultiplyAlpha = true;
            this.canvasTexture.format = THREE.RGBAFormat;
            this.canvasTexture.generateMipmaps = false;
        } else {
            this.canvas = document.createElement("canvas");
            this.canvas.width = e;
            this.canvas.height = t;
            this.canvasTexture = new THREE.Texture(this.canvas);
            this.canvasTexture.minFilter = this.canvasTexture.magFilter = THREE.LinearFilter;
            this.canvasTexture.premultiplyAlpha = true;
            this.canvasTexture.format = THREE.RGBAFormat;
            this.canvasTexture.generateMipmaps = false;
        }
    },
    setSize: function (e, t) {
        this.reset(e, t);
    },
    unload: function () {
        if (this.readBuffer) {
            this.readBuffer.dispose();
        }
        if (this.writeBuffer) {
            this.writeBuffer.dispose();
        }
        for (let e = 0; e < this.screenBuffers.length; e++) {
            if (this.screenBuffers[e]) {
                this.screenBuffers[e].dispose();
            }
        }
        this.canvas = null;
    },
};

(THREE.Pass = function () {
    (this.enabled = true), (this.needsSwap = true), (this.clear = false), (this.renderToScreen = false);
}),
    Object.assign(THREE.Pass.prototype, {
        setSize: function (e, t) {},
        render: function (e, t, r, i, a) {
            console.error("THREE.Pass: .render() must be implemented in derived pass.");
        },
    }),
    (PZ.schedule = function (e) {
        0 === e
            ? (ISNODE
                  ? (this.texture = new THREE.DataTexture())
                  : ((this.el = document.createElement("video")),
                    (this.el.preload = "auto"),
                    (this.el.muted = true),
                    (this.texture = new THREE.Texture(this.el))),
              (this.texture.minFilter = THREE.LinearFilter),
              (this.texture.magFilter = THREE.LinearFilter),
              (this.texture.format = THREE.RGBFormat),
              (this.texture.generateMipmaps = false),
              (this.playing = false),
              (this.padding = 60),
              (this.type = 0))
            : 1 === e
            ? (ISNODE || ((this.el = document.createElement("audio")), (this.el.preload = "auto")),
              (this.playing = false),
              (this.padding = 60),
              (this.type = 1))
            : ((this.el = null), (this.padding = 0), (this.type = 2)),
            this.reset();
    }),
    (PZ.schedule.type = { VIDEO: 0, AUDIO: 1, NONE: 2 }),
    (PZ.scheduleItem = function () {
        (this.clip = null), (this.start = 0), (this.length = 0), (this.media = 0);
    }),
    (PZ.schedule.prototype.unload = function () {
        this.texture && this.texture.dispose();
    }),
    (PZ.schedule.prototype.canAdd = function (e) {
        return e === PZ.schedule.type.AUDIO || e === PZ.schedule.type.VIDEO
            ? e === this.type
            : this.type === PZ.schedule.type.NONE;
    }),
    (PZ.schedule.prototype.reset = function () {
        this.el && this.playing && (this.el.pause(), (this.playing = false)),
            (this.currentItem = null),
            (this.index = 0),
            (this.items = []);
    }),
    (PZ.schedule.prototype.update = function (e, t) {
        var r = this.currentItem;
        if (!r || r.start + r.length <= e || r.start - this.padding > e) {
            var i = this.items[this.index];
            if (i.start + i.length <= e)
                for (var a = this.index; ++a < this.items.length; ) {
                    if (e < this.items[a].start - this.padding) break;
                    this.index = a;
                }
            else if (i.start > e)
                for (a = this.index; --a >= 0; ) {
                    var s = this.items[a];
                    if (e >= s.start + s.length) break;
                    this.index = a;
                }
            (i = this.items[this.index]).start - this.padding <= e && i.start + i.length > e
                ? ((this.currentItem = i),
                  this.el &&
                      ((this.el.src = this.currentItem.media.url),
                      (this.el.currentTime = this.currentItem.clip.properties.time.get(0))),
                  this.texture && (this.currentItem.texture = this.texture))
                : (this.currentItem = null);
        }
    }),
    (PZ.schedule.prototype.decodeFrame = function (e) {
        var t = this;
        return new Promise(function (r, i) {
            (t.el.oncanplaythrough = function () {
                (this.oncanplaythrough = null), (t.texture.needsUpdate = true), r();
            }),
                (t.el.currentTime = e);
        });
    }),
    (PZ.schedule.prototype.ffDecodeFrame = function (e, t) {
        var r = ASSETDIR + "/" + this.currentItem.media.sha256.replace(/[^a-zA-Z0-9]/g, ""),
            i = this.currentItem.texture;
        if (this.decoder && r === this.decoder.filename && e === this.decoder.lastFrame + 1)
            (this.decoder.lastFrame = e),
                (this.decoder.frameByteOffset = 0),
                this.decoder.nextFrameData &&
                    (i.image.data.set(this.decoder.nextFrameData),
                    (this.decoder.frameByteOffset += this.decoder.nextFrameData.length),
                    (this.decoder.nextFrameData = null));
        else {
            this.decoder && this.decoder.process
                ? (this.decoder.process.kill(), (this.decoder.process = null))
                : (this.decoder = {});
            var a = [
                "-ss",
                (e / t).toFixed(3),
                "-i",
                r,
                "-r",
                t,
                ..."-vf vflip -f rawvideo -pix_fmt rgb24 -".split(" "),
            ];
            (this.decoder.process = spawn(FFMPEG, a)),
                this.decoder.process.stdout.pause(),
                (this.decoder.filename = r),
                (this.decoder.lastFrame = e),
                (this.decoder.frameByteOffset = 0),
                (this.decoder.nextFrameData = null),
                this.decoder.process.on("exit", () => {
                    this.decoder.process = null;
                }),
                this.decoder.process.stderr.on("data", (e) => {
                    console.log("D: " + e.toString("ascii"));
                    var t = e.toString("utf8").match(/rawvideo.*?([1-9]\d{0,4})x([1-9]\d{0,4})/);
                    t &&
                        ((i.image.width = parseInt(t[1])),
                        (i.image.height = parseInt(t[2])),
                        (i.image.data = new Uint8Array(i.image.width * i.image.height * 3)));
                });
        }
        var s = this;
        return new Promise(async function (e, t) {
            if (!s.decoder.process) return console.log("video process not running"), (s.decoder = null), void e();
            let r = setTimeout(() => {
                    console.log("video decoder timed out"),
                        s.decoder.process && s.decoder.process.kill(),
                        (s.decoder = null),
                        e();
                }, 15e3),
                a = () => {
                    console.log("video process exited"), (s.decoder = null), clearTimeout(r), e();
                },
                n = (t) => {
                    var o = i.image.data.length,
                        p = Math.min(o - s.decoder.frameByteOffset, t.length),
                        l = new Uint8Array(t.buffer, 0, p);
                    i.image.data.set(l, s.decoder.frameByteOffset),
                        p < t.length && (s.decoder.nextFrameData = new Uint8Array(t.buffer, p)),
                        (s.decoder.frameByteOffset += l.length),
                        s.decoder.frameByteOffset >= o &&
                            (s.decoder.process.stdout.pause(),
                            s.decoder.process.stdout.removeListener("data", n),
                            s.decoder.process.removeListener("exit", a),
                            (i.needsUpdate = true),
                            clearTimeout(r),
                            e());
                };
            s.decoder.process.on("exit", a), s.decoder.process.stdout.on("data", n), s.decoder.process.stdout.resume();
        });
    }),
    (PZ.schedule.prototype.prepare = async function (e, t) {
        let r = t.sequence.properties.rate.get();
        if ((this.update(e, r), this.currentItem)) {
            let i = e - this.currentItem.start;
            if (i < 0) return;
            if (ISNODE) {
                if (this.type === PZ.schedule.type.VIDEO) {
                    let e = this.currentItem.clip.properties.time.get(i);
                    await this.ffDecodeFrame(Math.round(e * r), r);
                }
            } else if (this.el) {
                let e = this.currentItem.clip.properties.time.get(i);
                await this.decodeFrame(e);
            }
            this.currentItem.clip && (this.currentItem.clip.update(e), await this.currentItem.clip.prepare(e, t));
        }
    }),
    (PZ.schedule.combineTracks = function (e) {
        for (var t = [], r = 0; r < e.length; r++) 0 !== e[r].clips.length && t.push({ track: e[r], idx: 0 });
        var i,
            a = [];
        function s() {
            for (var e = 0, r = null, i = 0; i < t.length; i++) {
                var a = t[i],
                    s = a.track.clips[a.idx];
                (!r || s.start < r.start) && ((r = s), (e = i));
            }
            return null !== r && ++t[e].idx >= t[e].track.clips.length && t.splice(e, 1), r;
        }
        for (; (i = s()); ) a.push(i);
        return a;
    }),
    (PZ.schedule.cleanUpSchedules = function (e, t) {
        for (var r = t.length - 1; r >= 0; r--)
            if (0 === t[r].items.length) {
                let i = t.splice(r, 1)[0];
                i.unload(), e.ui.onScheduleUnloaded.update(i);
            } else t[r].currentItem = null;
    }),
    (PZ.schedule.scheduleItem = function (e, t, r, i) {
        var a;
        for (a = 0; a < t.length; a++)
            if (t[a].canAdd(i)) {
                var s = t[a].currentItem,
                    n = t[a].padding;
                if (null === s || s.start + s.length <= r.start - n) break;
            }
        t[a] || ((t[a] = new PZ.schedule(i)), e.ui.onScheduleCreated.update(t[a])),
            t[a].items.push(r),
            (t[a].currentItem = r);
    }),
    (PZ.schedule.scheduleVideoMaterials = function (e, t, r) {
        let i = r.object.videoMaterials;
        i.sort(function (e, t) {
            return e.properties.startOffset.value - t.properties.startOffset.value;
        });
        for (var a = 0; a < i.length; a++) {
            let s = i[a],
                n = s.media ? s.media.asset : null;
            if (!n) continue;
            let o = new PZ.scheduleItem();
            (o.start = r.start + s.properties.startOffset.value),
                (o.length = r.length - s.properties.startOffset.value),
                (o.media = n),
                (o.clip = r),
                (o.obj = s),
                Object.defineProperty(o, "texture", {
                    get() {
                        return this.obj.threeObj.map;
                    },
                    set(e) {
                        this.obj.threeObj.map = e;
                    },
                }),
                this.scheduleItem(e, t, o, PZ.schedule.type.VIDEO);
        }
    }),
    (PZ.schedule.updateSchedules = function (e, t, r, i) {
        for (var a = 0; a < t.length; a++) t[a].reset();
        for (a = 0; a < r.length; a++) {
            var s = r[a];
            let n = s.media ? s.media.asset : null;
            if (!n && !s.object) continue;
            let o = new PZ.scheduleItem();
            (o.clip = s),
                (o.start = s.start),
                (o.length = s.length),
                (o.media = n),
                Object.defineProperty(o, "texture", {
                    get: function () {
                        return this.clip.object.texture;
                    },
                    set: function (e) {
                        this.clip.object.texture = e;
                    },
                }),
                this.scheduleItem(e, t, o, n ? i : PZ.schedule.type.NONE),
                s.object.videoMaterials && this.scheduleVideoMaterials(e, t, s);
        }
        this.cleanUpSchedules(e, t);
    }),
    (PZ.schedule.analyzeSequence = function (e) {
        this.updateSchedules(e, e.videoSchedules, this.combineTracks(e.videoTracks), PZ.schedule.type.VIDEO),
            this.updateSchedules(e, e.audioSchedules, this.combineTracks(e.audioTracks), PZ.schedule.type.AUDIO);
    }),
    (PZ.export = function (e, t, r) {
        if (
            ((this.sequence = e),
            (this.params = t),
            (this.renderer = null),
            (this.compositor = null),
            (this.readPixelsWorkaround = false),
            ISNODE)
        ) {
            if (r) {
                var i;
                try {
                    (i = require("node-gles").createWebGLRenderingContext({
                        width: t.width,
                        height: t.height,
                        majorVersion: 2,
                        minorVersion: 0,
                        webGLCompability: true,
                    })),
                        console.log("VERSION: " + i.getParameter(i.VERSION)),
                        console.log("RENDERER: " + i.getParameter(i.RENDERER));
                } catch (e) {
                    (i = require("gl")(t.width, t.height, {
                        preserveDrawingBuffer: true,
                        alpha: false,
                        stencil: true,
                    })),
                        (moduleName = "gl"),
                        console.log("headless-gl renderer");
                }
                this.renderer = new THREE.WebGLRenderer({
                    canvas: { addEventListener: function () {}, removeEventListener: function () {} },
                    context: i,
                });
            }
        } else {
            this.renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
            let e = this.renderer.context,
                r = e.getExtension("WEBGL_debug_renderer_info"),
                i = e.getParameter(r.UNMASKED_RENDERER_WEBGL);
            console.log("GPU: " + i),
                "Mesa DRI Intel(R) HD Graphics 500 (Broxton 2x6)" === i.trim() &&
                    (console.warn("Broken config detected: using readPixels workaround"),
                    (this.readPixelsWorkaround = true),
                    (this.readPixelsCanvas = document.createElement("canvas")),
                    (this.readPixelsCanvas.width = t.width),
                    (this.readPixelsCanvas.height = t.height),
                    (this.readPixelsCtx = this.readPixelsCanvas.getContext("2d")),
                    this.readPixelsCtx.scale(1, -1));
        }
        this.renderer &&
            (this.renderer.setSize(t.width, t.height, false),
            this.renderer.setClearColor(0, 1),
            (this.renderer.shadowMap.enabled = true),
            (this.renderer.shadowMap.type = THREE.PCFSoftShadowMap),
            (this.compositor = new PZ.compositor(this.renderer, t.width, t.height)),
            (this.compositor.sequence = e)),
            (this.sampleRate = 48e3),
            (this.framesRendered = 0),
            (this.samplesRendered = 0),
            (this.frame = t.start),
            (this.sample = Math.floor((t.start / e.properties.rate.get()) * this.sampleRate)),
            (this.frameAdvance = e.properties.rate.get() / t.rate),
            (this.totalFrames = t.length),
            (this.totalSamples = Math.floor((t.length / t.rate) * this.sampleRate)),
            (this.frameWaiting = -1),
            (this.framePromise = null);
    }),
    (PZ.export.prototype.unload = function () {
        this.compositor && (this.compositor.unload(), this.renderer.dispose());
    }),
    (PZ.export.prototype.remuxAudio = async function (e) {
        var t = {
                file: { name: e.media.filename || "audio.ogg", data: e.media.file },
                startTime: e.offset,
                duration: e.length,
                typeMask: 2,
            },
            r = await PZ.av.remux(t);
        return (e.startOffset = Math.max(e.offset - r.offset, 0)), r.buffer;
    }),
    (PZ.export.prototype.decodeAudio = function (e) {
        return new Promise(function (t, r) {
            var i = e.slice(0),
                a = new AudioContext();
            a.decodeAudioData(
                e,
                function (e) {
                    a.close(), t(e);
                },
                function (e) {
                    PZ.av.decode(i, function (e, r) {
                        if (e && r) {
                            var i = new Float32Array(e),
                                s = new Float32Array(r),
                                n = a.createBuffer(2, i.length, 48e3);
                            n.copyToChannel(i, 0), n.copyToChannel(s, 1), a.close(), t(n);
                        }
                    });
                }
            );
        });
    }),
    (PZ.export.prototype.ffDecodeAudio = function (e) {
        var t = e.offset,
            r = e.length,
            i = ASSETDIR + "/" + e.media.sha256.replace(/[^a-zA-Z0-9]/g, "");
        return (
            console.log(i + " " + t + " " + r),
            new Promise(function (r, a) {
                let s = ["-i", i, "-ss", t.toFixed(3), ..."-acodec pcm_f32le -ac 2 -f f32le -ar 48000 -".split(" ")],
                    n = spawn(FFMPEG, s),
                    o = Buffer.alloc(2 * Math.floor(48e3 * e.length) * 4),
                    p = 0,
                    l = setTimeout(() => {
                        console.log("audio decoder timed out"), n.kill(), r();
                    }, 3e4);
                n.on("exit", function () {
                    (e.buffer = o),
                        (e.numSamples = o.length / 4 / 2),
                        console.log("out buf: " + o.length + " samples: " + e.numSamples),
                        (e.segmentOffsetSamples = Math.round(48e3 * e.segmentOffset)),
                        clearTimeout(l),
                        r();
                }),
                    n.stdout.on("data", function (e) {
                        (p += e.copy(o, p)) >= o.length && n.kill();
                    }),
                    n.stderr.on("data", function (e) {
                        console.log("AD: " + e.toString("ascii"));
                    });
            })
        );
    }),
    (PZ.export.prototype.renderAudioSegment = function (e, t, r) {
        let i = this.sequence.properties.rate.get(),
            a = this.sampleRate,
            s = t / a,
            n = r / a;
        return new Promise(function (t, o) {
            for (var p = new OfflineAudioContext(2, r, a), l = null; (l = e.pop()); ) {
                if (!l.buffer) continue;
                var h = p.createBufferSource();
                (h.buffer = l.buffer), (h.playbackRate.value = l.playbackRate);
                let e = p.createGain(),
                    t = p.createStereoPanner();
                for (var c = 0; c < n; c += 1 / i) {
                    let r = (c + s) * i - l.frameOffset,
                        a = l.volume.get(r);
                    e.gain.setValueAtTime(a, c);
                    let n = l.pan.get(r);
                    t.pan.setValueAtTime(n, c);
                }
                h.connect(e),
                    e.connect(t),
                    t.connect(p.destination),
                    h.start(l.segmentOffset, l.startOffset / l.playbackRate, l.length);
            }
            (p.oncomplete = function (e) {
                (p.oncomplete = null), t(e.renderedBuffer);
            }),
                p.startRendering();
        });
    }),
    ISNODE &&
        (PZ.export.prototype.renderAudioSegment = function (e, t, r) {
            var i = new Float32Array(2 * r);
            let a = this.sequence.properties.rate.get(),
                s = this.sampleRate,
                n = t / s;
            function o(t, r) {
                let i = e[t];
                if (!i.buffer) return [0, 0];
                var o = new Float32Array(i.buffer.buffer);
                let p = ((r -= i.segmentOffsetSamples) / s + n) * a - i.frameOffset;
                if ((r = Math.floor(r * i.playbackRate)) < 0 || r >= i.numSamples) return [0, 0];
                let l = o[2 * r],
                    h = o[2 * r + 1],
                    c = i.volume.get(p);
                (l *= c), (h *= c);
                let u = i.pan.get(p);
                if (u <= 0) {
                    let e = (u + 1) * Math.PI * 0.5;
                    (l += h * Math.cos(e)), (h *= Math.sin(e));
                } else {
                    let e = Math.abs(u) * Math.PI * 0.5;
                    h += (l *= Math.cos(e)) * Math.sin(e);
                }
                return [l, h];
            }
            for (var p = 0; p < r; p++) {
                for (var l = 0; l < e.length; l++) {
                    var h = o(l, p);
                    (i[2 * p + 0] += h[0]), (i[2 * p + 1] += h[1]);
                }
                (i[2 * p + 0] = Math.min(Math.max(i[2 * p + 0], -1), 1)),
                    (i[2 * p + 1] = Math.min(Math.max(i[2 * p + 1], -1), 1));
            }
            return i;
        }),
    (PZ.export.prototype.analyzeSegment = function (e, t) {
        let r = this.sequence.properties.rate.get();
        for (var i = e / 48e3, a = i + t / 48e3, s = [], n = 0; n < this.sequence.audioSchedules.length; n++)
            for (var o = this.sequence.audioSchedules[n], p = 0; p < o.items.length; p++) {
                var l = o.items[p].clip,
                    h = l.start / r,
                    c = h + l.length / r;
                if (c <= i) continue;
                if (h >= a) break;
                let e = l.properties.time.get(Math.max(h, i) * r - l.start),
                    t = l.properties.time.get(Math.min(c, a) * r - l.start),
                    n = ((l.properties.time.get(l.length) - l.properties.time.get(0)) / l.length) * r;
                s.push({
                    segmentOffset: Math.max(h - i, 0),
                    offset: e,
                    startOffset: 0,
                    length: t - e,
                    media: l.media.asset,
                    buffer: null,
                    frameOffset: l.start,
                    time: l.properties.time,
                    playbackRate: n,
                    volume: l.object.properties.volume,
                    pan: l.object.properties.pan,
                });
            }
        return s;
    }),
    (PZ.export.prototype.getAudioSamples = async function (e) {
        if (this.samplesRendered >= this.totalSamples) return new ArrayBuffer(0);
        let t = this.sample,
            r = Math.min(250 * e, this.totalSamples - this.sample);
        for (var i = this.analyzeSegment(this.sample, r), a = 0; a < i.length; a++) {
            var s = i[a];
            if (ISNODE) await this.ffDecodeAudio(s);
            else {
                if (!s.media.file) {
                    console.warn("Missing audio asset: " + (s.media.filename || s.media.sha256));
                    continue;
                }
                let e = await this.remuxAudio(s);
                if (!e) continue;
                s.buffer = await this.decodeAudio(e);
            }
        }
        return (this.samplesRendered += r), (this.sample += r), await this.renderAudioSegment(i, t, r);
    }),
    (PZ.export.prototype.getVideoFrame = async function (e) {
        if (this.framesRendered >= this.totalFrames) return 0;
        if (
            (this.frameWaiting !== Math.round(this.frame) &&
                ((this.frameWaiting = Math.round(this.frame)),
                (this.framePromise = this.sequence.prepare(this.frameWaiting, this))),
            await this.framePromise,
            this.compositor.renderSequence(this.frame),
            this.readPixelsWorkaround)
        ) {
            let t = this.renderer.context,
                r = this.readPixelsCtx,
                i = t.drawingBufferWidth,
                a = t.drawingBufferHeight;
            r.drawImage(t.canvas, 0, 0, i, a, 0, -a, i, a);
            let s = r.getImageData(0, 0, i, a);
            e.set(s.data);
        } else {
            let t = this.renderer.context;
            t.readPixels(0, 0, this.params.width, this.params.height, t.RGBA, t.UNSIGNED_BYTE, e);
        }
        return (
            this.framesRendered++,
            (this.frame += this.frameAdvance),
            this.frameWaiting !== Math.round(this.frame) &&
                ((this.frameWaiting = Math.round(this.frame)),
                (this.framePromise = this.sequence.prepare(this.frameWaiting, this))),
            1
        );
    }),
    (PZ.upload = function () {
        (this.bytesUploaded = 0), (this.uploadSize = 0);
    }),
    (PZ.upload.prototype.sleep = async function (e) {
        return await new Promise((t, r) => {
            setTimeout(() => t(), e);
        });
    }),
    (PZ.upload.prototype.fetchWithRetry = async function (e, t, r) {
        let i,
            a = 0;
        for (undefined === r && (r = 5); ; ) {
            try {
                i = await fetch(e, t);
            } catch (e) {}
            if (i && i.ok) return i;
            if ((i && i.status < 500) || a >= r) throw new Error(i.statusText);
            await this.sleep(100 * Math.pow(2, a)), (a += 1);
        }
    }),
    (PZ.upload.prototype.uploadFile = async function (e, t) {
        for (var r, i, a = Math.ceil(e.size / 262144), s = [], n = 0; n < a; n++) {
            let a = await new Promise(function (t, r) {
                let i = e.slice(262144 * n, 262144 * (n + 1)),
                    a = new FileReader();
                a.readAsArrayBuffer(i),
                    (a.onload = function (e) {
                        t(e.target.result);
                    });
            });
            (p = new Headers()).append("Date", new Date().toUTCString()),
                s.push(btoa(((r = n), (r += "").length >= (i = 10) ? r : new Array(i - r.length + 1).join("0") + r))),
                await this.fetchWithRetry(t + "&comp=block&blockid=" + encodeURIComponent(s[s.length - 1]), {
                    method: "put",
                    headers: p,
                    body: a,
                }),
                (this.bytesUploaded += a.byteLength);
        }
        var o = '<?xml version="1.0" encoding="utf-8"?><BlockList>';
        for (n = 0; n < a; n++) o += "<Uncommitted>" + s[n] + "</Uncommitted>";
        var p;
        (o += "</BlockList>"),
            (p = new Headers()).append("Date", new Date().toUTCString()),
            p.append("Content-Type", "text/plain; charset=UTF-8"),
            await this.fetchWithRetry(t + "&comp=blocklist", { method: "put", headers: p, body: o });
    }),
    (PZ.upload.prototype.uploadProject = async function (e, t) {
        var r = Object.keys(e.assets.list),
            i = [];
        for (let t = 0; t < r.length; t++) {
            var a = e.assets.list[r[t]];
            a.source !== PZ.asset.source.FILE ||
                a.references <= 0 ||
                !a.file ||
                (i.push(a), (this.uploadSize += a.file.size));
        }
        let s = new Blob([JSON.stringify(e)]);
        this.uploadSize += s.size;
        for (let e = 0; e < i.length; e++) {
            let r = i[e],
                a = await this.fetchWithRetry(PZ.apiOrigin + "/renders/" + t + "/" + r.sha256, {
                    credentials: "include",
                }),
                s = await a.text();
            await this.uploadFile(r.file, s);
        }
        let n = await this.fetchWithRetry(PZ.apiOrigin + "/renders/" + t + "/project", { credentials: "include" }),
            o = await n.text();
        await this.uploadFile(s, o);
    }),
    (PZ.motionBlur = function (e) {
        (this.layer = e), (this.scene = e.threeObj), (this.references = 0), (this.prevModelViewMatrix = new WeakMap());
    }),
    (PZ.motionBlur.prototype.vertexShader = [
        "uniform mat4 prevModelViewMatrix;",
        "varying vec4 mvPosition;",
        "varying vec4 prevMvPosition;",
        "void main()",
        "{",
        "mvPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "prevMvPosition = projectionMatrix * prevModelViewMatrix * vec4(position, 1.0);",
        "gl_Position = mvPosition;",
        "}",
    ].join("\n")),
    (PZ.motionBlur.prototype.fragmentShader = [
        "varying vec4 mvPosition;",
        "varying vec4 prevMvPosition;",
        "void main()",
        "{",
        "vec2 a = (mvPosition.xy / mvPosition.w) * 0.5 + 0.5;",
        "vec2 b = (prevMvPosition.xy / prevMvPosition.w) * 0.5 + 0.5;",
        "vec2 velocity = 5.0 * (b - a);",
        "gl_FragColor = vec4(velocity.x, velocity.y, 0.1, 1.0);",
        "}",
    ].join("\n")),
    (PZ.motionBlur.prototype.load = function () {
        var e = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false,
            type: THREE.HalfFloatType,
        };
        (this.velocityBuffer = new THREE.WebGLRenderTarget(944, 531, e)),
            (this.velocityShader = new THREE.ShaderMaterial({
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader,
                uniforms: { prevModelViewMatrix: { type: "m4", value: new THREE.Matrix4() } },
            }));
    }),
    (PZ.motionBlur.prototype.unload = function () {
        this.velocityBuffer && (this.velocityBuffer.dispose(), (this.velocityBuffer = null));
    }),
    (PZ.motionBlur.prototype.getTexture = function () {
        return (
            this.references <= 0 && (this.load(), (this.references = 0)),
            (this.references += 1),
            this.velocityBuffer.texture
        );
    }),
    (PZ.motionBlur.prototype.releaseTexture = function () {
        (this.references -= 1), this.references <= 0 && (this.unload(), (this.references = 0));
    }),
    (PZ.motionBlur.prototype.onBeforeRender = function (e, t, r, i, a, s) {
        if (!a.uniforms || !a.uniforms.prevModelViewMatrix) return;
        let n = this.prevModelViewMatrix.get(this);
        a.uniforms.prevModelViewMatrix.value.copy(n);
    }),
    (PZ.motionBlur.prototype.update = function (e) {
        if (this.velocityBuffer) {
            for (let t = 0; t < this.layer.objects.length; t++) this.layer.objects[t].update(e + 0.5);
            this.scene.updateMatrixWorld(),
                this.scene.traverse((e) => {
                    let t = this.prevModelViewMatrix.get(e);
                    t || ((t = new THREE.Matrix4()), this.prevModelViewMatrix.set(t)),
                        t.multiplyMatrices(this.layer.pass.camera.matrixWorldInverse, e.matrixWorld),
                        (e.onBeforeRender = (e, r, i, a, s, n) => {
                            s === this.velocityShader && s.uniforms.prevModelViewMatrix.value.copy(t);
                        });
                });
        }
    }),
    (PZ.motionBlur.prototype.render = function (e) {
        this.velocityBuffer &&
            ((this.scene.overrideMaterial = this.velocityShader),
            e.clearTarget(this.velocityBuffer, true, true, true),
            e.render(this.scene, this.layer.pass.camera, this.velocityBuffer),
            (this.scene.overrideMaterial = null));
    }),
    (PZ.envMap = function (e) {
        (this.scene = e.threeObj), (this.references = 0), (this.needsUpdate = false);
    }),
    (PZ.envMap.prototype.load = function () {
        (this.mirrorCubeCamera = new THREE.CubeCamera(0.1, 5e3, 256)),
            this.mirrorCubeCamera.traverse(function (e) {
                e.layers.set(10);
            }),
            this.scene.add(this.mirrorCubeCamera);
    }),
    (PZ.envMap.prototype.unload = function () {
        this.mirrorCubeCamera &&
            (this.scene.remove(this.mirrorCubeCamera),
            this.mirrorCubeCamera.renderTarget.dispose(),
            (this.mirrorCubeCamera = null));
    }),
    (PZ.envMap.prototype.getTexture = function () {
        return (
            this.references <= 0 && (this.load(), (this.references = 0)),
            (this.references += 1),
            this.mirrorCubeCamera.renderTarget.texture
        );
    }),
    (PZ.envMap.prototype.releaseTexture = function () {
        (this.references -= 1), this.references <= 0 && (this.unload(), (this.references = 0));
    }),
    (PZ.envMap.prototype.render = function (e) {
        this.mirrorCubeCamera &&
            ((e.autoClear = true), this.mirrorCubeCamera.update(e, this.scene), (e.autoClear = false));
    }),
    (PZ.shake = function () {
        this.properties = new PZ.propertyList(this.shakePropertyDefinitions);
    }),
    (PZ.shake.prototype.waveFn = function (e) {
        return 2 * (1 & e) - 1;
    }),
    (PZ.shake.prototype.noiseFn = function (e) {
        var t = 1e4 * Math.sin(e);
        return t - Math.floor(t) - 0.5;
    }),
    (PZ.shake.prototype.lerp = function (e, t, r) {
        return e * (1 - r) + t * r;
    }),
    (PZ.shake.prototype.getValue = function (e, t, r, i, a, s, n) {
        var o = e * r[n] + i[n],
            p = Math.floor(o),
            l = p + 1,
            h = o - p;
        s[n] && (h = h * h * (3 - 2 * h));
        var c = this.waveFn(p) + a[n] * this.noiseFn(p),
            u = this.waveFn(l) + a[n] * this.noiseFn(l);
        return t[n] * this.lerp(c, u, h);
    }),
    (PZ.shake.prototype.shake = function (e, t, r) {
        let i = this.properties.amplitude.get(),
            a = this.properties.frequency.get(),
            s = this.properties.phase.get(),
            n = this.properties.noise.get(),
            o = this.properties.smooth.get();
        0 === this.properties.mode.get()
            ? (r.rotateX(this.getValue(e, i, a, s, n, o, 0) * t * 0.1),
              r.rotateY(this.getValue(e, i, a, s, n, o, 1) * t * 0.1))
            : (r.translateX(this.getValue(e, i, a, s, n, o, 0) * t),
              r.translateY(this.getValue(e, i, a, s, n, o, 1) * t)),
            r.translateZ(this.getValue(e, i, a, s, n, o, 2) * t),
            r.rotateZ(this.getValue(e, i, a, s, n, o, 3) * t * 0.1);
    }),
    (PZ.shake.prototype.shakePropertyDefinitions = {
        mode: { name: "Shake mode", type: PZ.property.type.OPTION, items: "rotate;move", value: 0 },
        amplitude: { name: "Amplitude", type: PZ.property.type.VECTOR4, value: [12, 12, 40, 20], min: 0, decimals: 1 },
        frequency: {
            name: "Frequency",
            type: PZ.property.type.VECTOR4,
            value: [0.6, 0.8, 0.7, 0.9],
            min: 0,
            decimals: 2,
        },
        phase: { name: "Phase", type: PZ.property.type.VECTOR4, value: [0, 11, 20, 31], min: 0, decimals: 1 },
        noise: {
            name: "Noise",
            type: PZ.property.type.VECTOR4,
            value: [0.9, 0.9, 0.9, 0.55],
            min: 0,
            max: 4,
            decimals: 2,
        },
        smooth: { name: "Smooth", type: PZ.property.type.VECTOR4, value: [1, 1, 1, 1], min: 0, max: 1, decimals: 0 },
    }),
    (PZ.asset = function () {
        (this.sha256 = ""),
            (this.source = 0),
            (this.external = false),
            (this.mediaReferences = 0),
            (this.references = 0),
            (this.file = null),
            (this.size = 0),
            (this.filename = ""),
            (this.data = new Map());
    }),
    (PZ.asset.hash = async function (e) {
        return await new Promise(function (t, r) {
            var i = new FileReader();
            (i.onload = async function (e) {
                for (
                    var r = await crypto.subtle.digest("SHA-256", new Uint8Array(e.target.result)),
                        i = [],
                        a = new Uint32Array(r),
                        s = 0;
                    s < a.length;
                    s++
                ) {
                    var n = ("00000000" + a[s].toString(16)).slice(-8);
                    i.push(n);
                }
                var o = i.join("");
                (o = o.substr(0, 32)), t(o);
            }),
                i.readAsArrayBuffer(e.slice(0, 268435456));
        });
    }),
    (PZ.asset.type = { IMAGE: 0, FONT: 1, GEOMETRY: 2, AV: 3, SHADER: 4, MISC: 5 }),
    (PZ.asset.source = { FILE: 1, ARCHIVE: 2, PRESET: 3, CLOUD: 4 }),
    (PZ.asset.prototype = {
        get key() {
            return this.sha256 || this.url;
        },
        load: function (e, t) {
            e &&
                ((this.sha256 = e.sha256),
                (this.url = e.url),
                (this.source = e.source),
                (this.external = e.external),
                (this.size = e.size),
                (this.filename = e.filename)),
                e.file
                    ? (this.file = e.file)
                    : t && t.fileExists(this.sha256) && (this.file = t.getFileBlob(this.sha256)),
                this.file && (this.url = URL.createObjectURL(this.file));
        },
        toJSON: function (e) {
            return e === this.key
                ? {
                      sha256: this.sha256,
                      url: this.source !== PZ.asset.source.FILE ? this.url : undefined,
                      source: this.source,
                      external: this.external,
                      size: this.size,
                      filename: this.filename,
                  }
                : this.key;
        },
        save: function (e) {
            this.size > 16777216 || true === this.external || e.addFile(this.sha256, this.file);
        },
    }),
    (PZ.asset.image = class {
        constructor(e) {
            (this.asset = e),
                (this.data = this.asset.data.get(PZ.asset.image)),
                this.data ||
                    ((this.data = { image: null, loading: null }), this.asset.data.set(PZ.asset.image, this.data));
        }
        get loading() {
            return this.data.loading;
        }
        async decode() {
            null !== this.data.loading && (await this.data.loading);
        }
        decodeBrowser() {
            (this.data.image = new Image()),
                (this.data.loading = new Promise((e, t) => {
                    if (this.asset.url) {
                        const t = this.asset.url.startsWith("/assets") ? this.asset.url.substring(1) : this.asset.url;
                        (this.data.image.onload = e), (this.data.image.src = t);
                    } else console.warn("Missing texture asset: " + (this.asset.filename || this.asset.sha256)), e();
                }));
        }
        decodeNode(e) {
            (this.data.image = { data: null, width: 0, height: 0 }),
                (this.data.loading = new Promise(async (t, r) => {
                    var i;
                    if (this.asset.source === PZ.asset.source.FILE)
                        i = ASSETDIR + "/" + this.asset.key.replace(/[^a-zA-Z0-9]/g, "");
                    else if (this.asset.source === PZ.asset.source.PRESET) {
                        i = WORKDIR + "/" + this.asset.url.replace(/\//g, "");
                        var a = await fetch(DOMAIN + this.asset.url),
                            s = await a.buffer();
                        await new Promise(function (e, t) {
                            fs.writeFile(i, s, e);
                        });
                    }
                    await this.ffDecode(i, this.data.image, e), t();
                }));
        }
        async ffDecode(e, t, r) {
            await new Promise(function (i, a) {
                var s,
                    n = [
                        "-i",
                        e,
                        "-vf",
                        "vflip" + (r ? ",scale=2^floor(log(iw)/log(2)):2^floor(log(ih)/log(2))" : ""),
                        ..."-f rawvideo -pix_fmt rgba -".split(" "),
                    ],
                    o = spawn(FFMPEG, n);
                let p = setTimeout(() => {
                    o.kill(), i();
                }, 3e4);
                o.on("exit", function () {
                    (t.data = new Uint8Array(s)), clearTimeout(p), i();
                }),
                    o.stdout.on("data", function (e) {
                        s = s ? Buffer.concat([s, e]) : e;
                    }),
                    o.stderr.on("data", function (e) {
                        var r = e.toString("utf8").match(/rawvideo.*?([1-9]\d{0,4})x([1-9]\d{0,4})/);
                        r && ((t.width = parseInt(r[1])), (t.height = parseInt(r[2])));
                    });
            });
        }
        getImage(e) {
            return this.data.image
                ? this.data.image
                : (ISNODE ? this.decodeNode(e) : this.decodeBrowser(), this.data.image);
        }
        getTexture(e) {
            var t,
                r = this.getImage(e);
            return (
                ISNODE
                    ? (((t = new THREE.DataTexture()).image = r), (t.magFilter = THREE.LinearFilter))
                    : (t = new THREE.Texture(r)),
                this.data.loading.then(function () {
                    r.width > 0 && r.height > 0 && (t.needsUpdate = true);
                }),
                t
            );
        }
    }),
    (PZ.asset.font = class {
        constructor(e) {
            (this.asset = e),
                (this.data = this.asset.data.get(PZ.asset.font)),
                this.data ||
                    ((this.data = {
                        font2d: null,
                        font3d: null,
                        fontFamilyName: "",
                        font2dLoading: null,
                        font3dLoading: null,
                    }),
                    this.asset.data.set(PZ.asset.font, this.data));
        }
        get loading() {
            return this.data.font2dLoading;
        }
        get loading3d() {
            return this.data.font3dLoading;
        }
        get font2d() {
            return this.data.font2d;
        }
        get font3d() {
            return this.data.font3d;
        }
        async getFont() {
            return this.data.font2d
                ? this.data.font2d
                : (this.data.font2dLoading ||
                      (this.data.font2dLoading = new Promise(async (e, t) => {
                          var r = await this.readFile();
                          (this.data.font2d = opentype.parse(r)),
                              true === this.data.font2d.supported
                                  ? ((this.data.font2d.familyName = this.data.font2d
                                        .getEnglishName("fontFamily")
                                        .toLowerCase()),
                                    e(this.data.font2d))
                                  : console.log("unsupported font");
                      })),
                  await this.data.font2dLoading);
        }
        async get3DFont() {
            return this.data.font3d
                ? this.data.font3d
                : (this.data.font3dLoading ||
                      (this.data.font3dLoading = new Promise(async (e, t) => {
                          var r = await this.readFile();
                          try {
                              var i = new THREE.TTFLoader().parse(r);
                              (this.data.font3d = new THREE.Font(i)),
                                  (this.data.fontFamilyName = i.familyName.toLowerCase()),
                                  e(this.data.font3d);
                          } catch (t) {
                              try {
                                  var a;
                                  a = ISNODE ? new Buffer(r).toString() : new TextDecoder().decode(r);
                                  i = JSON.parse(a);
                                  (this.data.font3d = new THREE.Font(i)),
                                      (this.data.fontFamilyName = i.familyName.toLowerCase()),
                                      e(this.data.font3d);
                              } catch (e) {
                                  0;
                              }
                          }
                      })),
                  await this.data.font3dLoading);
        }
        async readFile() {
            return this.asset.source === PZ.asset.source.FILE
                ? ISNODE || this.asset.file
                    ? await this.readFileLocal()
                    : await new Promise(() => {})
                : await this.readFileRemote();
        }
        async readFileLocal() {
            return ISNODE
                ? await new Promise((e, t) => {
                      fs.readFile(ASSETDIR + "/" + this.asset.sha256, function (t, r) {
                          e(r.buffer);
                      });
                  })
                : await new Promise((e, t) => {
                      var r = new FileReader();
                      (r.onload = function (t) {
                          e(t.target.result);
                      }),
                          r.readAsArrayBuffer(this.asset.file);
                  });
        }
        async readFileRemote() {
            if (ISNODE) {
                e = await fetch(DOMAIN + this.asset.url);
                return (await e.buffer()).buffer;
            }
            var e = await fetch(this.asset.url.substring(1));
            return await e.arrayBuffer();
        }
    }),
    (PZ.asset.font.preset = [
        "absender",
        "adolphus",
        "aero matics",
        "another typewriter",
        "arual",
        "asenine",
        "baloo bhaina",
        "bebas",
        "bloody",
        "boston traffic",
        "carton six",
        "clemente pd",
        "droid sans",
        "fascinate inline",
        "griffy",
        "hamburger heaven",
        "inconsolata",
        "indie flower",
        "lobster",
        "nova oval",
        "old newspaper types",
        "orbitron",
        "permanent marker",
        "playfair display",
        "smudgestick",
        "the bold font",
        "timeless",
        "vt323",
    ]),
    (PZ.asset.geometry = class {
        constructor(e) {
            (this.asset = e),
                (this.data = this.asset.data.get(PZ.asset.geometry)),
                this.data ||
                    ((this.data = { geometry: null, loading: null }),
                    this.asset.data.set(PZ.asset.geometry, this.data));
        }
        get loading() {
            return this.data.loading;
        }
        async getGeometry() {
            return this.data.geometry
                ? this.data.geometry
                : (this.data.loading ||
                      (this.data.loading = new Promise(async (e, t) => {
                          try {
                              var r = await this.readFile(),
                                  i = JSON.parse(r),
                                  a = new THREE.BufferGeometryLoader();
                              (this.data.geometry = a.parse(i)), e(this.data.geometry);
                          } catch (t) {
                              console.error(t), (this.data.geometry = null), e(null);
                          }
                      })),
                  await this.data.loading);
        }
        async readFile() {
            return this.asset.source === PZ.asset.source.FILE
                ? ISNODE || this.asset.file
                    ? await this.readFileLocal()
                    : await new Promise(() => {})
                : await this.readFileRemote();
        }
        async readFileLocal() {
            return ISNODE
                ? await new Promise((e, t) => {
                      fs.readFile(ASSETDIR + "/" + this.asset.sha256, "ascii", function (t, r) {
                          e(r);
                      });
                  })
                : await new Promise((e, t) => {
                      var r = new FileReader();
                      (r.onload = function (t) {
                          e(t.target.result);
                      }),
                          r.readAsText(this.asset.file);
                  });
        }
        async readFileRemote() {
            if (ISNODE) {
                e = await fetch(DOMAIN + this.asset.url);
                return await e.text();
            }
            var e = await fetch(this.asset.url);
            return await e.text();
        }
    }),
    (PZ.asset.av = class {
        constructor(e) {
            (this.asset = e), (this.asset.length = this.asset.length || Number.POSITIVE_INFINITY);
        }
        get length() {
            return this.asset.length;
        }
    }),
    (PZ.asset.shader = class {
        constructor(e) {
            (this.asset = e),
                (this.data = this.asset.data.get(PZ.asset.shader)),
                this.data ||
                    ((this.data = { shader: "", loading: null }), this.asset.data.set(PZ.asset.shader, this.data));
        }
        get loading() {
            return this.data.loading;
        }
        async getShader() {
            return this.data.shader
                ? this.data.shader
                : (this.data.loading ||
                      (this.data.loading = new Promise(async (e, t) => {
                          (this.data.shader = await this.readFile()), e(this.data.shader);
                      })),
                  await this.data.loading);
        }
        async readFile() {
            return this.asset.source === PZ.asset.source.FILE
                ? await this.readFileLocal()
                : await this.readFileRemote();
        }
        async readFileLocal() {
            return ISNODE
                ? await new Promise((e, t) => {
                      fs.readFile(ASSETDIR + "/" + this.asset.sha256, "ascii", function (t, r) {
                          e(r);
                      });
                  })
                : await new Promise((e, t) => {
                      var r = new FileReader();
                      (r.onload = function (t) {
                          e(t.target.result);
                      }),
                          r.readAsText(this.asset.file);
                  });
        }
        async readFileRemote() {
            if (ISNODE) {
                e = await fetch(DOMAIN + this.asset.url);
                return (await e.text()).replace(/[^\x00-\x7F]/g, "");
            }
            var e = await fetch(this.asset.url.substring(1));
            return await e.text();
        }
    }),
    (PZ.asset.cubelut = class {
        constructor(e) {
            (this.asset = e),
                (this.data = this.asset.data.get(PZ.asset.cubelut)),
                this.data ||
                    ((this.data = { lut: null, loading: null }), this.asset.data.set(PZ.asset.cubelut, this.data));
        }
        get loading() {
            return this.data.loading;
        }
        parseCubeLUT(e) {
            let t = null,
                r = null,
                i = 0,
                a = [
                    [0, 0, 0],
                    [1, 1, 1],
                ],
                s = null,
                n = e.split("\n"),
                o = 0;
            for (let e = 0; e < n.length; e++) {
                let p = n[e].trim();
                if (0 === p.length || p.startsWith("#")) continue;
                let l = p.split(/\s+/);
                switch (l[0]) {
                    case "TITLE":
                        t = p.slice(7, -1);
                        break;
                    case "DOMAIN_MIN":
                        a[0] = l.slice(1).map(Number);
                        break;
                    case "DOMAIN_MAX":
                        a[1] = l.slice(1).map(Number);
                        break;
                    case "LUT_1D_SIZE":
                        if (((r = "1D"), (i = Number(l[1])) < 2 || i > 65536)) return null;
                        s = new Uint8Array(3 * i);
                        break;
                    case "LUT_3D_SIZE":
                        if (((r = "3D"), (i = Number(l[1])) < 2 || i > 256)) return null;
                        s = new Uint8Array(i * i * i * 3);
                        break;
                    default:
                        (s[o + 0] = 255 * Number(l[0])),
                            (s[o + 1] = 255 * Number(l[1])),
                            (s[o + 2] = 255 * Number(l[2])),
                            (o += 3);
                }
            }
            return { title: t, type: r, size: i, domain: a, data: s };
        }
        async getLUT() {
            return this.data.lut
                ? this.data.lut
                : (this.data.loading ||
                      (this.data.loading = new Promise(async (e, t) => {
                          var r = await this.readFile();
                          (this.data.lut = this.parseCubeLUT(r)), e(this.data.lut);
                      })),
                  await this.data.loading);
        }
        async readFile() {
            return this.asset.source === PZ.asset.source.FILE
                ? ISNODE || this.asset.file
                    ? await this.readFileLocal()
                    : await new Promise(() => {})
                : await this.readFileRemote();
        }
        async readFileLocal() {
            return ISNODE
                ? await new Promise((e, t) => {
                      fs.readFile(ASSETDIR + "/" + this.asset.sha256, "ascii", function (t, r) {
                          e(r);
                      });
                  })
                : await new Promise((e, t) => {
                      var r = new FileReader();
                      (r.onload = function (t) {
                          e(t.target.result);
                      }),
                          r.readAsText(this.asset.file);
                  });
        }
        async readFileRemote() {
            if (ISNODE) {
                e = await fetch(DOMAIN + this.asset.url);
                return await e.text();
            }
            var e = await fetch(this.asset.url.substring(1));
            return await e.text();
        }
    }),
    (PZ.package = class {
        constructor(e, t) {
            (this.data = e), (this.baseType = t || PZ.object.getTypeString(this.data[0]));
        }
        findAssetsObject(e, t) {
            if (e.children)
                for (let r = 0; r < e.children.length; r++)
                    if (e.children[r] instanceof PZ.objectList) this.findAssets(e.children[r], t);
                    else if (e.children[r] instanceof PZ.object) this.findAssetsObject(e.children[r], t);
                    else if (e.children[r] instanceof PZ.propertyList)
                        for (let i of e.children[r])
                            if (i.definition.type === PZ.property.type.ASSET) {
                                let e = i.get();
                                "string" != typeof e || e.startsWith("/") || t.push(e);
                            }
        }
        findAssets(e, t) {
            for (let r = 0; r < e.length; r++) this.findAssetsObject(e[r], t);
        }
        toJSON() {
            let e = { data: this.data, baseType: this.baseType, assets: [] };
            return this.findAssets(this.data, e.assets), e;
        }
    }),
    (PZ.project = class extends PZ.object {
        static async load(e) {
            if (PZ.compatibility.CM2.check(e)) {
                let t = new PZ.compatibility.CM2(e);
                return await t.load();
            }
            if (PZ.compatibility.BG4.check(e)) {
                let t = new PZ.compatibility.BG4(e);
                return await t.load();
            }
            let t = null;
            if (e.fileExists("meta")) {
                let r = e.getFileString("meta");
                t = JSON.parse(r).version;
            }
            let r = e.getFileString("project");
            if (((r = JSON.parse(r)), PZ.compatibility.check(t))) {
                new PZ.compatibility(t).upgrade(r);
            }
            return r;
        }
        static save(e, t) {
            let r = { version: PZ.compatibility.getCurrentVersion() },
                i = new Blob([JSON.stringify(r)]);
            e.addFile("meta", i);
            let a = new Blob([JSON.stringify(t)]);
            e.addFile("project", a);
        }
        constructor() {
            super(),
                (this.assets = new PZ.assetList()),
                (this.sequence = new PZ.sequence()),
                (this.sequence.parent = this),
                (this.media = new PZ.objectList(this, PZ.media)),
                (this.media.name = "Media"),
                (this.ui = {}),
                (this.ui.onChanged = new PZ.observable()),
                (this.ui.dirty = false),
                this.ui.onChanged.watch(() => (this.ui.dirty = true)),
                (this.children = [this.sequence, this.media]);
        }
        toJSON() {
            return { assets: this.assets, media: this.media.filter((e) => !e.preset), sequence: this.sequence };
        }
        load(e, t) {
            (e = e || {}), this.assets.loadAll(e.assets, t);
            for (let t = 0; t < e.media.length; t++) {
                let r = new PZ.media();
                (r.loading = r.load(e.media[t])), this.media.push(r);
            }
            this.sequence.load(e.sequence);
        }
    }),
    (PZ.assetList = function () {
        (this.list = {}), (this.onAssetCreated = new PZ.observable()), (this.onAssetRemoved = new PZ.observable());
    }),
    (PZ.assetList.prototype.toJSON = function () {
        return this.list;
    }),
    (PZ.assetList.prototype.createFromFile = async function (e, t, r) {
        r = r || (await PZ.asset.hash(t));
        var i = this.list[r];
        return i
            ? (i.file || ((i.file = t), (i.url = URL.createObjectURL(i.file)), this.onAssetCreated.update(i)), i)
            : (((i = new PZ.asset()).sha256 = r),
              (i.source = PZ.asset.source.FILE),
              t && ((i.file = t), (i.url = URL.createObjectURL(t)), (i.filename = t.name), (i.size = t.size)),
              (this.list[r] = i),
              this.onAssetCreated.update(i),
              i);
    }),
    (PZ.assetList.prototype.createFromPreset = function (e, t) {
        var r = this.list[t];
        return (
            r ||
            (((r = new PZ.asset()).url = t),
            (r.source = PZ.asset.source.PRESET),
            (r.external = true),
            (this.list[t] = r),
            r)
        );
    }),
    (PZ.assetList.prototype.load = function (e, t) {
        let r;
        return (
            e instanceof PZ.asset
                ? (r = e)
                : "string" == typeof e &&
                  ((r = this.list[e]) ||
                      ((r = new PZ.asset()),
                      e.startsWith("/")
                          ? ((r.url = e), (r.source = PZ.asset.source.PRESET), (r.external = true))
                          : ((r.sha256 = e), (r.source = PZ.asset.source.FILE)),
                      (this.list[e] = r),
                      this.onAssetCreated.update(r))),
            r ? (t ? r.mediaReferences++ : r.references++, r) : null
        );
    }),
    (PZ.assetList.prototype.unload = function (e, t) {
        e instanceof PZ.asset || (e = e.asset), t ? e.mediaReferences-- : e.references--, this.removeIfUnused(e);
    }),
    (PZ.assetList.prototype.locate = async function (e) {
        let t = await PZ.asset.hash(e),
            r = this.list[t];
        r && ((r.file = e), (r.url = URL.createObjectURL(e)), this.onAssetCreated.update(r));
    }),
    (PZ.assetList.prototype.removeIfUnused = function (e) {
        e.references <= 0 &&
            e.mediaReferences <= 0 &&
            (e.source === PZ.asset.source.FILE && e.url && URL.revokeObjectURL(e.url),
            delete this.list[e.key],
            this.onAssetRemoved.update(e));
    }),
    (PZ.assetList.prototype.restore = function (e) {
        (this.list[e.key] = e), this.onAssetCreated.update(e);
    }),
    (PZ.assetList.prototype.loadAll = function (e, t) {
        for (var r = Object.keys(e), i = 0; i < r.length; i++) {
            var a = e[r[i]];
            (this.list[r[i]] = new PZ.asset()), this.list[r[i]].load(a, t), this.onAssetCreated.update(this.list[r[i]]);
        }
    }),
    (PZ.assetList.prototype.saveAll = function (e) {
        for (var t = Object.keys(this.list), r = 0; r < t.length; r++) this.list[t[r]].save(e);
    }),
    (PZ.sequence = class extends PZ.object {
        constructor() {
            super(),
                PZ.observable.defineObservableProp(this, "length", "onLengthChanged"),
                (this.length = 0),
                (this.properties = new PZ.propertyList(PZ.sequence.propertyDefinitions, this)),
                (this.videoTracks = new PZ.objectList(this, PZ.track.video)),
                (this.audioTracks = new PZ.objectList(this, PZ.track.audio)),
                (this.clipLinks = null),
                (this.videoSchedules = []),
                (this.audioSchedules = []),
                (this.ui = {}),
                (this.ui.onScheduleCreated = new PZ.observable()),
                (this.ui.onScheduleUnloaded = new PZ.observable()),
                (this.ui.onClipCreated = new PZ.observable()),
                (this.ui.onClipMoved = new PZ.observable()),
                (this.ui.onClipDeleted = new PZ.observable()),
                (this.ui.onTrackCreated = new PZ.observable()),
                (this.ui.onTrackMoved = new PZ.observable()),
                (this.ui.onTrackDeleted = new PZ.observable()),
                (this.children = [this.properties, this.videoTracks, this.audioTracks]);
        }
        load(e) {
            if ((this.properties.load(e && e.properties), e)) {
                this.length = e.length;
                for (let t = 0; t < e.videoTracks.length; t++) {
                    let r = new PZ.track.video();
                    this.videoTracks.push(r), r.load(e.videoTracks[t]);
                }
                for (let t = 0; t < e.audioTracks.length; t++) {
                    let r = new PZ.track.audio();
                    this.audioTracks.push(r), r.load(e.audioTracks[t]);
                }
                this.clipLinks = new PZ.clipLinks(this, e.clipLinks);
            }
            PZ.schedule.analyzeSequence(this);
        }
        toJSON() {
            return {
                properties: this.properties,
                length: this.length,
                videoTracks: this.videoTracks,
                audioTracks: this.audioTracks,
                clipLinks: this.clipLinks,
            };
        }
        update(e) {
            for (let t = 0; t < this.videoTracks.length; t++) this.videoTracks[t].update(e);
        }
        async prepare(e, t) {
            this.update(e);
            for (let r = 0; r < this.videoSchedules.length; r++) await this.videoSchedules[r].prepare(e, t);
        }
    }),
    (PZ.sequence.defaultName = "Sequence"),
    (PZ.sequence.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Sequence" },
        resolution: {
            name: "Resolution",
            type: PZ.property.type.VECTOR2,
            spaceChar: "x",
            value: [1920, 1080],
            decimals: 0,
            max: 4e3,
            min: 1,
        },
        rate: { name: "Frame rate", type: PZ.property.type.NUMBER, value: 30, decimals: 0, max: 120, min: 1 },
        markers: {
            dynamic: true,
            name: "Markers",
            type: PZ.property.type.TEXT,
            value: (e) => {
                (e.animated = true), (e.hideAnimateToggle = true);
            },
            allowEmpty: true,
            defaultValue: (e) => e.keyframes.length + 1,
        },
        motionBlur: { name: "Multisample motion blur", type: PZ.property.type.OPTION, value: 0, items: "off;on" },
        motionBlurSamples: {
            dynamic: true,
            name: "Samples",
            type: PZ.property.type.NUMBER,
            decimals: 0,
            value: 16,
            min: 1,
            max: 128,
        },
        motionBlurShutter: { dynamic: true, name: "Shutter", type: PZ.property.type.NUMBER, value: 0.5 },
    }),
    (PZ.clipLinks = function (e, t) {
        if (((this.links = {}), (this.seed = 0), t)) {
            this.seed = t.seed;
            let r = Object.keys(t.links);
            for (let i = 0; i < r.length; i++) {
                let a = new PZ.clipLink(r[i]);
                this.links[r[i]] = a;
                let s = t.links[r[i]].clips;
                for (let t = 0; t < s.length; t++) (a.clips[t] = e.parent.addressLookup(s[t])), (a.clips[t].link = a);
            }
        }
    }),
    (PZ.clipLinks.prototype.generateKey = function () {
        return this.seed++;
    }),
    (PZ.clipLinks.prototype.link = function (e, t) {
        return this.links[e] || (this.links[e] = new PZ.clipLink(e)), this.links[e].clips.push(t), this.links[e];
    }),
    (PZ.clipLinks.prototype.unlink = function (e, t) {
        this.links[e].clips.splice(this.links[e].clips.indexOf(t), 1),
            0 === this.links[e].clips.length && delete this.links[e];
    }),
    (PZ.clipLink = function (e) {
        (this.key = e), (this.clips = []);
    }),
    (PZ.clipLink.prototype.toJSON = function (e) {
        if ("link" === e) return this.key;
        for (var t = { clips: [] }, r = 0; r < this.clips.length; r++) t.clips.push(this.clips[r].getAddress());
        return t;
    }),
    (PZ.track = class extends PZ.object {
        static create(e) {
            let t;
            return (t = 0 === e ? new PZ.track.video() : new PZ.track.audio());
        }
        constructor() {
            super();
        }
        getCurrentClip(e) {
            for (var t = 0; t < this.clips.length && e >= this.clips[t].start; t++)
                if (e < this.clips[t].endFrame) return this.clips[t];
            return null;
        }
        load(e) {
            if (e) {
                let r = this.clips.type === PZ.clip.video ? 0 : 1;
                for (var t = 0; t < e.clips.length; t++) {
                    let i = PZ.clip.create(r, e.clips[t].object.type);
                    this.clips.push(i), i.load(e.clips[t]);
                }
            }
        }
        update(e) {
            let t = this.enabled ? this.getCurrentClip(e) : null;
            this.layer = t ? t.object : null;
        }
        toJSON() {
            return { type: this.type, clips: this.clips };
        }
    }),
    (PZ.track.audio = class extends PZ.track {
        constructor() {
            super(), (this.clips = new PZ.objectList(this, PZ.clip.audio)), (this.children = [this.clips]);
        }
    }),
    (PZ.track.audio.prototype.type = 1),
    (PZ.track.video = class extends PZ.track {
        constructor() {
            super(),
                (this.skip = false),
                (this.enabled = true),
                (this.layer = null),
                (this.clips = new PZ.objectList(this, PZ.clip.video)),
                (this.children = [this.clips]);
        }
    }),
    (PZ.track.video.prototype.type = 0),
    (PZ.clip = class extends PZ.object {
        static create(e, t) {
            let r;
            return (r = 0 === e ? new PZ.clip.video(t) : new PZ.clip.audio(t));
        }
        constructor() {
            super(),
                (this.start = 0),
                (this.length = 0),
                (this.object = null),
                (this.link = null),
                (this.media = null),
                (this.properties = new PZ.propertyList(PZ.clip.propertyDefinitions, this)),
                (this.children = [this.properties]);
        }
        get endFrame() {
            return this.start + this.length;
        }
        get mediaLength() {
            let e = Number.POSITIVE_INFINITY;
            return this.media && (e = this.media.length * this.parentProject.sequence.properties.rate.get()), e;
        }
        load(e) {
            (this.start = e.start),
                (this.length = e.length),
                (this.link = e.link || null),
                this.properties.load(e.properties);
        }
        toJSON() {
            return {
                start: this.start,
                length: this.length,
                properties: this.properties,
                link: this.link,
                object: this.object,
            };
        }
        unload() {
            this.media && this.parentProject.assets.unload(this.media), this.object && this.object.unload();
        }
        update(e) {
            this.object.update(e - this.start);
        }
        async prepare(e, t) {
            await this.object.prepare(e - this.start);
        }
    }),
    (PZ.clip.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Clip" },
        media: {
            readOnly: true,
            name: "Media",
            type: PZ.property.type.ASSET,
            assetType: PZ.asset.type.AV,
            value: null,
            changed: function () {
                let e = this.parentObject;
                this.value && (e.media = new PZ.asset.av(e.parentProject.assets.load(this.value)));
            },
        },
        time: {
            dynamic: true,
            name: "Time",
            type: PZ.property.type.NUMBER,
            decimals: 3,
            staticBehavior: PZ.property.dynamic.staticBehavior.LINEAR,
            value: (e) => {
                e.keyframes.push(new PZ.keyframe(0, 0));
                let t = e.parentObject,
                    r = t.getParentOfType(PZ.sequence).properties.rate.get();
                e.keyframes.push(new PZ.keyframe(t.length / r, t.length));
            },
        },
    }),
    (PZ.clip.audio = class extends PZ.clip {
        constructor(e) {
            super(),
                (this.properties.time.hideAnimateToggle = true),
                (this.object = new PZ.audio()),
                (this.object.parent = this),
                this.children.push(this.object);
        }
        load(e) {
            e && (PZ.clip.prototype.load.call(this, e), this.object.load(e.object));
        }
    }),
    (PZ.clip.video = class extends PZ.clip {
        constructor(e) {
            super(), (this.object = PZ.layer.create(e)), (this.object.parent = this), this.children.push(this.object);
        }
        load(e) {
            e && (PZ.clip.prototype.load.call(this, e), (this.object.loading = this.object.load(e.object)));
        }
    }),
    (PZ.layer = class extends PZ.object {
        static create(e) {
            let t,
                r = [
                    PZ.layer.texture,
                    PZ.layer.adjustment,
                    PZ.layer.composite,
                    PZ.layer.image,
                    PZ.layer.scene,
                    PZ.layer,
                    PZ.layer.shape,
                    PZ.layer.shape.text,
                    PZ.layer.shape.preset,
                ];
            if ("number" == typeof e) {
                t = new (0, r[e])();
            } else t = new PZ.layer();
            return (t.type = e), t;
        }
        constructor() {
            super(),
                (this.composite = {}),
                (this.composite.group = new THREE.Object3D()),
                (this.composite.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), new THREE.Material())),
                this.composite.group.add(this.composite.quad),
                (this.properties = new PZ.propertyList(
                    {
                        name: PZ.property.create(PZ.layer.propertyDefinitions.name),
                        childProperties: new PZ.propertyList(),
                        resolution: PZ.property.create(PZ.layer.propertyDefinitions.resolution),
                        position: PZ.property.create(PZ.layer.propertyDefinitions.position),
                        scale: PZ.property.create(PZ.layer.propertyDefinitions.scale),
                        rotation: PZ.property.create(PZ.layer.propertyDefinitions.rotation),
                        opacity: PZ.property.create(PZ.layer.propertyDefinitions.opacity),
                        blending: PZ.property.create(PZ.layer.propertyDefinitions.blending),
                    },
                    this
                )),
                (this.effects = new PZ.objectList(this, PZ.effect)),
                (this.children = [this.properties, this.effects]);
        }
        load(e) {
            (this.vertShader = this.parentProject.assets.createFromPreset(
                PZ.asset.type.SHADER,
                "/assets/shaders/vertex/common.glsl"
            )),
                (this.fragShader = this.parentProject.assets.createFromPreset(
                    PZ.asset.type.SHADER,
                    "/assets/shaders/fragment/blend.glsl"
                )),
                (this.vertShader = new PZ.asset.shader(this.parentProject.assets.load(this.vertShader))),
                (this.fragShader = new PZ.asset.shader(this.parentProject.assets.load(this.fragShader)));
            let t = new THREE.ShaderMaterial({
                uniforms: {
                    tBG: { type: "t", value: null },
                    tDiffuse: { type: "t", value: null },
                    uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
                    opacity: { type: "f", value: 1 },
                },
            });
            if (
                ((this.loadShaders = Promise.all([this.vertShader.getShader(), this.fragShader.getShader()])),
                this.loadShaders.then(function (e) {
                    (t.vertexShader = e[0]), (t.fragmentShader = e[1]), (t.needsUpdate = true);
                }),
                (this.composite.quad.material = t),
                (this.composite.quad.material.premultipliedAlpha = true),
                (this.composite.quad.material.defines[this.properties.blending.get()] = 1),
                "object" == typeof e)
            )
                for (let t = 0; t < e.effects.length; t++) {
                    let r = PZ.effect.create(e.effects[t].type);
                    this.effects.push(r), (r.loading = r.load(e.effects[t]));
                }
            this.properties.name.set(PZ.layer.getName(this));
        }
        toJSON() {
            return { type: this.type, properties: this.properties, effects: this.effects };
        }
        unload() {
            this.parentProject.assets.unload(this.vertShader), this.parentProject.assets.unload(this.fragShader);
            for (var e = 0; e < this.effects.length; e++) this.effects[e].unload();
        }
        update(e) {
            let t = this.properties.position.get(e);
            this.composite.group.position.set(t[0], t[1], 0);
            let r = this.properties.rotation.get(e);
            this.composite.group.rotation.z = r;
            let i = this.properties.scale.get(e);
            this.composite.group.scale.set(i[0], i[1], 1),
                (this.composite.quad.material.uniforms.opacity.value = this.properties.opacity.get(e));
            for (var a = 0; a < this.effects.length; a++) this.effects[a].update(e);
        }
        async prepare(e, t) {
            await this.loadShaders;
            for (var r = 0; r < this.effects.length; r++)
                await this.effects[r].loading, await this.effects[r].prepare(e, t);
        }
    }),
    (PZ.layer.blendModes = [
        { name: "zero", value: "BLEND_ZERO" },
        { name: "src", value: "BLEND_SRC" },
        { name: "dest", value: "BLEND_DST" },
        { name: "src over", value: "BLEND_SRC_OVER" },
        { name: "dest over", value: "BLEND_DST_OVER" },
        { name: "src in", value: "BLEND_SRC_IN" },
        { name: "dest in", value: "BLEND_DST_IN" },
        { name: "src out", value: "BLEND_SRC_OUT" },
        { name: "dest out", value: "BLEND_DST_OUT" },
        { name: "src atop", value: "BLEND_SRC_ATOP" },
        { name: "dest atop", value: "BLEND_DST_ATOP" },
        { name: "xor", value: "BLEND_XOR" },
        { name: "multiply", value: "BLEND_MULTIPLY" },
        { name: "screen", value: "BLEND_SCREEN" },
        { name: "overlay", value: "BLEND_OVERLAY" },
        { name: "darken", value: "BLEND_DARKEN" },
        { name: "lighten", value: "BLEND_LIGHTEN" },
        { name: "color dodge", value: "BLEND_COLORDODGE" },
        { name: "color burn", value: "BLEND_COLORBURN" },
        { name: "hard light", value: "BLEND_HARDLIGHT" },
        { name: "soft light", value: "BLEND_SOFTLIGHT" },
        { name: "difference", value: "BLEND_DIFFERENCE" },
        { name: "exclusion", value: "BLEND_EXCLUSION" },
        { name: "invert", value: "BLEND_INVERT" },
        { name: "invert rgb", value: "BLEND_INVERT_RGB" },
        { name: "linear dodge", value: "BLEND_LINEARDODGE" },
        { name: "linear burn", value: "BLEND_LINEARBURN" },
        { name: "vivid light", value: "BLEND_VIVIDLIGHT" },
        { name: "linear light", value: "BLEND_LINEARLIGHT" },
        { name: "pin light", value: "BLEND_PINLIGHT" },
        { name: "hard mix", value: "BLEND_HARDMIX" },
        { name: "hue", value: "BLEND_HUE" },
        { name: "saturation", value: "BLEND_SATURATION" },
        { name: "color", value: "BLEND_COLOR" },
        { name: "luminosity", value: "BLEND_LUMINOSITY" },
        { name: "add", value: "BLEND_PLUS" },
        { name: "add darker", value: "BLEND_PLUS_DARKER" },
        { name: "subtract", value: "BLEND_MINUS" },
        { name: "contrast", value: "BLEND_CONTRAST" },
        { name: "invert ovg", value: "BLEND_INVERT_OVG" },
        { name: "red", value: "BLEND_RED" },
        { name: "green", value: "BLEND_GREEN" },
        { name: "blue", value: "BLEND_BLUE" },
    ]),
    (PZ.layer.prototype.baseTypeString = "layer"),
    (PZ.layer.prototype.defaultName = "Layer"),
    (PZ.layer.getName = (e) => (e ? e.defaultName : PZ.layer.prototype.defaultName)),
    (PZ.layer.propertyDefinitions = {
        name: {
            visible: false,
            name: "Name",
            type: PZ.property.type.TEXT,
            value: (e) => {
                let t = e.parent ? e.parentObject : null;
                e.set(PZ.layer.getName(t));
            },
        },
        position: {
            dynamic: true,
            group: true,
            objects: [
                { dynamic: true, name: "Position.X", type: PZ.property.type.NUMBER, value: 0, step: 10 },
                { dynamic: true, name: "Position.Y", type: PZ.property.type.NUMBER, value: 0, step: 10 },
            ],
            name: "Position",
            type: PZ.property.type.VECTOR2,
        },
        scale: {
            dynamic: true,
            group: true,
            objects: [
                {
                    dynamic: true,
                    name: "Scale.X",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
                {
                    dynamic: true,
                    name: "Scale.Y",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
            ],
            name: "Scale",
            type: PZ.property.type.VECTOR2,
            linkRatio: true,
        },
        resolution: {
            name: "Resolution",
            type: PZ.property.type.VECTOR2,
            spaceChar: "x",
            value: [0, 0],
            readOnly: true,
            min: 1,
            step: 1,
            decimals: 0,
        },
        rotation: {
            dynamic: true,
            name: "Rotation",
            type: PZ.property.type.NUMBER,
            scaleFactor: Math.PI / 180,
            value: 0,
            step: 3,
            decimals: 1,
        },
        opacity: {
            dynamic: true,
            name: "Opacity",
            type: PZ.property.type.NUMBER,
            value: 1,
            max: 1,
            min: 0,
            step: 0.1,
            decimals: 2,
        },
        blending: {
            name: "Blending mode",
            type: PZ.property.type.LIST,
            value: "BLEND_SRC_OVER",
            items: PZ.layer.blendModes,
            changed: function () {
                let e = this.parentObject;
                (e.composite.quad.material.defines = {}),
                    (e.composite.quad.material.defines[this.value] = 1),
                    (e.composite.quad.material.needsUpdate = true);
            },
        },
    }),
    (PZ.layer.texture = class extends PZ.layer {
        constructor() {
            super(), (this.texture = null);
        }
        load(e) {
            if ((super.load(e), this.properties.load(e && e.properties), e)) {
                let e = this.properties.resolution.get();
                this.composite.quad.scale.set(e[0], e[1], 1);
            }
        }
    }),
    (PZ.layer.adjustment = class extends PZ.layer {
        constructor() {
            super();
        }
        load(e) {
            super.load(e), this.properties.load(e && e.properties);
            let t = this.parentProject.sequence.properties.resolution.get();
            this.properties.resolution.set([t[0], t[1]]);
            let r = this.properties.resolution.get();
            this.composite.quad.scale.set(r[0], r[1], 1);
        }
    }),
    (PZ.layer.adjustment.prototype.defaultName = "Adjustment"),
    (PZ.layer.composite = class extends PZ.layer {
        constructor() {
            super(), (this.objects = new PZ.objectList(this, PZ.layer)), this.children.splice(1, 0, this.objects);
        }
        load(e) {
            super.load(e), this.properties.load(e && e.properties);
            let t = this.parentProject.sequence.properties.resolution.get();
            this.properties.resolution.set([t[0], t[1]]);
            let r = this.properties.resolution.get();
            if ((this.composite.quad.scale.set(r[0], r[1], 1), "object" == typeof e))
                for (let t = 0; t < e.objects.length; t++) {
                    let r = PZ.layer.create(e.objects[t].type);
                    this.objects.push(r), (r.loading = r.load(e.objects[t]));
                }
        }
        toJSON() {
            var e = super.toJSON();
            return (e.objects = this.objects), e;
        }
        unload() {
            for (let e = 0; e < this.objects.length; e++) this.objects[e].unload();
            super.unload();
        }
        async prepare(e, t) {
            for (let r = 0; r < this.objects.length; r++) await this.objects[r].prepare(e, t);
            await super.prepare(e, t);
        }
        update(e) {
            super.update(e);
            for (let t = 0; t < this.objects.length; t++) this.objects[t].update(e);
        }
    }),
    (PZ.layer.composite.prototype.defaultName = "Composite"),
    (PZ.layer.scene = class extends PZ.layer {
        constructor() {
            super(), (this.objects = new PZ.objectList(this, PZ.object3d)), this.children.splice(1, 0, this.objects);
        }
        load(e) {
            super.load(e),
                this.properties.load(e && e.properties),
                (this.threeObj = new THREE.Scene()),
                (this.envMap = new PZ.envMap(this)),
                (this.motionBlur = new PZ.motionBlur(this)),
                (this.videoMaterials = []),
                (this.pass = new THREE.RenderPass(this.threeObj, null)),
                (this.pass.envMap = this.envMap),
                (this.pass.motionBlur = this.motionBlur);
            let t = this.parentProject.sequence.properties.resolution.get();
            this.properties.resolution.set([t[0], t[1]]);
            let r = this.properties.resolution.get();
            if ((this.composite.quad.scale.set(r[0], r[1], 1), "object" == typeof e))
                for (let t = 0; t < e.objects.length; t++) {
                    let r = PZ.object3d.create(e.objects[t].type);
                    this.objects.push(r), (r.loading = r.load(e.objects[t]));
                }
        }
        unload() {
            for (let e = 0; e < this.objects.length; e++) this.objects[e].unload();
            super.unload();
        }
        toJSON() {
            var e = super.toJSON();
            return (e.objects = this.objects), e;
        }
        update(e) {
            this.motionBlur.update(e);
            for (let t = 0; t < this.objects.length; t++) this.objects[t].update(e);
            this.threeObj.updateMatrixWorld(), super.update(e);
        }
        async prepare(e, t) {
            for (let r = 0; r < this.objects.length; r++) await this.objects[r].prepare(e, t);
            await super.prepare(e, t);
        }
    }),
    (PZ.layer.scene.prototype.defaultName = "Scene"),
    (PZ.layer.image = class extends PZ.layer {
        constructor() {
            super(), (this.image = null);
        }
        load(e) {
            if (
                (super.load(e),
                (this.imageProperties = this.properties.childProperties),
                this.imageProperties.addAll(PZ.layer.image.propertyDefinitions),
                this.properties.load(e && e.properties),
                e)
            ) {
                let e = this.parentProject.assets.load(this.imageProperties.image.get());
                e &&
                    ((this.image = new PZ.asset.image(e)),
                    (this.texture = this.image.getTexture()),
                    (this.texture.premultiplyAlpha = true));
                let t = this.properties.resolution.get();
                this.composite.quad.scale.set(t[0], t[1], 1);
            }
        }
        async prepare(e, t) {
            this.image && (await this.image.loading), await super.prepare(e, t);
        }
        unload() {
            this.image && (this.parentProject.assets.unload(this.image), this.texture.dispose()), super.unload();
        }
    }),
    (PZ.layer.image.propertyDefinitions = {
        image: {
            visible: false,
            name: "Image",
            type: PZ.property.type.ASSET,
            assetType: PZ.asset.type.IMAGE,
            value: null,
        },
    }),
    (PZ.layer.image.prototype.defaultName = "Image"),
    (PZ.layer.shape = class extends PZ.layer {
        constructor() {
            super(), (this.objects = new PZ.objectList(this, PZ.shape)), this.children.splice(1, 0, this.objects);
        }
        load(e) {
            if ((super.load(e), this.properties.load(e && e.properties), "object" == typeof e))
                for (let t = 0; t < e.objects.length; t++) {
                    let r = PZ.shape.create(e.objects[t].type);
                    this.objects.push(r), (r.loading = r.load(e.objects[t]));
                }
            let t = this.parentProject.sequence.properties.resolution.get();
            this.properties.resolution.set([t[0], t[1]]);
            let r = this.properties.resolution.get();
            this.composite.quad.scale.set(r[0], r[1], 1),
                (this.properties.position.visible = false),
                (this.properties.scale.visible = false),
                (this.properties.rotation.visible = false);
        }
        unload() {
            for (var e = 0; e < this.objects.length; e++) this.objects[e].unload();
            super.unload();
        }
        toJSON() {
            let e = super.toJSON();
            return (e.objects = this.objects), e;
        }
        async prepare(e, t) {
            for (var r = 0; r < this.objects.length; r++) await this.objects[r].prepare(e, t);
            await super.prepare(e, t);
        }
        update(e) {
            (this.frame = e), super.update(e);
        }
        draw(e) {
            e.save(),
                e.clearRect(0, 0, e.canvas.width, e.canvas.height),
                e.translate(0.5 * e.canvas.width, 0.5 * e.canvas.height);
            let t = this.properties.resolution.get();
            e.scale(e.canvas.width / t[0], e.canvas.height / t[1]);
            for (let t = 0; t < this.objects.length; t++) this.objects[t].draw(this.frame, e);
            e.restore();
        }
    }),
    (PZ.layer.shape.prototype.defaultName = "Shape"),
    (PZ.layer.shape.preset = class extends PZ.layer.shape {
        constructor() {
            super(), (this.shapesNeedUpdate = true), (this.objects.visible = false);
        }
        load(e) {
            if ((super.load(e), !this.objects.length)) {
                let e = PZ.shape.create(0);
                this.objects.push(e), e.load({ operations: [{ type: 0 }, { type: 1 }] });
            }
            (this.shapeProperties = this.properties.childProperties),
                this.shapeProperties.addAll({
                    preset: new PZ.property.static(PZ.layer.shape.preset.propertyDefinitions.preset),
                }),
                this.shapeProperties.load(e && e.properties && e.properties.childProperties),
                this.shapeProperties.addAll({
                    transform: this.objects[0].properties,
                    fill: this.objects[0].operations[0].properties,
                    stroke: this.objects[0].operations[1].properties,
                });
            let t = this.parentProject.sequence.properties.resolution.get();
            this.properties.resolution.set([t[0], t[1]]);
            let r = this.properties.resolution.get();
            this.composite.quad.scale.set(r[0], r[1], 1),
                (this.properties.position.visible = false),
                (this.properties.scale.visible = false),
                (this.properties.rotation.visible = false);
        }
        update(e) {
            this.shapesNeedUpdate && (this.updateShapes(), (this.shapesNeedUpdate = false)), super.update(e);
        }
        toJSON() {
            let e = super.toJSON();
            return (e.objects = [PZ.shape.prototype.toJSON.call(this.objects[0])]), e;
        }
        updateShapes() {
            for (; this.objects[0].objects.length; )
                this.objects[0].objects.splice(this.objects[0].objects.length - 1, 1);
            let e = PZ.shape.create(1);
            switch (((e.path = {}), this.shapeProperties.preset.get())) {
                case 0:
                    e.path.draw = function (e) {
                        e.beginPath(), e.ellipse(0, 0, 100, 100, 0, 0, 2 * Math.PI);
                    };
                    break;
                case 1:
                    e.path.draw = function (e) {
                        e.beginPath(), e.rect(-100, -100, 200, 200);
                    };
            }
            this.objects[0].objects.push(e), e.load({ operations: [] });
        }
    }),
    (PZ.layer.shape.preset.propertyDefinitions = {
        preset: {
            name: "Preset shape",
            type: PZ.property.type.OPTION,
            value: 0,
            items: ["ellipse", "rectangle"],
            changed: function () {
                this.parentObject.shapesNeedUpdate = true;
            },
        },
    }),
    (PZ.layer.shape.preset.prototype.defaultName = "Preset shape"),
    (PZ.layer.shape.text = class extends PZ.layer.shape {
        constructor() {
            super(),
                (this.font = null),
                (this.fontNeedsUpdate = true),
                (this.shapesNeedUpdate = false),
                (this.objects.visible = false);
        }
        load(e) {
            if ((super.load(e), !this.objects.length)) {
                let e = PZ.shape.create(0);
                this.objects.push(e), e.load({ operations: [{ type: 0 }, { type: 1 }] });
            }
            (this.textProperties = this.properties.childProperties),
                this.textProperties.addAll({
                    text: new PZ.property.static(PZ.layer.shape.text.propertyDefinitions.text),
                    font: new PZ.property.static(PZ.layer.shape.text.propertyDefinitions.font),
                    size: new PZ.property.static(PZ.layer.shape.text.propertyDefinitions.size),
                }),
                this.textProperties.load(e && e.properties && e.properties.childProperties),
                this.textProperties.addAll({
                    transform: this.objects[0].properties,
                    fill: this.objects[0].operations[0].properties,
                    stroke: this.objects[0].operations[1].properties,
                });
            let t = this.parentProject.sequence.properties.resolution.get();
            this.properties.resolution.set([t[0], t[1]]);
            let r = this.properties.resolution.get();
            this.composite.quad.scale.set(r[0], r[1], 1),
                (this.properties.position.visible = false),
                (this.properties.scale.visible = false),
                (this.properties.rotation.visible = false);
        }
        toJSON() {
            let e = super.toJSON();
            return (e.objects = [PZ.shape.prototype.toJSON.call(this.objects[0])]), e;
        }
        unload() {
            this.font && this.parentProject.assets.unload(this.font), super.unload();
        }
        update(e) {
            this.fontNeedsUpdate && (this.updateFont(), (this.fontNeedsUpdate = false)),
                this.shapesNeedUpdate && (this.updateShapes(), (this.shapesNeedUpdate = false)),
                super.update(e);
        }
        updateFont() {
            let e = this.font;
            e &&
                e.getFont().then((t) => {
                    this.font === e && (this.shapesNeedUpdate = true);
                });
        }
        updateShapes() {
            if (!this.font || !this.font.font2d) return;
            let e = this.font.font2d,
                t = this.textProperties.size.get() / e.unitsPerEm,
                r = this.textProperties.text.get(),
                i = e.stringToGlyphs(r),
                a = 0,
                s = 0,
                n = 0,
                o = 0,
                p = Number.POSITIVE_INFINITY,
                l = Number.NEGATIVE_INFINITY,
                h = Number.POSITIVE_INFINITY,
                c = Number.NEGATIVE_INFINITY;
            for (let e = 0; e < i.length; e++) {
                r[e];
                let n = i[e],
                    o = n.xMax - n.xMin,
                    u = n.yMax - n.yMin;
                Number.isNaN(u) ||
                    ((p = Math.min(p, a + n.xMin * t)),
                    (h = Math.min(h, s + n.yMin * t)),
                    (l = Math.max(l, a + (n.xMin + o) * t)),
                    (c = Math.max(c, s + (n.yMin + u) * t))),
                    (a += n.advanceWidth * t);
            }
            for (a = -(0.5 * (n = l - p) + p), s = -(0.5 * (o = c - h) + h); this.objects[0].objects.length; )
                this.objects[0].objects.splice(this.objects[0].objects.length - 1, 1);
            for (let n = 0; n < i.length; n++) {
                let o = r[n],
                    p = i[n],
                    l = PZ.shape.create(1),
                    h = {
                        properties: {
                            position: { animated: false, keyframes: [{ frame: 0, value: [a, s] }] },
                            scale: { animated: false, keyframes: [{ frame: 0, value: [t, t] }] },
                        },
                        operations: [],
                    };
                (l.path = e.getPath(o, 0, 0, e.unitsPerEm)),
                    (a += p.advanceWidth * t),
                    this.objects[0].objects.push(l),
                    l.load(h);
            }
        }
        async prepare(e, t) {
            this.font && (await this.font.loading), await super.prepare(e, t);
        }
    }),
    (PZ.layer.shape.text.propertyDefinitions = {
        text: {
            name: "Text",
            type: PZ.property.type.TEXT,
            value: "text",
            changed: function () {
                this.parentObject.shapesNeedUpdate = true;
            },
        },
        font: {
            name: "Font",
            type: PZ.property.type.ASSET,
            assetType: PZ.asset.type.FONT,
            value: "/assets/fonts/2d/bebas.ttf",
            accept: ".ttf,.otf,.woff,.woff2",
            changed: function () {
                let e = this.parentObject;
                e.font && (e.parentProject.assets.unload(e.font), (e.font = null)),
                    this.value &&
                        ((e.font = new PZ.asset.font(e.parentProject.assets.load(this.value))),
                        (e.fontNeedsUpdate = true));
            },
        },
        size: {
            name: "Size",
            type: PZ.property.type.NUMBER,
            value: 100,
            decimals: 0,
            min: 1,
            step: 1,
            changed: function () {
                this.parentObject.shapesNeedUpdate = true;
            },
        },
    }),
    (PZ.layer.shape.text.prototype.defaultName = "Text"),
    (PZ.media = class extends PZ.object {
        constructor() {
            super(),
                (this.creationId = null),
                (this.data = null),
                (this.baseType = null),
                (this.assets = []),
                (this.properties = new PZ.propertyList(PZ.media.propertyDefinitions, this)),
                (this.objects = new PZ.objectList(this, PZ.media)),
                (this.children = [this.properties, this.objects]),
                PZ.observable.defineObservableProp(this, "loaded", "onLoaded"),
                (this.loaded = false);
        }
        async load(e) {
            (e = await e),
                this.properties.load(e.properties),
                (this.icon = e.icon || this.icon),
                (this.creationId = e.creationId),
                (this.data = e.data),
                (this.baseType = e.baseType),
                (this.thumbnail = e.thumbnail),
                (this.preset = e.preset);
            for (let t = 0; t < e.assets.length; t++)
                this.assets[t] = this.parentProject.assets.load(e.assets[t], true);
            this.loaded = true;
        }
        unload() {
            for (let e = 0; e < this.assets.length; e++) this.parentProject.assets.unload(this.assets[e], true);
        }
        toJSON() {
            return {
                properties: this.properties,
                title: this.title,
                icon: this.icon,
                creationId: this.creationId,
                data: this.data,
                baseType: this.baseType,
                assets: this.assets,
            };
        }
    }),
    (PZ.media.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Media" },
        icon: { visible: false, items: [], name: "Icon", type: PZ.property.type.LIST, value: "fragment" },
    }),
    (PZ.audio = class extends PZ.object {
        constructor() {
            super(),
                (this.properties = new PZ.propertyList(PZ.audio.propertyDefinitions, this)),
                (this.children = [this.properties]);
        }
        load(e) {
            this.properties.load(e && e.properties);
        }
        toJSON() {
            return { properties: this.properties };
        }
        update() {}
        prepare() {}
        unload() {}
    }),
    (PZ.audio.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Audio" },
        volume: { dynamic: true, name: "Volume", type: PZ.property.type.NUMBER, value: 1, min: 0, step: 0.1 },
        pan: { dynamic: true, name: "Pan", type: PZ.property.type.NUMBER, value: 0, max: 1, min: -1, step: 0.1 },
    }),
    (PZ.effect = class extends PZ.object {
        static create(e) {
            let t,
                r = [PZ.effect.group, PZ.effect.shader];
            if ("number" == typeof e) {
                t = new (0, r[e])();
            } else t = new PZ.effect();
            return (t.type = e), t;
        }
        constructor() {
            super(),
                (this.properties = new PZ.propertyList(PZ.effect.propertyDefinitions, this)),
                (this.children = [this.properties]);
        }
        parentChanged(e) {
            if (e) {
                let t = e.parentObject;
                t instanceof PZ.layer || (t = t.parentLayer),
                    t.properties.resolution.onChanged.unwatch(this.resize_bound);
            }
            this.parent && this.parentLayer.properties.resolution.onChanged.watch(this.resize_bound, true);
        }
        async load(e) {
            if (!PZ.effect.fnList[this.type]) {
                let e = "effect/" + this.type.replace(/[^a-zA-Z0-9]/g, "") + ".js";
                ISNODE && (e = DOMAIN + e),
                    (PZ.effect.fnList[this.type] = new Promise(async (t, r) => {
                        let i = await fetch(e),
                            a = await i.text();
                        t(new Function(a));
                    }));
            }
            (await PZ.effect.fnList[this.type]).call(this),
                await this.load(e),
                (this.resize_bound = this.resize.bind(this)),
                this.onParentChanged.watch(this.parentChanged.bind(this), true);
        }
        update() {}
        resize() {}
        unload() {}
        prepare() {}
        toJSON() {
            return { type: this.type, properties: this.properties };
        }
    }),
    (PZ.effect.prototype.baseTypeString = "effect"),
    (PZ.effect.prototype.defaultName = "Effect"),
    (PZ.effect.fnList = {}),
    (PZ.effect.getName = (e) => (e ? e.defaultName : PZ.effect.prototype.defaultName)),
    (PZ.effect.propertyDefinitions = {
        name: {
            visible: false,
            readOnly: true,
            name: "Name",
            type: PZ.property.type.TEXT,
            value: (e) => {
                let t = e.parent ? e.parentObject : null;
                e.set(PZ.effect.getName(t));
            },
        },
    }),
    (PZ.effect.group = class extends PZ.effect {
        constructor() {
            super(),
                (this.threeObj = null),
                (this.enabled = false),
                this.properties.addAll(PZ.effect.group.propertyDefinitions),
                (this.customProperties = new PZ.objectList(this, PZ.property.dynamic)),
                (this.customProperties.name = "Custom properties"),
                (this.objects = new PZ.objectList(this, PZ.effect)),
                this.children.push(this.customProperties, this.objects);
        }
        load(e) {
            if (
                ((this.threeObj = new THREE.Object3D()), this.properties.load(e && e.properties), "object" == typeof e)
            ) {
                if (e.customProperties)
                    for (let t = 0; t < e.customProperties.length; t++) {
                        let r = PZ.property.create(e.customProperties[t].type);
                        this.customProperties.push(r), r.load(e.customProperties[t]);
                    }
                for (let t = 0; t < e.objects.length; t++) {
                    let r = PZ.effect.create(e.objects[t].type);
                    this.objects.push(r), (r.loading = r.load(e.objects[t]));
                }
            }
        }
        toJSON() {
            return {
                type: this.type,
                properties: this.properties,
                customProperties: this.customProperties,
                objects: this.objects,
            };
        }
        unload() {
            for (var e = 0; e < this.objects.length; e++) this.objects[e].unload();
        }
        resize() {}
        update(e) {
            this.enabled = !!this.properties.enabled.get(e);
            for (var t = 0; t < this.objects.length; t++) this.objects[t].update(e);
        }
        async prepare(e) {
            for (var t = 0; t < this.objects.length; t++)
                await this.objects[t].loading, await this.objects[t].prepare(e);
        }
    }),
    (PZ.effect.group.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Group" },
        enabled: { dynamic: true, name: "Enabled", type: PZ.property.type.OPTION, value: 1, items: "off;on" },
    }),
    (PZ.effect.shader = class extends PZ.effect {
        constructor() {
            super(),
                (this.textures = new Map()),
                (this.onShaderError = new PZ.observable()),
                (this.fragmentShaderHasError = false),
                (this.fragmentShaderNeedsUpdate = true),
                this.properties.addAll(PZ.effect.shader.propertyDefinitions),
                (this.customProperties = new PZ.objectList(this, PZ.property)),
                (this.customProperties.name = "Shader properties"),
                (this.updateFn = () => (this.fragmentShaderNeedsUpdate = true)),
                this.customProperties.onObjectAdded.watch(this.propertyAdded.bind(this)),
                this.customProperties.onObjectRemoved.watch(this.propertyRemoved.bind(this)),
                this.children.push(this.customProperties);
        }
        propertyAdded(e) {
            e.properties.name.onChanged.watch(this.updateFn),
                e instanceof PZ.property.static &&
                    (e.definition.type === PZ.property.type.ASSET
                        ? e.onChanged.watch(PZ.effect.shader.assetChanged.bind(e))
                        : e.onChanged.watch(this.updateFn)),
                (this.fragmentShaderNeedsUpdate = true);
        }
        propertyRemoved(e) {
            if ((e.properties.name.onChanged.unwatch(this.updateFn), e instanceof PZ.property.static))
                if (e.definition.type === PZ.property.type.ASSET) {
                    const t = this.textures.get(e.get());
                    t && (this.parentProject.assets.unload(t.asset), t.texture.dispose());
                } else e.onChanged.unwatch(this.updateFn);
            this.fragmentShaderNeedsUpdate = true;
        }
        static assetChanged(e) {
            let t = this.parentObject;
            if (t.textures.get(e)) {
                const r = t.textures.get(e);
                t.parentProject.assets.unload(r.asset), r.texture.dispose(), t.textures.delete(e);
            }
            if (this.value) {
                const e = {};
                (e.asset = new PZ.asset.image(t.parentProject.assets.load(this.value))),
                    (e.texture = e.asset.getTexture(true)),
                    t.textures.set(this.value, e);
            }
            this.parentObject.fragmentShaderNeedsUpdate = true;
        }
        static changeFn() {
            this.parentObject.fragmentShaderNeedsUpdate = true;
        }
        async load(e) {
            if ((this.properties.load(e && e.properties), "object" == typeof e && e.customProperties))
                for (let t = 0; t < e.customProperties.length; t++) {
                    let r = PZ.property.create(e.customProperties[t].type);
                    this.customProperties.push(r), r.load(e.customProperties[t]);
                }
            const t = new THREE.RawShaderMaterial({
                vertexShader:
                    "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\n\nuniform vec2 uvScale;\n\nvarying vec2 vUv;\nvarying vec2 vUvScaled;\nvarying vec2 bgCoord;\n\nvoid main()\n{\n\tvUv = uv;\n\tvUvScaled = uv * uvScale;\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\tbgCoord = gl_Position.xy * 0.5 + 0.5;\n}",
                defines: {},
            });
            (this.pass = new THREE.ShaderPass(t)), (this.pass.material.premultipliedAlpha = true);
        }
        fixPropertyName(e) {
            return e.replace(/\s/g, "_");
        }
        updateFragmentShader() {
            const e = this.pass.uniforms,
                t = this.pass.material.defines;
            for (let t in e) delete e[t];
            for (let e in t) delete t[e];
            const r = ["f", "v2", "v3", "v4", "v3"],
                i = [Number, THREE.Vector2, THREE.Vector3, THREE.Vector4, THREE.Vector3];
            for (let a = 0; a < this.customProperties.length; a++) {
                const s = this.customProperties[a],
                    n = this.fixPropertyName(s.properties.name.get());
                if (s instanceof PZ.property.dynamic) {
                    const t = {},
                        a = s.definition.type;
                    (t.type = r[a]), (t.value = new i[a]()), (e[n] = t);
                } else if (s.definition.type === PZ.property.type.ASSET) {
                    const t = {},
                        r = this.textures.get(s.get());
                    (t.type = "t"), (t.value = r ? r.texture : null), (e[n] = t);
                } else t[n] = s.get();
            }
            (e.tDiffuse = { type: "t", value: null }), (e.uvScale = { type: "v2", value: new THREE.Vector2(1, 1) });
            let a = this.parentLayer.properties.resolution.get();
            (e.resolution = { type: "v2", value: new THREE.Vector2(a[0], a[1]) }),
                (this.pass.material.fragmentShader = this.properties.fragShader.get()),
                (this.pass.material.needsUpdate = true);
        }
        toJSON() {
            return { type: this.type, properties: this.properties, customProperties: this.customProperties };
        }
        unload() {
            for (let e of this.textures.keys()) {
                const t = this.textures.get(e);
                this.parentProject.assets.unload(t.asset), t.texture.dispose();
            }
        }
        resize() {
            let e = this.parentLayer.properties.resolution.get();
            this.pass.uniforms.resolution.value.set(e[0], e[1]);
        }
        update(e) {
            if (this.fragmentShaderNeedsUpdate)
                this.updateFragmentShader(),
                    (this.fragmentShaderNeedsUpdate = false),
                    (this.fragmentShaderHasError = false);
            else if (
                this.pass.material.program &&
                this.pass.material.program.diagnostics &&
                !this.pass.material.program.diagnostics.runnable
            ) {
                if (!this.fragmentShaderHasError) {
                    let e = this.pass.material.program.diagnostics.fragmentShader.log;
                    const t = Object.keys(this.pass.material.defines).length;
                    (e = e.replace(/ERROR: 0:(\d+):/, (e, r) => `ERROR: 0:${parseInt(r) - t}:`)),
                        this.onShaderError.update(e),
                        (this.fragmentShaderHasError = true),
                        (this.pass.enabled = false);
                }
                return;
            }
            this.pass.enabled = !!this.properties.enabled.get(e);
            for (var t = 0; t < this.customProperties.length; t++) {
                if (this.customProperties[t] instanceof PZ.property.dynamic == false) continue;
                const r = this.fixPropertyName(this.customProperties[t].properties.name.get()),
                    i = this.customProperties[t].get(e),
                    a = this.pass.uniforms[r];
                Array.isArray(i) ? a.value.set(...i) : (a.value = i);
            }
        }
    }),
    (PZ.effect.shader.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Shader" },
        enabled: { dynamic: true, name: "Enabled", type: PZ.property.type.OPTION, value: 1, items: "off;on" },
        fragShader: {
            name: "Fragment shader",
            type: PZ.property.type.SHADER,
            value: "precision highp float;\nprecision highp int;\n\nuniform sampler2D tDiffuse;\nvarying vec2 vUvScaled;\n\nvoid main()\n{\n  vec4 texel = texture2D(tDiffuse, vUvScaled);\n  gl_FragColor = texel;\n}",
            changed: PZ.effect.shader.changeFn,
        },
    }),
    (PZ.material = class extends PZ.object {
        static create(e) {
            var t = new PZ.material();
            return (t.type = e), t;
        }
        constructor() {
            super(),
                this.onParentChanged.watch(this.parentChanged.bind(this)),
                (this.properties = new PZ.propertyList(PZ.material.propertyDefinitions, this)),
                (this.children = [this.properties]);
        }
        parentChanged(e) {
            this.threeObj &&
                (e && (e.parent.threeObj.material = this.oldMaterial),
                this.parent &&
                    ((this.oldMaterial = this.parentObject.threeObj.material),
                    (this.parentObject.threeObj.material = this.threeObj)));
        }
        async load(e) {
            if (!PZ.material.fnList[this.type]) {
                let e = "material/" + this.type.replace(/[^a-zA-Z0-9]/g, "") + ".js";
                ISNODE && (e = DOMAIN + e),
                    (PZ.material.fnList[this.type] = new Promise(async function (t, r) {
                        let i = await fetch(e),
                            a = await i.text();
                        t(new Function(a));
                    }));
            }
            (await PZ.material.fnList[this.type]).call(this), this.load(e), this.onParentChanged.update();
        }
        toJSON() {}
        update() {}
        prepare() {}
    }),
    (PZ.material.prototype.baseTypeString = "material"),
    (PZ.material.prototype.defaultName = "Material"),
    (PZ.material.fnList = {}),
    (PZ.material.getName = (e) => (e ? e.defaultName : PZ.material.prototype.defaultName)),
    (PZ.material.propertyDefinitions = {
        name: {
            visible: false,
            name: "Name",
            type: PZ.property.type.TEXT,
            value: (e) => {
                let t = e.parent ? e.parentObject : null;
                e.set(PZ.material.getName(t));
            },
        },
    }),
    (PZ.object3d = class extends PZ.object {
        static create(e) {
            let t,
                r = [
                    PZ.object3d.shape,
                    PZ.object3d.text,
                    PZ.object3d.model,
                    PZ.object3d.light,
                    PZ.object3d.particles,
                    PZ.object3d.group,
                    PZ.object3d.camera,
                ];
            if ("number" == typeof e) {
                let i = r[e];
                i || 99 !== e || (i = PZ.object3d.dummy), (t = new i());
            } else t = new PZ.object3d();
            return (t.type = e), t;
        }
        constructor() {
            super(),
                this.onParentChanged.watch(this.parentChanged.bind(this)),
                (this.properties = new PZ.propertyList(PZ.object3d.propertyDefinitions, this)),
                (this.children = [this.properties]);
        }
        parentChanged() {
            this.threeObj &&
                (this.threeObj.parent && this.threeObj.parent.remove(this.threeObj),
                this.parent &&
                    (this.parentObject.threeObj.add(this.threeObj),
                    this.parentObject instanceof PZ.object3d.group &&
                        !(this instanceof PZ.object3d.group) &&
                        (this.threeObj.layers.mask = this.parentObject.threeObj.layers.mask)));
        }
        async load(e) {
            if (!PZ.object3d.fnList[this.type]) {
                let e = "object3d/" + this.type.replace(/[^a-zA-Z0-9]/g, "") + ".js";
                ISNODE && (e = DOMAIN + e),
                    (PZ.object3d.fnList[this.type] = new Promise(async function (t, r) {
                        let i = await fetch(e),
                            a = await i.text();
                        t(new Function(a));
                    }));
            }
            (await PZ.object3d.fnList[this.type]).call(this), this.load(e);
        }
        toJSON() {}
        update() {}
        resize() {}
        unload() {}
        prepare() {}
    }),
    (PZ.object3d.eulerOrders = [
        { name: "XYZ", value: "XYZ" },
        { name: "YZX", value: "YZX" },
        { name: "ZXY", value: "ZXY" },
        { name: "XZY", value: "XZY" },
        { name: "YXZ", value: "YXZ" },
        { name: "ZYX", value: "ZYX" },
    ]),
    (PZ.object3d.prototype.baseTypeString = "object3d"),
    (PZ.object3d.prototype.defaultName = "3D Object"),
    (PZ.object3d.fnList = {}),
    (PZ.object3d.getName = (e) => (e ? e.defaultName : PZ.object3d.prototype.defaultName)),
    (PZ.object3d.propertyDefinitions = {
        name: {
            visible: false,
            name: "Name",
            type: PZ.property.type.TEXT,
            value: (e) => {
                let t = e.parent ? e.parentObject : null;
                e.set(PZ.object3d.getName(t));
            },
        },
    }),
    (PZ.object3d.light = class extends PZ.object3d {
        constructor() {
            super(), (this.threeObj = null), (this.objectType = 1);
        }
        load(e) {
            "object" == typeof e && (this.objectType = e.objectType),
                this.changeObjectType(this.objectType),
                this.properties.load(e && e.properties);
        }
        toJSON() {
            return { type: this.type, objectType: this.objectType, properties: this.properties };
        }
        unload() {}
        update(e) {
            let t;
            this.properties.position &&
                ((t = this.properties.position.get(e)), this.threeObj.position.set(t[0], t[1], t[2])),
                this.properties.target &&
                    ((t = this.properties.target.get(e)),
                    this.threeObj.target.position.set(t[0], t[1], t[2]),
                    this.threeObj.target.updateMatrixWorld()),
                (t = this.properties.color.get(e)),
                this.threeObj.color.setRGB(t[0], t[1], t[2]),
                this.properties.groundColor &&
                    ((t = this.properties.groundColor.get(e)), this.threeObj.groundColor.setRGB(t[0], t[1], t[2])),
                (this.threeObj.intensity = this.properties.intensity.get(e)),
                this.properties.angle && (this.threeObj.angle = (this.properties.angle.get(e) * Math.PI) / 180);
        }
        changeObjectType(e) {
            let t = "Light";
            switch (((this.objectType = e), this.objectType)) {
                case 1:
                    (t = "Light"),
                        (this.threeObj = new THREE.SpotLight(16777215, 1, 0, Math.PI / 3, 0.5, 1)),
                        this.properties.addAll({
                            color: PZ.property.create(PZ.object3d.light.propertyDefinitions.color),
                            position: PZ.property.create(PZ.object3d.light.propertyDefinitions.position),
                            target: PZ.property.create(PZ.object3d.light.propertyDefinitions.target),
                            intensity: PZ.property.create(PZ.object3d.light.propertyDefinitions.intensity),
                            angle: PZ.property.create(PZ.object3d.light.propertyDefinitions.angle),
                        });
                    break;
                case 2:
                    (t = "Point Light"),
                        (this.threeObj = new THREE.PointLight(16777215, 1, 0)),
                        this.properties.addAll({
                            color: PZ.property.create(PZ.object3d.light.propertyDefinitions.color),
                            position: PZ.property.create(PZ.object3d.light.propertyDefinitions.position),
                            intensity: PZ.property.create(PZ.object3d.light.propertyDefinitions.intensity),
                        });
                    break;
                case 3:
                    (t = "Directional Light"),
                        (this.threeObj = new THREE.DirectionalLight(16777215, 1)),
                        this.properties.addAll({
                            color: PZ.property.create(PZ.object3d.light.propertyDefinitions.color),
                            position: PZ.property.create(PZ.object3d.light.propertyDefinitions.position),
                            target: PZ.property.create(PZ.object3d.light.propertyDefinitions.target),
                            intensity: PZ.property.create(PZ.object3d.light.propertyDefinitions.intensity),
                        });
                    break;
                case 4:
                    (t = "Hemisphere Light"),
                        (this.threeObj = new THREE.HemisphereLight(16777215, 16777215, 1)),
                        this.properties.addAll({
                            color: PZ.property.create(PZ.object3d.light.propertyDefinitions.skyColor),
                            groundColor: PZ.property.create(PZ.object3d.light.propertyDefinitions.groundColor),
                            intensity: PZ.property.create(PZ.object3d.light.propertyDefinitions.intensity),
                        });
            }
            this.properties.name.set(t),
                this.objectType < 4 &&
                    ((this.threeObj.castShadow = true),
                    (this.threeObj.shadow.mapSize.height = 1024),
                    (this.threeObj.shadow.mapSize.width = 1024),
                    (this.threeObj.shadow.camera.near = 5),
                    (this.threeObj.shadow.camera.far = 1500),
                    (this.threeObj.shadow.camera.fov = 60),
                    (this.threeObj.shadow.bias = 0)),
                this.parentChanged();
        }
    }),
    (PZ.object3d.light.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Light" },
        position: {
            dynamic: true,
            group: true,
            objects: [
                { dynamic: true, name: "Position.X", type: PZ.property.type.NUMBER, value: 0, step: 1 },
                { dynamic: true, name: "Position.Y", type: PZ.property.type.NUMBER, value: 10, step: 1 },
                { dynamic: true, name: "Position.Z", type: PZ.property.type.NUMBER, value: 0, step: 1 },
            ],
            name: "Position",
            type: PZ.property.type.VECTOR3,
        },
        target: {
            dynamic: true,
            group: true,
            objects: [
                { dynamic: true, name: "Target.X", type: PZ.property.type.NUMBER, value: 0, step: 1 },
                { dynamic: true, name: "Target.Y", type: PZ.property.type.NUMBER, value: 0, step: 1 },
                { dynamic: true, name: "Target.Z", type: PZ.property.type.NUMBER, value: 0, step: 1 },
            ],
            name: "Target",
            type: PZ.property.type.VECTOR3,
        },
        color: {
            dynamic: true,
            group: true,
            objects: [
                { dynamic: true, name: "Color.R", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
                { dynamic: true, name: "Color.G", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
                { dynamic: true, name: "Color.B", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
            ],
            name: "Color",
            type: PZ.property.type.COLOR,
        },
        skyColor: {
            dynamic: true,
            group: true,
            objects: [
                { dynamic: true, name: "Sky color.R", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
                { dynamic: true, name: "Sky color.G", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
                { dynamic: true, name: "Sky color.B", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
            ],
            name: "Sky color",
            type: PZ.property.type.COLOR,
        },
        groundColor: {
            dynamic: true,
            group: true,
            objects: [
                { dynamic: true, name: "Ground color.R", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
                { dynamic: true, name: "Ground color.G", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
                { dynamic: true, name: "Ground color.B", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
            ],
            name: "Ground color",
            type: PZ.property.type.COLOR,
        },
        intensity: {
            dynamic: true,
            name: "Intensity",
            type: PZ.property.type.NUMBER,
            value: 1,
            max: 100,
            min: 0,
            step: 1,
            decimals: 1,
        },
        angle: { dynamic: true, name: "Angle", type: PZ.property.type.NUMBER, value: 60, max: 90, min: 0, step: 1 },
    }),
    (PZ.object3d.light.prototype.defaultName = "Light"),
    (PZ.object3d.model = class extends PZ.object3d {
        constructor() {
            super(),
                (this.threeObj = null),
                (this.objectType = 0),
                (this.textures = []),
                this.properties.addAll({
                    modelProperties: new PZ.propertyList(),
                    position: PZ.property.create(PZ.object3d.model.propertyDefinitions.position),
                    rotation: PZ.property.create(PZ.object3d.model.propertyDefinitions.rotation),
                    scale: PZ.property.create(PZ.object3d.model.propertyDefinitions.scale),
                });
        }
        load(e) {
            switch (("object" == typeof e && (this.objectType = e.objectType), this.objectType)) {
                case 2:
                    this.properties.modelProperties.addAll({
                        lidrotation: PZ.property.create(PZ.object3d.model.propertyDefinitions.lidrotation),
                    });
            }
            this.changeObjectType(this.objectType), this.properties.load(e && e.properties);
        }
        toJSON() {
            return { type: this.type, objectType: this.objectType, properties: this.properties };
        }
        unload() {
            for (var e = 0; e < this.textures.length; e++) this.parentProject.assets.unload(this.textures[e]);
        }
        update(e) {
            let t;
            (t = this.properties.position.get(e)),
                this.threeObj.position.set(t[0], t[1], t[2]),
                (t = this.properties.rotation.get(e)),
                this.threeObj.rotation.set(t[0], t[1], t[2]),
                (t = this.properties.scale.get(e)),
                this.threeObj.scale.set(t[0], t[1], t[2]),
                this.lidobj &&
                    this.lidobj.rotation.set(0.032 * this.properties.modelProperties.lidrotation.get(e), 0, 0);
        }
        changeObjectType(e) {
            let t = "Model";
            switch (((this.objectType = e), (this.threeObj = new THREE.Object3D()), this.objectType)) {
                case 1:
                    (t = "AK47"),
                        new THREE.JSONLoader().load("/assets/models/ak/ak.json", (e) => {
                            var t = new THREE.MeshPhongMaterial({
                                    map: this.loadTexture("/assets/models/ak/ak_m.jpg"),
                                    normalMap: this.loadTexture("/assets/models/ak/ak_n.jpg"),
                                    specularMap: this.loadTexture("/assets/models/ak/ak_s.jpg"),
                                    specular: 16777215,
                                }),
                                r = new THREE.Mesh(e, t);
                            r.scale.set(5, 5, 5), this.threeObj.add(r);
                        });
                    break;
                case 2:
                    t = "Mystery box";
                    var r = new THREE.JSONLoader(),
                        i = new THREE.JSONLoader();
                    r.load("/assets/models/mysterybox/base.json", (e) => {
                        i.load("/assets/models/mysterybox/lid.json", (t) => {
                            var r = new THREE.MeshPhongMaterial({
                                    map: this.loadTexture("/assets/models/mysterybox/base_m.png"),
                                    normalMap: this.loadTexture("/assets/models/mysterybox/base_n.jpg"),
                                    specularMap: this.loadTexture("/assets/models/mysterybox/base_s.png"),
                                    specular: 16777215,
                                    shininess: 20,
                                }),
                                i = new THREE.MeshPhongMaterial({
                                    map: this.loadTexture("/assets/models/mysterybox/lid_m.png"),
                                    normalMap: this.loadTexture("/assets/models/mysterybox/lid_n.jpg"),
                                    specularMap: this.loadTexture("/assets/models/mysterybox/lid_s.png"),
                                    specular: 16777215,
                                }),
                                a = new THREE.Mesh(e, r),
                                s = new THREE.Mesh(t, i);
                            (this.lidobj = s),
                                a.scale.set(5, 5, 5),
                                a.position.set(0, -4.7, 0),
                                s.scale.set(5, 5, 5),
                                s.position.set(0, 13.7, 6),
                                this.threeObj.add(a),
                                this.threeObj.add(s);
                        });
                    });
            }
            this.parentChanged(), this.properties.name.set(t);
        }
        loadTexture(e) {
            var t = this.parentProject.assets.createFromPreset(PZ.asset.type.IMAGE, e);
            return (t = new PZ.asset.image(this.parentProject.assets.load(t))), this.textures.push(t), t.getTexture();
        }
    }),
    (PZ.object3d.model.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Model" },
        lidrotation: {
            dynamic: true,
            name: "Lid open",
            type: PZ.property.type.NUMBER,
            value: 0,
            max: 100,
            min: 0,
            vstep: 5,
            decimals: 1,
            dragstep: 0.1,
        },
        position: {
            dynamic: true,
            group: true,
            objects: [
                { dynamic: true, name: "Position.X", type: PZ.property.type.NUMBER, value: 0 },
                { dynamic: true, name: "Position.Y", type: PZ.property.type.NUMBER, value: 0 },
                { dynamic: true, name: "Position.Z", type: PZ.property.type.NUMBER, value: 0 },
            ],
            name: "Position",
            type: PZ.property.type.VECTOR3,
        },
        rotation: {
            dynamic: true,
            group: true,
            objects: [
                {
                    dynamic: true,
                    name: "Rotation.X",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                },
                {
                    dynamic: true,
                    name: "Rotation.Y",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                },
                {
                    dynamic: true,
                    name: "Rotation.Z",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                },
            ],
            name: "Rotation",
            type: PZ.property.type.VECTOR3,
            scaleFactor: Math.PI / 180,
        },
        scale: {
            dynamic: true,
            group: true,
            objects: [
                {
                    dynamic: true,
                    name: "Scale.X",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
                {
                    dynamic: true,
                    name: "Scale.Y",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
                {
                    dynamic: true,
                    name: "Scale.Z",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
            ],
            name: "Scale",
            type: PZ.property.type.VECTOR3,
            linkRatio: true,
        },
        eulerOrder: {
            name: "Rotation order",
            type: PZ.property.type.LIST,
            value: "XYZ",
            items: PZ.object3d.eulerOrders,
            changed: function () {
                this.parentObject.threeObj.rotation.order = this.value;
            },
        },
    }),
    (PZ.object3d.model.prototype.defaultName = "Model"),
    (PZ.object3d.particles = class extends PZ.object3d {
        constructor() {
            super(), (this.texture = null), this.properties.addAll(PZ.object3d.particles.propertyDefinitions);
        }
        get presetTextures() {
            return [
                "artsy",
                "bar_blur",
                "circle_sft2",
                "circle_soft",
                "circle_soft3",
                "circle_soft4",
                "clumpy_blurry",
                "dots",
                "flash1",
                "flash2",
                "flash3",
                "misc",
                "nebula",
                "plume",
                "plume2",
                "plume3",
                "plume4",
                "ring",
                "ring_blur",
                "ring_partial",
                "skull",
                "smokey",
                "splash",
                "splotch1",
                "splotch2",
                "spots",
                "squae_soft_blob",
                "square_soft",
                "squiggles",
                "star1",
                "star2",
                "star3",
                "tentacles",
                "tribal",
                "twisted",
                "waterfall",
            ];
        }
        get vertexShader() {
            return [
                "uniform vec2 resolution;",
                "uniform float time;",
                "uniform float rate;",
                "uniform float lifetime;",
                "uniform vec3 accel;",
                "uniform float vdist;",
                "uniform vec3 ivel_box;",
                "uniform vec3 vspread_box;",
                "uniform float ivel_sphere;",
                "uniform float vspread_sphere;",
                "uniform float pdist;",
                "uniform vec3 ipos;",
                "uniform vec3 pspread_box;",
                "uniform vec3 pspread_sphere;",
                "uniform float iang;",
                "uniform float aspread;",
                "uniform float angvel;",
                "uniform float avspread;",
                "uniform sampler2D color;",
                "uniform sampler2D size;",
                "attribute float pid;",
                "varying vec4 vColor;",
                "varying float vAngle;",
                "float rand(vec2 n) { ",
                "return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);",
                "}",
                "void main()",
                "{",
                "float delay = pid / rate;",
                "float ptime = mod(time - delay, lifetime);",
                "float count = floor((time - delay) / lifetime) + 1.0;",
                "vColor = step(delay, time) * texture2D(color, vec2(ptime / lifetime, 0.0));",
                "float scale = texture2D(size, vec2(ptime / lifetime, 0.0)).r;",
                "float a = iang + (-0.5 + rand(vec2(pid*count, pid)) ) * aspread;",
                "float avel = angvel + avspread * (rand(vec2(pid*count, 10.0)) - 0.5);",
                "vAngle = avel*ptime + a;",
                "#if PDIST==0",
                "vec3 p = ( vec3(-0.5) + ",
                "  vec3(rand(vec2(pid*count, pid*1.0)), rand(vec2(pid*count, pid*2.0)), rand(vec2(pid*count, pid*3.0))) )",
                "  * pspread_box;",
                "#else",
                "float phi = rand(vec2(pid*count, pid*1.0)) * 6.28319;",
                "float theta = rand(vec2(pid*count, pid*2.0)) * 3.14159 * pspread_sphere.z;",
                "float rad = (rand(vec2(pid*count, pid*3.0)) - 0.5) * pspread_sphere.y + pspread_sphere.x;",
                "vec3 p = rad * vec3(sin(phi)*cos(theta), sin(phi)*sin(theta), cos(phi));",
                "#endif",
                "#if VDIST==0",
                "vec3 v = ivel_box + ( vec3(-0.5) + ",
                "  vec3(rand(vec2(pid*count, pid*3.0)), rand(vec2(pid*count, pid*2.0)), rand(vec2(pid*count, pid*1.0))) )",
                "  * vspread_box;",
                "#else",
                "vec3 v = (ivel_sphere + (rand(vec2(pid*count, pid*3.0)) - 0.5) * vspread_sphere) * normalize(p);",
                "#endif",
                "vec3 pos = accel*ptime*ptime*0.5 + v*ptime + p + ipos;",
                "vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0 );",
                "gl_PointSize = scale * resolution.x * 50.0 / length( mvPosition.xyz );",
                "gl_Position = projectionMatrix * mvPosition;",
                "}",
            ].join("\n");
        }
        get fragmentShader() {
            return [
                "uniform sampler2D image;",
                "varying vec4 vColor;",
                "varying float vAngle;",
                "void main()",
                "{",
                "float x = gl_PointCoord.x - 0.5;",
                "float y = 1.0 - gl_PointCoord.y - 0.5;",
                "float c = cos(-vAngle);",
                "float s = sin(-vAngle);",
                "vec2 rotatedUV = vec2(c * x + s * y + 0.5, c * y - s * x + 0.5);",
                "vec4 tcolor = texture2D( image,  rotatedUV );",
                "gl_FragColor = tcolor * vColor;",
                "}",
            ].join("\n");
        }
        redrawGradient(e, t) {
            if (0 !== t.length) {
                t.sort(function (e, t) {
                    return e.position - t.position;
                });
                for (var r = { r: 0, g: 0, b: 0, a: 0 }, i = 0; i < e.length / 4; i++)
                    s((i / e.length) * 4),
                        (e[4 * i + 0] = Math.floor(r.r * r.a)),
                        (e[4 * i + 1] = Math.floor(r.g * r.a)),
                        (e[4 * i + 2] = Math.floor(r.b * r.a)),
                        (e[4 * i + 3] = Math.floor(255 * r.a));
            }
            function a(e) {
                var t = e.split("(")[1].split(")")[0].split(","),
                    r = { r: 0, g: 0, b: 0, a: 0 };
                return (
                    (r.r = parseInt(t[0])),
                    (r.g = parseInt(t[1])),
                    (r.b = parseInt(t[2])),
                    (r.a = undefined !== t[3] ? parseFloat(t[3]) : 1),
                    r
                );
            }
            function s(e, i) {
                for (var s, n, o, p = t[0], l = 0; l < t.length; l++) {
                    if (!(t[l].position < e)) {
                        if (t[l].position === e) {
                            p = t[l];
                            break;
                        }
                        p !== t[l] && (s = t[l]);
                        break;
                    }
                    p = t[l];
                }
                "string" == typeof (n = { position: p.position, color: p.color }).color && (n.color = a(n.color)),
                    s &&
                        ("string" == typeof (o = { position: s.position, color: s.color }).color &&
                            (o.color = a(o.color)),
                        (function (e, t, r) {
                            function i(e, t, r) {
                                return (t - e) * r + e;
                            }
                            var a = (r - e.position) / (t.position - e.position);
                            (e.color.r = i(e.color.r, t.color.r, a)),
                                (e.color.g = i(e.color.g, t.color.g, a)),
                                (e.color.b = i(e.color.b, t.color.b, a)),
                                (e.color.a = i(e.color.a, t.color.a, a));
                        })(n, o, e)),
                    Object.assign(r, n.color);
            }
        }
        load(e) {
            (this.colorTex = new THREE.DataTexture(new Uint8Array(128), 32, 1, THREE.RGBAFormat)),
                (this.colorTex.minFilter = this.colorTex.magFilter = THREE.LinearFilter),
                (this.sizeTex = new THREE.DataTexture(new Uint8Array(128), 32, 1, THREE.RGBAFormat)),
                (this.sizeTex.minFilter = this.sizeTex.magFilter = THREE.LinearFilter),
                (this.material = new THREE.ShaderMaterial({
                    uniforms: {
                        resolution: { type: "v2", value: new THREE.Vector2(1920, 1080) },
                        image: { type: "t", value: null },
                        color: { type: "t", value: this.colorTex },
                        size: { type: "t", value: this.sizeTex },
                        time: { type: "f", value: 0 },
                        rate: { type: "f", value: 0 },
                        lifetime: { type: "f", value: 0 },
                        accel: { type: "v3", value: new THREE.Vector3() },
                        vdist: { type: "f", value: 0 },
                        ivel_box: { type: "v3", value: new THREE.Vector3() },
                        vspread_box: { type: "v3", value: new THREE.Vector3() },
                        ivel_sphere: { type: "f", value: 0 },
                        vspread_sphere: { type: "f", value: 0 },
                        pdist: { type: "f", value: 0 },
                        ipos: { type: "v3", value: new THREE.Vector3() },
                        pspread_box: { type: "v3", value: new THREE.Vector3() },
                        pspread_sphere: { type: "v3", value: new THREE.Vector3() },
                        iang: { type: "f", value: 0 },
                        aspread: { type: "f", value: 0 },
                        angvel: { type: "f", value: 0 },
                        avspread: { type: "f", value: 0 },
                    },
                    vertexShader: this.vertexShader,
                    fragmentShader: this.fragmentShader,
                    transparent: true,
                    depthTest: true,
                    depthWrite: false,
                })),
                (this.threeObj = new THREE.Points(new THREE.BufferGeometry(), this.material)),
                (this.threeObj.frustumCulled = false),
                (this.threeObj.onBeforeRender = function (e) {
                    let t = e.getSize();
                    this.material.uniforms.resolution.value.set(t.width, t.height);
                }),
                this.parentChanged(),
                this.properties.load(e && e.properties),
                "object" != typeof e && this.randomize();
        }
        randomize() {
            var e = this.properties,
                t = this.getParentOfType(PZ.clip).length,
                r = t / this.getParentOfType(PZ.sequence).properties.rate.get(),
                i = PZ.random.number(1, 4, true);
            let a = [];
            for (var s = 0; s < i; s++)
                a.push({
                    position: PZ.random.number(0, 1),
                    color: PZ.random.htmlColor((0 === s && i > 1) || s === i - 1),
                });
            e.color.set(a);
            var n = PZ.random.number(1, 4, true);
            let o = [];
            for (s = 0; s < n; s++) o.push({ position: PZ.random.number(0, 1), color: PZ.random.grayColor() });
            e.size.set(o),
                e.number.set(PZ.random.number(1, 1e3, true)),
                e.rate.set(Math.round(PZ.random.number(0.1, 3) * e.number.get())),
                PZ.random.number(0, 1) > 0.5
                    ? e.lifetime.set(e.number.get() / e.rate.get())
                    : e.lifetime.set(PZ.random.normal(r, 0.5 * r));
            let p = 0;
            PZ.random.number(0, 1) > 0.3 && (p = e.number.get() / e.rate.get());
            let l = {
                animated: true,
                keyframes: [
                    { frame: 0, value: p, tween: 1 },
                    {
                        frame: t - 1,
                        value: p + r * PZ.random.number(0.1, 3),
                        tween: PZ.random.number(0, 1) > 0.9 ? PZ.random.number(2, 31, true) : 1,
                    },
                ],
            };
            e.time.load(l), e.pdist.set(PZ.random.number(0, 2, true));
            var h = 500 * PZ.random.number(0, 2, true);
            0 === e.pdist.get()
                ? e.pspread.set([PZ.random.normal(h, 300), PZ.random.normal(h, 300), PZ.random.normal(h, 300)])
                : (e.iradius.set(PZ.random.normal(h, 300)), e.rspread.set(PZ.random.number(1, 2 * e.iradius.get()))),
                e.vdist.set(PZ.random.number(0, 1, true)),
                0 === e.vdist.get()
                    ? (e.ivel.set([PZ.random.normal(0, 100), PZ.random.normal(0, 100), PZ.random.normal(0, 100)]),
                      e.vspread.set([
                          Math.abs(PZ.random.normal(0, 100)),
                          Math.abs(PZ.random.normal(0, 100)),
                          Math.abs(PZ.random.normal(0, 100)),
                      ]))
                    : (e.irvel.set(PZ.random.normal(100, 200)), e.rvspread.set(Math.abs(PZ.random.normal(0, 100)))),
                PZ.random.number(0, 1) > 0.3
                    ? e.accel.set([PZ.random.normal(0, 100), PZ.random.normal(0, 100), PZ.random.normal(0, 100)])
                    : e.accel.set([0, 0, 0]),
                e.iang.set(PZ.random.number(0, 359)),
                PZ.random.number(0, 1) > 0.2 ? e.aspread.set(PZ.random.number(0, 359)) : e.aspread.set(0),
                PZ.random.number(0, 1) > 0.4
                    ? (e.angvel.set(PZ.random.normal(0, 20)), e.avspread.set(Math.abs(PZ.random.normal(0, 200))))
                    : (e.angvel.set(0), e.avspread.set(0)),
                e.blending.set(PZ.random.number(0, 1, true));
            var c =
                "/assets/textures/particles/" +
                this.presetTextures[PZ.random.number(0, this.presetTextures.length - 1, true)] +
                ".png";
            this.parentProject.assets.createFromPreset(PZ.asset.type.IMAGE, c);
            e.texture.set(c);
            var u = this.texture.getTexture();
            this.material.uniforms.image.value = u;
        }
        updateProps() {
            let e,
                t = this.material.uniforms,
                r = this.properties;
            this.redrawGradient(this.colorTex.image.data, r.color.get()),
                this.redrawGradient(this.sizeTex.image.data, r.size.get()),
                (t.color.value.needsUpdate = true),
                (t.size.value.needsUpdate = true),
                this.updateNumber(),
                (t.rate.value = r.rate.get()),
                (t.lifetime.value = r.lifetime.get()),
                (e = r.ipos.get()),
                t.ipos.value.set(e[0], e[1], e[2]),
                (this.material.defines.PDIST = 0 === r.pdist.get() ? 0 : 1),
                r.pdist.get() > 0
                    ? ((t.pspread_sphere.value.x = r.iradius.get()),
                      (t.pspread_sphere.value.y = r.rspread.get()),
                      (t.pspread_sphere.value.z = 1 === r.pdist.get() ? 1 : 0))
                    : ((e = r.pspread.get()), t.pspread_box.value.set(e[0], e[1], e[2])),
                (this.material.defines.VDIST = r.vdist.get()),
                r.vdist.get() > 0
                    ? ((t.ivel_sphere.value = r.irvel.get()), (t.vspread_sphere.value = r.rvspread.get()))
                    : ((e = r.ivel.get()),
                      t.ivel_box.value.set(e[0], e[1], e[2]),
                      (e = r.vspread.get()),
                      t.vspread_box.value.set(e[0], e[1], e[2])),
                (e = r.accel.get()),
                t.accel.value.set(e[0], e[1], e[2]),
                (t.iang.value = (r.iang.get() / 180) * Math.PI),
                (t.aspread.value = (r.aspread.get() / 180) * Math.PI),
                (t.angvel.value = (r.angvel.get() / 180) * Math.PI),
                (t.avspread.value = (r.avspread.get() / 180) * Math.PI),
                (this.material.blending = r.blending.get() + 1),
                (this.material.needsUpdate = true);
        }
        updateNumber() {
            null !== this.threeObj.geometry && this.threeObj.geometry.dispose();
            let e = this.properties.number.get();
            for (var t = new Float32Array(3 * e), r = new Float32Array(e), i = 0; i < e; i++)
                (r[i] = i), (t[3 * i] = 0), (t[3 * i + 1] = 0), (t[3 * i + 2] = 0);
            (this.threeObj.geometry = new THREE.BufferGeometry()),
                this.threeObj.geometry.addAttribute("position", new THREE.BufferAttribute(t, 3)),
                this.threeObj.geometry.addAttribute("pid", new THREE.BufferAttribute(r, 1)),
                (this.threeObj.geometry.buffersNeedUpdate = true);
        }
        toJSON() {
            return { type: this.type, properties: this.properties };
        }
        unload() {
            this.colorTex.dispose(),
                this.sizeTex.dispose(),
                this.texture &&
                    (this.parentProject.assets.unload(this.texture), this.material.uniforms.image.value.dispose());
        }
        update(e) {
            this.material.uniforms.time.value = this.properties.time.get(e);
        }
        async prepare(e) {
            this.texture && (await this.texture.loading);
        }
    }),
    (PZ.object3d.particles.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Particles" },
        time: { dynamic: true, name: "Time", type: PZ.property.type.NUMBER, value: 0, step: 0.01, decimals: 2 },
        color: {
            name: "Color",
            type: PZ.property.type.GRADIENT,
            value: [{ position: 0, color: "rgba(255,255,255,1.0)" }],
            changed: function () {
                let e = this.parentObject;
                e.redrawGradient(e.colorTex.image.data, this.value),
                    (e.material.uniforms.color.value.needsUpdate = true);
            },
        },
        size: {
            name: "Size",
            type: PZ.property.type.GRADIENT,
            value: [{ position: 0, color: "rgba(255,255,255,1.0)" }],
            changed: function (e) {
                let t = this.parentObject;
                t.redrawGradient(t.sizeTex.image.data, this.value), (t.material.uniforms.size.value.needsUpdate = true);
            },
        },
        number: {
            name: "Number of particles",
            type: PZ.property.type.NUMBER,
            value: 0,
            changed: function () {
                this.parentObject.updateNumber();
            },
            min: 1,
            decimals: 0,
            step: 1,
        },
        rate: {
            name: "Emitter rate",
            type: PZ.property.type.NUMBER,
            value: 0,
            changed: function () {
                this.parentObject.material.uniforms.rate.value = this.value;
            },
            min: 1,
            step: 1,
        },
        lifetime: {
            name: "Particle lifetime",
            type: PZ.property.type.NUMBER,
            value: 0,
            changed: function () {
                this.parentObject.material.uniforms.lifetime.value = this.value;
            },
            max: 1e3,
            min: 0.01,
            step: 1,
        },
        pdist: {
            name: "Position mode",
            type: PZ.property.type.OPTION,
            value: 0,
            items: "box;sphere;disk",
            changed: function () {
                let e = this.parentObject;
                (e.material.defines.PDIST = 0 === this.value ? 0 : 1),
                    (e.material.uniforms.pspread_sphere.value.z = 1 === this.value ? 1 : 0),
                    (e.material.needsUpdate = true);
            },
        },
        ipos: {
            name: "Position",
            type: PZ.property.type.VECTOR3,
            value: [0, 0, 0],
            changed: function () {
                let e = this.parentObject,
                    t = this.value;
                e.material.uniforms.ipos.value.set(t[0], t[1], t[2]);
            },
            step: 1,
        },
        pspread: {
            name: "Position spread",
            type: PZ.property.type.VECTOR3,
            value: [1, 1, 1],
            changed: function () {
                let e = this.parentObject,
                    t = this.value;
                e.material.uniforms.pspread_box.value.set(t[0], t[1], t[2]);
            },
            min: 0,
            step: 1,
        },
        iradius: {
            name: "Radius",
            type: PZ.property.type.NUMBER,
            value: 0,
            changed: function () {
                this.parentObject.material.uniforms.pspread_sphere.value.x = this.value;
            },
            step: 1,
        },
        rspread: {
            name: "Radius spread",
            type: PZ.property.type.NUMBER,
            value: 0,
            changed: function () {
                this.parentObject.material.uniforms.pspread_sphere.value.y = this.value;
            },
            step: 1,
        },
        vdist: {
            name: "Speed mode",
            type: PZ.property.type.OPTION,
            value: 0,
            items: "box;sphere",
            changed: function () {
                let e = this.parentObject;
                (e.material.defines.VDIST = this.value), (e.material.needsUpdate = true);
            },
        },
        ivel: {
            name: "Speed",
            type: PZ.property.type.VECTOR3,
            value: [0, 0, 0],
            changed: function () {
                let e = this.parentObject,
                    t = this.value;
                e.material.uniforms.ivel_box.value.set(t[0], t[1], t[2]);
            },
            step: 1,
        },
        vspread: {
            name: "Speed spread",
            type: PZ.property.type.VECTOR3,
            value: [0, 0, 0],
            changed: function () {
                let e = this.parentObject,
                    t = this.value;
                e.material.uniforms.vspread_box.value.set(t[0], t[1], t[2]);
            },
            min: 0,
            step: 1,
        },
        irvel: {
            name: "Radial speed",
            type: PZ.property.type.NUMBER,
            value: 0,
            changed: function () {
                this.parentObject.material.uniforms.ivel_sphere.value = this.value;
            },
            min: -1e3,
            step: 1,
        },
        rvspread: {
            name: "Radial speed spread",
            type: PZ.property.type.NUMBER,
            value: 0,
            changed: function () {
                this.parentObject.material.uniforms.vspread_sphere.value = this.value;
            },
            min: 0,
            step: 1,
        },
        accel: {
            name: "Gravity",
            type: PZ.property.type.VECTOR3,
            value: [0, 0, 0],
            changed: function () {
                let e = this.parentObject,
                    t = this.value;
                e.material.uniforms.accel.value.set(t[0], t[1], t[2]);
            },
            step: 1,
        },
        iang: {
            name: "Rotation",
            type: PZ.property.type.NUMBER,
            value: 0,
            changed: function () {
                this.parentObject.material.uniforms.iang.value = (this.value / 180) * Math.PI;
            },
            max: 360,
            min: 0,
            step: 1,
        },
        aspread: {
            name: "Rotation spread",
            type: PZ.property.type.NUMBER,
            value: 0,
            changed: function () {
                this.parentObject.material.uniforms.aspread.value = (this.value / 180) * Math.PI;
            },
            max: 360,
            min: 0,
            step: 1,
        },
        angvel: {
            name: "Rotation speed",
            type: PZ.property.type.NUMBER,
            value: 0,
            changed: function () {
                this.parentObject.material.uniforms.angvel.value = (this.value / 180) * Math.PI;
            },
            step: 1,
        },
        avspread: {
            name: "Rotation speed spread",
            type: PZ.property.type.NUMBER,
            value: 0,
            changed: function () {
                this.parentObject.material.uniforms.avspread.value = (this.value / 180) * Math.PI;
            },
            step: 1,
        },
        blending: {
            name: "Blending mode",
            items: "normal;add",
            type: PZ.property.type.OPTION,
            value: 0,
            changed: function () {
                this.parentObject.material.blending = this.value + 1;
            },
        },
        texture: {
            name: "Texture",
            items: PZ.object3d.particles.prototype.presetTextures,
            type: PZ.property.type.ASSET,
            baseUrl: "/assets/textures/particles/",
            assetType: PZ.asset.type.IMAGE,
            accept: "image/*",
            value: null,
            changed: function () {
                let e = this.parentObject;
                if (
                    (e.texture &&
                        (e.parentProject.assets.unload(e.texture),
                        (e.texture = null),
                        e.material.uniforms.image.value.dispose(),
                        (e.material.uniforms.image.value = null)),
                    this.value)
                ) {
                    e.texture = new PZ.asset.image(e.parentProject.assets.load(this.value));
                    let t = e.texture.getTexture(true);
                    e.material.uniforms.image.value = t;
                }
                e.material.needsUpdate = true;
            },
        },
    }),
    (PZ.object3d.particles.prototype.defaultName = "Particles"),
    (PZ.object3d.shape = class extends PZ.object3d {
        constructor() {
            super(),
                (this.threeObj = null),
                (this.objectType = 0),
                (this.customGeometry = null),
                (this.geometryNeedsUpdate = true),
                (this.materials = new PZ.objectSingleton(this, PZ.material)),
                this.properties.addAll({
                    name: PZ.property.create(PZ.object3d.shape.propertyDefinitions.name),
                    geometryProperties: new PZ.propertyList(),
                    position: PZ.property.create(PZ.object3d.shape.propertyDefinitions.position),
                    rotation: PZ.property.create(PZ.object3d.shape.propertyDefinitions.rotation),
                    scale: PZ.property.create(PZ.object3d.shape.propertyDefinitions.scale),
                    eulerOrder: PZ.property.create(PZ.object3d.shape.propertyDefinitions.eulerOrder),
                }),
                this.children.push(this.materials);
        }
        static changeFn() {
            this.parentObject.geometryNeedsUpdate = true;
        }
        get material() {
            return this.materials[0];
        }
        load(e) {
            if (
                ("object" == typeof e && (this.objectType = e.objectType),
                this.createMesh(),
                this.properties.load(e && e.properties),
                "object" == typeof e && e.material)
            ) {
                let t = PZ.material.create(e.material.type);
                this.materials.push(t), (t.loading = t.load(e.material));
            }
            if (!this.material) {
                let e = PZ.material.create("singlecolor");
                this.materials.push(e), (e.loading = e.load());
            }
        }
        toJSON() {
            return {
                type: this.type,
                objectType: this.objectType,
                properties: this.properties,
                material: this.material,
            };
        }
        unload() {
            this.customGeometry &&
                (this.parentProject.assets.unload(this.customGeometry), this.threeObj.geometry.dispose()),
                this.material && this.material.unload();
        }
        update(e) {
            let t;
            this.geometryNeedsUpdate && (this.generatePresetGeometry(), (this.geometryNeedsUpdate = false)),
                (t = this.properties.position.get(e)),
                this.threeObj.position.set(t[0], t[1], t[2]),
                (t = this.properties.rotation.get(e)),
                this.threeObj.rotation.set(t[0], t[1], t[2]),
                (t = this.properties.scale.get(e)),
                this.threeObj.scale.set(t[0], t[1], t[2]),
                this.material && this.material.update(e);
        }
        async prepare(e) {
            this.customGeometry && (await this.customGeometry.loading),
                this.material && (await this.material.loading, await this.material.prepare(e));
        }
        updateGeometry(e) {
            this.threeObj &&
                (this.threeObj.geometry && (this.threeObj.geometry.dispose(), (this.threeObj.geometry = null)),
                e && ((this.threeObj.geometry = e), (this.threeObj.geometry.buffersNeedUpdate = true)));
        }
        generatePresetGeometry() {
            if (99 === this.objectType)
                return void this.customGeometry.getGeometry().then((e) => {
                    this.updateGeometry(e);
                });
            let e,
                t = this.properties.geometryProperties;
            switch (this.objectType) {
                case 1:
                    e = new THREE.BoxGeometry(t.box_size.get()[0], t.box_size.get()[1], t.box_size.get()[2]);
                    break;
                case 2:
                    e = new THREE.CylinderGeometry(
                        t.cylinder_size.get()[0],
                        t.cylinder_size.get()[1],
                        t.cylinder_size.get()[2],
                        t.cylinder_detail.get(),
                        1,
                        !t.cylinder_openEnded.get()
                    );
                    break;
                case 3:
                    e = new THREE.PlaneGeometry(t.rect_size.get()[0], t.rect_size.get()[1]);
                    break;
                case 4:
                    e = new THREE.CircleGeometry(t.circle_size.get(), t.circle_detail.get(), 0, 2 * Math.PI);
                    break;
                case 5:
                    e = new THREE.SphereGeometry(
                        t.sphere_size.get(),
                        t.sphere_detail.get()[0],
                        t.sphere_detail.get()[1],
                        0,
                        2 * Math.PI,
                        0,
                        Math.PI
                    );
                    break;
                case 6:
                    e = new THREE.TorusGeometry(
                        t.donut_size.get()[0],
                        t.donut_size.get()[1],
                        t.donut_detail.get()[0],
                        t.donut_detail.get()[1],
                        2 * Math.PI
                    );
                    break;
                case 7:
                    let i = [];
                    for (let e = 0; e < t.path_loops.get() * t.path_detail.get()[1]; e++)
                        i.push(
                            new THREE.Vector3(
                                t.path_size.get()[0] * Math.cos((2 * Math.PI * e) / t.path_detail.get()[1]),
                                t.path_size.get()[1] * Math.sin((2 * Math.PI * e) / t.path_detail.get()[1]),
                                (t.path_size.get()[2] * e) / t.path_detail.get()[1]
                            )
                        );
                    let a = new THREE.CatmullRomCurve3(i),
                        s = { steps: 10 * t.path_detail.get()[1], bevelEnabled: false, extrudePath: a },
                        n = [],
                        o = t.path_thickness.get();
                    for (let e = 0; e < t.path_detail.get()[0]; e++) {
                        var r = (e / t.path_detail.get()[0]) * 2 * Math.PI;
                        n.push(new THREE.Vector2(Math.cos(r) * o, Math.sin(r) * o));
                    }
                    let p = new THREE.Shape(n);
                    (e = new THREE.ExtrudeGeometry(p, s)).computeFaceNormals(), e.computeVertexNormals();
            }
            e.center(), this.updateGeometry(e);
        }
        createMesh() {
            let e = "Shape";
            switch (this.objectType) {
                case 1:
                    (e = "Box"),
                        this.properties.geometryProperties.addAll({
                            box_size: PZ.property.create(PZ.object3d.shape.propertyDefinitions.box_size),
                        });
                    break;
                case 2:
                    (e = "Cylinder"),
                        this.properties.geometryProperties.addAll({
                            cylinder_size: PZ.property.create(PZ.object3d.shape.propertyDefinitions.cylinder_size),
                            cylinder_detail: PZ.property.create(PZ.object3d.shape.propertyDefinitions.cylinder_detail),
                            cylinder_openEnded: PZ.property.create(
                                PZ.object3d.shape.propertyDefinitions.cylinder_openEnded
                            ),
                        });
                    break;
                case 3:
                    (e = "Rectangle"),
                        this.properties.geometryProperties.addAll({
                            rect_size: PZ.property.create(PZ.object3d.shape.propertyDefinitions.rect_size),
                        });
                    break;
                case 4:
                    (e = "Circle"),
                        this.properties.geometryProperties.addAll({
                            circle_size: PZ.property.create(PZ.object3d.shape.propertyDefinitions.circle_size),
                            circle_detail: PZ.property.create(PZ.object3d.shape.propertyDefinitions.circle_detail),
                        });
                    break;
                case 5:
                    (e = "Sphere"),
                        this.properties.geometryProperties.addAll({
                            sphere_size: PZ.property.create(PZ.object3d.shape.propertyDefinitions.sphere_size),
                            sphere_detail: PZ.property.create(PZ.object3d.shape.propertyDefinitions.sphere_detail),
                        });
                    break;
                case 6:
                    (e = "Donut"),
                        this.properties.geometryProperties.addAll({
                            donut_size: PZ.property.create(PZ.object3d.shape.propertyDefinitions.donut_size),
                            donut_detail: PZ.property.create(PZ.object3d.shape.propertyDefinitions.donut_detail),
                        });
                    break;
                case 7:
                    (e = "Wire"),
                        this.properties.geometryProperties.addAll({
                            path_size: PZ.property.create(PZ.object3d.shape.propertyDefinitions.path_size),
                            path_thickness: PZ.property.create(PZ.object3d.shape.propertyDefinitions.path_thickness),
                            path_loops: PZ.property.create(PZ.object3d.shape.propertyDefinitions.path_loops),
                            path_detail: PZ.property.create(PZ.object3d.shape.propertyDefinitions.path_detail),
                        });
                    break;
                case 99:
                    (e = "Geometry"),
                        this.properties.geometryProperties.addAll({
                            customGeometry: PZ.property.create(PZ.object3d.shape.propertyDefinitions.customGeometry),
                        });
            }
            this.properties.name.set(e),
                (this.threeObj = new THREE.Mesh(new THREE.Geometry(), new THREE.Material())),
                (this.threeObj.material.visible = false),
                (this.threeObj.castShadow = true),
                (this.threeObj.receiveShadow = true),
                this.parentChanged();
        }
    }),
    (PZ.object3d.shape.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Shape" },
        customGeometry: {
            visible: false,
            name: "Geometry",
            type: PZ.property.type.ASSET,
            assetType: PZ.property.type.GEOMETRY,
            value: null,
            changed: function () {
                let e = this.parentObject;
                e.customGeometry && e.parentProject.assets.unload(e.customGeometry),
                    this.value &&
                        ((e.customGeometry = new PZ.asset.geometry(e.parentProject.assets.load(this.value))),
                        (e.geometryNeedsUpdate = true));
            },
        },
        box_size: {
            name: "Box size",
            type: PZ.property.type.VECTOR3,
            subtitle1: "width",
            subtitle2: "height",
            subtitle3: "depth",
            value: [10, 10, 10],
            min: 0,
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        cylinder_size: {
            name: "Cylinder size",
            type: PZ.property.type.VECTOR3,
            subtitle1: "top radius",
            subtitle2: "bottom radius",
            subtitle3: "height",
            value: [10, 10, 10],
            min: 0,
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        cylinder_detail: {
            name: "Detail",
            type: PZ.property.type.NUMBER,
            value: 10,
            min: 0,
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        cylinder_openEnded: {
            name: "End faces",
            type: PZ.property.type.OPTION,
            items: "open;closed",
            value: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        rect_size: {
            name: "Rectangle size",
            type: PZ.property.type.VECTOR2,
            subtitle1: "width",
            subtitle2: "height",
            value: [10, 10],
            min: 0,
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        circle_size: {
            name: "Circle radius",
            type: PZ.property.type.NUMBER,
            value: 10,
            min: 0,
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        circle_detail: {
            name: "Detail",
            type: PZ.property.type.NUMBER,
            value: 10,
            min: 1,
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        sphere_size: {
            name: "Sphere radius",
            type: PZ.property.type.NUMBER,
            value: 10,
            min: 0,
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        sphere_detail: {
            name: "Detail",
            type: PZ.property.type.VECTOR2,
            subtitle1: "horizontal",
            subtitle2: "vertical",
            value: [10, 10],
            min: 1,
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        donut_size: {
            name: "Donut size",
            type: PZ.property.type.VECTOR2,
            subtitle1: "radius",
            subtitle2: "tube radius",
            value: [10, 10],
            min: 0,
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        donut_detail: {
            name: "Detail",
            type: PZ.property.type.VECTOR2,
            subtitle1: "inner",
            subtitle2: "outer",
            value: [10, 10],
            min: 1,
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        path_size: {
            name: "Wire size",
            type: PZ.property.type.VECTOR3,
            subtitle1: "horizontal",
            subtitle2: "vertical",
            subtitle3: "stretch",
            value: [10, 10, 10],
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        path_thickness: {
            name: "Thickness",
            type: PZ.property.type.NUMBER,
            value: 2,
            min: 1,
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        path_loops: {
            name: "Loops",
            type: PZ.property.type.NUMBER,
            value: 5,
            vmin: 1,
            vstep: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        path_detail: {
            name: "Detail",
            type: PZ.property.type.VECTOR2,
            value: [10, 10],
            subtitle1: "inner",
            subtitle2: "outer",
            min: 1,
            step: 1,
            decimals: 0,
            changed: PZ.object3d.shape.changeFn,
        },
        position: {
            dynamic: true,
            group: true,
            objects: [
                { dynamic: true, name: "Position.X", type: PZ.property.type.NUMBER, value: 0 },
                { dynamic: true, name: "Position.Y", type: PZ.property.type.NUMBER, value: 0 },
                { dynamic: true, name: "Position.Z", type: PZ.property.type.NUMBER, value: 0 },
            ],
            name: "Position",
            type: PZ.property.type.VECTOR3,
        },
        rotation: {
            dynamic: true,
            group: true,
            objects: [
                {
                    dynamic: true,
                    name: "Rotation.X",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                },
                {
                    dynamic: true,
                    name: "Rotation.Y",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                },
                {
                    dynamic: true,
                    name: "Rotation.Z",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                },
            ],
            name: "Rotation",
            type: PZ.property.type.VECTOR3,
            scaleFactor: Math.PI / 180,
        },
        scale: {
            dynamic: true,
            group: true,
            objects: [
                {
                    dynamic: true,
                    name: "Scale.X",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
                {
                    dynamic: true,
                    name: "Scale.Y",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
                {
                    dynamic: true,
                    name: "Scale.Z",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
            ],
            name: "Scale",
            type: PZ.property.type.VECTOR3,
            linkRatio: true,
        },
        eulerOrder: {
            name: "Rotation order",
            type: PZ.property.type.LIST,
            value: "XYZ",
            items: PZ.object3d.eulerOrders,
            changed: function () {
                this.parentObject.threeObj.rotation.order = this.value;
            },
        },
    }),
    (PZ.object3d.shape.prototype.defaultName = "Shape"),
    (PZ.object3d.text = class extends PZ.object3d {
        constructor() {
            super(),
                (this.threeObj = null),
                (this.font = null),
                (this.fontNeedsUpdate = true),
                (this.geometryNeedsUpdate = true),
                (this.materials = new PZ.objectSingleton(this, PZ.material)),
                this.properties.addAll(PZ.object3d.text.propertyDefinitions),
                this.children.push(this.materials);
        }
        static changeFn() {
            this.parentObject.geometryNeedsUpdate = true;
        }
        get material() {
            return this.materials[0];
        }
        updateGeometry() {
            let e = this.font;
            e &&
                e.font3d &&
                (this.threeObj.geometry.dispose(),
                (this.threeObj.geometry = new THREE.TextGeometry(this.properties.text.get(), {
                    size: this.properties.size.get()[0],
                    height: this.properties.size.get()[1],
                    curveSegments: this.properties.detail.get(),
                    font: e.font3d,
                    bevelEnabled: !!this.properties.bevel.get(),
                    bevelThickness: this.properties.bevelSize.get()[0],
                    bevelSize: this.properties.bevelSize.get()[1],
                    material: 0,
                    extrudeMaterial: 1,
                })),
                (this.threeObj.geometry.buffersNeedUpdate = true),
                this.center());
        }
        updateFont() {
            let e = this.font;
            e &&
                e.get3DFont().then((t) => {
                    this.font === e && (this.geometryNeedsUpdate = true);
                });
        }
        load(e) {
            if (
                ((this.threeObj = new THREE.Mesh(new THREE.Geometry(), new THREE.Material())),
                (this.threeObj.material.visible = false),
                this.properties.load(e && e.properties),
                "object" == typeof e && e.material)
            ) {
                let t = PZ.material.create(e.material.type);
                this.materials.push(t), (t.loading = t.load(e.material));
            }
            if (!this.material) {
                let e = PZ.material.create("singlecolor");
                this.materials.push(e), (e.loading = e.load());
            }
            this.center(),
                (this.threeObj.castShadow = true),
                (this.threeObj.receiveShadow = true),
                this.parentChanged();
        }
        toJSON() {
            return { type: this.type, properties: this.properties, material: this.material };
        }
        unload() {
            this.font && this.parentProject.assets.unload(this.font), this.material && this.material.unload();
        }
        update(e) {
            let t;
            this.fontNeedsUpdate && (this.updateFont(), (this.fontNeedsUpdate = false)),
                this.geometryNeedsUpdate && (this.updateGeometry(), (this.geometryNeedsUpdate = false)),
                (t = this.properties.position.get(e)),
                this.threeObj.position.set(t[0], t[1], t[2]),
                (t = this.properties.rotation.get(e)),
                this.threeObj.rotation.set(t[0], t[1], t[2]),
                (t = this.properties.scale.get(e)),
                this.threeObj.scale.set(t[0], t[1], t[2]),
                this.material && this.material.update(e);
        }
        async prepare(e) {
            this.font && (await this.font.loading3d),
                this.material && (await this.material.loading, await this.material.prepare(e));
        }
        center() {
            this.threeObj.geometry.computeBoundingBox();
            var e = this.threeObj.geometry.boundingBox,
                t = new THREE.Vector3();
            switch ((t.addVectors(e.min, e.max), t.multiplyScalar(-0.5), this.properties.positionMode.get())) {
                case 1:
                    t.x -= t.x;
                    break;
                case 2:
                    t.x += t.x;
                    break;
                case 3:
                    t.y += t.y;
                    break;
                case 4:
                    t.y -= t.y;
                    break;
                case 5:
                    t.z += t.z;
                    break;
                case 6:
                    t.z -= t.z;
            }
            this.threeObj.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(t.x, t.y, t.z)),
                this.threeObj.geometry.computeBoundingBox();
        }
    }),
    (PZ.object3d.text.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Text" },
        text: { name: "Text", type: PZ.property.type.TEXT, value: "text", changed: PZ.object3d.text.changeFn },
        font: {
            name: "Font",
            type: PZ.property.type.ASSET,
            assetType: PZ.asset.type.FONT,
            value: "/assets/fonts/2d/bebas.ttf",
            accept: ".ttf,.otf,.woff,.woff2",
            changed: function () {
                let e = this.parentObject;
                e.font && (e.parentProject.assets.unload(e.font), (e.font = null)),
                    this.value &&
                        ((e.font = new PZ.asset.font(e.parentProject.assets.load(this.value))),
                        (e.fontNeedsUpdate = true));
            },
        },
        size: {
            name: "Size",
            type: PZ.property.type.VECTOR2,
            value: [20, 3],
            subtitle1: "height",
            subtitle2: "thickness",
            changed: PZ.object3d.text.changeFn,
            max: 200,
            min: 1,
            step: 1,
            decimals: 0,
        },
        detail: {
            name: "Detail",
            type: PZ.property.type.NUMBER,
            value: 5,
            changed: PZ.object3d.text.changeFn,
            max: 200,
            min: 1,
            step: 1,
            decimals: 0,
        },
        bevel: {
            name: "Bevel",
            type: PZ.property.type.OPTION,
            value: 0,
            items: "off;on",
            changed: PZ.object3d.text.changeFn,
        },
        bevelSize: {
            name: "Bevel size",
            type: PZ.property.type.VECTOR2,
            value: [0.1, 0.5],
            subtitle1: "size",
            subtitle2: "thickness",
            changed: PZ.object3d.text.changeFn,
            min: 0.01,
            step: 0.1,
            decimals: 2,
        },
        positionMode: {
            name: "Center point",
            type: PZ.property.type.OPTION,
            value: 0,
            items: "center;left;right;top;bottom;front;back",
            changed: PZ.object3d.text.changeFn,
        },
        position: {
            dynamic: true,
            group: true,
            objects: [
                { dynamic: true, name: "Position.X", type: PZ.property.type.NUMBER, value: 0 },
                { dynamic: true, name: "Position.Y", type: PZ.property.type.NUMBER, value: 0 },
                { dynamic: true, name: "Position.Z", type: PZ.property.type.NUMBER, value: 0 },
            ],
            name: "Position",
            type: PZ.property.type.VECTOR3,
        },
        rotation: {
            dynamic: true,
            group: true,
            objects: [
                {
                    dynamic: true,
                    name: "Rotation.X",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                },
                {
                    dynamic: true,
                    name: "Rotation.Y",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                },
                {
                    dynamic: true,
                    name: "Rotation.Z",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                },
            ],
            name: "Rotation",
            type: PZ.property.type.VECTOR3,
            scaleFactor: Math.PI / 180,
        },
        scale: {
            dynamic: true,
            group: true,
            objects: [
                {
                    dynamic: true,
                    name: "Scale.X",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
                {
                    dynamic: true,
                    name: "Scale.Y",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
                {
                    dynamic: true,
                    name: "Scale.Z",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
            ],
            name: "Scale",
            type: PZ.property.type.VECTOR3,
            linkRatio: true,
        },
        eulerOrder: {
            name: "Rotation order",
            type: PZ.property.type.LIST,
            value: "XYZ",
            items: PZ.object3d.eulerOrders,
            changed: function () {
                this.parentObject.threeObj.rotation.order = this.value;
            },
        },
    }),
    (PZ.object3d.text.prototype.defaultName = "Text"),
    (PZ.object3d.group = class extends PZ.object3d {
        constructor() {
            super(),
                (this.threeObj = null),
                this.properties.addAll(PZ.object3d.group.propertyDefinitions),
                (this.customProperties = new PZ.objectList(this, PZ.property.dynamic)),
                (this.customProperties.name = "Custom properties"),
                (this.objects = new PZ.objectList(this, PZ.object3d)),
                this.children.push(this.customProperties, this.objects);
        }
        load(e) {
            if (
                ((this.threeObj = new THREE.Object3D()), this.properties.load(e && e.properties), "object" == typeof e)
            ) {
                var t = this.properties.reflectionVisibility.get();
                if (
                    ((this.threeObj.layers.mask = 0),
                    (0 !== t && 2 !== t) || this.threeObj.layers.enable(0),
                    (1 !== t && 2 !== t) || this.threeObj.layers.enable(10),
                    e.customProperties)
                )
                    for (let t = 0; t < e.customProperties.length; t++) {
                        let r = PZ.property.create(e.customProperties[t].type);
                        this.customProperties.push(r), r.load(e.customProperties[t]);
                    }
                for (let t = 0; t < e.objects.length; t++) {
                    let r = PZ.object3d.create(e.objects[t].type);
                    this.objects.push(r), (r.loading = r.load(e.objects[t]));
                }
            }
            this.parentChanged();
        }
        toJSON() {
            return {
                type: this.type,
                properties: this.properties,
                customProperties: this.customProperties,
                objects: this.objects,
            };
        }
        unload() {
            for (var e = 0; e < this.objects.length; e++) this.objects[e].unload();
        }
        update(e) {
            let t;
            (this.threeObj.visible = 1 === this.properties.enabled.get(e)),
                (t = this.properties.position.get(e)),
                this.threeObj.position.set(t[0], t[1], t[2]),
                (t = this.properties.rotation.get(e)),
                this.threeObj.rotation.set(t[0], t[1], t[2]),
                (t = this.properties.scale.get(e)),
                this.threeObj.scale.set(t[0], t[1], t[2]);
            for (var r = 0; r < this.objects.length; r++) this.objects[r].update(e);
        }
        async prepare(e) {
            for (var t = 0; t < this.objects.length; t++) await this.objects[t].prepare(e);
        }
    }),
    (PZ.object3d.group.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Group" },
        enabled: { dynamic: true, name: "Enabled", type: PZ.property.type.OPTION, value: 1, items: "off;on" },
        reflectionVisibility: {
            name: "Visibility",
            type: PZ.property.type.OPTION,
            value: 0,
            changed: function () {
                let e = this.parentObject;
                (e.threeObj.layers.mask = 0),
                    (0 !== this.value && 2 !== this.value) || e.threeObj.layers.enable(0),
                    (1 !== this.value && 2 !== this.value) || e.threeObj.layers.enable(10);
                for (var t = 0; t < e.objects.length; t++)
                    e.objects[t] instanceof PZ.object3d.group == false &&
                        (e.objects[t].threeObj.layers.mask = e.threeObj.layers.mask);
            },
            items: "normal;reflections only;scene + reflections",
        },
        position: {
            dynamic: true,
            group: true,
            objects: [
                { dynamic: true, name: "Position.X", type: PZ.property.type.NUMBER, value: 0 },
                { dynamic: true, name: "Position.Y", type: PZ.property.type.NUMBER, value: 0 },
                { dynamic: true, name: "Position.Z", type: PZ.property.type.NUMBER, value: 0 },
            ],
            name: "Position",
            type: PZ.property.type.VECTOR3,
        },
        rotation: {
            dynamic: true,
            group: true,
            objects: [
                {
                    dynamic: true,
                    name: "Rotation.X",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                },
                {
                    dynamic: true,
                    name: "Rotation.Y",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                },
                {
                    dynamic: true,
                    name: "Rotation.Z",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                },
            ],
            name: "Rotation",
            type: PZ.property.type.VECTOR3,
            scaleFactor: Math.PI / 180,
        },
        scale: {
            dynamic: true,
            group: true,
            objects: [
                {
                    dynamic: true,
                    name: "Scale.X",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
                {
                    dynamic: true,
                    name: "Scale.Y",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
                {
                    dynamic: true,
                    name: "Scale.Z",
                    type: PZ.property.type.NUMBER,
                    value: 1,
                    min: 0.001,
                    step: 0.1,
                    decimals: 3,
                },
            ],
            name: "Scale",
            type: PZ.property.type.VECTOR3,
            linkRatio: true,
        },
        eulerOrder: {
            name: "Rotation order",
            type: PZ.property.type.LIST,
            value: "XYZ",
            items: PZ.object3d.eulerOrders,
            changed: function () {
                this.parentObject.threeObj.rotation.order = this.value;
            },
        },
    }),
    (PZ.object3d.group.prototype.defaultName = "Group"),
    (PZ.object3d.camera = class extends PZ.object3d {
        constructor() {
            super(),
                (this.threeObj = null),
                (this.objectType = 1),
                (this.shake = new PZ.shake()),
                this.properties.addAll(PZ.object3d.camera.propertyDefinitions),
                this.properties.add("shake", this.shake.properties);
        }
        load(e) {
            "object" == typeof e && (this.objectType = e.objectType),
                this.changeObjectType(this.objectType),
                this.properties.load(e && e.properties);
        }
        toJSON() {
            return { type: this.type, objectType: this.objectType, properties: this.properties };
        }
        changeObjectType(e) {
            let t = "Camera";
            switch (((this.objectType = e), this.objectType)) {
                case 1:
                    (t = "Perspective Camera"), (this.threeObj = new THREE.PerspectiveCamera(60, 1, 0.1, 5e3));
                    break;
                case 2:
                    (t = "Orthographic Camera"),
                        (this.threeObj = new THREE.OrthographicCamera(-0.05, 0.05, 0.05, -0.05, 0.1, 5e3));
            }
            this.properties.name.set(t),
                this.parentChanged(),
                (this.parentLayer.pass.camera = this.threeObj),
                this.parentLayer.properties.resolution.onChanged.watch(this.resolutionChanged.bind(this), true);
        }
        resolutionChanged() {
            let e = this.parentProject.sequence.properties.resolution.get(),
                t = e[0],
                r = e[1];
            if (1 === this.objectType) {
                let t = e[0] / e[1];
                this.threeObj.aspect = t;
            } else
                (this.threeObj.left = -0.05 * t),
                    (this.threeObj.right = 0.05 * t),
                    (this.threeObj.top = 0.05 * r),
                    (this.threeObj.bottom = -0.05 * r);
            this.threeObj.updateProjectionMatrix();
        }
        update(e) {
            let t;
            (t = this.properties.position.get(e)),
                this.threeObj.position.set(t[0], t[1], t[2]),
                (t = this.properties.rotation.get(e)),
                this.threeObj.rotation.set(t[0], t[1], t[2]);
            let r = this.properties.shakeAmplitude.get(e),
                i = e * (this.properties.shakeSpeed.get(e) / 30);
            this.shake.shake(i, r, this.threeObj);
        }
    }),
    (PZ.object3d.camera.propertyDefinitions = {
        name: { visible: false, name: "Name", type: PZ.property.type.TEXT, value: "Camera" },
        position: {
            dynamic: true,
            group: true,
            objects: [
                { dynamic: true, name: "Position.X", type: PZ.property.type.NUMBER, value: 0, step: 1, decimals: 2 },
                { dynamic: true, name: "Position.Y", type: PZ.property.type.NUMBER, value: 0, step: 1, decimals: 2 },
                { dynamic: true, name: "Position.Z", type: PZ.property.type.NUMBER, value: 80, step: 1, decimals: 2 },
            ],
            name: "Position",
            type: PZ.property.type.VECTOR3,
        },
        rotation: {
            dynamic: true,
            group: true,
            objects: [
                {
                    dynamic: true,
                    name: "Rotation.X",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                    step: 1,
                },
                {
                    dynamic: true,
                    name: "Rotation.Y",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                    step: 1,
                },
                {
                    dynamic: true,
                    name: "Rotation.Z",
                    type: PZ.property.type.NUMBER,
                    value: 0,
                    scaleFactor: Math.PI / 180,
                    step: 1,
                },
            ],
            name: "Rotation",
            type: PZ.property.type.VECTOR3,
            scaleFactor: Math.PI / 180,
        },
        eulerOrder: {
            name: "Rotation order",
            type: PZ.property.type.LIST,
            value: "XYZ",
            items: PZ.object3d.eulerOrders,
            changed: function () {
                this.parentObject.threeObj.rotation.order = this.value;
            },
        },
        shakeAmplitude: {
            dynamic: true,
            name: "Shake amount",
            type: PZ.property.type.NUMBER,
            value: 0,
            max: 1,
            min: 0,
            step: 0.01,
            decimals: 3,
        },
        shakeSpeed: {
            dynamic: true,
            name: "Shake speed",
            type: PZ.property.type.NUMBER,
            value: 30,
            min: 0,
            step: 0.01,
        },
    }),
    (PZ.object3d.camera.prototype.defaultName = "Camera"),
    (PZ.ui = PZ.ui || {}),
    (PZ.ui.edit = PZ.ui.edit || {}),
    (PZ.ui.objectTypes = new Map()),
    PZ.ui.objectTypes.set(PZ.effect, [
        { name: "LAYER", category: true },
        { name: "Color Overlay", desc: "Blends a solid color over opaque areas.", type: "coloroverlay" },
        { name: "Gradient Overlay", desc: "Blends a gradient over opaque areas.", type: "gradientoverlay" },
        { name: "Image Overlay", desc: "Blends an image over opaque areas.", type: "overlay" },
        { name: "COLOR", category: true },
        { name: "Negative", desc: "Inverts colors.", type: "negative" },
        { name: "Saturation", desc: "Adjust color saturation and create grayscale effects.", type: "grayscale" },
        { name: "Brightness + Contrast", desc: "Adjust image brightness and contrast.", type: "brightnesscontrast" },
        {
            name: "Color Grading",
            desc: "Adjust the grading of shadows, midtones, and highlights.",
            type: "colorgrading",
        },
        {
            name: "Color Adjustment",
            desc: "Add, multiply, and exponentiate colors to adjust appearance.",
            type: "colorcorrection",
        },
        { name: "Colorize", desc: "Changes the hue of the image.", type: "colorize" },
        { name: "Posterize", desc: "Reduces the number of colors.", type: "posterize" },
        { name: "Chroma Key", desc: "Masks the image based on color.", type: "chromakey" },
        { name: "Luma Key", desc: "Masks the image based on brightness.", type: "lumakey" },
        { name: "Technicolor", desc: "Simulates a classic movie color process.", type: "technicolor" },
        { name: "Color Shift", desc: "Shift all of the hue values of the image.", type: "hueshift" },
        { name: "Exposure", desc: "Simulates adjusting image exposure.", type: "exposure" },
        { name: "Cube LUT", desc: "Applies a preset Cube LUT file to remap colors.", type: "cubelut" },
        { name: "ENHANCE", category: true },
        { name: "Antialiasing", desc: "Softens jagged, sharp edges.", type: "fxaa" },
        { name: "Bloom", desc: "Adds a glowing effect to bright areas.", type: "bloom" },
        {
            name: "Anamorphic Lens Flare",
            desc: "Creates horizontal flares from bright areas.",
            type: "anamorphicflare",
        },
        { name: "Edge Detection", desc: "Applies a Sobel filter to emphasize edges.", type: "edgedetection" },
        { name: "DISTORT", category: true },
        { name: "RGB Shift", desc: "Shifts color channels apart.", type: "rgbshift" },
        { name: "Fisheye", desc: "Simulates a fisheye lens.", type: "fisheye" },
        { name: "Pulse", desc: "Distorts radially outward in a ripple pattern.", type: "pulse" },
        { name: "Wavy", desc: "Distorts vertically in a wavy pattern.", type: "wavy" },
        { name: "Pixelated", desc: "Reduces image resolution with large pixels.", type: "pixelated" },
        { name: "Swirl", desc: "Distorts in a spiral pattern.", type: "swirl" },
        { name: "Static", desc: "Creates grainy, noisy distortion.", type: "static" },
        { name: "Glitch", desc: "Simulates glitches by randomly displacing portions of the image.", type: "glitch" },
        { name: "Displacement Map", desc: "Uses a map to displace portions of the image.", type: "displacementmap" },
        {
            name: "Twitch",
            desc: "Combines various effects to create a chaotic distortion effect.",
            type: 0,
            data: {
                type: 0,
                properties: {
                    name: "Twitch (beta v1)",
                    enabled: { animated: false, keyframes: [{ value: 1, frame: 0, tween: 1 }] },
                },
                customProperties: [
                    {
                        type: { custom: true, dynamic: true, type: 0, value: 0 },
                        properties: { name: "Amount" },
                        animated: false,
                        keyframes: [{ value: 0.3, frame: 0, tween: 1 }],
                    },
                    {
                        type: { custom: true, dynamic: true, type: 0, value: 0 },
                        properties: { name: "Speed" },
                        animated: false,
                        keyframes: [{ value: 2, frame: 0, tween: 1 }],
                    },
                    {
                        type: { custom: true, dynamic: true, type: 0, value: 0 },
                        properties: { name: "RGB Shift amount" },
                        animated: false,
                        keyframes: [{ value: 24, frame: 0, tween: 1 }],
                    },
                    {
                        type: { custom: true, dynamic: true, type: 0, value: 0 },
                        properties: { name: "RGB Shift tendency" },
                        animated: false,
                        keyframes: [{ value: 10, frame: 0, tween: 1 }],
                    },
                    {
                        type: { custom: true, dynamic: true, type: 0, value: 0 },
                        properties: { name: "Slide amount" },
                        animated: false,
                        keyframes: [{ value: 0.5, frame: 0, tween: 1 }],
                    },
                    {
                        type: { custom: true, dynamic: true, type: 0, value: 0 },
                        properties: { name: "Slide tendency" },
                        animated: false,
                        keyframes: [{ value: 10, frame: 0, tween: 1 }],
                    },
                    {
                        type: { custom: true, dynamic: true, type: 0, value: 0 },
                        properties: { name: "Blur amount" },
                        animated: false,
                        keyframes: [{ value: 2, frame: 0, tween: 1 }],
                    },
                    {
                        type: { custom: true, dynamic: true, type: 0, value: 0 },
                        properties: { name: "Blur tendency" },
                        animated: false,
                        keyframes: [{ value: 10, frame: 0, tween: 1 }],
                    },
                ],
                objects: [
                    {
                        type: "rgbshift",
                        properties: {
                            name: "RGB Shift",
                            enabled: { animated: false, keyframes: [{ value: 1, frame: 0, tween: 1 }] },
                            amount: {
                                animated: true,
                                expression:
                                    'var amt = properties["Amount"];\namt *= properties["RGB Shift amount"];\nvar spd = properties["Speed"];\nspd *= properties["RGB Shift tendency"];\namt * shake(time, spd, 1, 0, 2)',
                            },
                            angle: { animated: false, keyframes: [{ value: 1.55, frame: 0, tween: 1 }] },
                        },
                    },
                    {
                        type: "directionalblur",
                        properties: {
                            name: "Directional Blur",
                            enabled: { animated: false, keyframes: [{ value: 1, frame: 0, tween: 1 }] },
                            delta: {
                                animated: true,
                                expression:
                                    'var amt = properties["Amount"];\namt *= properties["Blur amount"];\nvar spd = properties["Speed"];\nspd *= properties["Blur tendency"];\namt * shake(time, spd * 10, 1, 0, 2)',
                            },
                            direction: { animated: false, keyframes: [{ value: 1.55, frame: 0, tween: 1 }] },
                        },
                    },
                    {
                        type: "brightnesscontrast",
                        properties: {
                            name: "Brightness + Contrast",
                            enabled: { animated: false, keyframes: [{ value: 1, frame: 0, tween: 1 }] },
                            brightness: {
                                animated: true,
                                expression:
                                    'var amt = properties["Amount"];\nvar spd = properties["Speed"];\namt * shake(time, spd * 5, 0.1, 1, 1)',
                            },
                            contrast: { animated: false, keyframes: [{ value: 1, frame: 0, tween: 1 }] },
                        },
                    },
                    {
                        type: "transform",
                        properties: {
                            name: "Transform",
                            enabled: { animated: false, keyframes: [{ value: 1, frame: 0, tween: 1 }] },
                            cameraType: 0,
                            cameraPosition: {
                                animated: true,
                                expression:
                                    'var amt = properties["Amount"];\namt *= properties["Slide amount"];\nvar spd = properties["Speed"];\nspd *= properties["Slide tendency"];\nvar slide = amt * shake(time, spd, 50, 0, 2);\n[0,slide,0]',
                            },
                            cameraRotation: { animated: false, keyframes: [{ value: [0, 0, 0], frame: 0, tween: 1 }] },
                            imagePosition: { animated: false, keyframes: [{ value: [0, 0, 0], frame: 0, tween: 1 }] },
                            imageRotation: { animated: false, keyframes: [{ value: [0, 0, 0], frame: 0, tween: 1 }] },
                            imageScale: { animated: false, keyframes: [{ value: [1, 1], frame: 0, tween: 1 }] },
                        },
                    },
                ],
            },
        },
        { name: "Pixel Sort", desc: "Rearranges pixels based on relative brightness.", type: "pixelsort" },
        { name: "Scan Lines", desc: "Simulates scan lines.", type: "scanlines" },
        { name: "BLUR + SHARPEN", category: true },
        { name: "Box Blur", desc: "Blurs the image using a fast blur technique.", type: "boxblur" },
        { name: "Gaussian Blur", desc: "Blurs the image using a higher quality blur technique.", type: "gaussianblur" },
        { name: "Radial Blur", desc: "Blurs radially from a specified point.", type: "radialblur" },
        { name: "Directional Blur", desc: "Blurs the image in a single direction.", type: "directionalblur" },
        { name: "Sharpen", desc: "Sharpens the image.", type: "sharpen" },
        { name: "FRAMING", category: true },
        { name: "Crop", desc: "Trims the edges of the image.", type: "crop" },
        { name: "Transform", desc: "Applies 3d transformation to the image.", type: "transform" },
        { name: "Mask", desc: "Mask a part of the image to be transparent.", type: "mask" },
        { name: "Shutter", desc: "Simulates a camera shutter for cover and fade effects.", type: "shutter" },
        { name: "Duplicate", desc: "Creates a grid of image copies.", type: "duplicate" },
        { name: "Mirror", desc: "Uses reflection to create a symmetrical image.", type: "mirror" },
        { name: "Flip", desc: "Flips the image in the specified directions.", type: "flip" },
        { name: "Shake", desc: "Simulates a shaking camera by transforming the image.", type: "shake" },
        { name: "MISC", category: true },
        { name: "Group", desc: "Meta-effect for object management.", type: 0 },
        { name: "Shader", desc: "Custom shader effect.", type: 1 },
    ]),
    PZ.ui.objectTypes.set(PZ.object3d, [
        { name: "OBJECTS", category: true },
        {
            name: "Shape",
            desc: "Primitive object such as a box or sphere.",
            type: 0,
            list: [
                { name: "Box", type: 0, data: { objectType: 1 } },
                { name: "Cylinder", type: 0, data: { objectType: 2 } },
                { name: "Rectangle", type: 0, data: { objectType: 3 } },
                { name: "Circle", type: 0, data: { objectType: 4 } },
                { name: "Sphere", type: 0, data: { objectType: 5 } },
                { name: "Donut", type: 0, data: { objectType: 6 } },
                { name: "Wire", type: 0, data: { objectType: 7 } },
            ],
        },
        { name: "Text", desc: "Custom 3D text.", type: 1 },
        {
            name: "Light",
            desc: "Creates light and shadows in a scene.",
            type: 3,
            hidelist: true,
            list: [
                { name: "Spot light", type: 3, data: { objectType: 1 } },
                { name: "Point light", type: 3, data: { objectType: 2 } },
                { name: "Directional light", type: 3, data: { objectType: 3 } },
                { name: "Hemisphere light", type: 3, data: { objectType: 4 } },
            ],
        },
        { name: "Particles", desc: "A system of many animated sprites.", type: 4 },
        { name: "Group", desc: "Meta-object for combining objects into one.", type: 5 },
        {
            name: "Camera",
            desc: "Defines what is visible in the rendered image.",
            type: 6,
            list: [
                { name: "Perspective camera (3d)", type: 6, data: { objectType: 1 } },
                { name: "Orthographic camera (2d)", type: 6, data: { objectType: 2 } },
            ],
        },
        { name: "Model", desc: "Import an OBJ object file.", type: 5, data: PZ.ui.edit.importOBJ },
    ]),
    PZ.ui.objectTypes.set(PZ.property.dynamic, [
        { name: "Number", type: { custom: true, dynamic: true, type: PZ.property.type.NUMBER } },
        {
            name: "2D Vector",
            type: {
                custom: true,
                group: true,
                dynamic: true,
                objects: [
                    { dynamic: true, name: "X", type: PZ.property.type.NUMBER, value: 0 },
                    { dynamic: true, name: "Y", type: PZ.property.type.NUMBER, value: 0 },
                ],
                type: PZ.property.type.VECTOR2,
            },
        },
        {
            name: "3D Vector",
            type: {
                custom: true,
                group: true,
                dynamic: true,
                objects: [
                    { dynamic: true, name: "X", type: PZ.property.type.NUMBER, value: 0 },
                    { dynamic: true, name: "Y", type: PZ.property.type.NUMBER, value: 0 },
                    { dynamic: true, name: "Z", type: PZ.property.type.NUMBER, value: 0 },
                ],
                type: PZ.property.type.VECTOR3,
            },
        },
        {
            name: "4D Vector",
            type: {
                custom: true,
                group: true,
                dynamic: true,
                objects: [
                    { dynamic: true, name: "X", type: PZ.property.type.NUMBER, value: 0 },
                    { dynamic: true, name: "Y", type: PZ.property.type.NUMBER, value: 0 },
                    { dynamic: true, name: "Z", type: PZ.property.type.NUMBER, value: 0 },
                    { dynamic: true, name: "W", type: PZ.property.type.NUMBER, value: 0 },
                ],
                type: PZ.property.type.VECTOR4,
            },
        },
        {
            name: "Color",
            type: {
                custom: true,
                group: true,
                dynamic: true,
                objects: [
                    { dynamic: true, name: "R", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
                    { dynamic: true, name: "G", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
                    { dynamic: true, name: "B", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
                ],
                type: PZ.property.type.COLOR,
            },
        },
    ]),
    PZ.ui.objectTypes.set(PZ.property, [
        { name: "STATIC", category: true },
        { name: "Number", type: { custom: true, type: PZ.property.type.NUMBER, value: 0 } },
        {
            name: "Image",
            type: {
                custom: true,
                type: PZ.property.type.ASSET,
                assetType: PZ.asset.type.IMAGE,
                accept: "image/*",
                value: null,
            },
        },
        { name: "DYNAMIC", category: true },
        { name: "Number", type: { custom: true, dynamic: true, type: PZ.property.type.NUMBER } },
        {
            name: "2D Vector",
            type: {
                custom: true,
                group: true,
                dynamic: true,
                objects: [
                    { dynamic: true, name: "X", type: PZ.property.type.NUMBER, value: 0 },
                    { dynamic: true, name: "Y", type: PZ.property.type.NUMBER, value: 0 },
                ],
                type: PZ.property.type.VECTOR2,
            },
        },
        {
            name: "3D Vector",
            type: {
                custom: true,
                group: true,
                dynamic: true,
                objects: [
                    { dynamic: true, name: "X", type: PZ.property.type.NUMBER, value: 0 },
                    { dynamic: true, name: "Y", type: PZ.property.type.NUMBER, value: 0 },
                    { dynamic: true, name: "Z", type: PZ.property.type.NUMBER, value: 0 },
                ],
                type: PZ.property.type.VECTOR3,
            },
        },
        {
            name: "4D Vector",
            type: {
                custom: true,
                group: true,
                dynamic: true,
                objects: [
                    { dynamic: true, name: "X", type: PZ.property.type.NUMBER, value: 0 },
                    { dynamic: true, name: "Y", type: PZ.property.type.NUMBER, value: 0 },
                    { dynamic: true, name: "Z", type: PZ.property.type.NUMBER, value: 0 },
                    { dynamic: true, name: "W", type: PZ.property.type.NUMBER, value: 0 },
                ],
                type: PZ.property.type.VECTOR4,
            },
        },
        {
            name: "Color",
            type: {
                custom: true,
                group: true,
                dynamic: true,
                objects: [
                    { dynamic: true, name: "R", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
                    { dynamic: true, name: "G", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
                    { dynamic: true, name: "B", type: PZ.property.type.NUMBER, value: 1, min: 0, max: 1 },
                ],
                type: PZ.property.type.COLOR,
            },
        },
    ]),
    PZ.ui.objectTypes.set(PZ.material, [
        { name: "Single Color", type: "singlecolor" },
        { name: "Image", type: "texture" },
        { name: "Video", type: "video" },
        { name: "Custom Material", type: "custom" },
    ]),
    PZ.ui.objectTypes.set(PZ.layer, [
        { name: "LAYERS", category: true },
        { name: "Image", desc: "Import an image.", type: 3, data: PZ.ui.edit.importImage },
        { name: "Text", desc: "Custom text.", type: 7 },
        { name: "Preset Shape", desc: "Simple preset shapes.", type: 8 },
        { name: "Shape", desc: "Arbitrary 2D bezier shape.", type: 6 },
        { name: "Adjustment", desc: "A meta-layer used to add effects to lower layers.", type: 1 },
        { name: "Composite", desc: "A meta-layer used to composite child layers.", type: 2 },
        { name: "Scene", desc: "Render 3D objects.", type: 4 },
    ]),
    PZ.ui.objectTypes.set(PZ.shape, [
        { name: "Group", type: 0 },
        { name: "Path", type: 1 },
    ]),
    PZ.ui.objectTypes.set(PZ.draw, [
        { name: "Fill", type: 0 },
        { name: "Stroke", type: 1 },
    ]),
    (PZ.shape = class extends PZ.object {
        static create(e) {
            let t;
            if (typeof e == "number") {
                switch (e) {
                    case 0:
                        t = new PZ.shape.group();
                        break;
                    case 1:
                        t = new PZ.shape.path();
                }
            } else {
                t = new PZ.shape();
            }
            t.type = e;
            return t;
        }
        constructor() {
            super();
            this.properties = new PZ.propertyList(PZ.shape.propertyDefinitions, this);
            this.operations = new PZ.objectList(this, PZ.draw);
            this.children = [this.properties, this.operations];
        }
        load(e) {
            this.properties.load(e && e.properties);
            if (typeof e == "object") {
                for (var t = 0; t < e.operations.length; t++) {
                    let r = PZ.draw.create(e.operations[t].type);
                    this.operations.push(r);
                    r.load(e.operations[t]);
                }
            }
        }
        toJSON() {
            return {
                type: this.type,
                properties: this.properties,
                operations: this.operations,
            };
        }
        unload() {}
        prepare() {}
    });
PZ.shape.prototype.baseTypeString = "shape";
PZ.shape.prototype.defaultName = "Shape";
PZ.shape.getName = (e) => (e ? e.defaultName : PZ.shape.prototype.defaultName);
PZ.shape.propertyDefinitions = {
    name: {
        visible: false,
        name: "Name",
        type: PZ.property.type.TEXT,
        value: (e) => {
            let t = e.parent ? e.parentObject : null;
            e.set(PZ.shape.getName(t));
        },
    },
    position: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Position.X",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 10,
                decimals: 1,
            },
            {
                dynamic: true,
                name: "Position.Y",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 10,
                decimals: 1,
            },
        ],
        name: "Position",
        type: PZ.property.type.VECTOR2,
    },
    rotation: {
        dynamic: true,
        name: "Rotation",
        type: PZ.property.type.NUMBER,
        scaleFactor: Math.PI / 180,
        value: 0,
        step: 3,
        decimals: 1,
    },
    scale: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Scale.X",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0.001,
                step: 0.1,
                dragstep: 0.001,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "Scale.Y",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0.001,
                step: 0.1,
                dragstep: 0.001,
                decimals: 3,
            },
        ],
        name: "Scale",
        type: PZ.property.type.VECTOR2,
        linkRatio: true,
    },
};
PZ.shape.group = class extends PZ.shape {
    constructor() {
        super();
        this.objects = new PZ.objectList(this, PZ.shape);
        this.children.splice(1, 0, this.objects);
    }
    load(e) {
        super.load(e);
        if (typeof e == "object" && e.objects) {
            for (var t = 0; t < e.objects.length; t++) {
                let r = PZ.shape.create(e.objects[t].type);
                this.objects.push(r);
                r.loading = r.load(e.objects[t]);
            }
        }
    }
    toJSON() {
        let e = super.toJSON();
        e.objects = this.objects;
        return e;
    }
    unload() {
        for (var e = 0; e < this.objects.length; e++) {
            this.objects[e].unload();
        }
    }
    draw(e, t) {
        t.save();
        let r = this.properties.rotation.get(e);
        let i = this.properties.position.get(e);
        let a = this.properties.scale.get(e);
        let s = Math.cos(r);
        let n = Math.sin(r);
        t.transform(
            a[0] * s,
            -a[0] * n,
            a[1] * n,
            a[1] * s,
            -a[0] * s * 0.5 - a[1] * n * 0.5 + i[0] + 0.5,
            a[0] * n * 0.5 - a[1] * s * 0.5 - i[1] + 0.5
        );
        for (let r = 0; r < this.objects.length; r++) {
            this.objects[r].draw(e, t);
            for (let r = 0; r < this.operations.length; r++) {
                this.operations[r].draw(e, t);
            }
        }
        t.restore();
    }
    async prepare(e) {
        for (var t = 0; t < this.objects.length; t++) {
            await this.objects[t].prepare(e);
        }
    }
};
PZ.shape.group.prototype.defaultName = "Group";
PZ.shape.path = class extends PZ.shape {
    constructor() {
        super();
        this.path = null;
    }
    load(e) {
        super.load(e);
    }
    toJSON() {
        let e = super.toJSON();
        e.path = this.path;
        return e;
    }
    unload() {}
    draw(e, t, r) {
        if (!this.path) {
            return;
        }
        t.save();
        let i = this.properties.position.get(e);
        let a = this.properties.rotation.get(e);
        let s = this.properties.scale.get(e);
        let n = Math.cos(a);
        let o = Math.sin(a);
        t.transform(
            s[0] * n,
            -s[0] * o,
            s[1] * o,
            s[1] * n,
            -s[0] * n * 0.5 - s[1] * o * 0.5 + i[0] + 0.5,
            s[0] * o * 0.5 - s[1] * n * 0.5 - i[1] + 0.5
        );
        this.path.draw(t);
        for (let r = 0; r < this.operations.length; r++) {
            this.operations[r].draw(e, t);
        }
        t.restore();
    }
    async prepare(e) {}
};
PZ.shape.path.prototype.defaultName = "Path";
PZ.draw = class extends PZ.object {
    static create(e) {
        let t;
        if (typeof e == "number") {
            t = new [PZ.draw.fill, PZ.draw.stroke][e]();
        } else {
            t = new PZ.draw();
        }
        t.type = e;
        return t;
    }
    constructor() {
        super();
    }
    load(e) {
        this.properties.load(e && e.properties);
    }
    draw() {}
    toJSON() {
        return { type: this.type };
    }
};
PZ.draw.defaultName = "Draw Operation";
PZ.draw.fill = class extends PZ.draw {
    constructor() {
        super();
        this.properties = new PZ.propertyList(PZ.draw.fill.propertyDefinitions, this);
        this.children = [this.properties];
    }
    toJSON() {
        let e = super.toJSON();
        e.properties = this.properties;
        return e;
    }
    draw(e, t) {
        let r;
        r = this.properties.color.get(e);
        t.fillStyle =
            "rgb(" + Math.floor(255 * r[0]) + ", " + Math.floor(255 * r[1]) + ", " + Math.floor(255 * r[2]) + ")";
        t.fill();
    }
};
PZ.draw.fill.propertyDefinitions = {
    color: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Fill.R",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0,
                max: 1,
            },
            {
                dynamic: true,
                name: "Fill.B",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0,
                max: 1,
            },
            {
                dynamic: true,
                name: "Fill.G",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0,
                max: 1,
            },
        ],
        name: "Fill",
        type: PZ.property.type.COLOR,
    },
};
PZ.draw.stroke = class extends PZ.draw {
    constructor() {
        super();
        this.properties = new PZ.propertyList(PZ.draw.stroke.propertyDefinitions, this);
        this.children = [this.properties];
    }
    toJSON() {
        let e = super.toJSON();
        e.properties = this.properties;
        return e;
    }
    draw(e, t) {
        let r;
        r = this.properties.color.get(e);
        t.strokeStyle =
            "rgba(" +
            Math.floor(255 * r[0]) +
            ", " +
            Math.floor(255 * r[1]) +
            ", " +
            Math.floor(255 * r[2]) +
            ", " +
            this.properties.opacity.get(e) +
            ")";
        t.lineWidth = this.properties.size.get(e);
        t.stroke();
    }
};
PZ.draw.stroke.propertyDefinitions = {
    color: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Stroke.R",
                type: PZ.property.type.NUMBER,
                value: 0,
                min: 0,
                max: 1,
            },
            {
                dynamic: true,
                name: "Stroke.B",
                type: PZ.property.type.NUMBER,
                value: 0,
                min: 0,
                max: 1,
            },
            {
                dynamic: true,
                name: "Stroke.G",
                type: PZ.property.type.NUMBER,
                value: 0,
                min: 0,
                max: 1,
            },
        ],
        name: "Stroke",
        type: PZ.property.type.COLOR,
    },
    size: {
        dynamic: true,
        name: "Stroke width",
        type: PZ.property.type.NUMBER,
        value: 1,
        min: 0.1,
        decimals: 1,
        step: 1,
    },
    opacity: {
        dynamic: true,
        name: "Stroke opacity",
        type: PZ.property.type.NUMBER,
        value: 1,
        min: 0,
        max: 1,
        decimals: 2,
        step: 1,
    },
};
