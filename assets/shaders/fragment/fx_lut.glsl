uniform sampler2D tDiffuse;
uniform sampler2D tLUT;

varying vec2 vUvScaled;

#define FILTER_3D true

vec4 sampleAs3DTexture(sampler2D tex, vec3 texCoord, float size)
{
  float sliceSize = 1.0 / size;                  // space of 1 slice
  float slicePixelSize = sliceSize / size;       // space of 1 pixel
  float width = size - 1.0;
  float sliceInnerSize = slicePixelSize * width; // space of size pixels
  float zSlice0 = floor(texCoord.z * width);
  float zSlice1 = min(zSlice0 + 1.0, width);
  float xOffset = slicePixelSize * 0.5 + texCoord.x * sliceInnerSize;
  float yRange = (texCoord.y * width + 0.5) / size;
  float s0 = xOffset + (zSlice0 * sliceSize);

#ifdef FILTER_3D

  float s1 = xOffset + (zSlice1 * sliceSize);
  vec4 slice0Color = texture2D(tex, vec2(s0, yRange));
  vec4 slice1Color = texture2D(tex, vec2(s1, yRange));
  float zOffset = mod(texCoord.z * width, 1.0);
  return mix(slice0Color, slice1Color, zOffset);

#else

  return texture2D(tex, vec2( s0, yRange));

#endif
}

void main()
{
  vec4 color = texture2D(tDiffuse, vUvScaled);

  color.rgb /= color.a;

  color.rgb = clamp((color.rgb - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN), vec3(0.0), vec3(1.0));

#ifdef LUT_3D

  color.rgb = sampleAs3DTexture(tLUT, color.rbg, LUT_SIZE).rgb;

#else

  color.r = texture2D(tLUT, color.rr).r;
  color.g = texture2D(tLUT, color.gg).g;
  color.b = texture2D(tLUT, color.bb).b;

#endif

  color.rgb *= color.a;

  gl_FragColor = color;
}
