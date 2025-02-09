uniform sampler2D tDiffuse;
uniform vec2 uvScale;

uniform vec2 imageScale;

varying vec2 vUv;
varying vec2 vUvScaled;

void main()
{
#if REPEAT_MODE==0
#ifdef REPEAT_SCALE
  gl_FragColor = texture2D(tDiffuse, mod((vUvScaled - vec2(0.5)) * imageScale + vec2(0.5), uvScale));
#else
  gl_FragColor = texture2D(tDiffuse, mod(vUvScaled, uvScale));
#endif
#elif REPEAT_MODE==1
#ifdef REPEAT_SCALE
  vec2 uv = mod((vUvScaled - vec2(0.5)) * imageScale + vec2(0.5) + uvScale, uvScale * 2.0) - uvScale;
  gl_FragColor = texture2D(tDiffuse, abs(uv));
#else
  vec2 uv = mod(vUvScaled + uvScale, uvScale * 2.0) - uvScale;
  //(uv + 1.0, 2.0) - 1.0
  gl_FragColor = texture2D(tDiffuse, abs(uv));
#endif
#endif
}
