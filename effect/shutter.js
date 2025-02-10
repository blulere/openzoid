this.defaultName = "Shutter", this.shaderfile = "fx_shutter", this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl", this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/common.glsl"), this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl), this.propertyDefinitions = {
    enabled: {
        dynamic: !0,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    mode: {
        name: "Mode",
        type: PZ.property.type.OPTION,
        value: 1,
        changed: function() {
            let e = this.parentObject;
            e.pass.material.defines.SHUTTER_TYPE = 2 & this.value, e.pass.material.defines.SHUTTER_SIDE = 1 & this.value, e.pass.material.needsUpdate = !0
        },
        items: "linear;linear doublesided;radial"
    },
    color: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Color.R",
            type: PZ.property.type.NUMBER,
            value: 0,
            min: 0,
            max: 1
        }, {
            dynamic: !0,
            name: "Color.G",
            type: PZ.property.type.NUMBER,
            value: 0,
            min: 0,
            max: 1
        }, {
            dynamic: !0,
            name: "Color.B",
            type: PZ.property.type.NUMBER,
            value: 0,
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
    covered: {
        dynamic: !0,
        name: "Cover",
        type: PZ.property.type.NUMBER,
        value: .25,
        max: 1,
        min: 0,
        step: .01,
        decimals: 3
    },
    angle: {
        dynamic: !0,
        name: "Angle",
        type: PZ.property.type.NUMBER,
        value: .5 * Math.PI,
        min: 0,
        step: 1,
        decimals: 3
    },
    fade: {
        dynamic: !0,
        name: "Fade",
        type: PZ.property.type.NUMBER,
        value: .001,
        max: 1,
        min: 0,
        step: .005,
        decimals: 3
    }
}, this.properties.addAll(this.propertyDefinitions, this), this.load = async function(e) {
    this.vertShader = new PZ.asset.shader(this.parentProject.assets.load(this.vertShader)), this.fragShader = new PZ.asset.shader(this.parentProject.assets.load(this.fragShader));
    var t = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: {
                type: "t",
                value: null
            },
            resolution: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            },
            uvScale: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            },
            color: {
                type: "v3",
                value: new THREE.Vector3(0, 0, 0)
            },
            opacity: {
                type: "f",
                value: 1
            },
            covered: {
                type: "f",
                value: .25
            },
            angle: {
                type: "f",
                value: 0
            },
            fade: {
                type: "f",
                value: .5 * Math.PI
            }
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader()
    });
    this.pass = new THREE.ShaderPass(t), this.pass.material.premultipliedAlpha = !0, this.properties.load(e && e.properties), this.pass.material.defines = {
        SHUTTER_TYPE: 2 & this.properties.mode.get(),
        SHUTTER_SIDE: 1 & this.properties.mode.get()
    }
}, this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    }
}, this.unload = function(e) {
    this.parentProject.assets.unload(this.vertShader), this.parentProject.assets.unload(this.fragShader)
}, this.update = function(e) {
    if (!this.pass) return;
    let t;
    t = this.properties.color.get(e), this.pass.uniforms.color.value.set(t[0], t[1], t[2]), this.pass.uniforms.opacity.value = this.properties.opacity.get(e), this.pass.uniforms.covered.value = this.properties.covered.get(e), this.pass.uniforms.angle.value = this.properties.angle.get(e), this.pass.uniforms.fade.value = this.properties.fade.get(e), this.pass.enabled = this.properties.enabled.get(e) && 0 !== this.pass.uniforms.opacity.value
}, this.resize = function() {
    let e = this.parentLayer.properties.resolution.get();
    this.pass.uniforms.resolution.value.set(e[0], e[1])
};