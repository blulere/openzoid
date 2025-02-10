this.defaultName = "Flip", this.shaderfile = "fx_repeat", this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl", this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/remap.glsl"), this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl), this.propertyDefinitions = {
    enabled: {
        dynamic: !0,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    horizontal: {
        dynamic: !0,
        name: "Horizontal flip",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    vertical: {
        dynamic: !0,
        name: "Vertical flip",
        type: PZ.property.type.OPTION,
        value: 0,
        items: "off;on"
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
            uvTransform: {
                type: "m3",
                value: new THREE.Matrix3
            }
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader()
    });
    this.pass = new THREE.ShaderPass(t), this.pass.material.defines.REPEAT_MODE = 0, this.properties.load(e && e.properties)
}, this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    }
}, this.unload = function(e) {
    this.parentProject.assets.unload(this.vertShader), this.parentProject.assets.unload(this.fragShader)
}, this.update = function(e) {
    if (!this.pass) return;
    this.pass.enabled = this.properties.enabled.get(e);
    let t = this.properties.horizontal.get(e),
        s = this.properties.vertical.get(e);
    this.pass.uniforms.uvTransform.value.setUvTransform(0, 0, 1 - 2 * t, 1 - 2 * s, 0, .5, .5)
};