uniform mat4 u_Model;
uniform mat4 u_ViewProj;

in vec4 vs_Pos;
in vec4 vs_Nor;

out vec4 fs_Pos;
out vec4 fs_TransPos;
out vec4 fs_Nor;

void main() {
    vec3 p = vs_Pos.xyz;
    fs_Pos = vec4(p, 1.f);

    p = deformTerrain(p);

    fs_Nor = vs_Nor;
    vec4 modelposition = u_Model * vec4(p, 1.f);
    fs_TransPos = modelposition;
    gl_Position = u_ViewProj * modelposition;
}
