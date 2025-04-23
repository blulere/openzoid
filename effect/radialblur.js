this.defaultName = "Radial Blur";
this.shaderfile = "fx_radialblur";
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
    density: {
        dynamic: true,
        name: "Delta",
        type: PZ.property.type.NUMBER,
        value: 0.5,
        max: 1,
        min: -1,
        step: 0.05,
        decimals: 3,
    },
    dither: {
        dynamic: true,
        name: "Dither",
        type: PZ.property.type.NUMBER,
        value: 0.5,
        max: 1,
        min: 0,
        step: 0.05,
        decimals: 3,
    },
    decay: {
        dynamic: true,
        name: "Decay",
        type: PZ.property.type.NUMBER,
        value: 0.9,
        max: 1,
        min: 0,
        step: 0.05,
        decimals: 3,
    },
    center: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Center.X",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 0.05,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "Center.Y",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 0.05,
                decimals: 3,
            },
        ],
        name: "Center",
        type: PZ.property.type.VECTOR2,
    },
    overbright: {
        name: "Overbright",
        type: PZ.property.type.OPTION,
        value: 0,
        changed: function () {
            let e = this.parentObject;
            if (this.value === 0) {
                e.pass.material.defines.CONSTANT_BRIGHTNESS = 1;
            } else {
                delete e.pass.material.defines.CONSTANT_BRIGHTNESS;
            }
            e.pass.material.needsUpdate = true;
        },
        items: "off;on",
    },
    weight: {
        dynamic: true,
        name: "Weight",
        type: PZ.property.type.NUMBER,
        value: 0.2,
        max: 1,
        min: 0,
        step: 0.05,
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
            uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            resolution: { type: "v2", value: new THREE.Vector2(1, 1) },
            decay: { type: "f", value: 0.97 },
            density: { type: "f", value: 0.5 },
            dither: { type: "f", value: 1 },
            center: { type: "v2", value: new THREE.Vector2(0, 0) },
            weight: { type: "f", value: 1 },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    material.premultipliedAlpha = true;
    material.defines.DITHER = 1;
    material.defines.CONSTANT_BRIGHTNESS = 1;
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
    if (!this.pass) {
        return;
    }
    this.pass.enabled = this.properties.enabled.get(e);
    this.pass.uniforms.decay.value = this.properties.decay.get(e);
    this.pass.uniforms.density.value = this.properties.density.get(e);
    this.pass.uniforms.dither.value = this.properties.dither.get(e);
    this.pass.uniforms.weight.value = this.properties.weight.get(e);
    let center = this.properties.center.get(e);
    this.pass.uniforms.center.value.set(center[0], center[1]);
};

this.resize = function () {
    let resolution = this.parentLayer.properties.resolution.get();
    this.pass.uniforms.resolution.value.set(resolution[0], resolution[1]);
};
