this.defaultName = "Gradient Overlay", this.shaderfile = "blend", this.texture = null, this.gradientNeedsUpdate = !0, this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl", this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/overlay.glsl"), this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl), this.propertyDefinitions = {
    enabled: {
        dynamic: !0,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    gradient: {
        name: "Gradient",
        type: PZ.property.type.GRADIENT,
        value: [{
            position: 0,
            color: "rgba(255, 255, 255, 1)"
        }],
        changed: function() {
            this.parentObject.gradientNeedsUpdate = !0
        }
    },
    gradientType: {
        name: "Type",
        type: PZ.property.type.OPTION,
        value: 0,
        items: "linear;radial;angular;reflected;diamond",
        changed: function() {
            let e = this.parentObject;
            e.pass.material.defines.BLEND_GRADIENT_TYPE = this.value, e.pass.material.needsUpdate = !0
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
            min: .01,
            step: .05,
            decimals: 3
        }, {
            dynamic: !0,
            name: "Scale.Y",
            type: PZ.property.type.NUMBER,
            value: 1,
            min: .01,
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
                BLEND_SRC_GRADIENT: 1,
                OVERLAP_MODE: 3,
                BLEND_GRADIENT_TYPE: e.pass.material.defines.BLEND_GRADIENT_TYPE
            }, e.pass.material.defines[this.value] = 1, e.pass.material.needsUpdate = !0
        }
    }
}, this.properties.addAll(this.propertyDefinitions, this), this.load = async function(e) {
    this.gradient = new THREE.DataTexture(new Uint8Array(128), 32, 1, THREE.RGBAFormat), this.gradient.minFilter = this.gradient.magFilter = THREE.LinearFilter, this.vertShader = new PZ.asset.shader(this.parentProject.assets.load(this.vertShader)), this.fragShader = new PZ.asset.shader(this.parentProject.assets.load(this.fragShader));
    var t = new THREE.ShaderMaterial({
        uniforms: {
            tBG: {
                type: "t",
                value: null
            },
            tDiffuse: {
                type: "t",
                value: this.gradient
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
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader()
    });
    this.pass = new THREE.OverlayPass(t), this.pass.material.defines.BLEND_SRC_GRADIENT = 1, this.pass.material.defines.OVERLAP_MODE = 3, this.pass.material.defines.BLEND_GRADIENT_TYPE = 0, this.pass.material.defines.BLEND_SRC_OVER = 1, this.properties.load(e && e.properties)
}, this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    }
}, this.unload = function() {
    this.gradient.dispose(), this.parentProject.assets.unload(this.vertShader), this.parentProject.assets.unload(this.fragShader)
}, this.updateGradient = function() {
    PZ.object3d.particles.prototype.redrawGradient(this.gradient.image.data, this.properties.gradient.get()), this.gradient.needsUpdate = !0
}, this.update = function(e) {
    if (!this.pass) return;
    this.gradientNeedsUpdate && (this.updateGradient(), this.gradientNeedsUpdate = !1), this.pass.uniforms.opacity.value = this.properties.opacity.get(e);
    let t = this.properties.offset.get(e),
        a = this.properties.scale.get(e),
        s = this.properties.rotation.get(e),
        i = a[0],
        r = a[1];
    a[0] = 1 / (a[0] * this.aspect_w), a[1] = 1 / (a[1] * this.aspect_h);
    let p = Math.cos(s),
        n = Math.sin(s);
    this.pass.uniforms.uvTransform.value.set(a[0] * p, a[1] * n * r / i, -a[0] * p * .5 - a[1] * n * r / i * .5 - t[0] * p / i - t[1] * n / i + .5, -a[0] * n * i / r, a[1] * p, a[0] * n * i / r * .5 - a[1] * p * .5 + t[0] * n / r - t[1] * p / r + .5, 0, 0, 1), this.pass.enabled = this.properties.enabled.get(e)
}, this.resize = function() {
    let e = this.parentLayer.properties.resolution.get(),
        t = Math.max(e[0], e[1]);
    this.aspect_w = t / e[0], this.aspect_h = t / e[1]
};