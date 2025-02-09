this.defaultName="Swirl",this.shaderfile="fx_swirl",this.shaderUrl="/assets/shaders/fragment/"+this.shaderfile+".glsl",this.vertShader=this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER,"/assets/shaders/vertex/common.glsl"),this.fragShader=this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER,this.shaderUrl),this.propertyDefinitions={enabled:{dynamic:!0,name:"Enabled",type:PZ.property.type.OPTION,value:1,items:"off;on"},angle:{dynamic:!0,name:"Angle",type:PZ.property.type.NUMBER,value:.2,max:100,min:-100,step:.01,decimals:3}},this.properties.addAll(this.propertyDefinitions,this),this.load=async function(e){this.vertShader=new PZ.asset.shader(this.parentProject.assets.load(this.vertShader)),this.fragShader=new PZ.asset.shader(this.parentProject.assets.load(this.fragShader));var t=new THREE.ShaderMaterial({uniforms:{tDiffuse:{type:"t",value:null},resolution:{type:"v2",value:new THREE.Vector2(1,1)},uvScale:{type:"v2",value:new THREE.Vector2(1,1)},angle:{type:"f",value:0}},vertexShader:await this.vertShader.getShader(),fragmentShader:await this.fragShader.getShader()});this.pass=new THREE.ShaderPass(t),this.pass.material.premultipliedAlpha=!0,this.properties.load(e&&e.properties)},this.toJSON=function(){return{type:this.type,properties:this.properties}},this.unload=function(e){this.parentProject.assets.unload(this.vertShader),this.parentProject.assets.unload(this.fragShader)},this.update=function(e){this.pass&&(this.pass.uniforms.angle.value=this.properties.angle.get(e),this.pass.enabled=this.properties.enabled.get(e)&&0!==this.pass.uniforms.angle.value)},this.resize=function(){let e=this.parentLayer.properties.resolution.get();this.pass.uniforms.resolution.value.set(e[0],e[1])};