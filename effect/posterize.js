this.defaultName = "Posterize";
this.shaderfile = "fx_posterize";
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
    gamma: {
        dynamic: true,
        name: "Gamma",
        type: PZ.property.type.NUMBER,
        value: 0.6,
        max: 1,
        min: 0,
        step: 0.01,
        decimals: 2,
    },
    regions: {
        dynamic: true,
        name: "Colors",
        type: PZ.property.type.NUMBER,
        value: 8,
        max: 1e3,
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
    var material = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { type: "t", value: null },
            uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            gamma: { type: "f", value: 0.6 },
            regions: { type: "f", value: 8 },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    this.pass = new THREE.ShaderPass(material);
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
        this.pass.uniforms.gamma.value = this.properties.gamma.get(e);
        this.pass.uniforms.regions.value = this.properties.regions.get(e);
    }
};
