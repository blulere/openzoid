this.defaultName = "Transform", this.shaderfile = "fx_repeat", this.shaderUrl = "/assets/shaders/fragment/" + this.shaderfile + ".glsl", this.vertShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/common.glsl"), this.fragShader = this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl), this.propertyDefinitions = {
    enabled: {
        dynamic: !0,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    cameraType: {
        name: "Camera type",
        type: PZ.property.type.OPTION,
        value: 0,
        changed: function() {
            this.parentObject.cameraNeedsUpdate = !0
        },
        items: "perspective;orthographic"
    },
    cameraPosition: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Camera position.X",
            type: PZ.property.type.NUMBER,
            value: 0,
            step: 1
        }, {
            dynamic: !0,
            name: "Camera position.Y",
            type: PZ.property.type.NUMBER,
            value: 0,
            step: 1
        }, {
            dynamic: !0,
            name: "Camera position.Z",
            type: PZ.property.type.NUMBER,
            value: 0,
            step: 1
        }],
        name: "Camera position",
        type: PZ.property.type.VECTOR3
    },
    cameraRotation: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Camera rotation.X",
            type: PZ.property.type.NUMBER,
            value: 0,
            scaleFactor: Math.PI / 180,
            step: 1
        }, {
            dynamic: !0,
            name: "Camera rotation.Y",
            type: PZ.property.type.NUMBER,
            value: 0,
            scaleFactor: Math.PI / 180,
            step: 1
        }, {
            dynamic: !0,
            name: "Camera rotation.Z",
            type: PZ.property.type.NUMBER,
            value: 0,
            scaleFactor: Math.PI / 180,
            step: 1
        }],
        name: "Camera rotation",
        type: PZ.property.type.VECTOR3,
        scaleFactor: Math.PI / 180
    },
    imagePosition: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Image position.X",
            type: PZ.property.type.NUMBER,
            value: 0,
            step: 1
        }, {
            dynamic: !0,
            name: "Image position.Y",
            type: PZ.property.type.NUMBER,
            value: 0,
            step: 1
        }, {
            dynamic: !0,
            name: "Image position.Z",
            type: PZ.property.type.NUMBER,
            value: 0,
            step: 1
        }],
        name: "Image position",
        type: PZ.property.type.VECTOR3
    },
    imageRotation: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Image rotation.X",
            type: PZ.property.type.NUMBER,
            value: 0,
            scaleFactor: Math.PI / 180,
            step: 1
        }, {
            dynamic: !0,
            name: "Image rotation.Y",
            type: PZ.property.type.NUMBER,
            value: 0,
            scaleFactor: Math.PI / 180,
            step: 1
        }, {
            dynamic: !0,
            name: "Image rotation.Z",
            type: PZ.property.type.NUMBER,
            value: 0,
            scaleFactor: Math.PI / 180,
            step: 1
        }],
        name: "Image rotation",
        type: PZ.property.type.VECTOR3,
        scaleFactor: Math.PI / 180
    },
    imageScale: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Image scale.X",
            type: PZ.property.type.NUMBER,
            value: 1,
            min: .001,
            step: .1,
            decimals: 3
        }, {
            dynamic: !0,
            name: "Image scale.Y",
            type: PZ.property.type.NUMBER,
            value: 1,
            min: .001,
            step: .1,
            decimals: 3
        }],
        name: "Image scale",
        type: PZ.property.type.VECTOR2,
        linkRatio: !0
    },
    uvScale: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "UV scale.X",
            type: PZ.property.type.NUMBER,
            value: 1,
            step: .01,
            decimals: 3
        }, {
            dynamic: !0,
            name: "UV scale.Y",
            type: PZ.property.type.NUMBER,
            value: 1,
            step: .01,
            decimals: 3
        }],
        name: "UV scale",
        type: PZ.property.type.VECTOR2,
        linkRatio: !0
    },
    wrap: {
        name: "Wrap",
        type: PZ.property.type.OPTION,
        value: 0,
        changed: function() {
            let e = this.parentObject;
            e.pass.material.defines.REPEAT_MODE = this.value, e.pass.material.needsUpdate = !0
        },
        items: "tile;reflect"
    }
}, this.properties.addAll(this.propertyDefinitions, this), this.cameraNeedsUpdate = !0, this.threeObj = null, this.offsetZ = 0, this.load = async function(e) {
    this.vertShader = new PZ.asset.shader(this.parentProject.assets.load(this.vertShader)), this.fragShader = new PZ.asset.shader(this.parentProject.assets.load(this.fragShader));
    var t = new THREE.ShaderMaterial({
        uniforms: {
            tDiffuse: {
                type: "t",
                value: null
            },
            uvScale: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            },
            imageScale: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            }
        },
        vertexShader: await this.vertShader.getShader(),
        fragmentShader: await this.fragShader.getShader()
    });
    this.pass = new THREE.ShaderPass(t), this.pass.material.premultipliedAlpha = !0, this.pass.material.transparent = !0, this.pass.material.defines.REPEAT_SCALE = !0, this.pass.material.defines.REPEAT_MODE = 0, this.properties.load(e && e.properties)
}, this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    }
}, this.unload = function(e) {
    this.parentProject.assets.unload(this.vertShader), this.parentProject.assets.unload(this.fragShader)
}, this.updateCamera = function() {
    this.pass.scene.remove(this.pass.camera), 0 === this.properties.cameraType.get() ? this.pass.camera = new THREE.PerspectiveCamera : this.pass.camera = new THREE.OrthographicCamera, this.pass.scene.add(this.pass.camera), this.resize()
}, this.update = function(e) {
    if (!this.pass) return;
    let t;
    this.cameraNeedsUpdate && (this.updateCamera(), this.cameraNeedsUpdate = !1), t = this.properties.cameraPosition.get(e), this.pass.camera.position.set(t[0], t[1], t[2]), t = this.properties.cameraRotation.get(e), this.pass.camera.rotation.set(t[0], t[1], t[2]), t = this.properties.imagePosition.get(e), this.pass.quad.position.set(t[0], t[1], t[2] + this.offsetZ), t = this.properties.imageRotation.get(e), this.pass.quad.rotation.set(t[0], t[1], t[2]), t = this.properties.imageScale.get(e), this.pass.quad.scale.set(t[0], t[1], 1), t = this.properties.uvScale.get(e), this.pass.uniforms.imageScale.value.set(t[0], t[1]), this.pass.enabled = this.properties.enabled.get(e)
}, this.resize = function() {
    let e;
    e = this.parentLayer.properties.resolution.get();
    let t = Math.max(e[0], e[1]);
    this.offsetZ = -t;
    let a = this.pass.quad.geometry.attributes.position;
    a.array[3] = a.array[9] = .5 * e[0], a.array[0] = a.array[6] = -.5 * e[0], a.array[1] = a.array[4] = .5 * e[1], a.array[7] = a.array[10] = -.5 * e[1], a.needsUpdate = !0, 0 === this.properties.cameraType.get() ? (this.pass.camera.aspect = e[0] / e[1], this.pass.camera.fov = 2 * Math.atan(e[1] / (2 * t)) * (180 / Math.PI)) : (this.pass.camera.left = -.5 * e[0], this.pass.camera.right = .5 * e[0], this.pass.camera.top = .5 * e[1], this.pass.camera.bottom = -.5 * e[1]), this.pass.camera.near = 1, this.pass.camera.far = 2 * t, this.pass.camera.updateProjectionMatrix()
};