uniform mat4 u_Model;
uniform mat4 u_ViewProj;

in vec4 vs_Pos;
in vec4 vs_Nor;

out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_PosGlobal;

void main() {
    fs_Pos = vs_Pos;
    fs_Nor = inverse(transpose(u_Model)) * vs_Nor;
    fs_PosGlobal = u_Model * vs_Pos;
    gl_Position = u_ViewProj * fs_PosGlobal;
}
