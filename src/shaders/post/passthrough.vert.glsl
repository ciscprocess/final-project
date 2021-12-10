#version 300 es
precision highp float;
precision highp int;

uniform mat4 u_Model;
in vec4 vs_Pos;
in vec2 vs_UV;

out vec2 fs_UV;

void main()
{
    fs_UV = vs_UV;
    gl_Position = u_Model * vs_Pos;
}
