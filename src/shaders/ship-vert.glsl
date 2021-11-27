#version 300 es
uniform mat4 u_ViewProj;

in vec4 vs_Pos;
in vec4 vs_Nor;
in vec4 vs_Col;

in vec4 vs_Trans1;
in vec4 vs_Trans2;
in vec4 vs_Trans3;
in vec4 vs_Trans4;
in vec4 vs_Direction;
in vec2 vs_UV;

out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_Col;
out vec2 fs_UV;

const vec3 up = vec3(0.f, 0.f, 1.f);
mat3 rotFromDirection(vec3 direction) {
    vec3 yaxis = normalize(cross(up, direction));
    vec3 xaxis = normalize(cross(direction, yaxis));

    return mat3(xaxis, yaxis, direction);
}

void main()
{
    fs_Pos = vs_Pos;
    fs_Col = vs_Col;

    mat3 preRotScale = mat3(vs_Trans1.xyz, vs_Trans2.xyz, vs_Trans3.xyz);
    mat3 dynaRot = rotFromDirection(normalize(vs_Direction.xyz));
    mat3 invTranspose = inverse(transpose(dynaRot * preRotScale));
    fs_Nor = vec4(invTranspose * vec3(vs_Nor), 0);
    fs_Pos = vec4(dynaRot * preRotScale * vs_Pos.xyz + vs_Trans4.xyz, 1.f);
    fs_UV = vs_UV;
    gl_Position = u_ViewProj * fs_Pos;
}