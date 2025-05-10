this.defaultName = "Shake";
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
    amplitude: {
        dynamic: true,
        name: "Amount",
        type: PZ.property.type.NUMBER,
        value: 0.01,
        decimals: 3,
        min: 0,
        max: 1,
        step: 0.01,
    },
    speed: {
        dynamic: true,
        name: "Speed",
        type: PZ.property.type.NUMBER,
        value: 15,
        min: 0,
        step: 0.01,
    },
    zoom: {
        dynamic: true,
        name: "Zoom",
        type: PZ.property.type.NUMBER,
        value: 100,
        step: 1,
        min: 0,
        decimals: 1,
    },
    wrap: {
        name: "Wrap",
        type: PZ.property.type.OPTION,
        value: 2,
        changed: function () {
            let e = this.parentObject;
            e.pass.material.defines.REPEAT_MODE = Math.max(this.value - 1, 0);
            e.pass.material.needsUpdate = true;
            e.resize();
        },
        items: "none;tile;reflect",
    },
};

this.shake = new PZ.shake();
this.properties.addAll(this.propertyDefinitions, this);
this.properties.add("shake", this.shake.properties);

this.load = async function (e) {
    this.shake.properties.load({ mode: 1, amplitude: [1e3, 1e3, 1e3, 10] });
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
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    this.pass = new THREE.ShaderPass(material);
    this.pass.material.premultipliedAlpha = true;
    this.pass.material.transparent = true;
    this.pass.material.defines.REPEAT_MODE = 1;
    this.pass.scene.remove(this.pass.camera);
    this.pass.camera = new THREE.PerspectiveCamera();
    this.pass.scene.add(this.pass.camera);
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
    let zoom = this.properties.zoom.get(e);
    let parent = this.parentLayer;
    this.pass.quad.scale.copy(parent.composite.group.scale);
    this.pass.camera.position.set(0, 0, -zoom);
    this.pass.camera.rotation.set(0, 0, 0);
    this.pass.camera.scale.copy(parent.composite.group.scale);
    let amplitude = this.properties.amplitude.get(e);
    let speed = e * (this.properties.speed.get(e) / 30);
    this.shake.shake(speed, amplitude, this.pass.camera);
    this.pass.enabled = this.properties.enabled.get(e);
};

this.resize = function () {
    let resolution = this.parentLayer.properties.resolution.get();
    let wrap = this.properties.wrap.get();
    let position = this.pass.quad.geometry.attributes.position;
    let a = wrap === 0 ? 0.5 : 2.5;
    position.array[3] = position.array[9] = resolution[0] * a;
    position.array[0] = position.array[6] = resolution[0] * -a;
    position.array[1] = position.array[4] = resolution[1] * a;
    position.array[7] = position.array[10] = resolution[1] * -a;
    position.needsUpdate = true;
    let uv = this.pass.quad.geometry.attributes.uv;
    let uvArray = this.pass.quad.geometry.attributes.uv.array;
    let p = wrap === 0 ? 0 : 2;
    uvArray[0] = uvArray[4] = uvArray[5] = uvArray[7] = 0 - p;
    uvArray[1] = uvArray[2] = uvArray[3] = uvArray[6] = 1 + p;
    uv.needsUpdate = true;
    let h = Math.max(resolution[0], resolution[1]);
    this.pass.quad.position.set(0, 0, -h);
    this.pass.camera.aspect = resolution[0] / resolution[1];
    this.pass.camera.fov = 2 * Math.atan(resolution[1] / (2 * h)) * (180 / Math.PI);
    this.pass.camera.near = 1;
    this.pass.camera.far = 2 * h;
    this.pass.camera.updateProjectionMatrix();
};
