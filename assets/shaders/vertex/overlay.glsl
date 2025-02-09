uniform mat3 uvTransform;
uniform vec2 uvScale;

varying vec2 vUv;
varying vec2 vUvScaled;
varying vec2 bgCoord;

void main()
{
	vUv = uv;
	vUvScaled = (uvTransform * vec3(uv, 1.0)).xy;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	bgCoord = (gl_Position.xy * 0.5 + 0.5) * uvScale;
}