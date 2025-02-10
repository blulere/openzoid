this.defaultName = "Colorize", this.shaderfile = "fx_colorize", this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl", this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/common.glsl"), this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl), this.propertyDefinitions = {
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
    amount: {
        dynamic: !0,
        name: "Amount",
        type: PZ.property.type.NUMBER,
        value: 1,
        max: 1,
        min: 0,
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
            color: {
                type: "v3",
                value: new THREE.Vector3(1, 0, 0)
            },
            amount: {
                type: "f",
                value: 1
            }
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader()
    });
    this.pass = new THREE.ShaderPass(t), this.pass.material.premultipliedAlpha = !0, this.properties.load(e && e.properties)
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
    t = this.properties.color.get(e), this.pass.uniforms.color.value.set(t[0], t[1], t[2]), this.pass.uniforms.amount.value = this.properties.amount.get(e), this.pass.enabled = 1 === this.properties.enabled.get(e) && 0 !== this.pass.uniforms.amount.value
};