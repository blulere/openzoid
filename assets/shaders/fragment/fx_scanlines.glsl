uniform sampler2D tDiffuse;
uniform vec2 resolution;

uniform vec3 color;
uniform float thickness;
uniform float offset;
uniform float feather;
uniform float angle;
uniform float opacity;

varying vec2 vUv;
varying vec2 vUvScaled;

void main()
{
  vec4 texel = texture2D(tDiffuse, vUvScaled);

  //create guide vector
  float guideLength = 0.5 * sqrt(resolution.x * resolution.x + resolution.y * resolution.y);
  vec2 guide = guideLength * vec2(cos(angle), sin(angle));

  //project current point onto the guide
  float pos;
  pos = dot(guide, (vUv - vec2(0.5, 0.5)) * resolution) / dot(guide, guide) * guideLength;

  pos = (pos + offset) / thickness;

  float alpha = smoothstep(0.5 - feather, 0.5 + feather, mod(pos, 2.0)) -
                smoothstep(1.5 - feather, 1.5 + feather, mod(pos, 2.0));

  alpha *= opacity;

  gl_FragColor = vec4(color * alpha, alpha) + texel * (1.0 - alpha);
}
