uniform sampler2D tBG;
uniform float opacity;

#define PI_INV 0.31830988618379067

#if defined BLEND_SRC_COLOR
uniform vec3 color;
#else
uniform sampler2D tDiffuse;
#endif

varying vec2 vUvScaled;
varying vec2 bgCoord;

float minv3(vec3 c) {
  return min(min(c.r, c.g), c.b);
}
float maxv3(vec3 c) {
  return max(max(c.r, c.g), c.b);
}
float lumv3(vec3 c) {
  return dot(c, vec3(0.30, 0.59, 0.11));
}
float satv3(vec3 c) {
  return maxv3(c) - minv3(c);
}

// If any color components are outside [0,1], adjust the color to
// get the components in range.
vec3 ClipColor(vec3 color) {
  float lum = lumv3(color);
  float mincol = minv3(color);
  float maxcol = maxv3(color);
  if (mincol < 0.0) {
    color = lum + ((color-lum)*lum) / (lum-mincol);
  }
  if (maxcol > 1.0) {
    color = lum + ((color-lum)*(1.0-lum)) / (maxcol-lum);
  }
  return color;
}

// Take the base RGB color <cbase> and override its luminosity
// with that of the RGB color <clum>.
vec3 SetLum(vec3 cbase, vec3 clum) {
  float lbase = lumv3(cbase);
  float llum = lumv3(clum);
  float ldiff = llum - lbase;
  vec3 color = cbase + vec3(ldiff);
  return ClipColor(color);
}

// Take the base RGB color <cbase> and override its saturation with
// that of the RGB color <csat>.  The override the luminosity of the
// result with that of the RGB color <clum>.
vec3 SetLumSat(vec3 cbase, vec3 csat, vec3 clum)
{
  float minbase = minv3(cbase);
  float sbase = satv3(cbase);
  float ssat = satv3(csat);
  vec3 color;
  if (sbase > 0.0) {
    // Equivalent (modulo rounding errors) to setting the
    // smallest (R,G,B) component to 0, the largest to <ssat>,
    // and interpolating the "middle" component based on its
    // original value relative to the smallest/largest.
    color = (cbase - minbase) * ssat / sbase;
  } else {
    color = vec3(0.0);
  }
  return SetLum(color, clum);
}

#ifndef OVERLAP_MODE
  #define OVERLAP_MODE 0
#endif

#if OVERLAP_MODE==0 //uncorrelated
  float p0(float As, float Ad) { return As * Ad; }
  float p1(float As, float Ad) { return As * (1.0-Ad); }
  float p2(float As, float Ad) { return Ad * (1.0-As); }
// #elif OVERLAP_MODE==1 //conjoint
//   float p0(float As, float Ad) { return min(As, Ad); }
//   float p1(float As, float Ad) { return max(As-Ad, 0.0); }
//   float p2(float As, float Ad) { return max(Ad-As, 0.0); }
// #elif OVERLAP_MODE==2 //disjoint
//   float p0(float As, float Ad) { return max(As+Ad-1.0, 0.0); }
//   float p1(float As, float Ad) { return min(As, 1.0-Ad); }
//   float p2(float As, float Ad) { return min(Ad, 1.0-As); }
#elif OVERLAP_MODE==3 //force atop
  float p0(float As, float Ad) { return As * Ad; }
  float p1(float As, float Ad) { return 0.0; }
  float p2(float As, float Ad) { return Ad * (1.0-As); }
#endif

#if defined BLEND_ZERO
  const vec3 coeff = vec3(0.0, 0.0, 0.0);
  vec3 f(vec3 Cs, vec3 Cd) { return vec3(0.0); }
#elif defined BLEND_SRC
  const vec3 coeff = vec3(1.0, 1.0, 0.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cs; }
#elif defined BLEND_DST
  const vec3 coeff = vec3(1.0, 0.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cd; }
#elif defined BLEND_SRC_OVER
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cs; }
#elif defined BLEND_DST_OVER
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cd; }
#elif defined BLEND_SRC_IN
  const vec3 coeff = vec3(1.0, 0.0, 0.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cs; }
#elif defined BLEND_DST_IN
  const vec3 coeff = vec3(1.0, 0.0, 0.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cd; }
#elif defined BLEND_SRC_OUT
  const vec3 coeff = vec3(0.0, 1.0, 0.0);
  vec3 f(vec3 Cs, vec3 Cd) { return vec3(0.0); }
