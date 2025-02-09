uniform sampler2D tDiffuse;
uniform float threshold;
uniform float soften;

varying vec2 vUvScaled;

float rgbToLuminosity(vec3 rgb)
{
  vec3 luma = vec3(0.299, 0.587, 0.114);
  return dot(rgb, luma);
}

float lumaKey(vec3 color)
{
  float luminosity = rgbToLuminosity(color);
  return smoothstep(threshold - soften, threshold + soften, luminosity);
}

void main()
{
  vec4 color = texture2D(tDiffuse, vUvScaled);

  color.rgb /= color.a;

  float key = lumaKey(color.rgb);

  #ifdef KEY_INVERT
    key = 1.0 - key;
  #endif

#ifdef KEY_MASK
  gl_FragColor = vec4(vec3(key), 1.0);
#else
  color.a *= key;
  color.rgb *= color.a;

  gl_FragColor = color;
#endif
}
