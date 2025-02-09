uniform sampler2D tDiffuse;
uniform float saturation;

varying vec2 vUvScaled;

void main() {

    vec4 cl = texture2D(tDiffuse, vUvScaled);

    //sepia: vec3(1.2, 1.0, 0.8)

    vec3 gray = vec3(dot(cl.rgb, vec3(0.299, 0.587, 0.114)));

    gl_FragColor = vec4(mix(vec3(gray), cl.rgb, saturation), cl.a);

}
