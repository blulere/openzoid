this.defaultName = "Anamorphic Lens Flare";
this.propertyDefinitions = {
    enabled: {
        dynamic: true,
        name: "Enabled",
        type: PZ.property.type.OPTION,
        value: 1,
        items: "off;on"
    },
    amount: {
        dynamic: true,
        name: "Amount",
        type: PZ.property.type.NUMBER,
        value: 1,
        max: 1,
        min: 0,
        step: 0.01,
        decimals: 2
    },
    inner: {
        dynamic: true,
        group: true,
        objects: [{
            dynamic: true,
            name: "Inner glow.R",
            type: PZ.property.type.NUMBER,
            value: 1,
            min: 0,
            max: 1
        }, {
            dynamic: true,
            name: "Inner glow.G",
            type: PZ.property.type.NUMBER,
            value: 0,
            min: 0,
            max: 1
        }, {
            dynamic: true,
            name: "Inner glow.B",
            type: PZ.property.type.NUMBER,
            value: 0,
            min: 0,
            max: 1
        }],
        name: "Inner glow",
        type: PZ.property.type.COLOR
    },
    outer: {
        dynamic: true,
        group: true,
        objects: [{
            dynamic: true,
            name: "Outer glow.R",
            type: PZ.property.type.NUMBER,
            value: 1,
            min: 0,
            max: 1
        }, {
            dynamic: true,
            name: "Outer glow.G",
            type: PZ.property.type.NUMBER,
            value: 0,
            min: 0,
            max: 1
        }, {
            dynamic: true,
            name: "Outer glow.B",
            type: PZ.property.type.NUMBER,
            value: 0,
            min: 0,
            max: 1
        }],
        name: "Outer glow",
        type: PZ.property.type.COLOR
    },
    strength: {
        dynamic: true,
        name: "Strength",
        type: PZ.property.type.NUMBER,
        value: .75,
        max: 3,
        min: 0,
        step: 0.01,
        decimals: 2
    },
    radius: {
        dynamic: true,
        name: "Radius",
        type: PZ.property.type.NUMBER,
        value: .8,
        max: 1,
        min: 0,
        step: 0.01,
        decimals: 2
    },
    threshold: {
        dynamic: true,
        name: "Threshold",
        type: PZ.property.type.NUMBER,
        value: .4,
        max: 1,
        min: 0,
        step: 0.01,
        decimals: 2
    }
};
this.properties.addAll(this.propertyDefinitions, this);

