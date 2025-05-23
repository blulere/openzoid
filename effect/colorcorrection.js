this.defaultName = "Color Adjustment";
this.shaderfile = "fx_colorcorrection";
this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl";
this.vertShader = this.parentProject.assets.createFromPreset(
    PZ.asset.type.SHADER,
    "/assets/shaders/vertex/common.glsl"
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
    powRGB: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Power.R",
                type: PZ.property.type.NUMBER,
                value: 1,
                max: 100,
                min: 0,
                step: 0.1,
                decimals: 2,
            },
            {
                dynamic: true,
                name: "Power.G",
                type: PZ.property.type.NUMBER,
                value: 1,
                max: 100,
                min: 0,
                step: 0.1,
                decimals: 2,
            },
            {
                dynamic: true,
                name: "Power.B",
                type: PZ.property.type.NUMBER,
                value: 1,
                max: 100,
                min: 0,
                step: 0.1,
                decimals: 2,
            },
        ],
        name: "Power",
        type: PZ.property.type.VECTOR3,
    },
    mulRGB: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Multiply.R",
                type: PZ.property.type.NUMBER,
                value: 0.8,
                max: 100,
                min: 0,
                step: 0.1,
                decimals: 2,
            },
            {
                dynamic: true,
                name: "Multiply.G",
                type: PZ.property.type.NUMBER,
                value: 0.8,
                max: 100,
                min: 0,
                step: 0.1,
                decimals: 2,
            },
            {
                dynamic: true,
                name: "Multiply.B",
                type: PZ.property.type.NUMBER,
                value: 0.8,
                max: 100,
                min: 0,
                step: 0.1,
                decimals: 2,
            },
        ],
        name: "Multiply",
        type: PZ.property.type.VECTOR3,
    },
    addRGB: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Add.R",
                type: PZ.property.type.NUMBER,
                value: 0.08,
                max: 1,
                min: -1,
                step: 0.01,
                decimals: 2,
            },
            {
                dynamic: true,
                name: "Add.G",
                type: PZ.property.type.NUMBER,
                value: 0.08,
                max: 1,
                min: -1,
                step: 0.01,
                decimals: 2,
            },
            {
                dynamic: true,
                name: "Add.B",
                type: PZ.property.type.NUMBER,
                value: 0.08,
                max: 1,
                min: -1,
                step: 0.01,
                decimals: 2,
            },
        ],
        name: "Add",
        type: PZ.property.type.VECTOR3,
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
            powRGB: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
            mulRGB: { type: "v3", value: new THREE.Vector3(0.8, 0.8, 0.8) },
            addRGB: { type: "v3", value: new THREE.Vector3(0.08, 0.08, 0.08) },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    this.pass = new THREE.ShaderPass(t);
    this.pass.material.transparent = true;
    this.pass.material.premultipliedAlpha = true;
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
    let t;
    this.pass.enabled = this.properties.enabled.get(e);
    t = this.properties.powRGB.get(e);
    this.pass.uniforms.powRGB.value.set(t[0], t[1], t[2]);
    t = this.properties.mulRGB.get(e);
    this.pass.uniforms.mulRGB.value.set(t[0], t[1], t[2]);
    t = this.properties.addRGB.get(e);
    this.pass.uniforms.addRGB.value.set(t[0], t[1], t[2]);
};
