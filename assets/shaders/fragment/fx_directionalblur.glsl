uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform vec2 uvScale;
uniform float delta;
uniform float direction;

varying vec2 vUv;

void main()
{
  const float kernel = 10.0;
  vec4 sum = vec4(0.);
  vec4 accumulation = vec4(0.);
  float total = 0.;

  vec2 dir = vec2(cos(direction), sin(direction));
  vec2 pixelSize = 1.0 / resolution;

  for (float i = -kernel; i <= kernel; i++)
  {
    vec2 pix = vUv + dir * i * delta * pixelSize;
    float use = step(0.0, pix.x) * (1.0 - step(1.0, pix.x));
    use *= step(0.0, pix.y) * (1.0 - step(1.0, pix.y));
    accumulation += texture2D(tDiffuse, pix * uvScale);
    total += use;
  }

  sum = accumulation / total;

  gl_FragColor = sum;
}
