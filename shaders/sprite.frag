#version 300 es

precision highp float;

uniform vec4 u_color;
uniform sampler2D u_texture;
uniform bool u_useTexture;

in vec2 v_texCoord;

out vec4 outColor;

void main() {
    if (u_useTexture) {
        outColor = texture(u_texture, v_texCoord);
    } else {
        outColor = u_color;
    }
}
