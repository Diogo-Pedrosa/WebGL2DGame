#version 300 es

in vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_position;
uniform vec2 u_size;

out vec2 v_texCoord;

void main() {
    vec2 positionInPixels = a_position * u_size + u_position;
    vec2 zeroToOne = positionInPixels / u_resolution;
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;

    gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
    v_texCoord = a_position;
}
