this.defaultName = "Displacement Map";
this.shaderfile = "fx_displacementmap";
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
        name: "Displacement map",
        type: PZ.property.type.ASSET,
        assetType: PZ.asset.type.IMAGE,
        value: null,
        accept: "image/*",
        changed: function () {
            let e = this.parentObject;
            if (e.texture) {
                e.parentProject.assets.unload(e.texture);
                e.texture = null;
                e.pass.uniforms.tDisplacement.value.dispose();
                e.pass.uniforms.tDisplacement.value = null;
            }
            if (this.value) {
                e.texture = new PZ.asset.image(
                    e.parentProject.assets.load(this.value)
                );
                let t = e.texture.getTexture(true);
                t.minFilter = t.magFilter = THREE.LinearFilter;
                t.wrapS = t.wrapT = THREE.RepeatWrapping;
                t.generateMipmaps = false;
                e.pass.uniforms.tDisplacement.value = t;
            }
            e.pass.material.needsUpdate = true;
        },
    },
    displacementOffset: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Displacement offset.X",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 0.01,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "Displacement offset.Y",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 0.01,
                decimals: 3,
            },
        ],
        name: "Displacement offset",
        type: PZ.property.type.VECTOR2,
        step: 0.01,
        decimals: 3,
    },
    uDisplacement: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "X displacement.R",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: -1,
                max: 1,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "X displacement.G",
                type: PZ.property.type.NUMBER,
                value: 0,
                min: -1,
                max: 1,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "X displacement.B",
                type: PZ.property.type.NUMBER,
                value: 0,
                min: -1,
                max: 1,
                decimals: 3,
            },
        ],
        name: "X displacement",
        type: PZ.property.type.VECTOR3,
    },
    vDisplacement: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Y displacement.R",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: -1,
                max: 1,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "Y displacement.G",
                type: PZ.property.type.NUMBER,
                value: 0,
                min: -1,
                max: 1,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "Y displacement.B",
                type: PZ.property.type.NUMBER,
                value: 0,
                min: -1,
                max: 1,
                decimals: 3,
            },
        ],
        name: "Y displacement",
        type: PZ.property.type.VECTOR3,
    },
    amount: {
        dynamic: true,
        name: "Amount",
        type: PZ.property.type.NUMBER,
        value: 0.1,
        step: 0.01,
        decimals: 3,
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
    wrap: {
        name: "Wrap",
        items: ["clamp", "tile", "reflect"],
        value: 2,
        type: PZ.property.type.OPTION,
        changed: function () {
            let e = this.parentObject;
            e.pass.material.defines.REPEAT_MODE = this.value;
            e.pass.material.needsUpdate = true;
            e.resize();
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
    var t = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { type: "t", value: null },
            tDisplacement: { type: "t", value: null },
            amount: { type: "f", value: 1 },
            offset: { type: "v2", value: new THREE.Vector2() },
            uDisplacement: { type: "v2", value: new THREE.Vector3() },
            vDisplacement: { type: "v2", value: new THREE.Vector3() },
            uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            uvTransform: { type: "m3", value: new THREE.Matrix3() },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
        premultipliedAlpha: true,
        defines: { HAS_OFFSET: true },
    });
    this.pass = new THREE.ShaderPass(t);
    this.pass.material.defines.REPEAT_MODE = 2;
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
    let offset = this.properties.offset.get(e);
    let scale = this.properties.scale.get(e);
    let rotation = this.properties.rotation.get(e);
    let p = this.aspect * scale[0];
    let i = scale[1];
    scale[0] = 1 / scale[0];
    scale[1] = 1 / scale[1];
    let r;
    let n = Math.cos(rotation);
    let l = Math.sin(rotation);
    this.pass.uniforms.uvTransform.value.set(
        scale[0] * n,
        (scale[1] * l * i) / p,
        -scale[0] * n * 0.5 -
            ((scale[1] * l * i) / p) * 0.5 -
            (offset[0] * n) / p -
            (offset[1] * l) / p +
            0.5,
        (-scale[0] * l * p) / i,
        scale[1] * n,
        ((scale[0] * l * p) / i) * 0.5 -
            scale[1] * n * 0.5 +
            (offset[0] * l) / i -
            (offset[1] * n) / i +
            0.5,
        0,
        0,
        1
    );
    r = this.properties.uDisplacement.get(e);
    this.pass.uniforms.uDisplacement.value.set(r[0], r[1], r[2]);
    r = this.properties.vDisplacement.get(e);
    this.pass.uniforms.vDisplacement.value.set(r[0], r[1], r[2]);
    r = this.properties.displacementOffset.get(e);
    this.pass.uniforms.offset.value.set(r[0], r[1]);
    this.pass.uniforms.amount.value = this.properties.amount.get(e);
    this.pass.enabled = this.properties.enabled.get(e);
};

this.prepare = async function (e) {
    if (this.texture) {
        await this.texture.loading;
    }
};

this.resize = function () {
    let e = this.parentLayer.properties.resolution.get();
    this.aspect = e[0] / e[1];
};
