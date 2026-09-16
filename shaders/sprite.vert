#version 300 es

in vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_position;
uniform vec2 u_size;
uniform float u_rotation;

out vec2 v_texCoord;

void main() {
    vec2 localPosition = (a_position - 0.5) * u_size;
    float sine = sin(u_rotation);
    float cosine = cos(u_rotation);
    mat2 rotation = mat2(cosine, sine, -sine, cosine);
    vec2 center = u_position + u_size * 0.5;
    vec2 positionInPixels = rotation * localPosition + center;
    vec2 zeroToOne = positionInPixels / u_resolution;
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;

    gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
    v_texCoord = a_position;
}
