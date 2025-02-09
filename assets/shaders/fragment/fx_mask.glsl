uniform sampler2D tDiffuse;
uniform float feather;
uniform float opacity;

varying vec2 vUv;

void main()
{

  float mask;

#if MASK_MODE==0 //rectangle

  mask = 1.0;
  mask *= 1.0 - smoothstep(1.0 - feather, 1.0 - feather * 0.5, abs(vUv.x - 0.5) * 2.0);
  mask *= 1.0 - smoothstep(1.0 - feather, 1.0 - feather * 0.5, abs(vUv.y - 0.5) * 2.0);

#else //ellipse

  float radius = length(vUv - vec2(0.5)) * 2.0;
  mask = 1.0 - smoothstep(1.0 - feather, 1.0 - feather * 0.5, radius);

#endif

  gl_FragColor = vec4(mask * opacity);
}
