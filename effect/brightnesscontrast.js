this.defaultName = "Brightness + Contrast", this.shaderfile = "fx_brightnesscontrast", this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl", this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/common.glsl"), this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl), this.propertyDefinitions = {
    enabled: {
        dynamic: !0,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    brightness: {
        dynamic: !0,
        name: "Brightness",
        type: PZ.property.type.NUMBER,
        value: 0,
        min: -1,
        max: 1,
        step: .1
    },
    contrast: {
        dynamic: !0,
        name: "Contrast",
        type: PZ.property.type.NUMBER,
        value: 1,
        min: 0,
        max: 10,
        step: .1
    }
}, this.properties.addAll(this.propertyDefinitions, this), this.load = async function(e) {
    this.vertShader = new PZ.asset.shader(this.parentProject.assets.load(this.vertShader)), this.fragShader = new PZ.asset.shader(this.parentProject.assets.load(this.fragShader));
    var t = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: {
                type: "t",
                value: null
            },
            uvScale: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            },
            resolution: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            },
            brightness: {
                type: "f",
                value: 1
            },
            contrast: {
                type: "f",
                value: 1
            }
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader()
    });
    this.pass = new THREE.ShaderPass(t), this.properties.load(e && e.properties)
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
    this.pass.enabled = this.properties.enabled.get(e), t = this.properties.brightness.get(e), this.pass.uniforms.brightness.value = t, t = this.properties.contrast.get(e), this.pass.uniforms.contrast.value = t
};