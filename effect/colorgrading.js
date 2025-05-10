this.defaultName = "Color Grading";
this.shaderfile = "fx_liftgammagain";
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
    shadows: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Shadows.R",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0,
                max: 1,
            },
            {
                dynamic: true,
                name: "Shadows.G",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0,
                max: 1,
            },
            {
                dynamic: true,
                name: "Shadows.B",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0,
                max: 1,
            },
        ],
        name: "Shadows",
        type: PZ.property.type.COLOR,
    },
    midtones: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Midtones.R",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0,
                max: 1,
            },
            {
                dynamic: true,
                name: "Midtones.G",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0,
                max: 1,
            },
            {
                dynamic: true,
                name: "Midtones.B",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0,
                max: 1,
            },
        ],
        name: "Midtones",
        type: PZ.property.type.COLOR,
    },
    highlights: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Highlights.R",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0,
                max: 1,
            },
            {
                dynamic: true,
                name: "Highlights.G",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0,
                max: 1,
            },
            {
                dynamic: true,
                name: "Highlights.B",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0,
                max: 1,
            },
        ],
        name: "Highlights",
        type: PZ.property.type.COLOR,
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
            shadows: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
            midtones: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
            highlights: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
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
    t = this.properties.shadows.get(e);
    this.pass.uniforms.shadows.value.set(t[0], t[1], t[2]);
    t = this.properties.midtones.get(e);
    this.pass.uniforms.midtones.value.set(t[0], t[1], t[2]);
    t = this.properties.highlights.get(e);
    this.pass.uniforms.highlights.value.set(t[0], t[1], t[2]);
};