#elif defined BLEND_DST_OUT
  const vec3 coeff = vec3(0.0, 0.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return vec3(0.0); }
#elif defined BLEND_SRC_ATOP
  const vec3 coeff = vec3(1.0, 0.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cs; }
#elif defined BLEND_DST_ATOP
  const vec3 coeff = vec3(1.0, 1.0, 0.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cd; }
#elif defined BLEND_XOR
  const vec3 coeff = vec3(0.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return vec3(0.0); }
#elif defined BLEND_MULTIPLY
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cs*Cd; }
#elif defined BLEND_SCREEN
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cs+Cd-Cs*Cd; }
#elif defined BLEND_OVERLAY
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd)
  {
    return mix(
      2.0*Cs*Cd,
      vec3(1.0)-2.0*(vec3(1.0)-Cs)*(vec3(1.0)-Cd),
      step(Cd, vec3(0.5))
    );
  }
#elif defined BLEND_DARKEN
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return min(Cs, Cd); }
#elif defined BLEND_LIGHTEN
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return max(Cs, Cd); }
#elif defined BLEND_COLORDODGE
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return min(vec3(1.0), Cd/(vec3(1.0)-Cs)); }
#elif defined BLEND_COLORBURN
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return vec3(1.0) - min(vec3(1.0),(vec3(1.0)-Cd)/Cs); }
#elif defined BLEND_HARDLIGHT
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd)
  {
    return mix(
      2.0*Cs*Cd,
      vec3(1.0)-2.0*(vec3(1.0)-Cs)*(vec3(1.0)-Cd),
      step(Cs, vec3(0.5))
    );
  }
#elif defined BLEND_SOFTLIGHT
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd)
  {
    return mix(
      Cd-(vec3(1.0)-2.0*Cs)*Cd*(vec3(1.0)-Cd),
      mix(
        Cd+(2.0*Cs-vec3(1.0))*Cd*((16.0*Cd-vec3(12.0))*Cd+vec3(3.0)),
        Cd+(2.0*Cs-vec3(1.0))*(sqrt(Cd)-Cd),
        step(Cd, vec3(0.25))
      ),
      step(Cs, vec3(0.5))
    );
  }
#elif defined BLEND_DIFFERENCE
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return abs(Cd-Cs); }
#elif defined BLEND_EXCLUSION
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cs+Cd-2.0*Cs*Cd; }
#elif defined BLEND_INVERT
  const vec3 coeff = vec3(1.0, 0.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return 1.0-Cd; }
#elif defined BLEND_INVERT_RGB
  const vec3 coeff = vec3(1.0, 0.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cs*(1.0-Cd); }
#elif defined BLEND_LINEARDODGE
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cs+Cd; }
#elif defined BLEND_LINEARBURN
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return Cs+Cd-vec3(1.0); }
#elif defined BLEND_VIVIDLIGHT
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd)
  {
    return mix(
      vec3(1.0)-min(vec3(1.0),(vec3(1.0)-Cd)/(2.0*Cs)),
      min(vec3(1.0),Cd/(2.0*(vec3(1.0)-Cs))),
      step(Cs, vec3(0.5))
    );
  }
#elif defined BLEND_LINEARLIGHT
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return 2.0*Cs+Cd-vec3(1.0); }
#elif defined BLEND_PINLIGHT
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd)
  {
    vec3 c = 2.0*Cs-vec3(1.0);
    return min(mix(c + vec3(1.0), c, step(c, Cd)), Cd);
  }
#elif defined BLEND_HARDMIX
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return step(Cs+Cd, vec3(1.0)); }
#elif defined BLEND_HUE
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return SetLumSat(Cs, Cd, Cd); }
#elif defined BLEND_SATURATION
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return SetLumSat(Cd, Cs, Cd); }
#elif defined BLEND_COLOR
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return SetLum(Cs, Cd); }
#elif defined BLEND_LUMINOSITY
  const vec3 coeff = vec3(1.0, 1.0, 1.0);
  vec3 f(vec3 Cs, vec3 Cd) { return SetLum(Cd, Cs); }
#elif defined BLEND_PLUS
  #define BLEND_RGB
  vec4 f(vec4 Cs, vec4 Cd) { return Cs+Cd; }
