uniform sampler2D tDiffuse;
uniform vec2 uvScale;
uniform float amount;
uniform vec2 resolution;

varying vec2 vUv;

const float PI = 3.1415926535;


void main()
{

    float prop = resolution.x / resolution.y; //screen proroption

    vec2 p = vec2(vUv.x, vUv.y / prop); //normalized coords with some cheat
                                                               //(assume 1:1 prop)

    vec2 m = vec2(0.5, 0.5 / prop); //center coords
    vec2 d = p - m; //vector from center to current fragment
    float r = sqrt(dot(d, d)); // distance of pixel from center

    float power = ( 2.0 * 3.141592 / (2.0 * sqrt(dot(m, m))) ) * amount / 100.0;

    float bind; //radius of 1:1 effect
    if (power > 0.0)
    {
      bind = sqrt(dot(m, m)); //stick to corners
    }
    else
    {
      if (prop < 1.0) bind = m.x; else bind = m.y; //stick to borders
    }

    //Weird formulas
    vec2 uv;
    if (power > 0.0) //fisheye
      uv = m + normalize(d) * tan(r * power) * bind / tan( bind * power);
    else //antifisheye
      uv = m + normalize(d) * atan(r * -power * 10.0) * bind / atan(-power * bind * 10.0);

    vec4 col = texture2D(tDiffuse, vec2(uv.x, uv.y * prop) * uvScale);

    gl_FragColor = vec4(col);
}

//
