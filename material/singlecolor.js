this.defaultName="Single Color",
this.load=function(e) {
    this.threeObj=new THREE.MeshBasicMaterial( {
        color: 16777215, side:2
    }
    ),
    this.threeObj.premultipliedAlpha= true,
    this.properties.load(e&&e.properties)
}

,
this.unload=function() {
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
    let t=this.properties.color.get(e);
    this.threeObj.color.setRGB(t[0], t[1], t[2])
}

,
this.props= {
    color: {
        dynamic: true,
        group: true,
        objects:[ {
            dynamic:  true, name:"Color.R", type:PZ.property.type.NUMBER, value:1, min:0, max:1
        }
        ,
            {
            dynamic:  true, name:"Color.G", type:PZ.property.type.NUMBER, value:1, min:0, max:1
        }
        ,
            {
            dynamic:  true, name:"Color.B", type:PZ.property.type.NUMBER, value:1, min:0, max:1
        }
        ],
        name:"Color",
        type:PZ.property.type.COLOR
    }
}

,
this.properties.addAll(this.props);