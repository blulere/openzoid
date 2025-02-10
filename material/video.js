this.defaultName="Video",
this.load=function(e) {
    this.onParentChanged.watch(this.videoParentChanged.bind(this)),
    this.threeObj=new THREE.MeshBasicMaterial( {
        color: 16777215
    }
    ),
    this.media=null,
    this.properties.load(e&&e.properties),
    this.threeObj.transparent=1===this.properties.transparent.get(),
    this.threeObj.blending=this.properties.blending.get(),
    this.threeObj.map=new THREE.Texture
}

,
this.unload=function() {
    this.media&&(this.parentProject.assets.unload(this.media), this.media=null),
    this.threeObj.dispose()
}

,
this.videoParentChanged=function(e) {
    if(e) {
        const t=e.parentLayer,
        a=t.videoMaterials.indexOf(this);
        a>=0&&t.videoMaterials.splice(a, 1)
    }
    this.parent&&this.parentLayer.videoMaterials.push(this),
    PZ.schedule.analyzeSequence(this.parentProject.sequence)
}

,
this.toJSON=function() {
    return {
        type: this.type, properties:this.properties
    }
}

,
this.props= {
    video: {
        name:"Video",
        type:PZ.property.type.ASSET,
        assetType:PZ.asset.type.AV,
        accept:"video/*",
        value:null,
        changed:function() {
            let e=this.parentObject,
            t=e.parentProject.sequence;
            e.media&&(e.parentProject.assets.unload(e.media), e.media=null),
            this.value&&(e.media=new PZ.asset.av(e.parentProject.assets.load(this.value))),
            PZ.schedule.analyzeSequence(t)
        }
    }
    ,
    startOffset: {
        name:"Start offset (frames)",
        type:PZ.property.type.NUMBER,
        value:0,
        min:0,
        step:1,
        decimals:0,
        dragstep:.1,
        changed:function() {
            let e=this.parentObject.parentProject.sequence;
            PZ.schedule.analyzeSequence(e)
        }
    }
    ,
    offset: {
        name:"Media offset (frames)",
        type:PZ.property.type.NUMBER,
        value:0,
        min:0,
        step:1,
        decimals:0,
        changed:function() {
            let e=this.parentObject.parentProject.sequence;
            PZ.schedule.analyzeSequence(e)
        }
    }
    ,
    color: {
        dynamic: !0,
        group: !0,
        objects:[ {
            dynamic:  !0, name:"Color.R", type:PZ.property.type.NUMBER, value:1, min:0, max:1
        }
        ,
            {
            dynamic:  !0, name:"Color.G", type:PZ.property.type.NUMBER, value:1, min:0, max:1
        }
        ,
            {
            dynamic:  !0, name:"Color.B", type:PZ.property.type.NUMBER, value:1, min:0, max:1
        }
        ],
        name:"Color",
        type:PZ.property.type.COLOR
    }
    ,
    transparent: {
        name:"Transparency",
        type:PZ.property.type.OPTION,
        value:0,
        changed:function() {
            this.parentObject.threeObj.transparent=1===this.value
        }
        ,
        items:"off;on"
    }
    ,
    opacity: {
        dynamic:  !0, name:"Opacity", type:PZ.property.type.NUMBER, value:1, max:1, min:0, step:.01
    }
    ,
    blending: {
        name:"Blending",
        type:PZ.property.type.OPTION,
        value:1,
        changed:function() {
            this.parentObject.threeObj.blending=this.value
        }
        ,
        items:"none;normal;additive;subtractive;multiply"
    }
}

,
this.update=function(e) {
    let t;
    t=this.properties.color.get(e),
    this.threeObj.color.setRGB(t[0], t[1], t[2]),
    this.threeObj.opacity=this.properties.opacity.get(e)
}

,
this.properties.addAll(this.props);