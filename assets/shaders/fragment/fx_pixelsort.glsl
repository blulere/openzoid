uniform sampler2D tDiffuse;
uniform sampler2D tMap;
uniform vec2 uvScale;
uniform float threshold;
uniform float direction;

varying vec2 vUv;
varying vec2 vUvScaled;


CONST_RESOLUTION;

#ifndef PASS_MAP

float fromRgb(vec3 v)
{
  return ((v.z * 256.0 + v.y) * 256.0 + v.x) * 255.0;
}

vec4 draw(vec2 uv)
{
  vec2 dirVec = (DIRECTION == 0) ? vec2( 0.0, 1.0 ) : vec2( 1.0, 0.0 );
  const float wid = (DIRECTION == 0) ? resolution.y : resolution.x;
  float pos = (DIRECTION == 0) ? floor( uv.y * resolution.y ) : floor( uv.x * resolution.x );

  for (int i = 0; i < int(wid); i++)
  {
    vec2 p = uv + dirVec * float(i) / wid;
    if (p.x < 1.0 && p.y < 1.0)
    {
      float v = fromRgb(texture2D(tMap, p * uvScale).xyz);
      if (abs(v - pos) < 0.5)
      {
        return texture2D(tDiffuse, p * uvScale);
      }
    }

    p = uv - dirVec * float(i) / wid;
    if (0.0 < p.x && 0.0 < p.y)
    {
      float v = fromRgb(texture2D(tMap, p * uvScale).xyz);
      if (abs(v - pos) < 0.5)
      {
        return texture2D(tDiffuse, p * uvScale);
      }
    }
  }

  return vec4(1.0, 0.0, 1.0, 1.0);
}

#else

float gray(vec3 c)
{
  return dot(c, vec3(0.299, 0.587, 0.114));
}

vec3 toRgb(float i)
{
  return vec3(
      mod(i, 256.0),
      mod(floor(i / 256.0), 256.0),
      floor(i / 65536.0)
  ) / 255.0;
}

bool thr(float v)
{
  return (AFFECT == 0) ? (threshold < v) : (v < threshold);
}

vec4 sort(vec2 uv)
{
  vec2 dirVec = (DIRECTION == 0) ? vec2( 0.0, 1.0 ) : vec2( 1.0, 0.0 );
  const float wid = (DIRECTION == 0) ? resolution.y : resolution.x;
  float pos = (DIRECTION == 0) ? floor( uv.y * resolution.y ) : floor( uv.x * resolution.x );

  float val = gray(texture2D(tDiffuse, uv * uvScale).xyz);

  if (!thr(val))
  {
    float post = pos;
    float rank = 0.0;
    float head = 0.0;
    float tail = 0.0;

    for (int i = 0; i < int(wid); i++)
    {
      post -= 1.0;
      if (post == -1.0)
      {
        head = post + 1.0;
        break;
      }
      vec2 p = dirVec * (post + 0.5) / wid + dirVec.yx * uv;
      float v = gray(texture2D(tDiffuse, p * uvScale).xyz);
      if (thr(v))
      {
        head = post + 1.0;
        break;
      }
      if (v <= val) rank += 1.0;
    }

    post = pos;
    for (int i = 0; i < int(wid); i++)
    {
      post += 1.0;
      if (wid == post)
      {
        tail = post - 1.0;
        break;
      }
      vec2 p = dirVec * (post + 0.5) / wid + dirVec.yx * uv;
      float v = gray(texture2D(tDiffuse, p * uvScale).xyz);
      if (thr(v))
      {
        tail = post - 1.0;
        break;
      }
      if (v < val) rank += 1.0;
    }

    pos = (REVERSE == 1) ? (tail - rank) : (head + rank);
  }

  return vec4(toRgb(pos), 1.0);
}

#endif

void main()
{
#ifdef PASS_MAP
  gl_FragColor = sort(vUv);
#else
  gl_FragColor = draw(vUv);
#endif
}
