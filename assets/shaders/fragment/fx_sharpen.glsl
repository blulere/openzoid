uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform vec2 uvScale;
uniform float delta;

varying vec2 vUvScaled;

void main()
{
  vec2 d = vec2(1.0) / resolution * delta * uvScale;

  vec4 sum = vec4(0.0);

  sum += -1.0 * texture2D(tDiffuse, vUvScaled + vec2(-d.x, 0.0));
  sum += -1.0 * texture2D(tDiffuse, vUvScaled + vec2(0.0, -d.y));
  sum +=  5.0 * texture2D(tDiffuse, vUvScaled);
  sum += -1.0 * texture2D(tDiffuse, vec2(vUvScaled.x, min(uvScale.y * 0.99, vUvScaled.y + d.y)));
  sum += -1.0 * texture2D(tDiffuse, vec2(min(uvScale.x * 0.99, vUvScaled.x + d.x), vUvScaled.y));

  gl_FragColor = sum;
}
