// that's what the point of the mask is
this.defaultName = "Mask";
this.shaderfile = "fx_mask";
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
        value: 0,
        changed: function () {
            let e = this.parentObject;
            e.pass.mask.material.defines.MASK_MODE = this.value;
            e.pass.mask.material.needsUpdate = true;
        },
        items: "rectangle;ellipse",
    },
    position: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Position.X",
                type: PZ.property.type.NUMBER,
                value: 0,
                decimals: 0,
                step: 10,
            },
            {
                dynamic: true,
                name: "Position.Y",
                type: PZ.property.type.NUMBER,
                value: 0,
                decimals: 0,
                step: 10,
            },
        ],
        name: "Position",
        type: PZ.property.type.VECTOR2,
    },
    size: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Size.X",
                type: PZ.property.type.NUMBER,
                min: 0.01,
                value: 250,
                decimals: 0,
                step: 10,
            },
            {
                dynamic: true,
                name: "Size.Y",
                type: PZ.property.type.NUMBER,
                min: 0.01,
                value: 250,
                decimals: 0,
                step: 10,
            },
        ],
        name: "Size",
        type: PZ.property.type.VECTOR2,
        linkRatio: true,
    },
    rotation: {
        dynamic: true,
        name: "Rotation",
        type: PZ.property.type.NUMBER,
        value: 0,
        step: 0.1,
    },
    invert: {
        name: "Invert",
        type: PZ.property.type.OPTION,
        value: 0,
        items: "off;on",
        changed: function () {
            let e = this.parentObject;
            if (this.value) {
                e.pass.material.blendSrc = THREE.OneMinusDstColorFactor;
            } else {
                e.pass.material.blendSrc = THREE.DstColorFactor;
            }
        },
    },
    feather: {
        dynamic: true,
        name: "Feather",
        type: PZ.property.type.NUMBER,
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.1,
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
};

this.properties.addAll(this.propertyDefinitions, this);

this.load = async function (e) {
    this.vertShader = new PZ.asset.shader(
        this.parentProject.assets.load(this.vertShader)
    );
    this.fragShader = new PZ.asset.shader(
        this.parentProject.assets.load(this.fragShader)
    );
    let material = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { type: "t", value: null },
            uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            resolution: { type: "v2", value: new THREE.Vector2(1, 1) },
            feather: { type: "f", value: 0 },
            opacity: { type: "f", value: 1 },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    material.premultipliedAlpha = true;
    this.pass = new THREE.ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(THREE.CopyShader.uniforms),
            fragmentShader: THREE.CopyShader.fragmentShader,
            vertexShader: THREE.CopyShader.vertexShader,
        })
    );
    this.pass.camera.matrixAutoUpdate = false;
    this.pass.quad.matrixAutoUpdate = false;
    this.pass.material.premultipliedAlpha = true;
    this.pass.material.transparent = true;
    this.pass.material.blending = THREE.CustomBlending;
    this.pass.material.blendEquation = THREE.AddEquation;
    this.pass.material.blendDst = THREE.ZeroFactor;
    this.pass.mask = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), material);
    this.pass.mask.material.premultipliedAlpha = true;
    this.pass.mask.material.transparent = true;
    this.pass.scene.add(this.pass.mask);
    this.properties.load(e && e.properties);
    if (this.properties.invert.get()) {
        this.pass.material.blendSrc = THREE.OneMinusDstColorFactor;
    } else {
        this.pass.material.blendSrc = THREE.DstColorFactor;
    }
    this.pass.mask.material.defines = { MASK_MODE: this.properties.mode.get() };
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
    let position;
    let feather = this.properties.feather.get(e);
    position = this.properties.position.get(e);
    this.pass.mask.position.set(position[0], position[1], -0.5);
    position = this.properties.size.get(e);
    this.pass.mask.scale.set(position[0] * (1 + feather), position[1] * (1 + feather), 1);
    position = this.properties.rotation.get(e);
    this.pass.mask.rotation.set(0, 0, position);
    let s = this.parentLayer;
    s.composite.group.updateMatrix();
    this.pass.quad.matrix.copy(s.composite.group.matrix);
    this.pass.camera.matrix.copy(s.composite.group.matrix);
    this.pass.mask.material.uniforms.feather.value = feather;
    this.pass.mask.material.uniforms.opacity.value =
        this.properties.opacity.get(e);
    this.pass.enabled = this.properties.enabled.get(e);
};

this.resize = function () {
    let resolution = this.parentLayer.properties.resolution.get();
    let position = this.pass.quad.geometry.attributes.position;
    position.array[3] = position.array[9] = 0.5 * resolution[0];
    position.array[0] = position.array[6] = -0.5 * resolution[0];
    position.array[1] = position.array[4] = 0.5 * resolution[1];
    position.array[7] = position.array[10] = -0.5 * resolution[1];
    position.needsUpdate = true;
    this.pass.camera.left = -0.5 * resolution[0];
    this.pass.camera.right = 0.5 * resolution[0];
    this.pass.camera.top = 0.5 * resolution[1];
    this.pass.camera.bottom = -0.5 * resolution[1];
    this.pass.camera.updateProjectionMatrix();
};
