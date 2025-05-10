this.defaultName = "Gradient Overlay";
this.shaderfile = "blend";
this.texture = null;
this.gradientNeedsUpdate = true;
this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl";
this.vertShader = this.parentProject.assets.createFromPreset(
    PZ.asset.type.SHADER,
    "/assets/shaders/vertex/overlay.glsl"
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
    gradient: {
        name: "Gradient",
        type: PZ.property.type.GRADIENT,
        value: [{ position: 0, color: "rgba(255, 255, 255, 1)" }],
        changed: function () {
            this.parentObject.gradientNeedsUpdate = true;
        },
    },
    gradientType: {
        name: "Type",
        type: PZ.property.type.OPTION,
        value: 0,
        items: "linear;radial;angular;reflected;diamond",
        changed: function () {
            let e = this.parentObject;
            e.pass.material.defines.BLEND_GRADIENT_TYPE = this.value;
            e.pass.material.needsUpdate = true;
        },
    },
    offset: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Offset.X",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 0.05,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "Offset.Y",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 0.05,
                decimals: 3,
            },
        ],
        name: "Offset",
        type: PZ.property.type.VECTOR2,
    },
    scale: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Scale.X",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0.01,
                step: 0.05,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "Scale.Y",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0.01,
                step: 0.05,
                decimals: 3,
            },
        ],
        name: "Scale",
        type: PZ.property.type.VECTOR2,
        linkRatio: true,
    },
    rotation: {
        dynamic: true,
        name: "Rotation",
        type: PZ.property.type.NUMBER,
        scaleFactor: Math.PI / 180,
        value: 0,
        step: 3,
        decimals: 1,
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
    blending: {
        name: "Blending mode",
        type: PZ.property.type.LIST,
        value: "BLEND_SRC_OVER",
        items: PZ.layer.blendModes,
        changed: function () {
            let e = this.parentObject;
            e.pass.material.defines = {
                BLEND_SRC_GRADIENT: 1,
                OVERLAP_MODE: 3,
                BLEND_GRADIENT_TYPE:
                    e.pass.material.defines.BLEND_GRADIENT_TYPE,
            };
            e.pass.material.defines[this.value] = 1;
            e.pass.material.needsUpdate = true;
        },
    },
};

this.properties.addAll(this.propertyDefinitions, this);

this.load = async function (e) {
    this.gradient = new THREE.DataTexture(
        new Uint8Array(128),
        32,
        1,
        THREE.RGBAFormat
    );
    this.gradient.minFilter = this.gradient.magFilter = THREE.LinearFilter;
    this.vertShader = new PZ.asset.shader(
        this.parentProject.assets.load(this.vertShader)
    );
    this.fragShader = new PZ.asset.shader(
        this.parentProject.assets.load(this.fragShader)
    );
    var material = new THREE.ShaderMaterial({
        uniforms: {
            tBG: { type: "t", value: null },
            tDiffuse: { type: "t", value: this.gradient },
            opacity: { type: "f", value: 1 },
            uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            uvTransform: { type: "m3", value: new THREE.Matrix3() },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    this.pass = new THREE.OverlayPass(material);
    this.pass.material.defines.BLEND_SRC_GRADIENT = 1;
    this.pass.material.defines.OVERLAP_MODE = 3;
    this.pass.material.defines.BLEND_GRADIENT_TYPE = 0;
    this.pass.material.defines.BLEND_SRC_OVER = 1;
    this.properties.load(e && e.properties);
};

this.toJSON = function () {
    return { type: this.type, properties: this.properties };
};

this.unload = function () {
    this.gradient.dispose();
    this.parentProject.assets.unload(this.vertShader);
    this.parentProject.assets.unload(this.fragShader);
};

this.updateGradient = function () {
    PZ.object3d.particles.prototype.redrawGradient(
        this.gradient.image.data,
        this.properties.gradient.get()
    );
    this.gradient.needsUpdate = true;
};

this.update = function (e) {
    if (!this.pass) {
        return;
    }
    if (this.gradientNeedsUpdate) {
        this.updateGradient();
        this.gradientNeedsUpdate = false;
    }
    this.pass.uniforms.opacity.value = this.properties.opacity.get(e);
    let offset = this.properties.offset.get(e);
    let scale = this.properties.scale.get(e);
    let rotation = this.properties.rotation.get(e);
    let i = scale[0];
    let r = scale[1];
    scale[0] = 1 / (scale[0] * this.aspect_w);
    scale[1] = 1 / (scale[1] * this.aspect_h);
    let p = Math.cos(rotation);
    let n = Math.sin(rotation);
    this.pass.uniforms.uvTransform.value.set(
        scale[0] * p,
        (scale[1] * n * r) / i,
        -scale[0] * p * 0.5 -
            ((scale[1] * n * r) / i) * 0.5 -
            (offset[0] * p) / i -
            (offset[1] * n) / i +
            0.5,
        (-scale[0] * n * i) / r,
        scale[1] * p,
        ((scale[0] * n * i) / r) * 0.5 -
            scale[1] * p * 0.5 +
            (offset[0] * n) / r -
            (offset[1] * p) / r +
            0.5,
        0,
        0,
        1
    );
    this.pass.enabled = this.properties.enabled.get(e);
};

this.resize = function () {
    let resolution = this.parentLayer.properties.resolution.get();
    let t = Math.max(resolution[0], resolution[1]);
    this.aspect_w = t / resolution[0];
    this.aspect_h = t / resolution[1];
};
