this.defaultName = "Radial Blur", this.shaderfile = "fx_radialblur", this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl", this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/common.glsl"), this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl), this.propertyDefinitions = {
    enabled: {
        dynamic: !0,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    density: {
        dynamic: !0,
        name: "Delta",
        type: PZ.property.type.NUMBER,
        value: .5,
        max: 1,
        min: -1,
        step: .05,
        decimals: 3
    },
    dither: {
        dynamic: !0,
        name: "Dither",
        type: PZ.property.type.NUMBER,
        value: .5,
        max: 1,
        min: 0,
        step: .05,
        decimals: 3
    },
    decay: {
        dynamic: !0,
        name: "Decay",
        type: PZ.property.type.NUMBER,
        value: .9,
        max: 1,
        min: 0,
        step: .05,
        decimals: 3
    },
    center: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Center.X",
            type: PZ.property.type.NUMBER,
            value: 0,
            step: .05,
            decimals: 3
        }, {
            dynamic: !0,
            name: "Center.Y",
            type: PZ.property.type.NUMBER,
            value: 0,
            step: .05,
            decimals: 3
        }],
        name: "Center",
        type: PZ.property.type.VECTOR2
    },
    overbright: {
        name: "Overbright",
        type: PZ.property.type.OPTION,
        value: 0,
        changed: function() {
            let e = this.parentObject;
            0 === this.value ? e.pass.material.defines.CONSTANT_BRIGHTNESS = 1 : delete e.pass.material.defines.CONSTANT_BRIGHTNESS, e.pass.material.needsUpdate = !0
        },
        items: "off;on"
    },
    weight: {
        dynamic: !0,
        name: "Weight",
        type: PZ.property.type.NUMBER,
        value: .2,
        max: 1,
        min: 0,
        step: .05,
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
            uvScale: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            },
            resolution: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            },
            decay: {
                type: "f",
                value: .97
            },
            density: {
                type: "f",
                value: .5
            },
            dither: {
                type: "f",
                value: 1
            },
            center: {
                type: "v2",
                value: new THREE.Vector2(0, 0)
            },
            weight: {
                type: "f",
                value: 1
            }
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader()
    });
    t.premultipliedAlpha = !0, t.defines.DITHER = 1, t.defines.CONSTANT_BRIGHTNESS = 1, this.pass = new THREE.ShaderPass(t), this.properties.load(e && e.properties)
}, this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    }
}, this.unload = function(e) {
    this.parentProject.assets.unload(this.vertShader), this.parentProject.assets.unload(this.fragShader)
}, this.update = function(e) {
    if (!this.pass) return;
    this.pass.enabled = this.properties.enabled.get(e), this.pass.uniforms.decay.value = this.properties.decay.get(e), this.pass.uniforms.density.value = this.properties.density.get(e), this.pass.uniforms.dither.value = this.properties.dither.get(e), this.pass.uniforms.weight.value = this.properties.weight.get(e);
    let t = this.properties.center.get(e);
    this.pass.uniforms.center.value.set(t[0], t[1])
}, this.resize = function() {
    let e = this.parentLayer.properties.resolution.get();
    this.pass.uniforms.resolution.value.set(e[0], e[1])
};