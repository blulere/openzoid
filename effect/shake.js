this.defaultName = "Shake", this.shaderfile = "fx_repeat", this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl", this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/common.glsl"), this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl), this.propertyDefinitions = {
    enabled: {
        dynamic: !0,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    amplitude: {
        dynamic: !0,
        name: "Amount",
        type: PZ.property.type.NUMBER,
        value: .01,
        decimals: 3,
        min: 0,
        max: 1,
        step: .01
    },
    speed: {
        dynamic: !0,
        name: "Speed",
        type: PZ.property.type.NUMBER,
        value: 15,
        min: 0,
        step: .01
    },
    zoom: {
        dynamic: !0,
        name: "Zoom",
        type: PZ.property.type.NUMBER,
        value: 100,
        step: 1,
        min: 0,
        decimals: 1
    },
    wrap: {
        name: "Wrap",
        type: PZ.property.type.OPTION,
        value: 2,
        changed: function() {
            let e = this.parentObject;
            e.pass.material.defines.REPEAT_MODE = Math.max(this.value - 1, 0), e.pass.material.needsUpdate = !0, e.resize()
        },
        items: "none;tile;reflect"
    }
}, this.shake = new PZ.shake, this.properties.addAll(this.propertyDefinitions, this), this.properties.add("shake", this.shake.properties), this.load = async function(e) {
    this.shake.properties.load({
        mode: 1,
        amplitude: [1e3, 1e3, 1e3, 10]
    }), this.vertShader = new PZ.asset.shader(this.parentProject.assets.load(this.vertShader)), this.fragShader = new PZ.asset.shader(this.parentProject.assets.load(this.fragShader));
    var t = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: {
                type: "t",
                value: null
            },
            uvScale: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            }
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader()
    });
    this.pass = new THREE.ShaderPass(t), this.pass.material.premultipliedAlpha = !0, this.pass.material.transparent = !0, this.pass.material.defines.REPEAT_MODE = 1, this.pass.scene.remove(this.pass.camera), this.pass.camera = new THREE.PerspectiveCamera, this.pass.scene.add(this.pass.camera), this.properties.load(e && e.properties)
}, this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    }
}, this.unload = function(e) {
    this.parentProject.assets.unload(this.vertShader), this.parentProject.assets.unload(this.fragShader)
}, this.update = function(e) {
    if (!this.pass) return;
    let t = this.properties.zoom.get(e),
        s = this.parentLayer;
    this.pass.quad.scale.copy(s.composite.group.scale), this.pass.camera.position.set(0, 0, -t), this.pass.camera.rotation.set(0, 0, 0), this.pass.camera.scale.copy(s.composite.group.scale);
    let a = this.properties.amplitude.get(e),
        r = e * (this.properties.speed.get(e) / 30);
    this.shake.shake(r, a, this.pass.camera), this.pass.enabled = this.properties.enabled.get(e)
}, this.resize = function() {
    let e = this.parentLayer.properties.resolution.get(),
        t = this.properties.wrap.get(),
        s = this.pass.quad.geometry.attributes.position,
        a = 0 === t ? .5 : 2.5;
    s.array[3] = s.array[9] = e[0] * a, s.array[0] = s.array[6] = e[0] * -a, s.array[1] = s.array[4] = e[1] * a, s.array[7] = s.array[10] = e[1] * -a, s.needsUpdate = !0;
    let r = this.pass.quad.geometry.attributes.uv,
        i = this.pass.quad.geometry.attributes.uv.array,
        p = 0 === t ? 0 : 2;
    i[0] = i[4] = i[5] = i[7] = 0 - p, i[1] = i[2] = i[3] = i[6] = 1 + p, r.needsUpdate = !0;
    let h = Math.max(e[0], e[1]);
    this.pass.quad.position.set(0, 0, -h), this.pass.camera.aspect = e[0] / e[1], this.pass.camera.fov = 2 * Math.atan(e[1] / (2 * h)) * (180 / Math.PI), this.pass.camera.near = 1, this.pass.camera.far = 2 * h, this.pass.camera.updateProjectionMatrix()
};