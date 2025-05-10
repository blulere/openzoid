this.defaultName = "Transform";
this.shaderfile = "fx_repeat";
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
    cameraType: {
        name: "Camera type",
        type: PZ.property.type.OPTION,
        value: 0,
        changed: function () {
            this.parentObject.cameraNeedsUpdate = true;
        },
        items: "perspective;orthographic",
    },
    cameraPosition: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Camera position.X",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 1,
            },
            {
                dynamic: true,
                name: "Camera position.Y",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 1,
            },
            {
                dynamic: true,
                name: "Camera position.Z",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 1,
            },
        ],
        name: "Camera position",
        type: PZ.property.type.VECTOR3,
    },
    cameraRotation: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Camera rotation.X",
                type: PZ.property.type.NUMBER,
                value: 0,
                scaleFactor: Math.PI / 180,
                step: 1,
            },
            {
                dynamic: true,
                name: "Camera rotation.Y",
                type: PZ.property.type.NUMBER,
                value: 0,
                scaleFactor: Math.PI / 180,
                step: 1,
            },
            {
                dynamic: true,
                name: "Camera rotation.Z",
                type: PZ.property.type.NUMBER,
                value: 0,
                scaleFactor: Math.PI / 180,
                step: 1,
            },
        ],
        name: "Camera rotation",
        type: PZ.property.type.VECTOR3,
        scaleFactor: Math.PI / 180,
    },
    imagePosition: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Image position.X",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 1,
            },
            {
                dynamic: true,
                name: "Image position.Y",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 1,
            },
            {
                dynamic: true,
                name: "Image position.Z",
                type: PZ.property.type.NUMBER,
                value: 0,
                step: 1,
            },
        ],
        name: "Image position",
        type: PZ.property.type.VECTOR3,
    },
    imageRotation: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Image rotation.X",
                type: PZ.property.type.NUMBER,
                value: 0,
                scaleFactor: Math.PI / 180,
                step: 1,
            },
            {
                dynamic: true,
                name: "Image rotation.Y",
                type: PZ.property.type.NUMBER,
                value: 0,
                scaleFactor: Math.PI / 180,
                step: 1,
            },
            {
                dynamic: true,
                name: "Image rotation.Z",
                type: PZ.property.type.NUMBER,
                value: 0,
                scaleFactor: Math.PI / 180,
                step: 1,
            },
        ],
        name: "Image rotation",
        type: PZ.property.type.VECTOR3,
        scaleFactor: Math.PI / 180,
    },
    imageScale: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "Image scale.X",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0.001,
                step: 0.1,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "Image scale.Y",
                type: PZ.property.type.NUMBER,
                value: 1,
                min: 0.001,
                step: 0.1,
                decimals: 3,
            },
        ],
        name: "Image scale",
        type: PZ.property.type.VECTOR2,
        linkRatio: true,
    },
    uvScale: {
        dynamic: true,
        group: true,
        objects: [
            {
                dynamic: true,
                name: "UV scale.X",
                type: PZ.property.type.NUMBER,
                value: 1,
                step: 0.01,
                decimals: 3,
            },
            {
                dynamic: true,
                name: "UV scale.Y",
                type: PZ.property.type.NUMBER,
                value: 1,
                step: 0.01,
                decimals: 3,
            },
        ],
        name: "UV scale",
        type: PZ.property.type.VECTOR2,
        linkRatio: true,
    },
    wrap: {
        name: "Wrap",
        type: PZ.property.type.OPTION,
        value: 0,
        changed: function () {
            let e = this.parentObject;
            e.pass.material.defines.REPEAT_MODE = this.value;
            e.pass.material.needsUpdate = true;
        },
        items: "tile;reflect",
    },
};

this.properties.addAll(this.propertyDefinitions, this);
this.cameraNeedsUpdate = true;
this.threeObj = null;
this.offsetZ = 0;

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
            imageScale: { type: "v2", value: new THREE.Vector2(1, 1) },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    this.pass = new THREE.ShaderPass(material);
    this.pass.material.premultipliedAlpha = true;
    this.pass.material.transparent = true;
    this.pass.material.defines.REPEAT_SCALE = true;
    this.pass.material.defines.REPEAT_MODE = 0;
    this.properties.load(e && e.properties);
};

this.toJSON = function () {
    return { type: this.type, properties: this.properties };
};

this.unload = function (e) {
    this.parentProject.assets.unload(this.vertShader);
    this.parentProject.assets.unload(this.fragShader);
};

this.updateCamera = function () {
    this.pass.scene.remove(this.pass.camera);
    if (this.properties.cameraType.get() === 0) {
        this.pass.camera = new THREE.PerspectiveCamera();
    } else {
        this.pass.camera = new THREE.OrthographicCamera();
    }
    this.pass.scene.add(this.pass.camera);
    this.resize();
};

this.update = function (e) {
    if (!this.pass) {
        return;
    }
    let t;
    if (this.cameraNeedsUpdate) {
        this.updateCamera();
        this.cameraNeedsUpdate = false;
    }
    t = this.properties.cameraPosition.get(e);
    this.pass.camera.position.set(t[0], t[1], t[2]);
    t = this.properties.cameraRotation.get(e);
    this.pass.camera.rotation.set(t[0], t[1], t[2]);
    t = this.properties.imagePosition.get(e);
    this.pass.quad.position.set(t[0], t[1], t[2] + this.offsetZ);
    t = this.properties.imageRotation.get(e);
    this.pass.quad.rotation.set(t[0], t[1], t[2]);
    t = this.properties.imageScale.get(e);
    this.pass.quad.scale.set(t[0], t[1], 1);
    t = this.properties.uvScale.get(e);
    this.pass.uniforms.imageScale.value.set(t[0], t[1]);
    this.pass.enabled = this.properties.enabled.get(e);
};

this.resize = function () {
    let resolution;
    resolution = this.parentLayer.properties.resolution.get();
    let t = Math.max(resolution[0], resolution[1]);
    this.offsetZ = -t;
    let position = this.pass.quad.geometry.attributes.position;
    position.array[3] = position.array[9] = 0.5 * resolution[0];
    position.array[0] = position.array[6] = -0.5 * resolution[0];
    position.array[1] = position.array[4] = 0.5 * resolution[1];
    position.array[7] = position.array[10] = -0.5 * resolution[1];
    position.needsUpdate = true;
    if (this.properties.cameraType.get() === 0) {
        this.pass.camera.aspect = resolution[0] / resolution[1];
        this.pass.camera.fov = 2 * Math.atan(resolution[1] / (2 * t)) * (180 / Math.PI);
    } else {
        this.pass.camera.left = -0.5 * resolution[0];
        this.pass.camera.right = 0.5 * resolution[0];
        this.pass.camera.top = 0.5 * resolution[1];
        this.pass.camera.bottom = -0.5 * resolution[1];
    }
    this.pass.camera.near = 1;
    this.pass.camera.far = 2 * t;
    this.pass.camera.updateProjectionMatrix();
};
