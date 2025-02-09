this.defaultName="Displacement Map",this.shaderfile="fx_displacementmap",this.texture=null,this.shaderUrl="/assets/shaders/fragment/"+this.shaderfile+".glsl",this.vertShader=this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER,"/assets/shaders/vertex/overlay.glsl"),this.fragShader=this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER,this.shaderUrl),this.propertyDefinitions={enabled:{dynamic:!0,name:"Enabled",type:PZ.property.type.OPTION,value:1,items:"off;on"},texture:{name:"Displacement map",type:PZ.property.type.ASSET,assetType:PZ.asset.type.IMAGE,value:null,accept:"image/*",changed:function(){let e=this.parentObject;if(e.texture&&(e.parentProject.assets.unload(e.texture),e.texture=null,e.pass.uniforms.tDisplacement.value.dispose(),e.pass.uniforms.tDisplacement.value=null),this.value){e.texture=new PZ.asset.image(e.parentProject.assets.load(this.value));let t=e.texture.getTexture(!0);t.minFilter=t.magFilter=THREE.LinearFilter,t.wrapS=t.wrapT=THREE.RepeatWrapping,t.generateMipmaps=!1,e.pass.uniforms.tDisplacement.value=t}e.pass.material.needsUpdate=!0}},displacementOffset:{dynamic:!0,group:!0,objects:[{dynamic:!0,name:"Displacement offset.X",type:PZ.property.type.NUMBER,value:0,step:.01,decimals:3},{dynamic:!0,name:"Displacement offset.Y",type:PZ.property.type.NUMBER,value:0,step:.01,decimals:3}],name:"Displacement offset",type:PZ.property.type.VECTOR2,step:.01,decimals:3},uDisplacement:{dynamic:!0,group:!0,objects:[{dynamic:!0,name:"X displacement.R",type:PZ.property.type.NUMBER,value:1,min:-1,max:1,decimals:3},{dynamic:!0,name:"X displacement.G",type:PZ.property.type.NUMBER,value:0,min:-1,max:1,decimals:3},{dynamic:!0,name:"X displacement.B",type:PZ.property.type.NUMBER,value:0,min:-1,max:1,decimals:3}],name:"X displacement",type:PZ.property.type.VECTOR3},vDisplacement:{dynamic:!0,group:!0,objects:[{dynamic:!0,name:"Y displacement.R",type:PZ.property.type.NUMBER,value:1,min:-1,max:1,decimals:3},{dynamic:!0,name:"Y displacement.G",type:PZ.property.type.NUMBER,value:0,min:-1,max:1,decimals:3},{dynamic:!0,name:"Y displacement.B",type:PZ.property.type.NUMBER,value:0,min:-1,max:1,decimals:3}],name:"Y displacement",type:PZ.property.type.VECTOR3},amount:{dynamic:!0,name:"Amount",type:PZ.property.type.NUMBER,value:.1,step:.01,decimals:3},offset:{dynamic:!0,group:!0,objects:[{dynamic:!0,name:"Offset.X",type:PZ.property.type.NUMBER,value:0,step:.05,decimals:3},{dynamic:!0,name:"Offset.Y",type:PZ.property.type.NUMBER,value:0,step:.05,decimals:3}],name:"Offset",type:PZ.property.type.VECTOR2},scale:{dynamic:!0,group:!0,objects:[{dynamic:!0,name:"Scale.X",type:PZ.property.type.NUMBER,value:1,min:.01,step:.05,decimals:3},{dynamic:!0,name:"Scale.Y",type:PZ.property.type.NUMBER,value:1,min:.01,step:.05,decimals:3}],name:"Scale",type:PZ.property.type.VECTOR2,linkRatio:!0},rotation:{dynamic:!0,name:"Rotation",type:PZ.property.type.NUMBER,scaleFactor:Math.PI/180,value:0,step:3,decimals:1},wrap:{name:"Wrap",items:["clamp","tile","reflect"],value:2,type:PZ.property.type.OPTION,changed:function(){let e=this.parentObject;e.pass.material.defines.REPEAT_MODE=this.value,e.pass.material.needsUpdate=!0,e.resize()}}},this.properties.addAll(this.propertyDefinitions,this),this.load=async function(e){this.vertShader=new PZ.asset.shader(this.parentProject.assets.load(this.vertShader)),this.fragShader=new PZ.asset.shader(this.parentProject.assets.load(this.fragShader));var t=new THREE.ShaderMaterial({uniforms:{tDiffuse:{type:"t",value:null},tDisplacement:{type:"t",value:null},amount:{type:"f",value:1},offset:{type:"v2",value:new THREE.Vector2},uDisplacement:{type:"v2",value:new THREE.Vector3},vDisplacement:{type:"v2",value:new THREE.Vector3},uvScale:{type:"v2",value:new THREE.Vector2(1,1)},uvTransform:{type:"m3",value:new THREE.Matrix3}},vertexShader:await this.vertShader.getShader(),fragmentShader:await this.fragShader.getShader(),premultipliedAlpha:!0,defines:{HAS_OFFSET:!0}});this.pass=new THREE.ShaderPass(t),this.pass.material.defines.REPEAT_MODE=2,this.properties.load(e&&e.properties)},this.toJSON=function(){return{type:this.type,properties:this.properties}},this.unload=function(){this.texture&&(this.parentProject.assets.unload(this.texture),this.pass.uniforms.tDiffuse.value.dispose()),this.parentProject.assets.unload(this.vertShader),this.parentProject.assets.unload(this.fragShader)},this.update=function(e){if(!this.pass)return;let t=this.properties.offset.get(e),a=this.properties.scale.get(e),s=this.properties.rotation.get(e),p=this.aspect*a[0],i=a[1];a[0]=1/a[0],a[1]=1/a[1];let r,n=Math.cos(s),l=Math.sin(s);this.pass.uniforms.uvTransform.value.set(a[0]*n,a[1]*l*i/p,-a[0]*n*.5-a[1]*l*i/p*.5-t[0]*n/p-t[1]*l/p+.5,-a[0]*l*p/i,a[1]*n,a[0]*l*p/i*.5-a[1]*n*.5+t[0]*l/i-t[1]*n/i+.5,0,0,1),r=this.properties.uDisplacement.get(e),this.pass.uniforms.uDisplacement.value.set(r[0],r[1],r[2]),r=this.properties.vDisplacement.get(e),this.pass.uniforms.vDisplacement.value.set(r[0],r[1],r[2]),r=this.properties.displacementOffset.get(e),this.pass.uniforms.offset.value.set(r[0],r[1]),this.pass.uniforms.amount.value=this.properties.amount.get(e),this.pass.enabled=this.properties.enabled.get(e)},this.prepare=async function(e){this.texture&&await this.texture.loading},this.resize=function(){let e=this.parentLayer.properties.resolution.get();this.aspect=e[0]/e[1]};