uniform sampler2D tDiffuse;
uniform float gamma;
uniform float regions;

varying vec2 vUvScaled;

void main()
{
  vec4 col = texture2D(tDiffuse, vUvScaled);

  vec3 c = col.rgb;
  c = pow(c, vec3(gamma, gamma, gamma));
  c = floor(c * regions) / regions;
  c = pow(c, vec3(1.0 / gamma));

  gl_FragColor = vec4(c, col.a);
}
