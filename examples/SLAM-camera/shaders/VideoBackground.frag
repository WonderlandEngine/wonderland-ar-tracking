precision highp float;

#define TEXTURED

#include "lib/Uniforms.glsl"

in highp vec2 textureCoordinates;

out lowp vec4 outColor;

#ifdef TEXTURED
uniform sampler2D videoTexture;

vec4 shadeTexture() {
    ivec2 texSize = textureSize(videoTexture, 0);
    if (texSize.x <= 0 || texSize.y <= 0) return vec4(1.0, 0.0, 1.0, 1.0);

    float vRatio = float(viewport.z)/float(viewport.w);
    /* Sequence replay is rotated 90deg; treat texture aspect as swapped. */
    float tRatio = float(texSize.y)/float(texSize.x);

    vec2 uv = textureCoordinates;
    if(vRatio > tRatio) {
        /* Center the image vertically in the viewport and scale */
        uv.y = 0.5 + (textureCoordinates.y - 0.5) * (tRatio/vRatio);
    } else {
        /* Center the image horizontally in the viewport and scale */
        uv.x = 0.5 + (textureCoordinates.x - 0.5) * (vRatio/tRatio);
    }

    /* Rotate 90 degrees (clockwise) around center */
    uv = 1.0 - uv.yx;
    vec4 texel = texture(videoTexture, uv);
    return texel;
}
#endif

void main() {
    outColor = vec4(1.0);

    #ifdef TEXTURED
    outColor *= shadeTexture();
    #endif
}
