this.defaultName = "Image Overlay";
this.shaderfile = "blend";
this.texture = null;
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
    texture: {
        name: "Image",
        type: PZ.property.type.ASSET,
        assetType: PZ.asset.type.IMAGE,
        value: null,
        accept: "image/*",
        changed: function () {
            let e = this.parentObject;
            if (e.texture) {
                e.parentProject.assets.unload(e.texture);
                e.texture = null;
                e.pass.uniforms.tDiffuse.value.dispose();
                e.pass.uniforms.tDiffuse.value = null;
            }
            if (this.value) {
                e.texture = new PZ.asset.image(
                    e.parentProject.assets.load(this.value)
                );
                let t = e.texture.getTexture(true);
                t.minFilter = t.magFilter = THREE.LinearFilter;
                t.wrapS = t.wrapT = THREE.RepeatWrapping;
                t.generateMipmaps = false;
                e.pass.uniforms.tDiffuse.value = t;
            }
            e.pass.material.needsUpdate = true;
        },
    },
    repeat: {
        name: "Repeat",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on",
        changed: function () {
            let e = this.parentObject;
            e.pass.material.defines.BLEND_NO_REPEAT = !this.value;
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
                step: 0.05,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "Scale.Y",
                type: PZ.property.type.NUMBER,
                value: 1,
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
                OVERLAP_MODE: 3,
                BLEND_NO_REPEAT: e.pass.material.defines.BLEND_NO_REPEAT,
            };
            e.pass.material.defines[this.value] = 1;
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
            tBG: { type: "t", value: null },
            tDiffuse: { type: "t", value: null },
            opacity: { type: "f", value: 1 },
            uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            uvTransform: { type: "m3", value: new THREE.Matrix3() },
        },
        defines: { OVERLAP_MODE: 3, BLEND_NO_REPEAT: false, BLEND_SRC_OVER: 1 },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
        premultipliedAlpha: true,
    });
    this.pass = new THREE.OverlayPass(material);
    this.properties.load(e && e.properties);
};

this.toJSON = function () {
    return { type: this.type, properties: this.properties };
};

this.unload = function () {
    if (this.texture) {
        this.parentProject.assets.unload(this.texture);
        this.pass.uniforms.tDiffuse.value.dispose();
    }
    this.parentProject.assets.unload(this.vertShader);
    this.parentProject.assets.unload(this.fragShader);
};

this.update = function (e) {
    if (!this.pass) {
        return;
    }
    this.pass.uniforms.opacity.value = this.properties.opacity.get(e);
    let offset = this.properties.offset.get(e);
    let scale = this.properties.scale.get(e);
    let rotation = this.properties.rotation.get(e);
    let r = this.aspect * scale[0];
    let i = scale[1];
    scale[0] = 1 / scale[0];
    scale[1] = 1 / scale[1];
    let p = Math.cos(rotation);
    let n = Math.sin(rotation);
    this.pass.uniforms.uvTransform.value.set(
        scale[0] * p,
        (scale[1] * n * i) / r,
        -scale[0] * p * 0.5 -
            ((scale[1] * n * i) / r) * 0.5 -
            (offset[0] * p) / r -
            (offset[1] * n) / r +
            0.5,
        (-scale[0] * n * r) / i,
        scale[1] * p,
        ((scale[0] * n * r) / i) * 0.5 -
            scale[1] * p * 0.5 +
            (offset[0] * n) / i -
            (offset[1] * p) / i +
            0.5,
        0,
        0,
        1
    );
    this.pass.enabled = this.properties.enabled.get(e);
};

this.prepare = async function (e) {
    if (this.texture) {
        await this.texture.loading;
    }
};

this.resize = function () {
    let resolution = this.parentLayer.properties.resolution.get();
    this.aspect = resolution[0] / resolution[1];
};
