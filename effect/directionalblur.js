this.defaultName = "Directional Blur";
this.shaderfile = "fx_directionalblur";
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
    delta: {
        dynamic: true,
        name: "Delta",
        type: PZ.property.type.NUMBER,
        value: 1,
        max: 10,
        min: 0,
        step: 0.1,
    },
    direction: {
        dynamic: true,
        name: "Direction",
        type: PZ.property.type.NUMBER,
        value: 0,
        max: 10,
        min: 0,
        step: 0.1,
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
            resolution: { type: "v2", value: new THREE.Vector2(1, 1) },
            direction: { type: "f", value: 0 },
            delta: { type: "f", value: 1 },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    t.premultipliedAlpha = true;
    this.pass = new THREE.ShaderPass(t);
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
    if (this.pass) {
        this.pass.uniforms.delta.value = this.properties.delta.get(e);
        this.pass.uniforms.direction.value = this.properties.direction.get(e);
        this.pass.enabled =
            this.properties.enabled.get(e) === 1 &&
            this.pass.uniforms.delta.value !== 0;
    }
};

this.resize = function () {
    let e = this.parentLayer.properties.resolution.get();
    this.pass.uniforms.resolution.value.set(e[0], e[1]);
};
