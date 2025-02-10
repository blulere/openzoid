this.defaultName="Mask",
this.shaderfile="fx_mask",
this.shaderUrl="/assets/shaders/fragment/"+this.shaderfile+".glsl",
this.vertShader=this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, "/assets/shaders/vertex/common.glsl"),
this.fragShader=this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER, this.shaderUrl),
this.propertyDefinitions= {
    enabled: {
        dynamic:  !0, name:"Enabled", type:PZ.property.type.OPTION, value:1, items:"off;on"
    }
    ,
    mode: {
        name:"Mode",
        type:PZ.property.type.OPTION,
        value:0,
        changed:function() {
            let e=this.parentObject;
            e.pass.mask.material.defines.MASK_MODE=this.value,
            e.pass.mask.material.needsUpdate= !0
        }
        ,
        items:"rectangle;ellipse"
    }
    ,
    position: {
        dynamic: !0,
        group: !0,
        objects:[ {
            dynamic:  !0, name:"Position.X", type:PZ.property.type.NUMBER, value:0, decimals:0, step:10
        }
        ,
            {
            dynamic:  !0, name:"Position.Y", type:PZ.property.type.NUMBER, value:0, decimals:0, step:10
        }
        ],
        name:"Position",
        type:PZ.property.type.VECTOR2
    }
    ,
    size: {
        dynamic: !0,
        group: !0,
        objects:[ {
            dynamic:  !0, name:"Size.X", type:PZ.property.type.NUMBER, min:.01, value:250, decimals:0, step:10
        }
        ,
            {
            dynamic:  !0, name:"Size.Y", type:PZ.property.type.NUMBER, min:.01, value:250, decimals:0, step:10
        }
        ],
        name:"Size",
        type:PZ.property.type.VECTOR2,
        linkRatio: !0
    }
    ,
    rotation: {
        dynamic:  !0, name:"Rotation", type:PZ.property.type.NUMBER, value:0, step:.1
    }
    ,
    invert: {
        name: "Invert", type:PZ.property.type.OPTION, value:0, items:"off;on", changed:function() {
            let e=this.parentObject;
            this.value?e.pass.material.blendSrc=THREE.OneMinusDstColorFactor: e.pass.material.blendSrc=THREE.DstColorFactor
        }
    }
    ,
    feather: {
        dynamic:  !0, name:"Feather", type:PZ.property.type.NUMBER, value:.1, min:0, max:1, step:.1
    }
    ,
    opacity: {
        dynamic:  !0, name:"Opacity", type:PZ.property.type.NUMBER, value:1, max:1, min:0, step:.1
    }
}

,
this.properties.addAll(this.propertyDefinitions, this),
this.load=async function(e) {
    this.vertShader=new PZ.asset.shader(this.parentProject.assets.load(this.vertShader)),
    this.fragShader=new PZ.asset.shader(this.parentProject.assets.load(this.fragShader));
    let t=new THREE.ShaderMaterial( {
        uniforms: {
            tDiffuse: {
                type: "t", value:null
            }
            , uvScale: {
                type: "v2", value:new THREE.Vector2(1, 1)
            }
            , resolution: {
                type: "v2", value:new THREE.Vector2(1, 1)
            }
            , feather: {
                type: "f", value:0
            }
            , opacity: {
                type: "f", value:1
            }
        }
        , vertexShader:await this.vertShader.getShader(), fragmentShader:await this.fragShader.getShader()
    }
    );
    t.premultipliedAlpha= !0,
    this.pass=new THREE.ShaderPass(new THREE.ShaderMaterial( {
        uniforms: THREE.UniformsUtils.clone(THREE.CopyShader.uniforms), fragmentShader:THREE.CopyShader.fragmentShader, vertexShader:THREE.CopyShader.vertexShader
    }
    )),
    this.pass.camera.matrixAutoUpdate= !1,
    this.pass.quad.matrixAutoUpdate= !1,
    this.pass.material.premultipliedAlpha= !0,
    this.pass.material.transparent= !0,
    this.pass.material.blending=THREE.CustomBlending,
    this.pass.material.blendEquation=THREE.AddEquation,
    this.pass.material.blendDst=THREE.ZeroFactor,
    this.pass.mask=new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), t),
    this.pass.mask.material.premultipliedAlpha= !0,
    this.pass.mask.material.transparent= !0,
    this.pass.scene.add(this.pass.mask),
    this.properties.load(e&&e.properties),
    this.properties.invert.get()?this.pass.material.blendSrc=THREE.OneMinusDstColorFactor:this.pass.material.blendSrc=THREE.DstColorFactor,
    this.pass.mask.material.defines= {
        MASK_MODE: this.properties.mode.get()
    }
}

,
this.toJSON=function() {
    return {
        type: this.type, properties:this.properties
    }
}

,
this.unload=function(e) {
    this.parentProject.assets.unload(this.vertShader),
    this.parentProject.assets.unload(this.fragShader)
}

,
this.update=function(e) {
    if( !this.pass)return;
    let t,
    a=this.properties.feather.get(e);
    t=this.properties.position.get(e),
    this.pass.mask.position.set(t[0], t[1], -.5),
    t=this.properties.size.get(e),
    this.pass.mask.scale.set(t[0]*(1+a), t[1]*(1+a), 1),
    t=this.properties.rotation.get(e),
    this.pass.mask.rotation.set(0, 0, t);
    let s=this.parentLayer;
    s.composite.group.updateMatrix(),
    this.pass.quad.matrix.copy(s.composite.group.matrix),
    this.pass.camera.matrix.copy(s.composite.group.matrix),
    this.pass.mask.material.uniforms.feather.value=a,
    this.pass.mask.material.uniforms.opacity.value=this.properties.opacity.get(e),
    this.pass.enabled=this.properties.enabled.get(e)
}

,
this.resize=function() {
    let e=this.parentLayer.properties.resolution.get(),
    t=this.pass.quad.geometry.attributes.position;
    t.array[3]=t.array[9]=.5*e[0],
    t.array[0]=t.array[6]=-.5*e[0],
    t.array[1]=t.array[4]=.5*e[1],
    t.array[7]=t.array[10]=-.5*e[1],
    t.needsUpdate= !0,
    this.pass.camera.left=-.5*e[0],
    this.pass.camera.right=.5*e[0],
    this.pass.camera.top=.5*e[1],
    this.pass.camera.bottom=-.5*e[1],
    this.pass.camera.updateProjectionMatrix()
}

;