this.defaultName="Sharpen",this.shaderfile="fx_sharpen",this.shaderUrl="/assets/shaders/fragment/"+this.shaderfile+".glsl",this.vertShader=this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER,"/assets/shaders/vertex/common.glsl"),this.fragShader=this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER,this.shaderUrl),this.propertyDefinitions={enabled:{dynamic:!0,name:"Enabled",type:PZ.property.type.OPTION,value:1,items:"off;on"},delta:{dynamic:!0,name:"Delta",type:PZ.property.type.NUMBER,value:1,min:0,max:10}},this.properties.addAll(this.propertyDefinitions,this),this.load=async function(e){this.vertShader=new PZ.asset.shader(this.parentProject.assets.load(this.vertShader)),this.fragShader=new PZ.asset.shader(this.parentProject.assets.load(this.fragShader));var t=new THREE.ShaderMaterial({uniforms:{tDiffuse:{type:"t",value:null},uvScale:{type:"v2",value:new THREE.Vector2(1,1)},resolution:{type:"v2",value:new THREE.Vector2(1,1)},delta:{type:"f",value:1}},vertexShader:await this.vertShader.getShader(),fragmentShader:await this.fragShader.getShader()});this.pass=new THREE.ShaderPass(t),this.properties.load(e&&e.properties)},this.toJSON=function(){return{type:this.type,properties:this.properties}},this.unload=function(e){this.parentProject.assets.unload(this.vertShader),this.parentProject.assets.unload(this.fragShader)},this.update=function(e){if(!this.pass)return;this.pass.enabled=this.properties.enabled.get(e);let t=this.properties.delta.get(e);this.pass.uniforms.delta.value=t},this.resize=function(){let e=this.parentLayer.properties.resolution.get();this.pass.uniforms.resolution.value.set(e[0],e[1])};