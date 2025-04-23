this.defaultName = "Pixelated";
this.shaderfile = "fx_pixelated";
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
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Pixel size.X",
                type: PZ.property.type.NUMBER,
                value: 16,
                step: 1,
                decimals: 0,
                min: 1,
            },
            {
                dynamic: true,
                name: "Pixel size.Y",
                type: PZ.property.type.NUMBER,
                value: 9,
                step: 1,
                decimals: 0,
                min: 1,
            },
        ],
        name: "Pixel size",
        type: PZ.property.type.VECTOR2,
        linkRatio: true,
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
            size: { type: "v2", value: new THREE.Vector2(16, 9) },
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
    if (!this.pass) {
        return;
    }
    let size = this.properties.size.get(e);
    this.pass.uniforms.size.value.set(size[0], size[1]);
    this.pass.enabled =
        this.properties.enabled.get(e) === 1 &&
        (this.pass.uniforms.size.value.x !== 1 ||
            this.pass.uniforms.size.value.y !== 1);
};

this.resize = function () {
    let resolution = this.parentLayer.properties.resolution.get();
    this.pass.uniforms.resolution.value.set(resolution[0], resolution[1]);
};
