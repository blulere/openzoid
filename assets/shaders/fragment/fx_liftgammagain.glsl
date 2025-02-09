
uniform sampler2D tDiffuse;
uniform vec3 shadows;
uniform vec3 midtones;
uniform vec3 highlights;

varying vec2 vUvScaled;

void main()
{

  vec4 col = texture2D(tDiffuse, vUvScaled);

  //http://filmicworlds.com/blog/minimal-color-grading-tools/

  //convert shadows,midtones,highlights to lift,gamma,gain
  //can be precomputed for perf (but not animated...)

  vec3 lift = shadows;
  float avgLift = (lift.x + lift.y + lift.z) / 3.0;
  lift = lift - avgLift;

  vec3 invGamma = midtones;
  float avgGamma = (invGamma.x + invGamma.y + invGamma.z) / 3.0;
  invGamma = invGamma - avgGamma;

  vec3 gain = highlights;
  float avgGain = (gain.x + gain.y + gain.z) / 3.0;
  gain = gain - avgGain;

  const float shadowOffset = 0.0;
  const float highlightOffset = 0.0;
  lift = 0.0 + (lift + shadowOffset);
  gain = 1.0 + (gain + highlightOffset);

  const float midtoneOffset = 0.0;
  vec3 midGrey = 0.5 + (invGamma + midtoneOffset);
  vec3 H = gain;
  vec3 S = lift;

  invGamma = log(midGrey) / log( (0.5 - lift) / (gain - lift) );

  //lift gamma gain

  vec3 v = clamp(pow(col.rgb, invGamma), 0.0, 1.0);
  gl_FragColor = vec4(mix(lift, gain, v), col.a);
}
