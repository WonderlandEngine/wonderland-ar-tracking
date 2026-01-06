precision highp float;

#define TEXTURED

#include "lib/Uniforms.glsl"

in highp vec2 textureCoordinates;

out lowp vec4 outColor;

uniform sampler2D videoTexture;
uniform mat4 videoTextureTransform;

vec4 shadeTexture() {
    vec4 uv = videoTextureTransform * vec4(textureCoordinates, 0.0, 1.0);
    return textureProj(videoTexture, uv);
}

void main() {
    outColor = shadeTexture();
}
