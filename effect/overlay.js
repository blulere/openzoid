this.defaultName = "Image Overlay", this.shaderfile = "blend", this.texture = null, this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl", this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/overlay.glsl"), this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl), this.propertyDefinitions = {
    enabled: {
        dynamic: !0,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    texture: {
        name: "Image",
        type: PZ.property.type.ASSET,
        assetType: PZ.asset.type.IMAGE,
        value: null,
        accept: "image/*",
        changed: function() {
            let e = this.parentObject;
            if (e.texture && (e.parentProject.assets.unload(e.texture), e.texture = null, e.pass.uniforms.tDiffuse.value.dispose(), e.pass.uniforms.tDiffuse.value = null), this.value) {
                e.texture = new PZ.asset.image(e.parentProject.assets.load(this.value));
                let t = e.texture.getTexture(!0);
                t.minFilter = t.magFilter = THREE.LinearFilter, t.wrapS = t.wrapT = THREE.RepeatWrapping, t.generateMipmaps = !1, e.pass.uniforms.tDiffuse.value = t
            }
            e.pass.material.needsUpdate = !0
        }
    },
    repeat: {
        name: "Repeat",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on",
        changed: function() {
            let e = this.parentObject;
            e.pass.material.defines.BLEND_NO_REPEAT = !this.value, e.pass.material.needsUpdate = !0
        }
    },
    offset: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Offset.X",
            type: PZ.property.type.NUMBER,
            value: 0,
            step: .05,
            decimals: 3
        }, {
            dynamic: !0,
            name: "Offset.Y",
            type: PZ.property.type.NUMBER,
            value: 0,
            step: .05,
            decimals: 3
        }],
        name: "Offset",
        type: PZ.property.type.VECTOR2
    },
    scale: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Scale.X",
            type: PZ.property.type.NUMBER,
            value: 1,
            step: .05,
            decimals: 3
        }, {
            dynamic: !0,
            name: "Scale.Y",
            type: PZ.property.type.NUMBER,
            value: 1,
            step: .05,
            decimals: 3
        }],
        name: "Scale",
        type: PZ.property.type.VECTOR2,
        linkRatio: !0
    },
    rotation: {
        dynamic: !0,
        name: "Rotation",
        type: PZ.property.type.NUMBER,
        scaleFactor: Math.PI / 180,
        value: 0,
        step: 3,
        decimals: 1
    },
    opacity: {
        dynamic: !0,
        name: "Opacity",
        type: PZ.property.type.NUMBER,
        value: 1,
        max: 1,
        min: 0,
        step: .1
    },
    blending: {
        name: "Blending mode",
        type: PZ.property.type.LIST,
        value: "BLEND_SRC_OVER",
        items: PZ.layer.blendModes,
        changed: function() {
            let e = this.parentObject;
            e.pass.material.defines = {
                OVERLAP_MODE: 3,
                BLEND_NO_REPEAT: e.pass.material.defines.BLEND_NO_REPEAT
            }, e.pass.material.defines[this.value] = 1, e.pass.material.needsUpdate = !0
        }
    }
}, this.properties.addAll(this.propertyDefinitions, this), this.load = async function(e) {
    this.vertShader = new PZ.asset.shader(this.parentProject.assets.load(this.vertShader)), this.fragShader = new PZ.asset.shader(this.parentProject.assets.load(this.fragShader));
    var t = new THREE.ShaderMaterial({
        uniforms: {
            tBG: {
                type: "t",
                value: null
            },
            tDiffuse: {
                type: "t",
                value: null
            },
            opacity: {
                type: "f",
                value: 1
            },
            uvScale: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            },
            uvTransform: {
                type: "m3",
                value: new THREE.Matrix3
            }
        },
        defines: {
            OVERLAP_MODE: 3,
            BLEND_NO_REPEAT: !1,
            BLEND_SRC_OVER: 1
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
        premultipliedAlpha: !0
    });
    this.pass = new THREE.OverlayPass(t), this.properties.load(e && e.properties)
}, this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    }
}, this.unload = function() {
    this.texture && (this.parentProject.assets.unload(this.texture), this.pass.uniforms.tDiffuse.value.dispose()), this.parentProject.assets.unload(this.vertShader), this.parentProject.assets.unload(this.fragShader)
}, this.update = function(e) {
    if (!this.pass) return;
    this.pass.uniforms.opacity.value = this.properties.opacity.get(e);
    let t = this.properties.offset.get(e),
        s = this.properties.scale.get(e),
        a = this.properties.rotation.get(e),
        r = this.aspect * s[0],
        i = s[1];
    s[0] = 1 / s[0], s[1] = 1 / s[1];
    let p = Math.cos(a),
        n = Math.sin(a);
    this.pass.uniforms.uvTransform.value.set(s[0] * p, s[1] * n * i / r, -s[0] * p * .5 - s[1] * n * i / r * .5 - t[0] * p / r - t[1] * n / r + .5, -s[0] * n * r / i, s[1] * p, s[0] * n * r / i * .5 - s[1] * p * .5 + t[0] * n / i - t[1] * p / i + .5, 0, 0, 1), this.pass.enabled = this.properties.enabled.get(e)
}, this.prepare = async function(e) {
    this.texture && await this.texture.loading
}, this.resize = function() {
    let e = this.parentLayer.properties.resolution.get();
    this.aspect = e[0] / e[1]
};