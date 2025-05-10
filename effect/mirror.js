this.defaultName = "Mirror";
this.shaderfile = "fx_mirror";
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
    mode: {
        dynamic: true,
        name: "Mode",
        type: PZ.property.type.OPTION,
        value: 0,
        items: "left;right;top;bottom;left + top;right + top;left + bottom;right + bottom",
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
            left: { type: "f", value: 2 },
            right: { type: "f", value: 0 },
            top: { type: "f", value: 0 },
            bottom: { type: "f", value: 0 },
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
        var mode = this.properties.mode.get(e);
        this.pass.uniforms.left.value = mode === 0 || mode === 4 || mode === 6 ? 2 : 0;
        this.pass.uniforms.right.value = mode === 1 || mode === 5 || mode === 7 ? 2 : 0;
        this.pass.uniforms.top.value = mode === 2 || mode === 4 || mode === 5 ? 2 : 0;
        this.pass.uniforms.bottom.value = mode === 3 || mode === 6 || mode === 7 ? 2 : 0;
    }
};
