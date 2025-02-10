this.defaultName = "Color Overlay", this.shaderfile = "blend", this.texture = null, this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl", this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/overlay.glsl"), this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl), this.propertyDefinitions = {
    enabled: {
        dynamic: !0,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    color: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Color.R",
            type: PZ.property.type.NUMBER,
            value: 1,
            min: 0,
            max: 1
        }, {
            dynamic: !0,
            name: "Color.G",
            type: PZ.property.type.NUMBER,
            value: 1,
            min: 0,
            max: 1
        }, {
            dynamic: !0,
            name: "Color.B",
            type: PZ.property.type.NUMBER,
            value: 1,
            min: 0,
            max: 1
        }],
        name: "Color",
        type: PZ.property.type.COLOR
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
                BLEND_SRC_COLOR: 1,
                OVERLAP_MODE: 3
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
            color: {
                type: "v3",
                value: new THREE.Vector3(1, 1, 1)
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
        fragmentShader: await this.fragShader.getShader(),
        premultipliedAlpha: !0
    });
    this.pass = new THREE.OverlayPass(t), this.properties.load(e && e.properties), this.pass.material.defines.BLEND_SRC_COLOR = 1, this.pass.material.defines.OVERLAP_MODE = 3, this.pass.material.defines[this.properties.blending.get()] = 1
}, this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    }
}, this.unload = function() {
    this.parentProject.assets.unload(this.vertShader), this.parentProject.assets.unload(this.fragShader)
}, this.update = function(e) {
    if (!this.pass) return;
    this.pass.uniforms.opacity.value = this.properties.opacity.get(e);
    let t = this.properties.color.get(e);
    this.pass.uniforms.color.value.set(t[0], t[1], t[2]), this.pass.enabled = this.properties.enabled.get(e)
};