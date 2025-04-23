this.defaultName = "Shutter";
this.shaderfile = "fx_shutter";
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
        name: "Mode",
        type: PZ.property.type.OPTION,
        value: 1,
        changed: function () {
            let e = this.parentObject;
            e.pass.material.defines.SHUTTER_TYPE = 2 & this.value;
            e.pass.material.defines.SHUTTER_SIDE = 1 & this.value;
            e.pass.material.needsUpdate = true;
        },
        items: "linear;linear doublesided;radial",
    },
    color: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Color.R",
                type: PZ.property.type.NUMBER,
                value: 0,
                min: 0,
                max: 1,
            },
            {
                dynamic: true,
                name: "Color.G",
                type: PZ.property.type.NUMBER,
                value: 0,
                min: 0,
                max: 1,
            },
            {
                dynamic: true,
                name: "Color.B",
                type: PZ.property.type.NUMBER,
                value: 0,
                min: 0,
                max: 1,
            },
        ],
        name: "Color",
        type: PZ.property.type.COLOR,
    },
    opacity: {
        dynamic: true,
        name: "Opacity",
        type: PZ.property.type.NUMBER,
        value: 1,
        max: 1,
        min: 0,
        step: 0.1,
    },
    covered: {
        dynamic: true,
        name: "Cover",
        type: PZ.property.type.NUMBER,
        value: 0.25,
        max: 1,
        min: 0,
        step: 0.01,
        decimals: 3,
    },
    angle: {
        dynamic: true,
        name: "Angle",
        type: PZ.property.type.NUMBER,
        value: 0.5 * Math.PI,
        min: 0,
        step: 1,
        decimals: 3,
    },
    fade: {
        dynamic: true,
        name: "Fade",
        type: PZ.property.type.NUMBER,
        value: 0.001,
        max: 1,
        min: 0,
        step: 0.005,
        decimals: 3,
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
            color: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
            opacity: { type: "f", value: 1 },
            covered: { type: "f", value: 0.25 },
            angle: { type: "f", value: 0 },
            fade: { type: "f", value: 0.5 * Math.PI },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    this.pass = new THREE.ShaderPass(material);
    this.pass.material.premultipliedAlpha = true;
    this.properties.load(e && e.properties);
    this.pass.material.defines = {
        SHUTTER_TYPE: 2 & this.properties.mode.get(),
        SHUTTER_SIDE: 1 & this.properties.mode.get(),
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
    if (!this.pass) {
        return;
    }
    let color;
    color = this.properties.color.get(e);
    this.pass.uniforms.color.value.set(color[0], color[1], color[2]);
    this.pass.uniforms.opacity.value = this.properties.opacity.get(e);
    this.pass.uniforms.covered.value = this.properties.covered.get(e);
    this.pass.uniforms.angle.value = this.properties.angle.get(e);
    this.pass.uniforms.fade.value = this.properties.fade.get(e);
    this.pass.enabled =
        this.properties.enabled.get(e) &&
        this.pass.uniforms.opacity.value !== 0;
};

this.resize = function () {
    let resolution = this.parentLayer.properties.resolution.get();
    this.pass.uniforms.resolution.value.set(resolution[0], resolution[1]);
};
