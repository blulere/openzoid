this.defaultName = "Cube LUT";
this.shaderfile = "fx_lut";
this.lut = null;
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
    lut: {
        name: "Cube LUT file",
        type: PZ.property.type.ASSET,
        assetType: PZ.asset.type.MISC,
        value: null,
        accept: ".cube",
        changed: function () {
            let e = this.parentObject;
            if (e.lut) {
                e.parentProject.assets.unload(e.lut);
                e.lut = null;
                e.pass.uniforms.tDiffuse.value.dispose();
                e.pass.uniforms.tDiffuse.value = null;
            }
            if (this.value) {
                e.lut = new PZ.asset.cubelut(
                    e.parentProject.assets.load(this.value)
                );
                e.lut.getLUT().then((t) => {
                    e.updateTexture(t);
                });
            }
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
    var t = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: { type: "t", value: null },
            uvScale: { type: "v2", value: new THREE.Vector2(1, 1) },
            tLUT: { type: "t", value: null },
        },
        defines: {
            LUT_3D: false,
            LUT_SIZE: 1,
            DOMAIN_MIN: "vec3(0.,0.,0.)",
            DOMAIN_MAX: "vec3(0.,0.,0.)",
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader(),
    });
    t.premultipliedAlpha = true;
    this.pass = new THREE.ShaderPass(t);
    this.properties.load(e && e.properties);
};

this.updateTexture = function (e) {
    let t;
    let s;
    if (e.type === "1D") {
        t = e.size;
        s = 1;
    } else {
        t = e.size * e.size;
        s = e.size;
    }
    let a = new THREE.DataTexture(e.data, t, s, THREE.RGBFormat);
    a.magFilter = THREE.LinearFilter;
    a.needsUpdate = true;
    this.pass.material.uniforms.tLUT.value = a;
    this.pass.material.defines.LUT_3D = e.type === "3D";
    this.pass.material.defines.LUT_SIZE = e.size.toFixed(1);
    this.pass.material.defines.DOMAIN_MIN = `vec3(${e.domain[0]
        .map((e) => e.toFixed(1))
        .join(",")})`;
    this.pass.material.defines.DOMAIN_MAX = `vec3(${e.domain[1]
        .map((e) => e.toFixed(1))
        .join(",")})`;
    this.pass.material.needsUpdate = true;
};

this.toJSON = function () {
    return { type: this.type, properties: this.properties };
};

this.unload = function (e) {
    if (this.lut) {
        this.parentProject.assets.unload(this.lut);
    }
    this.parentProject.assets.unload(this.vertShader);
    this.parentProject.assets.unload(this.fragShader);
};

this.update = function (e) {
    if (this.pass) {
        this.pass.enabled =
            this.properties.enabled.get(e) === 1 &&
            this.properties.lut.get() !== null;
    }
};

this.prepare = async function (e) {
    if (this.lut) {
        await this.lut.loading;
    }
};
