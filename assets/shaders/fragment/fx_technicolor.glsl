uniform sampler2D tDiffuse;

varying vec2 vUvScaled;

void main() {

    vec4 cl = texture2D(tDiffuse, vUvScaled);

    vec4 newTex = vec4(cl.r, (cl.g + cl.b) * .5, (cl.g + cl.b) * .5, cl.a);

    gl_FragColor = newTex;

}
