uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform vec2 uvScale;
uniform float delta;

varying vec2 vUv;

void main()
{
  const float kernel = 10.0;
  vec4 sum = vec4(0.);
  vec4 accumulation = vec4(0.);
  float total = 0.;

#if BLUR_DIR==0
  //horizontal
  float pixelSize = 1.0 / resolution.x;
  for (float i = -kernel; i <= kernel; i++)
  {
    vec2 pix = vUv + vec2(i * delta * pixelSize, 0.0);
    float use = step(0.0, pix.x) * (1.0 - step(1.0, pix.x));
    accumulation += texture2D(tDiffuse, pix * uvScale) * use;
    total += use;
  }
#else
  //vertical
  float pixelSize = 1.0 / resolution.y;
  for (float i = -kernel; i <= kernel; i++)
  {
    vec2 pix = vUv + vec2(0.0, i * delta * pixelSize);
    float use = step(0.0, pix.y) * (1.0 - step(1.0, pix.y));
    accumulation += texture2D(tDiffuse, pix * uvScale) * use;
    total += use;
  }
#endif

  sum = accumulation / total; //(kernel + kernel + 1.);

  gl_FragColor = sum;
}
