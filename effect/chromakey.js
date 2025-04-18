this.defaultName = "Chroma Key";
this.shaderfile = "fx_chromakey";
this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl";
this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/common.glsl");
this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl);
this.propertyDefinitions = {
    enabled: {
        dynamic: true,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    backgroundColor: {
        dynamic: true,
        group: true,
        objects: [{
            dynamic: true,
            name: "Color.R",
            type: PZ.property.type.NUMBER,
            value: .157,
            min: 0,
            max: 1
        }, {
            dynamic: true,
            name: "Color.G",
            type: PZ.property.type.NUMBER,
            value: .776,
            min: 0,
            max: 1
        }, {
            dynamic: true,
            name: "Color.B",
            type: PZ.property.type.NUMBER,
            value: .129,
            min: 0,
            max: 1
        }],
        name: "Color",
        type: PZ.property.type.COLOR
    },
    weights: {
        dynamic: true,
        group: true,
        objects: [{
            dynamic: true,
            name: "Weights.H",
            type: PZ.property.type.NUMBER,
            value: 4,
            max: 100,
            min: 0,
            step: .1,
            decimals: 3
        }, {
            dynamic: true,
            name: "Weights.S",
            type: PZ.property.type.NUMBER,
            value: 1,
            max: 100,
            min: 0,
            step: .1,
            decimals: 3
        }, {
            dynamic: true,
            name: "Weights.V",
            type: PZ.property.type.NUMBER,
            value: 2,
            max: 100,
            min: 0,
            step: .1,
            decimals: 3
        }],
        name: "Weights",
        type: PZ.property.type.VECTOR3,
        decimals: 3
    },
    soften: {
        dynamic: true,
        name: "Soften",
        type: PZ.property.type.NUMBER,
        value: .5,
        min: 0,
        step: .01,
        decimals: 3
    },
    invert: {
        name: "Invert",
        type: PZ.property.type.OPTION,
        value: 0,
        items: "off;on",
        changed: function() {
            let e = this.parentObject;
            e.pass.material.defines.KEY_INVERT = !!this.value, e.pass.material.needsUpdate = true;
        }
    },
    mask: {
        name: "Mode",
        type: PZ.property.type.OPTION,
        value: 0,
        items: "result;mask",
        changed: function() {
            let e = this.parentObject;
            e.pass.material.defines.KEY_MASK = !!this.value, e.pass.material.needsUpdate = true;
        }
    }
};
this.properties.addAll(this.propertyDefinitions, this);
this.load = async function(e) {
    this.vertShader = new PZ.asset.shader(this.parentProject.assets.load(this.vertShader));
    this.fragShader = new PZ.asset.shader(this.parentProject.assets.load(this.fragShader));
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
            backgroundColor: {
                type: "v3",
                value: new THREE.Vector3(.157, .776, .129)
            },
            weights: {
                type: "v3",
                value: new THREE.Vector3(4, 1, 2)
            },
            soften: {
                type: "f",
                value: 0
            }
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader()
    });
    this.pass = new THREE.ShaderPass(t);
    this.pass.material.premultipliedAlpha = true;
    this.properties.load(e && e.properties);
};
this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    };
};
this.unload = function(e) {
    this.parentProject.assets.unload(this.vertShader);
    this.parentProject.assets.unload(this.fragShader);
};
this.update = function(e) {
    if(!this.pass) return;
    let t;
    this.pass.enabled = this.properties.enabled.get(e);
    t = this.properties.backgroundColor.get(e);
    this.pass.uniforms.backgroundColor.value.set(t[0], t[1], t[2]);
    t = this.properties.weights.get(e);
    this.pass.uniforms.weights.value.set(t[0], t[1], t[2]);
    this.pass.uniforms.soften.value = this.properties.soften.get(e);
};