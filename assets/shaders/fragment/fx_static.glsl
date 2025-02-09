uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float size;
uniform float time;
uniform float amount;

varying vec2 vUv;
varying vec2 vUvScaled;

float hash(in float n)
{
  return fract(sin(n)*43759.5453);
}

void main()
{
  vec2 coord = floor(resolution * vUv / size);

  float c = 2.125 + (time + 1.0) * 0.001;
  vec2 r = c * sin(c * (1.0 + coord.xy));
  float n = fract(r.x * r.y * (1000.0 + coord.x));

  vec4 col = texture2D(tDiffuse, vUvScaled);

  vec4 noise = vec4(vec3(n), 1.0);

#if NOISE_BLEND==1 //add
  noise = col + noise;
#elif NOISE_BLEND==2 //subtract
  noise = col - noise;
#elif NOISE_BLEND==3 //multiply
  noise = col * noise;
#endif

  gl_FragColor = mix(col, noise, amount);
}
