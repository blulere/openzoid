this.defaultName = "Duplicate", this.shaderfile = "fx_repeat", this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl", this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/remap.glsl"), this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl), this.propertyDefinitions = {
    enabled: {
        dynamic: !0,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
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
            dragstep: .001,
            decimals: 3
        }, {
            dynamic: !0,
            name: "Offset.Y",
            type: PZ.property.type.NUMBER,
            value: 0,
            step: .05,
            dragstep: .001,
            decimals: 3
        }],
        name: "Offset",
        type: PZ.property.type.VECTOR2
    },
    multiplier: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Multiplier.X",
            type: PZ.property.type.NUMBER,
            value: 3,
            min: .001,
            step: .01,
            decimals: 3
        }, {
            dynamic: !0,
            name: "Multiplier.Y",
            type: PZ.property.type.NUMBER,
            value: 3,
            min: .001,
            step: .01,
            decimals: 3
        }],
        name: "Multiplier",
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
    repeat: {
        name: "Repeat",
        type: PZ.property.type.OPTION,
        items: ["tile", "reflect"],
        value: 0,
        changed: function() {
            let e = this.parentObject;
            e.pass.material.defines.REPEAT_MODE = this.value, e.pass.material.needsUpdate = !0
        }
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
    this.pass = new THREE.ShaderPass(t), this.pass.material.premultipliedAlpha = !0, this.pass.material.defines.REPEAT_MODE = 0, this.properties.load(e && e.properties)
}, this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    }
}, this.unload = function(e) {
    this.parentProject.assets.unload(this.vertShader), this.parentProject.assets.unload(this.fragShader)
}, this.update = function(e) {
    if (!this.pass) return;
    let t, s, a;
    t = this.properties.offset.get(e), s = this.properties.multiplier.get(e), a = this.properties.rotation.get(e);
    let r = this.aspect * s[1],
        i = s[0],
        p = Math.cos(a),
        h = Math.sin(a);
    this.pass.uniforms.uvTransform.value.set(s[0] * p, s[1] * h * i / r, -s[0] * p * .5 - s[1] * h * i / r * .5 + t[0] + .5, -s[0] * h * r / i, s[1] * p, s[0] * h * r / i * .5 - s[1] * p * .5 + t[1] + .5, 0, 0, 1), this.pass.enabled = 1 === this.properties.enabled.get(e)
}, this.resize = function() {
    let e = this.parentLayer.properties.resolution.get();
    this.aspect = e[0] / e[1]
};