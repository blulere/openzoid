uniform sampler2D tDiffuse;
uniform float brightness;
uniform float contrast;

varying vec2 vUvScaled;

void main()
{
	vec4 color = texture2D(tDiffuse, vUvScaled);
	color.rgb /= color.a;
	gl_FragColor.rgb = (color.rgb - 0.5) * contrast + 0.5 + brightness;
	gl_FragColor.rgb *= color.a;
	gl_FragColor.a = color.a;
}
