this.defaultName = "Gaussian Blur", this.shaderfile = "fx_boxblur", this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl", this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/common.glsl"), this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl), this.propertyDefinitions = {
    enabled: {
        dynamic: !0,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    delta: {
        dynamic: !0,
        name: "Delta",
        type: PZ.property.type.NUMBER,
        value: 1,
        max: 10,
        min: 0,
        step: .1
    }
}, this.properties.addAll(this.propertyDefinitions, this), THREE.GaussianBlurPass || (THREE.GaussianBlurPass = function(e, t) {
    this.material_h = e, this.material_v = e.clone(), this.material_h.transparent = !0, this.material_h.premultipliedAlpha = !0, this.material_v.transparent = !0, this.material_v.premultipliedAlpha = !0, this.material_h.defines = {
        BLUR_DIR: 0
    }, this.material_v.defines = {
        BLUR_DIR: 1
    }, this.uniforms = this.material_h.uniforms = this.material_v.uniforms, this.renderToScreen = !1, this.enabled = !0, this.needsSwap = !1, this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), this.scene = new THREE.Scene, this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null), this.scene.add(this.quad)
}, THREE.GaussianBlurPass.prototype = {
    render: function(e, t, s, a) {
        for (var r = 0; r < 3; r++) this.quad.material = this.material_h, this.uniforms.tDiffuse.value = s.texture, e.render(this.scene, this.camera, t, a), this.quad.material = this.material_v, this.uniforms.tDiffuse.value = t.texture, e.render(this.scene, this.camera, s, a)
    }
}), this.load = async function(e) {
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
            delta: {
                type: "f",
                value: 1
            }
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader()
    });
    this.pass = new THREE.GaussianBlurPass(t), this.properties.load(e && e.properties)
}, this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    }
}, this.unload = function(e) {
    this.parentProject.assets.unload(this.vertShader), this.parentProject.assets.unload(this.fragShader)
}, this.update = function(e) {
    this.pass && (this.pass.uniforms.delta.value = this.properties.delta.get(e), this.pass.enabled = 1 === this.properties.enabled.get(e) && 0 !== this.pass.uniforms.delta.value)
}, this.resize = function() {
    let e = this.parentLayer.properties.resolution.get();
    this.pass.uniforms.resolution.value.set(e[0], e[1])
};