#version 300 es

//This is a vertex shader. While it is called a "shader" due to outdated conventions, this file
//is used to apply matrix transformations to the arrays of vertex data passed to it.
//Since this code is run on your GPU, each vertex is transformed simultaneously.
//If it were run on your CPU, each vertex would have to be processed in a FOR loop, one at a time.
//This simultaneous transformation allows your program to run much faster, especially when rendering
//geometry with millions of vertices.

uniform vec3 u_WarpDir;
uniform int u_Time;
uniform mat4 u_Model;
uniform mat4 u_ModelInvTr;
uniform mat4 u_ViewProj;

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;

in vec4 vs_Trans1;
in vec4 vs_Trans2;
in vec4 vs_Trans3;
in vec4 vs_Trans4;

out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_LightVec;
out vec4 fs_Col;

const vec4 lightPos = vec4(5, 5, 3, 1); //The position of our virtual light, which is used to compute the shading of

void main()
{
    fs_Pos = vs_Pos;
    fs_Col = vs_Col;

    mat4 transMatrix = mat4(vs_Trans1, vs_Trans2, vs_Trans3, vs_Trans4);

    mat3 invTranspose = mat3(inverse(transpose(transMatrix)));
    fs_Nor = vec4(invTranspose * vec3(vs_Nor), 0); 
    fs_Pos = transMatrix * vs_Pos;
    gl_Position = u_ViewProj * fs_Pos;
    gl_PointSize = 10.f;
}
