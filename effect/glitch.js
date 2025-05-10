this.defaultName = "Glitch";
this.shaderfile = "fx_glitch";
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
    time: {
        dynamic: true,
        name: "Time",
        type: PZ.property.type.NUMBER,
        value: 0,
        step: 0.01,
        value: (e) => {
            e.animated = true;
            e.expression = new PZ.expression("time");
        },
    },
    amount: {
        dynamic: true,
        name: "Amount",
        type: PZ.property.type.NUMBER,
        value: 0.4,
        max: 1,
        min: 0,
        step: 0.01,
    },
    offset: {
        dynamic: true,
        name: "Displacement",
        type: PZ.property.type.NUMBER,
        value: 0.1,
        max: 1,
        min: 0,
        step: 0.01,
    },
    speed: {
        dynamic: true,
        name: "Speed",
        type: PZ.property.type.NUMBER,
        value: 4,
        min: 1,
        step: 0.1,
        decimals: 1,
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
            uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            tDiffuse: { type: "t", value: null },
            amount: { type: "f", value: 0.005 },
            offset: { type: "f", value: 0.1 },
            speed: { type: "f", value: 0.1 },
            time: { type: "f", value: 0 },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
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
        this.pass.uniforms.amount.value = this.properties.amount.get(e);
        this.pass.uniforms.offset.value = this.properties.offset.get(e);
        this.pass.uniforms.speed.value = this.properties.speed.get(e);
        this.pass.uniforms.time.value = this.properties.time.get(e);
        this.pass.enabled =
            this.properties.enabled.get(e) === 1 &&
            this.pass.uniforms.amount.value !== 0;
    }
};
