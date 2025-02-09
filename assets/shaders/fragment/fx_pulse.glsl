uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform vec2 uvScale;
uniform float time;
uniform float size;
uniform float amplitude;

varying vec2 vUv;

vec2 GetOffsetFromCenter(vec2 screenCoords, vec2 screenSize)
{
    vec2 halfScreenSize = screenSize / 2.0;

    return (screenCoords.xy - halfScreenSize) / min(halfScreenSize.x, halfScreenSize.y);
}

float EffectFadeInTimeFactor = 0.5;

vec2 GetDistortionTexelOffset(vec2 offsetDirection, float offsetDistance, float time)
{
    float progress = mod(time, 1.0);

    float halfWidth = size / 2.0;
    float lower = 1.0 - smoothstep(progress - halfWidth, progress, offsetDistance);
    float upper = smoothstep(progress, progress + halfWidth, offsetDistance);

    float band = 1.0 - (upper + lower);

    float strength = 1.0 - progress;
    float fadeStrength = smoothstep(0.0, EffectFadeInTimeFactor, progress);

    float distortion = band * strength * fadeStrength;


    return distortion * offsetDirection * amplitude;
}


vec4 GetTextureOffset(vec2 coords, vec2 textureSize, vec2 texelOffset)
{
    vec2 texelSize = 1.0 / textureSize;
    vec2 offsetCoords = coords + texelSize * texelOffset;

    vec2 halfTexelSize = texelSize / 2.0;
    vec2 clampedOffsetCoords = clamp(offsetCoords, halfTexelSize, 1.0 - halfTexelSize);

    return texture2D(tDiffuse, clampedOffsetCoords * uvScale);
}

void main()
{
    vec2 screenCoords = vec2(vUv.x * resolution.x, vUv.y * resolution.y);

    vec2 offsetFromCenter = GetOffsetFromCenter(screenCoords, resolution);
    vec2 offsetDirection = normalize(-offsetFromCenter);
    float offsetDistance = length(offsetFromCenter);

    vec2 offset = GetDistortionTexelOffset(offsetDirection, offsetDistance / 2.0, time);

    vec4 background = GetTextureOffset(vUv, resolution, offset);

    gl_FragColor = background;
}
