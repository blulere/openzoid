uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform vec2 uvScale;
uniform float angle;
//uniform float radius;
//uniform vec2 center;

varying vec2 vUv;

void main()
{
  float radius = resolution.x*0.5;
  vec2 center = resolution*0.5;

  vec2 tc = vUv * resolution;
  tc -= center;
  float dist = length(tc);

  float percent = (radius - dist) / radius;
  float theta = percent * percent * angle * 8.0;
  float s = sin(theta);
  float c = cos(theta);
  tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));

  tc += center;
  gl_FragColor = texture2D(tDiffuse, min(tc / resolution, vec2(0.99)) * uvScale);
}
