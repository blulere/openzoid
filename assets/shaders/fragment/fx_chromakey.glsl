uniform sampler2D tDiffuse;
uniform vec3 backgroundColor;
uniform vec3 weights;
uniform float soften;

varying vec2 vUvScaled;

vec3 rgbToHsv(vec3 rgb)
{
  float Cmax = max(rgb.r, max(rgb.g, rgb.b));
  float Cmin = min(rgb.r, min(rgb.g, rgb.b));
  float delta = Cmax - Cmin;

  vec3 hsv = vec3(0., 0., Cmax);

  if (Cmax > Cmin)
  {
    hsv.y = delta / Cmax;

    if (rgb.r == Cmax)
    {
      hsv.x = (rgb.g - rgb.b) / delta;
    }
    else
    {
      if (rgb.g == Cmax)
        hsv.x = 2. + (rgb.b - rgb.r) / delta;
      else
        hsv.x = 4. + (rgb.r - rgb.g) / delta;
    }
    hsv.x = fract(hsv.x / 6.);
  }
  return hsv;
}

float chromaKey(vec3 color)
{
  vec3 hsv = rgbToHsv(color);
  vec3 target = rgbToHsv(backgroundColor);
  float dist = length(weights * (target - hsv));

  return smoothstep(0.0, soften, dist);
}

void main()
{
  vec4 color = texture2D(tDiffuse, vUvScaled);

  color.rgb /= color.a;

  float key = chromaKey(color.rgb);

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