THREE.LuminosityHighPassShader || (THREE.LuminosityHighPassShader = {
    shaderID: "luminosityHighPass",
    uniforms: {
        uvScale: {
            type: "v2",
            value: new THREE.Vector2(1, 1)
        },
        tDiffuse: {
            type: "t",
            value: null
        },
        luminosityThreshold: {
            type: "f",
            value: 1
        },
        smoothWidth: {
            type: "f",
            value: 1
        },
        defaultColor: {
            type: "c",
            value: new THREE.Color(0)
        },
        defaultOpacity: {
            type: "f",
            value: 0
        }
    },
    vertexShader: [
        "uniform vec2 uvScale;",
        "varying vec2 vUv;",
        "varying vec2 vUvScaled;",
        "void main() {",
            "vUv = uv / uvScale;",
            "vUvScaled = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n"),
    fragmentShader: [
        "uniform sampler2D tDiffuse;",
        "uniform vec3 defaultColor;",
        "uniform float defaultOpacity;",
        "uniform float luminosityThreshold;",
        "uniform float smoothWidth;",
        "varying vec2 vUvScaled;",
        "void main() {",
            "vec4 texel = texture2D( tDiffuse, vUvScaled );",
            "vec3 luma = vec3( 0.299, 0.587, 0.114 );",
            "float v = dot( texel.xyz, luma );",
            "vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );",
            "float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );",
            "gl_FragColor = mix( outputColor, texel, alpha );",
        "}"
    ].join("\n")
}),
// don't overwrite already existing THREE.ALFPass
THREE.ALFPass || (THREE.ALFPass = function(t, e, r, i) {
    THREE.Pass.call(this);
    this.strength = undefined !== e ? e : 1;
    this.radius = r;
    this.threshold = i;
    this.resolution = undefined !== t ? new THREE.Vector2(t.x, t.y) : new THREE.Vector2(256, 256),
    this.uniforms = {
        uvScale: {
            type: "v2",
            value: new THREE.Vector2(1, 1)
        }
    };
    var o = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
    };
    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;
    var a = Math.round(this.resolution.x / 2);
    var s = this.resolution.y;
    this.renderTargetBright = new THREE.WebGLRenderTarget(a, s, o);
    this.renderTargetBright.texture.generateMipmaps = false;

    for (var l = 0; l < this.nMips; l++) {
        var n;
        n = new THREE.WebGLRenderTarget(a, s, o);
        n.texture.generateMipmaps = false;
        this.renderTargetsHorizontal.push(n);
        
        n = new THREE.WebGLRenderTarget(a, s, o);
        n.texture.generateMipmaps = false;
        this.renderTargetsVertical.push(n);
        a = Math.round(a / 2);
    }

    if(THREE.LuminosityHighPassShader === undefined) {
        console.error("THREE.ALFPass relies on THREE.LuminosityHighPassShader");
    }

    var u = THREE.LuminosityHighPassShader;
    this.highPassUniforms = THREE.UniformsUtils.clone(u.uniforms);
    this.highPassUniforms.luminosityThreshold.value = i;
    this.highPassUniforms.smoothWidth.value = 0.01;
    this.highPassUniforms.uvScale.value.copy(this.uniforms.uvScale.value);
    this.materialHighPassFilter = new THREE.ShaderMaterial({
        uniforms: this.highPassUniforms,
        vertexShader: u.vertexShader,
        fragmentShader: u.fragmentShader,
        defines: {}
    });
    this.separableBlurMaterials = [];

    var h = [3, 5, 7, 9, 11];
    for(a = Math.round(this.resolution.x / 2), s = this.resolution.y, l = 0; l < this.nMips; l++) {
        this.separableBlurMaterials.push(this.getSeperableBlurMaterial(h[l]));
        this.separableBlurMaterials[l].premultipliedAlpha = true;
        this.separableBlurMaterials[l].uniforms.texSize.value = new THREE.Vector2(a, s);
        a = Math.round(a / 2);
    }

    this.compositeMaterial = this.getCompositeMaterial(this.nMips);
    this.compositeMaterial.uniforms.blurTexture1.value = this.renderTargetsVertical[0].texture;
    this.compositeMaterial.uniforms.blurTexture2.value = this.renderTargetsVertical[1].texture;
    this.compositeMaterial.uniforms.blurTexture3.value = this.renderTargetsVertical[2].texture;
    this.compositeMaterial.uniforms.blurTexture4.value = this.renderTargetsVertical[3].texture;
    this.compositeMaterial.uniforms.blurTexture5.value = this.renderTargetsVertical[4].texture;
    this.compositeMaterial.uniforms.bloomStrength.value = e;
    this.compositeMaterial.uniforms.bloomRadius.value = 0.1;
    this.compositeMaterial.premultipliedAlpha = true;
    this.compositeMaterial.needsUpdate = true;
    this.compositeMaterial.uniforms.bloomFactors.value = [1, .8, .6, .4, .2];
    this.bloomTintColors = [
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(1, 1, 1)
    ];
    this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors;

    if(THREE.CopyShader === undefined) {
        console.error("THREE.BloomPass relies on THREE.CopyShader");
    }

    var m = THREE.CopyShader;
    this.copyUniforms = THREE.UniformsUtils.clone(m.uniforms);
    this.copyUniforms.opacity.value = 1;
    this.materialCopy = new THREE.ShaderMaterial({
        uniforms: this.copyUniforms,
        vertexShader: m.vertexShader,
        fragmentShader: m.fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
        transparent: true,
        premultipliedAlpha: true
    });
    this.enabled = true;
    this.needsSwap = false;
    this.oldClearColor = new THREE.Color;
    this.oldClearAlpha = 1;
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene;
    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
    this.scene.add(this.quad);
},
THREE.ALFPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
    constructor: THREE.ALFPass,
    dispose: function() {
        for(var t = 0; t < this.renderTargetsHorizontal.length; t++) {
            this.renderTargetsHorizontal[t].dispose();
        }
        for(t = 0; t < this.renderTargetsVertical.length; t++) {
            this.renderTargetsVertical[t].dispose();
        }
        this.renderTargetBright.dispose()
    },
    setSize: function(t, e) {
        var r = Math.round(t / 2);
        var i = e;
        this.renderTargetBright.setSize(r, i);
        for(var o = 0; o < this.nMips; o++) {
            this.renderTargetsHorizontal[o].setSize(r, i);
            this.renderTargetsVertical[o].setSize(r, i);
            this.separableBlurMaterials[o].uniforms.texSize.value = new THREE.Vector2(r, i);
            r = Math.round(r / 2);
            i = Math.round(i);
        }
    },
    render: function(t, e, r, i, o) { // XXX: e, i, never used. Fix ?
        this.oldClearColor.copy(t.getClearColor());
        this.oldClearAlpha = t.getClearAlpha();
        var a = t.autoClear;
        t.autoClear = false;
        t.setClearColor(new THREE.Color(0, 0, 0), 0);
        o && t.context.disable(t.context.STENCIL_TEST);
        this.highPassUniforms.tDiffuse.value = r.texture;
        this.highPassUniforms.luminosityThreshold.value = this.threshold;
        this.quad.material = this.materialHighPassFilter;
        t.render(this.scene, this.camera, this.renderTargetBright, true);

        for(var s = this.renderTargetBright, l = 0; l < this.nMips; l++) {
            this.quad.material = this.separableBlurMaterials[l];
            this.separableBlurMaterials[l].uniforms.colorTexture.value = s.texture;
            this.separableBlurMaterials[l].uniforms.direction.value = THREE.ALFPass.BlurDirectionX;
            t.render(this.scene, this.camera, this.renderTargetsHorizontal[l], true);
            this.separableBlurMaterials[l].uniforms.colorTexture.value = this.renderTargetsHorizontal[l].texture;
            this.separableBlurMaterials[l].uniforms.direction.value = THREE.ALFPass.BlurDirectionY;
            t.render(this.scene, this.camera, this.renderTargetsVertical[l], true);
            s = this.renderTargetsVertical[l];
        }

        this.quad.material = this.compositeMaterial;
        this.compositeMaterial.uniforms.bloomStrength.value = this.strength;
        this.compositeMaterial.uniforms.bloomRadius.value = this.radius;
        this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors;
        t.render(this.scene, this.camera, this.renderTargetsHorizontal[0], true);
        this.quad.material = this.materialCopy;
        this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture;
        o && t.context.enable(t.context.STENCIL_TEST);
        t.render(this.scene, this.camera, r, false), t.setClearColor(this.oldClearColor, this.oldClearAlpha);
        t.autoClear = a;
    },
    getSeperableBlurMaterial: function(t) {
        return new THREE.ShaderMaterial({
            defines: {
                KERNEL_RADIUS: t,
                SIGMA: t
            },
            uniforms: {
                colorTexture: {
                    value: null
                },
                texSize: {
                    value: new THREE.Vector2(.5, .5)
                },
                direction: {
                    value: new THREE.Vector2(.5, .5)
                }
            },
            vertexShader:
            `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `,
            fragmentShader:
            `
            #include <common>
            varying vec2 vUv;
            uniform sampler2D colorTexture;
            uniform vec2 texSize;
            uniform vec2 direction;

            float gaussianPdf(in float x, in float sigma) {
                return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
            }

            void main() {
                vec2 invSize = 1.0 / texSize;
                float fSigma = float(SIGMA);
                float weightSum = gaussianPdf(0.0, fSigma);
                vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;
                for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
                    float x = float(i);
                    float w = gaussianPdf(x, fSigma);
                    vec2 uvOffset = direction * invSize * x;
                    vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);
                    vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);
                    diffuseSum += (sample1 + sample2) * w;
                    weightSum += 2.0 * w;
                    }
                gl_FragColor = diffuseSum/weightSum;
            }
            `
        })
    },
    getCompositeMaterial: function(t) {
        return new THREE.ShaderMaterial({
            defines: {
                NUM_MIPS: t
            },
            uniforms: {
                blurTexture1: {
                    value: null
                },
                blurTexture2: {
                    value: null
                },
                blurTexture3: {
                    value: null
                },
                blurTexture4: {
                    value: null
                },
                blurTexture5: {
                    value: null
                },
                dirtTexture: {
                    value: null
                },
                bloomStrength: {
                    value: 1
                },
                bloomFactors: {
                    value: null
                },
                bloomTintColors: {
                    value: null
                },
                bloomRadius: {
                    value: 0
                }
            },
            vertexShader:
            `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `,
            fragmentShader:
            `
            varying vec2 vUv;
            uniform sampler2D blurTexture1;
            uniform sampler2D blurTexture2;
            uniform sampler2D blurTexture3;
            uniform sampler2D blurTexture4;
            uniform sampler2D blurTexture5;
            uniform sampler2D dirtTexture;
            uniform float bloomStrength;
            uniform float bloomRadius;
            uniform float bloomFactors[NUM_MIPS];
            uniform vec3 bloomTintColors[NUM_MIPS];

            float lerpBloomFactor(const in float factor) {
                float mirrorFactor = 1.2 - factor;
                return mix(factor, mirrorFactor, bloomRadius);
            }

            void main() {
                gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
                lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
                lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
                lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
                lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
            }
            `
        })
    }
}),
THREE.ALFPass.BlurDirectionX = new THREE.Vector2(1, 0),
THREE.ALFPass.BlurDirectionY = new THREE.Vector2(0, 1)),
this.load = function(t) {
    this.pass = new THREE.ALFPass(new THREE.Vector2(1, 1), 1.5, .4, .85);
    this.properties.load(t && t.properties);
},
this.toJSON = function() {
    return {
        type: this.type,
        properties: this.properties
    };
},
this.unload = function(t) {
    this.pass.dispose();
},
this.update = function(t) {
    let e;
    this.pass.enabled = this.properties.enabled.get(t);
    this.pass.copyUniforms.opacity.value = this.properties.amount.get(t);
    this.pass.strength = this.properties.strength.get(t);
    this.pass.radius = this.properties.radius.get(t);
    this.pass.threshold = this.properties.threshold.get(t);
    e = this.properties.inner.get(t);
    this.pass.bloomTintColors[0].set(e[0], e[1], e[2]);
    this.pass.bloomTintColors[1].set(e[0], e[1], e[2]);
    this.pass.bloomTintColors[2].set(e[0], e[1], e[2]);
    e = this.properties.outer.get(t);
    this.pass.bloomTintColors[3].set(e[0], e[1], e[2]);
    this.pass.bloomTintColors[4].set(e[0], e[1], e[2]);
},
this.resize = function() {
    let resolution = this.parentLayer.properties.resolution.get();
    this.pass.setSize(resolution[0], resolution[1]);
};