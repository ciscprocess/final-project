#version 300 es
uniform int u_Time;
uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;
uniform mat4 u_ViewProj;

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;

out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_Col;

void main()
{
    fs_Pos = vs_Pos;
    fs_Col = vs_Col;
    fs_Nor = vs_Nor;

    gl_Position = u_ViewProj * fs_Pos;
}
