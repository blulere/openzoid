uniform sampler2D tDiffuse;
uniform vec2 uvScale;
uniform float amount;
uniform vec2 resolution;

varying vec2 vUvScaled;

void main()
{
  float x = 1.0 / resolution.x * uvScale.x * amount;
  float y = 1.0 / resolution.y * uvScale.y * amount;

  vec4 horizEdge = vec4( 0.0 );
  horizEdge -= texture2D( tDiffuse, vec2( vUvScaled.x - x, vUvScaled.y - y ) ) * 1.0;
  horizEdge -= texture2D( tDiffuse, vec2( vUvScaled.x - x, vUvScaled.y     ) ) * 2.0;
  horizEdge -= texture2D( tDiffuse, vec2( vUvScaled.x - x, vUvScaled.y + y ) ) * 1.0;
  horizEdge += texture2D( tDiffuse, vec2( vUvScaled.x + x, vUvScaled.y - y ) ) * 1.0;
  horizEdge += texture2D( tDiffuse, vec2( vUvScaled.x + x, vUvScaled.y     ) ) * 2.0;
  horizEdge += texture2D( tDiffuse, vec2( vUvScaled.x + x, vUvScaled.y + y ) ) * 1.0;

  vec4 vertEdge = vec4( 0.0 );
  vertEdge -= texture2D( tDiffuse, vec2( vUvScaled.x - x, vUvScaled.y - y ) ) * 1.0;
  vertEdge -= texture2D( tDiffuse, vec2( vUvScaled.x    , vUvScaled.y - y ) ) * 2.0;
  vertEdge -= texture2D( tDiffuse, vec2( vUvScaled.x + x, vUvScaled.y - y ) ) * 1.0;
  vertEdge += texture2D( tDiffuse, vec2( vUvScaled.x - x, vUvScaled.y + y ) ) * 1.0;
  vertEdge += texture2D( tDiffuse, vec2( vUvScaled.x    , vUvScaled.y + y ) ) * 2.0;
  vertEdge += texture2D( tDiffuse, vec2( vUvScaled.x + x, vUvScaled.y + y ) ) * 1.0;

  vec3 edge = sqrt((horizEdge.rgb * horizEdge.rgb) + (vertEdge.rgb * vertEdge.rgb));

  gl_FragColor = vec4( edge, texture2D( tDiffuse, vUvScaled ).a );
}
