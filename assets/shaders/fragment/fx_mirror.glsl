uniform sampler2D tDiffuse;
uniform vec2 uvScale;

uniform float left;
uniform float right;
uniform float bottom;
uniform float top;

varying vec2 vUv;

void main()
{
  vec2 uv = vUv;

  //left
  uv.x -= step(0.5, uv.x) * (uv.x - 0.5) * left;

  //right
  uv.x += step(uv.x, 0.5) * (0.5 - uv.x) * right;

  //bottom
  uv.y += step(0.5, uv.y) * (0.5 - uv.y) * bottom;

  //top
  uv.y -= step(uv.y, 0.5) * (uv.y - 0.5) * top;

  // Quad Mirror
  //right + bottom

  gl_FragColor = texture2D(tDiffuse, uv * uvScale);
}
