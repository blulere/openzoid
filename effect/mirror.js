this.defaultName="Mirror",this.shaderfile="fx_mirror",this.shaderUrl="/assets/shaders/fragment/"+this.shaderfile+".glsl",this.vertShader=this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER,"/assets/shaders/vertex/common.glsl"),this.fragShader=this.parentProject.assets.createFromPreset(PZ.asset.type.SHADER,this.shaderUrl),this.propertyDefinitions={enabled:{dynamic:!0,name:"Enabled",type:PZ.property.type.OPTION,value:1,items:"off;on"},mode:{dynamic:!0,name:"Mode",type:PZ.property.type.OPTION,value:0,items:"left;right;top;bottom;left + top;right + top;left + bottom;right + bottom"}},this.properties.addAll(this.propertyDefinitions,this),this.load=async function(e){this.vertShader=new PZ.asset.shader(this.parentProject.assets.load(this.vertShader)),this.fragShader=new PZ.asset.shader(this.parentProject.assets.load(this.fragShader));var t=new THREE.ShaderMaterial({uniforms:{tDiffuse:{type:"t",value:null},uvScale:{type:"v2",value:new THREE.Vector2(1,1)},left:{type:"f",value:2},right:{type:"f",value:0},top:{type:"f",value:0},bottom:{type:"f",value:0}},vertexShader:await this.vertShader.getShader(),fragmentShader:await this.fragShader.getShader()});this.pass=new THREE.ShaderPass(t),this.pass.material.premultipliedAlpha=!0,this.properties.load(e&&e.properties)},this.toJSON=function(){return{type:this.type,properties:this.properties}},this.unload=function(e){this.parentProject.assets.unload(this.vertShader),this.parentProject.assets.unload(this.fragShader)},this.update=function(e){if(this.pass){this.pass.enabled=this.properties.enabled.get(e);var t=this.properties.mode.get(e);this.pass.uniforms.left.value=0===t||4===t||6===t?2:0,this.pass.uniforms.right.value=1===t||5===t||7===t?2:0,this.pass.uniforms.top.value=2===t||4===t||5===t?2:0,this.pass.uniforms.bottom.value=3===t||6===t||7===t?2:0}};