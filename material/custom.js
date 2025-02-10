this.defaultName = "Custom Material";
const WRAP_VALUES = [THREE.ClampToEdgeWrapping, THREE.RepeatWrapping, THREE.MirroredRepeatWrapping];
this.load = function(e) {
    this.threeObj = new THREE.MeshStandardMaterial, this.texture = null, this.normalMap = null, this.properties.load(e && e.properties)
}, this.unload = function() {
    this.properties.reflection.set(0), this.texture && (this.parentProject.assets.unload(this.texture), this.threeObj.map.dispose()), this.normalMap && (this.parentProject.assets.unload(this.normalMap), this.threeObj.normalMap.dispose()), this.threeObj.dispose()
}, this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    }
}, this.update = function(e) {
    var t = this;
    let a;
    a = this.properties.color.get(e), t.threeObj.color.setRGB(a[0], a[1], a[2]), a = this.properties.emissive.get(e), t.threeObj.emissive.setRGB(a[0], a[1], a[2]), t.threeObj.map && (a = this.properties.repeat.get(e), t.threeObj.map.repeat.set(a[0], a[1]), a = this.properties.offset.get(e), t.threeObj.map.offset.set(a[0], a[1]), a = this.properties.center.get(e), t.threeObj.map.center.set(a[0], a[1]), t.threeObj.map.rotation = this.properties.rotation.get(e)), t.threeObj.normalMap && (a = this.properties.repeat.get(e), t.threeObj.normalMap.repeat.set(a[0], a[1]), a = this.properties.offset.get(e), t.threeObj.normalMap.offset.set(a[0], a[1]), a = this.properties.center.get(e), t.threeObj.normalMap.center.set(a[0], a[1]), t.threeObj.normalMap.rotation = this.properties.rotation.get(e)), t.threeObj.opacity = this.properties.opacity.get(e)
}, this.prepare = async function(e) {
    this.texture && await this.texture.loading, this.normalMap && await this.normalMap.loading
}, this.initReflection = function() {
    1 !== this.properties.reflection.get() || this.threeObj.envMap ? 0 === this.properties.reflection.get() && this.threeObj.envMap && (this.parentLayer.envMap.releaseTexture(), this.threeObj.envMap = null, this.threeObj.needsUpdate = !0) : (this.threeObj.envMap = this.parentLayer.envMap.getTexture(), this.threeObj.needsUpdate = !0)
}, this.props = {
    color: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Color.R",
            type: PZ.property.type.NUMBER,
            value: 1,
            min: 0,
            max: 1
        }, {
            dynamic: !0,
            name: "Color.G",
            type: PZ.property.type.NUMBER,
            value: 1,
            min: 0,
            max: 1
        }, {
            dynamic: !0,
            name: "Color.B",
            type: PZ.property.type.NUMBER,
            value: 1,
            min: 0,
            max: 1
        }],
        name: "Color",
        type: PZ.property.type.COLOR
    },
    emissive: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Emissive.R",
            type: PZ.property.type.NUMBER,
            value: 0,
            min: 0,
            max: 1
        }, {
            dynamic: !0,
            name: "Emissive.G",
            type: PZ.property.type.NUMBER,
            value: 0,
            min: 0,
            max: 1
        }, {
            dynamic: !0,
            name: "Emissive.B",
            type: PZ.property.type.NUMBER,
            value: 0,
            min: 0,
            max: 1
        }],
        name: "Emissive",
        type: PZ.property.type.COLOR
    },
    roughness: {
        name: "Roughness",
        type: PZ.property.type.NUMBER,
        value: .5,
        changed: function() {
            this.parentObject.threeObj.roughness = this.value
        },
        max: 1,
        min: 0,
        step: .01
    },
    metalness: {
        name: "Metalness",
        type: PZ.property.type.NUMBER,
        value: .5,
        changed: function() {
            this.parentObject.threeObj.metalness = this.value
        },
        max: 1,
        min: 0,
        step: .01
    },
    texture: {
        name: "Texture",
        type: PZ.property.type.ASSET,
        assetType: PZ.asset.type.IMAGE,
        accept: "image/*",
        value: null,
        changed: async function() {
            let e = this.parentObject;
            if (e.texture && (e.parentProject.assets.unload(e.texture), e.texture = null, e.threeObj.map.dispose(), e.threeObj.map = null), this.value) {
                e.texture = new PZ.asset.image(e.parentProject.assets.load(this.value));
                let t = e.texture.getTexture(!0),
                    a = e.properties.wrap.get() || 1;
                t.wrapS = WRAP_VALUES[a], t.wrapT = WRAP_VALUES[a], e.threeObj.map = t
            }
            e.threeObj.needsUpdate = !0
        }
    },
    transparent: {
        name: "Transparency",
        type: PZ.property.type.OPTION,
        value: 0,
        changed: function() {
            this.parentObject.threeObj.transparent = 1 === this.value
        },
        items: "off;on"
    },
    opacity: {
        dynamic: !0,
        name: "Opacity",
        type: PZ.property.type.NUMBER,
        value: 1,
        max: 1,
        min: 0,
        step: .01
    },
    blending: {
        name: "Blending",
        type: PZ.property.type.OPTION,
        value: 1,
        changed: function() {
            this.parentObject.threeObj.blending = this.value
        },
        items: "none;normal;additive;subtractive;multiply"
    },
    side: {
        name: "Render side",
        type: PZ.property.type.OPTION,
        value: 0,
        changed: function(e) {
            this.parentObject.threeObj.side = this.value
        },
        items: "front;back;both"
    },
    normalMap: {
        name: "Normal map",
        type: PZ.property.type.ASSET,
        assetType: PZ.asset.type.IMAGE,
        accept: "image/*",
        value: null,
        changed: async function() {
            let e = this.parentObject;
            if (e.normalMap && (e.parentProject.assets.unload(e.normalMap), e.normalMap = null, e.threeObj.normalMap.dispose(), e.threeObj.normalMap = null), this.value) {
                e.normalMap = new PZ.asset.image(e.parentProject.assets.load(this.value));
                let t = e.normalMap.getTexture(!0),
                    a = e.properties.wrap.get() || 1;
                t.wrapS = WRAP_VALUES[a], t.wrapT = WRAP_VALUES[a], e.threeObj.normalMap = t
            }
            e.threeObj.needsUpdate = !0
        }
    },
    normalScale: {
        name: "Normal scale",
        type: PZ.property.type.NUMBER,
        value: 1,
        changed: function() {
            this.parentObject.threeObj.normalScale.set(this.value, this.value)
        },
        decimals: 3,
        min: 0,
        step: .01
    },
    wrap: {
        name: "Wrap",
        type: PZ.property.type.OPTION,
        value: 1,
        changed: function() {
            let e = this.parentObject;
            e.threeObj.map && (e.threeObj.map.wrapS = WRAP_VALUES[this.value], e.threeObj.map.wrapT = WRAP_VALUES[this.value], e.threeObj.map.needsUpdate = !0), e.threeObj.normalMap && (e.threeObj.normalMap.wrapS = WRAP_VALUES[this.value], e.threeObj.normalMap.wrapT = WRAP_VALUES[this.value], e.threeObj.normalMap.needsUpdate = !0)
        },
        items: "none;tile;reflect"
    },
    repeat: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Repeat.U",
            type: PZ.property.type.NUMBER,
            step: .1,
            decimals: 3,
            value: 1
        }, {
            dynamic: !0,
            name: "Repeat.V",
            type: PZ.property.type.NUMBER,
            step: .1,
            decimals: 3,
            value: 1
        }],
        name: "Repeat",
        type: PZ.property.type.VECTOR2,
        step: .1,
        decimals: 3,
        linkRatio: !0
    },
    offset: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Offset.U",
            type: PZ.property.type.NUMBER,
            step: .1,
            decimals: 3,
            value: 0
        }, {
            dynamic: !0,
            name: "Offset.V",
            type: PZ.property.type.NUMBER,
            step: .1,
            decimals: 3,
            value: 0
        }],
        name: "Offset",
        step: .1,
        decimals: 3,
        type: PZ.property.type.VECTOR2
    },
    center: {
        dynamic: !0,
        group: !0,
        objects: [{
            dynamic: !0,
            name: "Center.U",
            type: PZ.property.type.NUMBER,
            step: .1,
            decimals: 3,
            value: 0
        }, {
            dynamic: !0,
            name: "Center.V",
            type: PZ.property.type.NUMBER,
            step: .1,
            decimals: 3,
            value: 0
        }],
        name: "Center",
        step: .1,
        decimals: 3,
        type: PZ.property.type.VECTOR2
    },
    rotation: {
        dynamic: !0,
        name: "Rotation",
        type: PZ.property.type.NUMBER,
        value: 0,
        step: .5,
        scaleFactor: Math.PI / 180
    },
    reflection: {
        name: "Reflection",
        type: PZ.property.type.OPTION,
        value: 0,
        changed: function() {
            this.parentObject.initReflection()
        },
        items: "off;on"
    }
}, this.properties.addAll(this.props);