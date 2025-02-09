uniform sampler2D tDiffuse;
uniform vec2 uvScale;

varying vec2 bgCoord;

void main()
{
  gl_FragColor = texture2D( tDiffuse, bgCoord * uvScale );
}
