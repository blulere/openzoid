this.defaultName = "Pixel Sort";
this.shaderfile = "fx_pixelsort";
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
    threshold: {
        dynamic: true,
        name: "Threshold",
        type: PZ.property.type.NUMBER,
        value: 1,
        max: 1,
        min: 0,
        step: 0.01,
        decimals: 3,
    },
    direction: {
        name: "Direction",
        type: PZ.property.type.OPTION,
        value: 0,
        items: "vertical;horizontal",
        changed: function () {
            let e = this.parentObject;
            e.pass.sortPass.defines.DIRECTION = this.value;
            e.pass.sortPass.needsUpdate = true;
            e.pass.drawPass.defines.DIRECTION = this.value;
            e.pass.drawPass.needsUpdate = true;
        },
    },
    reverse: {
        name: "Reverse",
        type: PZ.property.type.OPTION,
        value: 0,
        items: "off;on",
        changed: function () {
            let e = this.parentObject;
            e.pass.sortPass.defines.REVERSE = this.value;
            e.pass.sortPass.needsUpdate = true;
        },
    },
    affect: {
        name: "Affect",
        type: PZ.property.type.OPTION,
        value: 0,
        items: "shadows;highlights",
        changed: function () {
            let e = this.parentObject;
            e.pass.sortPass.defines.AFFECT = this.value;
            e.pass.sortPass.needsUpdate = true;
        },
    },
};

this.properties.addAll(this.propertyDefinitions, this);

if (!THREE.PixelSortPass) {
    THREE.PixelSortPass = function (sortPass, drawPass, uniforms) {
        THREE.Pass.call(this);
        this.sortPass = sortPass;
        this.drawPass = drawPass;
        this.uniforms = uniforms;
        let r = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
        };
        this.renderTarget = new THREE.WebGLRenderTarget(32, 32, r);
        this.renderTarget.texture.generateMipmaps = false;
        this.enabled = true;
        this.needsSwap = true;
        this.oldClearColor = new THREE.Color();
        this.oldClearAlpha = 1;
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new THREE.Scene();
        this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
        this.scene.add(this.quad);
    };
    THREE.PixelSortPass.prototype = Object.assign(
        Object.create(THREE.Pass.prototype),
        {
            constructor: THREE.PixelSortPass,
            dispose: function () {
                this.renderTarget.dispose();
            },
            setSize: function (e, t) {
                this.renderTarget.setSize(e, t);
            },
            render: function (e, t, s, r, a) {
                if (
                    s.width !== this.renderTarget.width ||
                    s.height !== this.renderTarget.height
                ) {
                    this.renderTarget.setSize(s.width, s.height);
                    this.sortPass.defines.CONST_RESOLUTION =
                        this.drawPass.defines.CONST_RESOLUTION = `const vec2 resolution = vec2(${t.viewport.z}.0, ${t.viewport.w}.0)`;
                    this.sortPass.needsUpdate = true;
                    this.drawPass.needsUpdate = true;
                }
                this.uniforms.tDiffuse.value = s.texture;
                this.uniforms.tMap.value = null;
                this.quad.material = this.sortPass;
                this.renderTarget.viewport.copy(t.viewport);
                e.render(this.scene, this.camera, this.renderTarget, true);
                this.uniforms.tDiffuse.value = s.texture;
                this.uniforms.tMap.value = this.renderTarget.texture;
                this.quad.material = this.drawPass;
                e.render(this.scene, this.camera, t, false);
            },
        }
    );
}

this.load = async function (e) {
    this.vertShader = new PZ.asset.shader(
        this.parentProject.assets.load(this.vertShader)
    );
    this.fragShader = new PZ.asset.shader(
        this.parentProject.assets.load(this.fragShader)
    );
    let t = {
        tDiffuse: { type: "t", value: null },
        tMap: { type: "t", value: null },
        uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
        threshold: { type: "f", value: 0.5 },
    };
    let s = new THREE.ShaderMaterial({
        uniforms: t,
        defines: { PASS_MAP: true, DIRECTION: 0, AFFECT: 0, REVERSE: 0 },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    let r = new THREE.ShaderMaterial({
        uniforms: t,
        defines: { DIRECTION: 0 },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    this.pass = new THREE.PixelSortPass(s, r, t);
    this.properties.load(e && e.properties);
};

this.toJSON = function () {
    return { type: this.type, properties: this.properties };
};

this.unload = function () {
    this.pass.dispose();
    this.parentProject.assets.unload(this.vertShader);
    this.parentProject.assets.unload(this.fragShader);
};

this.update = function (e) {
    this.pass.enabled = this.properties.enabled.get(e);
    this.pass.uniforms.threshold.value = this.properties.threshold.get(e);
};

this.resize = function () {
    this.parentLayer.properties.resolution.get();
};
