uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform vec2 uvScale;
uniform vec2 resolution;

uniform float density;
uniform float decay;
uniform float weight;
uniform vec2 center;

#ifdef DITHER
uniform float dither;
#endif

const int SAMPLES = 24;

float hash( vec2 p ){ return fract(sin(dot(p, vec2(41, 289)))*45758.5453); }

void main()
{
  vec2 uv = vUv;

  vec2 tuv = uv - 0.5 - center.xy * 0.45;
  vec2 dTuv = tuv * density / float(SAMPLES);

#ifdef DITHER
  uv += dTuv * (hash(floor(uv * resolution) + fract(0.0)) * 2.0 - 1.0) * dither;
#else
  uv += dTuv * (hash(floor(uv * resolution) + fract(0.0)) * 2.0 - 1.0);
#endif

#ifdef CONSTANT_BRIGHTNESS
  vec4 color = vec4(0.0);
#else
  vec4 color = texture2D(tDiffuse, uv * uvScale) * 0.25;
#endif

  float wt = weight;
  float sum = 0.0;
  for(int i = 0; i < SAMPLES; i++)
  {
    uv -= dTuv;
    color += texture2D(tDiffuse, uv * uvScale) * wt;
    sum += wt;
    wt *= decay;
  }

#ifdef CONSTANT_BRIGHTNESS
  color /= sum;
  gl_FragColor = color;
#else
  color *= (1.0 - dot(tuv, tuv) * 0.75);
  gl_FragColor = smoothstep(0.0, 1.0, color);
#endif
}
