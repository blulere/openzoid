uniform sampler2D tDiffuse;
uniform vec2 size;
uniform vec2 uvScale;
uniform vec2 resolution;

varying vec2 vUv;

void main()
{
  float dx = size.x*(1./resolution.x);
  float dy = size.y*(1./resolution.y);
  vec2 coord = vec2(dx * floor(vUv.x / dx + 0.5),
                    dy * floor(vUv.y / dy + 0.5));

  gl_FragColor = texture2D(tDiffuse, coord * uvScale);
}
