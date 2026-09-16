#version 300 es

precision highp float;

uniform vec4 u_color;
uniform sampler2D u_texture;
uniform bool u_useTexture;
uniform bool u_isCircle;

in vec2 v_texCoord;

out vec4 outColor;

void main() {
    if (u_isCircle && distance(v_texCoord, vec2(0.5)) > 0.5) {
        discard;
    }

    if (u_useTexture) {
        outColor = texture(u_texture, v_texCoord);
    } else {
        outColor = u_color;
    }
}