#elif defined BLEND_PLUS_DARKER
  #define BLEND_RGB
  vec4 f(vec4 Cs, vec4 Cd)
  {
    float a = min(1.0, Cs.a+Cd.a);
    return vec4(
      max( 0.0, a-((Cs.a-Cs.r)+(Cd.a-Cd.r)) ),
      max( 0.0, a-((Cs.a-Cs.g)+(Cd.a-Cd.g)) ),
      max( 0.0, a-((Cs.a-Cs.b)+(Cd.a-Cd.b)) ),
      a
    );
  }
#elif defined BLEND_MINUS
  #define BLEND_RGB
  vec4 f(vec4 Cs, vec4 Cd) { return Cd-Cs; }
#elif defined BLEND_CONTRAST
  #define BLEND_RGB
  vec4 f(vec4 Cs, vec4 Cd)
  {
    return vec4(
      Cd.a*0.5 + 2.0*(Cd.r-Cd.a*0.5)*(Cs.r-Cs.a*0.5),
      Cd.a*0.5 + 2.0*(Cd.g-Cd.a*0.5)*(Cs.g-Cs.a*0.5),
      Cd.a*0.5 + 2.0*(Cd.b-Cd.a*0.5)*(Cs.b-Cs.a*0.5),
      Cd.a
    );
  }
#elif defined BLEND_INVERT_OVG
  #define BLEND_RGB
  vec4 f(vec4 Cs, vec4 Cd)
  {
    return vec4(
      Cs.a*(1.0-Cd.r)+(1.0-Cs.a)*Cd.r,
      Cs.a*(1.0-Cd.g)+(1.0-Cs.a)*Cd.g,
      Cs.a*(1.0-Cd.b)+(1.0-Cs.a)*Cd.b,
      Cs.a+Cd.a-Cs.a*Cd.a
    );
  }
#elif defined BLEND_RED
  #define BLEND_RGB
  vec4 f(vec4 Cs, vec4 Cd) { return vec4(Cs.r, Cd.g, Cd.b, Cd.a); }
#elif defined BLEND_GREEN
  #define BLEND_RGB
  vec4 f(vec4 Cs, vec4 Cd) { return vec4(Cd.r, Cs.g, Cd.b, Cd.a); }
#elif defined BLEND_BLUE
  #define BLEND_RGB
  vec4 f(vec4 Cs, vec4 Cd) { return vec4(Cd.r, Cd.g, Cs.b, Cd.a); }
#endif

void main()
{

  vec4 dst = texture2D(tBG, bgCoord.xy);

#if defined BLEND_SRC_COLOR
  vec4 src = vec4(color, 1.0);
#elif defined BLEND_SRC_GRADIENT
  #if BLEND_GRADIENT_TYPE==0 //linear
    float d = vUvScaled.x;
  #elif BLEND_GRADIENT_TYPE==1 //radial
    float d = length(vUvScaled - vec2(0.5));
  #elif BLEND_GRADIENT_TYPE==2 //angular
    vec2 p = vUvScaled - vec2(0.5);
    float d = atan(p.x, p.y) * PI_INV * 0.5 + 0.5;
  #elif BLEND_GRADIENT_TYPE==3 //reflected
    float d = 1.0 - abs(2.0 * vUvScaled.x - 1.0);
  #elif BLEND_GRADIENT_TYPE==4 //diamond
    vec2 p = abs(vUvScaled - vec2(0.5));
    float d = p.x + p.y;
  #endif

  vec4 src = texture2D(tDiffuse, vec2(d, 0.5));
#else
  vec4 src = texture2D(tDiffuse, vUvScaled);

  #ifdef BLEND_NO_REPEAT
    vec2 s = step(vec2(0.0), vUvScaled) - step(vec2(1.0), vUvScaled);
    src *= s.x * s.y;
  #endif
#endif

#ifndef BLEND_RGB
  if (src.a > 0.0) src.rgb /= src.a;
  if (dst.a > 0.0) dst.rgb /= dst.a;

  src.a *= opacity;

  gl_FragColor = vec4(f(src.rgb, dst.rgb), coeff.x) * p0(src.a, dst.a) +
                 coeff.y * vec4(src.rgb, 1.0) * p1(src.a, dst.a) +
                 coeff.z * vec4(dst.rgb, 1.0) * p2(src.a, dst.a);
#else

  src *= opacity;

  gl_FragColor = f(src, dst);
#endif
}