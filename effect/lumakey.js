this.defaultName = "Luma Key";
this.shaderfile = "fx_lumakey";
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
    threshold: {
        dynamic: true,
        name: "Threshold",
        type: PZ.property.type.NUMBER,
        value: 0.5,
        max: 1,
        min: 0,
        step: 0.01,
        decimals: 3,
    },
    soften: {
        dynamic: true,
        name: "Soften",
        type: PZ.property.type.NUMBER,
        value: 0.1,
        max: 1,
        min: 0,
        step: 0.01,
        decimals: 3,
    },
    invert: {
        name: "Invert",
        type: PZ.property.type.OPTION,
        value: 0,
        items: "off;on",
        changed: function () {
            let e = this.parentObject;
            e.pass.material.defines.KEY_INVERT = !!this.value;
            e.pass.material.needsUpdate = true;
        },
    },
    mask: {
        name: "Mode",
        type: PZ.property.type.OPTION,
        value: 0,
        items: "result;mask",
        changed: function () {
            let e = this.parentObject;
            e.pass.material.defines.KEY_MASK = !!this.value;
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
    var material = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { type: "t", value: null },
            uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            threshold: { type: "f", value: 0 },
            soften: { type: "f", value: 0 },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    this.pass = new THREE.ShaderPass(material);
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
    if (this.pass) {
        this.pass.enabled = this.properties.enabled.get(e);
        this.pass.uniforms.threshold.value = this.properties.threshold.get(e);
        this.pass.uniforms.soften.value = this.properties.soften.get(e);
    }
};
