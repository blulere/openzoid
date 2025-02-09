uniform sampler2D tDiffuse;
uniform float amount;
uniform float time;
uniform float offset;
uniform float speed;
uniform vec2 uvScale;

varying vec2 vUv;

//based on https://www.shadertoy.com/view/MdfGD2

float rand( vec2 n ) {
  return fract(sin(dot(n.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float trunc( float x, float num_levels )
{
  return floor(x * num_levels) / num_levels;
}
vec2 trunc( vec2 x, vec2 num_levels )
{
  return floor(x * num_levels) / num_levels;
}

void main()
{
  float time_s = mod( time / 30.0, 32.0 );

  float time_frq = speed * 4.0;

  //change the frame randomly with change_rnd
  float min_change_frq = speed;
  float ct = trunc( time_s, min_change_frq );
  float change_rnd = rand( trunc(vUv.yy, vec2(16)) + 150.0 * ct );

  float tf = time_frq * change_rnd;

  //map uv to a random horizontal line
  float t = 5.0 * trunc( time_s, tf );
  float vt_rnd = 0.5 * rand( trunc(vUv.yy + t, vec2(11)) );
  vt_rnd += 0.5 * rand( trunc(vUv.yy + t, vec2(7)) );
  vt_rnd = vt_rnd * 2.0 - 1.0;
  vt_rnd = sign(vt_rnd) * clamp( ( abs(vt_rnd) - 1.0 + amount) / amount, 0.0, 1.0 );

  //add uv x offset
  vec2 uv_nm = vUv;
  uv_nm = clamp( uv_nm + vec2(offset * vt_rnd, 0), 0.0, 1.0 );

  vec4 col = texture2D( tDiffuse, uv_nm * uvScale, -10.0 );
  gl_FragColor = vec4( col.rgb, col.a );
}
