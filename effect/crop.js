this.defaultName = "Crop";
this.shaderfile = "fx_crop";
this.texture = null;
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
    left: {
        dynamic: true,
        name: "Left",
        type: PZ.property.type.NUMBER,
        value: 0,
        decimals: 3,
        min: 0,
        max: 1,
        step: 0.1,
    },
    top: {
        dynamic: true,
        name: "Top",
        type: PZ.property.type.NUMBER,
        value: 0,
        decimals: 3,
        min: 0,
        max: 1,
        step: 0.1,
    },
    right: {
        dynamic: true,
        name: "Right",
        type: PZ.property.type.NUMBER,
        value: 0,
        decimals: 3,
        min: 0,
        max: 1,
        step: 0.1,
    },
    bottom: {
        dynamic: true,
        name: "Bottom",
        type: PZ.property.type.NUMBER,
        value: 0,
        decimals: 3,
        min: 0,
        max: 1,
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
    var t = new THREE.ShaderMaterial({
        uniforms: {
            uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            tDiffuse: { type: "t", value: null },
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    this.pass = new THREE.ShaderPass(t);
    this.pass.material.premultipliedAlpha = true;
    this.properties.load(e && e.properties);
};

this.toJSON = function () {
    return { type: this.type, properties: this.properties };
};

this.unload = function () {
    this.parentProject.assets.unload(this.vertShader);
    this.parentProject.assets.unload(this.fragShader);
};

this.update = function (e) {
    if (!this.pass) {
        return;
    }
    let left = this.properties.left.get(e);
    let right = this.properties.right.get(e);
    let top = this.properties.top.get(e);
    let bottom = this.properties.bottom.get(e);
    this.pass.quad.position.set(left - right, bottom - top, 0);
    this.pass.quad.scale.set(1 - left - right, 1 - top - bottom, 1);
    this.pass.enabled = this.properties.enabled.get(e);
};
