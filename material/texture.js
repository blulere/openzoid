this.defaultName="Image";
const WRAP_VALUES=[THREE.ClampToEdgeWrapping,
THREE.RepeatWrapping,
THREE.MirroredRepeatWrapping];
this.load=function(e) {
    this.threeObj=new THREE.MeshBasicMaterial( {
        color: 16777215
    }
    ),
    this.texture=null,
    this.properties.load(e&&e.properties)
}

,
this.unload=function() {
    this.texture&&(this.parentProject.assets.unload(this.texture), this.threeObj.map.dispose()),
    this.threeObj.dispose()
}

,
this.toJSON=function() {
    return {
        type: this.type, properties:this.properties
    }
}

,
this.update=function(e) {
    this.threeObj.map&&(v=this.properties.repeat.get(e), this.threeObj.map.repeat.set(v[0], v[1]), v=this.properties.offset.get(e), this.threeObj.map.offset.set(v[0], v[1]), v=this.properties.center.get(e), this.threeObj.map.center.set(v[0], v[1]), this.threeObj.map.rotation=this.properties.rotation.get(e))
}

,
this.prepare=async function(e) {
    this.texture&&await this.texture.loading
}

,
this.props= {
    texture: {
        name:"Image",
        type:PZ.property.type.ASSET,
        assetType:PZ.asset.type.IMAGE,
        accept:"image/*",
        value:null,
        changed:function() {
            let e=this.parentObject;
            if(e.texture&&(e.parentProject.assets.unload(e.texture), e.texture=null, e.threeObj.map.dispose(), e.threeObj.map=null), this.value) {
                e.texture=new PZ.asset.image(e.parentProject.assets.load(this.value));
                let t=e.texture.getTexture( !0),
                p=e.properties.wrap.get()||1;
                t.wrapS=WRAP_VALUES[p],
                t.wrapT=WRAP_VALUES[p],
                e.threeObj.map=t
            }
            e.threeObj.needsUpdate= !0
        }
    }
    ,
    wrap: {
        name:"Wrap",
        type:PZ.property.type.OPTION,
        value:1,
        changed:function() {
            let e=this.parentObject;
            e.threeObj.map&&(e.threeObj.map.wrapS=WRAP_VALUES[this.value], e.threeObj.map.wrapT=WRAP_VALUES[this.value], e.threeObj.map.needsUpdate= !0)
        }
        ,
        items:"none;tile;reflect"
    }
    ,
    repeat: {
        dynamic: !0,
        group: !0,
        objects:[ {
            dynamic:  !0, name:"Repeat.U", type:PZ.property.type.NUMBER, step:.1, decimals:3, value:1
        }
        ,
            {
            dynamic:  !0, name:"Repeat.V", type:PZ.property.type.NUMBER, step:.1, decimals:3, value:1
        }
        ],
        name:"Repeat",
        type:PZ.property.type.VECTOR2,
        step:.1,
        decimals:3,
        linkRatio: !0
    }
    ,
    offset: {
        dynamic: !0,
        group: !0,
        objects:[ {
            dynamic:  !0, name:"Offset.U", type:PZ.property.type.NUMBER, step:.1, decimals:3, value:0
        }
        ,
            {
            dynamic:  !0, name:"Offset.V", type:PZ.property.type.NUMBER, step:.1, decimals:3, value:0
        }
        ],
        name:"Offset",
        step:.1,
        decimals:3,
        type:PZ.property.type.VECTOR2
    }
    ,
    center: {
        dynamic: !0,
        group: !0,
        objects:[ {
            dynamic:  !0, name:"Center.U", type:PZ.property.type.NUMBER, step:.1, decimals:3, value:0
        }
        ,
            {
            dynamic:  !0, name:"Center.V", type:PZ.property.type.NUMBER, step:.1, decimals:3, value:0
        }
        ],
        name:"Center",
        step:.1,
        decimals:3,
        type:PZ.property.type.VECTOR2
    }
    ,
    rotation: {
        dynamic:  !0, name:"Rotation", type:PZ.property.type.NUMBER, value:0, step:.5, scaleFactor:Math.PI/180
    }
    ,
    side: {
        name:"Render side",
        type:PZ.property.type.OPTION,
        value:0,
        changed:function() {
            this.parentObject.threeObj.side=this.value
        }
        ,
        items:"front;back;both"
    }
}

,
this.properties.addAll(this.props);