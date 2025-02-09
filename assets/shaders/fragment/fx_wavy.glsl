uniform sampler2D tDiffuse;
uniform vec2 uvScale;
uniform float amount;
uniform float time;
uniform float size;

#ifdef ANGLE
uniform float angle;
#endif

varying vec2 vUv;

#define PI 3.1415927

void main()
{
  vec2 uv = vUv;

#ifdef ANGLE
  float theta = dot(uv - vec2(0.5), vec2(cos(angle), sin(angle)));
  vec2 wave = vec2(cos(angle + PI * 0.5), sin(angle + PI * 0.5));
#else
  float theta = uv.x - 0.5;
  vec2 wave = vec2(0.0, 1.0);
#endif

  uv += wave * sin(theta * size + time * 0.5) * amount * 0.01 * sin(uv * PI);
  uv = min(uv, vec2(1.0, 1.0));

  vec4 texColor = texture2D(tDiffuse, uv * uvScale);

  gl_FragColor = texColor;
}
