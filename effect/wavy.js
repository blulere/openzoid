this.defaultName = "Wavy";
this.shaderfile = "fx_wavy";
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
    amount: {
        dynamic: true,
        name: "Amount",
        type: PZ.property.type.NUMBER,
        value: 3,
        min: 0,
        step: 0.1,
    },
    size: {
        dynamic: true,
        name: "Density",
        type: PZ.property.type.NUMBER,
        value: 25,
        max: 200,
        min: 0,
        step: 0.2,
    },
    time: {
        dynamic: true,
        name: "Time",
        type: PZ.property.type.NUMBER,
        value: 0,
        min: 0,
        step: 0.2,
    },
    angle: {
        dynamic: true,
        name: "Angle",
        type: PZ.property.type.NUMBER,
        value: 0,
        step: 0.2,
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
            amount: { type: "f", value: 3 },
            size: { type: "f", value: 25 },
            time: { type: "f", value: 0 },
            angle: { type: "f", value: 0 },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    this.pass = new THREE.ShaderPass(t);
    this.pass.material.premultipliedAlpha = true;
    this.pass.material.defines.ANGLE = 1;
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
        this.pass.uniforms.size.value = this.properties.size.get(e);
        this.pass.uniforms.time.value = this.properties.time.get(e);
        this.pass.uniforms.angle.value = this.properties.angle.get(e);
        this.pass.enabled =
            this.properties.enabled.get(e) === 1 &&
            this.pass.uniforms.amount.value !== 0;
    }
};
