uniform sampler2D tDiffuse;

varying vec2 vUvScaled;

void main() {

    vec4 cl = texture2D(tDiffuse, vUvScaled);

    gl_FragColor = vec4(cl.a - cl.r,
                        cl.a - cl.g,
                        cl.a - cl.b,
                        cl.a);
}
