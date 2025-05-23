this.defaultName = "Static";
this.shaderfile = "fx_static";
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
    size: {
        dynamic: true,
        name: "Size",
        type: PZ.property.type.NUMBER,
        value: 1,
        min: 1,
        step: 1,
        decimals: 0,
    },
    amount: {
        dynamic: true,
        name: "Amount",
        type: PZ.property.type.NUMBER,
        value: 0.5,
        max: 1,
        min: 0,
        step: 0.1,
    },
    blending: {
        name: "Blending mode",
        type: PZ.property.type.OPTION,
        value: 1,
        changed: function () {
            let e = this.parentObject;
            e.pass.material.defines.NOISE_BLEND = this.value;
            e.pass.material.needsUpdate = true;
        },
        items: "none;add;subtract;multiply",
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
    var material = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { type: "t", value: null },
            resolution: { type: "v2", value: new THREE.Vector2(1, 1) },
            uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            size: { type: "f", value: 1 },
            amount: { type: "f", value: 0.5 },
            time: { type: "f", value: 0 },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    this.pass = new THREE.ShaderPass(material);
    this.pass.material.premultipliedAlpha = true;
    this.properties.load(e && e.properties);
    this.pass.material.defines = {
        NOISE_BLEND: this.properties.blending.get(),
    };
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
        this.pass.uniforms.amount.value = this.properties.amount.get(e);
        this.pass.uniforms.size.value = this.properties.size.get(e);
        this.pass.uniforms.time.value = e;
        this.pass.enabled =
            this.properties.enabled.get(e) &&
            this.pass.uniforms.amount.value !== 0;
    }
};

this.resize = function () {
    let resolution = this.parentLayer.properties.resolution.get();
    this.pass.uniforms.resolution.value.set(resolution[0], resolution[1]);
};
