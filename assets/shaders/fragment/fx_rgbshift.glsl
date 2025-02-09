uniform sampler2D tDiffuse;
uniform vec2 uvScale;
uniform float amount;
uniform float angle;

#ifdef HAS_PIXELSIZE
  uniform vec2 pixelSize;
#endif

varying vec2 vUv;

float limit(vec2 uv)
{
  vec2 s = step(vec2(0.0), uv) - step(vec2(1.0), uv);
  return s.x * s.y;
}

void main()
{
#ifdef HAS_PIXELSIZE
  vec2 offset = amount * vec2( cos(angle), sin(angle)) * pixelSize;
#else
  vec2 offset = amount * vec2( cos(angle), sin(angle));
#endif

  vec2 rOffset = vUv + offset;
  vec4 cr = texture2D(tDiffuse, rOffset * uvScale) * limit(rOffset);

  vec4 cga = texture2D(tDiffuse, vUv * uvScale);

  vec2 bOffset = vUv - offset;
  vec4 cb = texture2D(tDiffuse, bOffset * uvScale) * limit(bOffset);

  gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
}