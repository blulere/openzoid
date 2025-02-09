uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform vec3 color;
uniform float covered;
uniform float opacity;
uniform float fade;
uniform float angle;

varying vec2 vUv;
varying vec2 vUvScaled;

void main() {

  vec4 texel = texture2D( tDiffuse, vUvScaled );
  float gradientpos;

#if SHUTTER_TYPE==0
    //create guide vector
    vec2 guide = 0.5 * sqrt(resolution.x * resolution.x + resolution.y * resolution.y) * vec2(cos(angle), sin(angle));

    //project outermost points of the image to the guide to determine the max distance
    float maxdist;
    maxdist = dot(guide, resolution * 0.5 * sign(guide)) / dot(guide, guide);

    //project current point onto the guide
    gradientpos = dot(guide, (vUv - vec2(0.5, 0.5)) * resolution) / dot(guide, guide);
    gradientpos /= maxdist * 2.0;
    gradientpos += 0.5;


#else
    float maxdist;
    maxdist = 0.5 * sqrt(resolution.x * resolution.x + resolution.y * resolution.y);

    gradientpos = length((vUv - vec2(0.5, 0.5)) * resolution) / maxdist;
#endif

  float alpha;

#if SHUTTER_SIDE==1
  alpha = smoothstep(1.0 - covered - fade, 1.0 - covered + fade, gradientpos) +
          1.0 - smoothstep(covered - fade, covered + fade, gradientpos);
#else
  alpha = smoothstep(1.0 - covered * 2.0 - fade, 1.0 - covered * 2.0 + fade, gradientpos);
#endif

  alpha *= opacity;

  gl_FragColor = vec4(color * alpha, alpha) + texel * (1.0 - alpha);
}
