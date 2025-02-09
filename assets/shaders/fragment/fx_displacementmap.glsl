uniform sampler2D tDiffuse;
uniform sampler2D tDisplacement;
uniform vec3 uDisplacement;
uniform vec3 vDisplacement;
uniform float amount;
uniform vec2 uvScale;
uniform vec2 offset;

varying vec2 vUvScaled;
varying vec2 bgCoord;

void main()
{
  vec3 map = texture2D(tDisplacement, vUvScaled).rgb;
  vec2 displacement = amount * vec2(dot(map, uDisplacement), dot(map, vDisplacement));

  vec2 uv = bgCoord - displacement;

#ifdef HAS_OFFSET
  uv -= offset;
#endif

#if REPEAT_MODE==0 //clamp
  uv = min(uv, uvScale);
#elif REPEAT_MODE==1 //tile
  uv = mod(uv, uvScale);
#elif REPEAT_MODE==2 //reflect
  uv = abs(mod(uv + uvScale, uvScale * 2.0) - uvScale);
#endif

  gl_FragColor = vec4(texture2D(tDiffuse, uv));
}
