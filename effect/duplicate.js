this.defaultName = "Duplicate";
this.shaderfile = "fx_repeat";
this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl";
this.vertShader = this.parentProject.assets.createFromPreset(
    PZ.asset.type.SHADER,
    "/assets/shaders/vertex/remap.glsl"
);
this.fragShader = this.parentProject.assets.createFromPreset(
    PZ.asset.type.SHADER,
    this.shaderUrl
);

this.propertyDefinitions = {
    enabled: {
        dynamic: true,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on",
    },
    offset: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Offset.X",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 0.05,
                dragstep: 0.001,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "Offset.Y",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 0.05,
                dragstep: 0.001,
                decimals: 3,
            },
        ],
        name: "Offset",
        type: PZ.property.type.VECTOR2,
    },
    multiplier: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Multiplier.X",
                type: PZ.property.type.NUMBER,
                value: 3,
                min: 0.001,
                step: 0.01,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "Multiplier.Y",
                type: PZ.property.type.NUMBER,
                value: 3,
                min: 0.001,
                step: 0.01,
                decimals: 3,
            },
        ],
        name: "Multiplier",
        type: PZ.property.type.VECTOR2,
        linkRatio: true,
    },
    rotation: {
        dynamic: true,
        name: "Rotation",
        type: PZ.property.type.NUMBER,
        scaleFactor: Math.PI / 180,
        value: 0,
        step: 3,
        decimals: 1,
    },
    repeat: {
        name: "Repeat",
        type: PZ.property.type.OPTION,
        items: ["tile", "reflect"],
        value: 0,
        changed: function () {
            let e = this.parentObject;
            e.pass.material.defines.REPEAT_MODE = this.value;
            e.pass.material.needsUpdate = true;
        },
    },
};

this.properties.addAll(this.propertyDefinitions, this);

this.load = async function (e) {
    this.vertShader = new PZ.asset.shader(
        this.parentProject.assets.load(this.vertShader)
    );
    this.fragShader = new PZ.asset.shader(
        this.parentProject.assets.load(this.fragShader)
    );
    var t = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { type: "t", value: null },
            uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            uvTransform: { type: "m3", value: new THREE.Matrix3() },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    this.pass = new THREE.ShaderPass(t);
    this.pass.material.premultipliedAlpha = true;
    this.pass.material.defines.REPEAT_MODE = 0;
    this.properties.load(e && e.properties);
};

this.toJSON = function () {
    return { type: this.type, properties: this.properties };
};

this.unload = function (e) {
    this.parentProject.assets.unload(this.vertShader);
    this.parentProject.assets.unload(this.fragShader);
};

this.update = function (e) {
    if (!this.pass) {
        return;
    }
    let offset;
    let multiplier;
    let rotation;
    offset = this.properties.offset.get(e);
    multiplier = this.properties.multiplier.get(e);
    rotation = this.properties.rotation.get(e);
    let r = this.aspect * multiplier[1];
    let i = multiplier[0];
    let p = Math.cos(rotation);
    let h = Math.sin(rotation);
    this.pass.uniforms.uvTransform.value.set(
        multiplier[0] * p,
        (multiplier[1] * h * i) / r,
        -multiplier[0] * p * 0.5 - ((multiplier[1] * h * i) / r) * 0.5 + offset[0] + 0.5,
        (-multiplier[0] * h * r) / i,
        multiplier[1] * p,
        ((multiplier[0] * h * r) / i) * 0.5 - multiplier[1] * p * 0.5 + offset[1] + 0.5,
        0,
        0,
        1
    );
    this.pass.enabled = this.properties.enabled.get(e) === 1;
};

this.resize = function () {
    let e = this.parentLayer.properties.resolution.get();
    this.aspect = e[0] / e[1];
};
