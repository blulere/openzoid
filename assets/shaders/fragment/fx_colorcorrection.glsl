
uniform sampler2D tDiffuse;
uniform vec3 powRGB;
uniform vec3 mulRGB;
uniform vec3 addRGB;

varying vec2 vUvScaled;

void main()
{

  vec4 color = texture2D(tDiffuse, vUvScaled);

  color.rgb /= color.a;
  color.rgb = mulRGB * pow( clamp( color.rgb + addRGB, 0.0, 1.0), powRGB );
  color.rgb *= color.a;

  gl_FragColor = color;

}
