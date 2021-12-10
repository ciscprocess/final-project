in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_PosGlobal;
layout (location = 0) out vec4 out_Col;
layout (location = 1) out vec4 out_Col2;
uniform mat4 u_Model;

vec3 colorWheelGas(float angle) {
    // base is grass
    vec3 a = vec3(0.590, 0.590, 0.190) + vec3(sin(u_Seed * 3.2f + 1.), sin(u_Seed * 2.6f + 2.), sin(u_Seed * 2.f - 1.)) / 4.;
    vec3 b = vec3(0.600, 0.222, 0.500);
    vec3 c = vec3(0.590, 0.690, 0.590);
    vec3 d = vec3(0.010, 1.098, 0.410);
    return (a + b * cos(2.f * 3.14159 * (c * angle + d))) * 0.65f;
}

void main() {
    vec3 p = fs_Pos.xyz;
    vec3 gp = fs_PosGlobal.xyz;
    vec3 lightSource = vec3(0.f);

    vec3 normal = fs_Nor.xyz;

    float params2 = randomNoise2(p, u_Seed + 12.f);
    vec3 speed = vec3(
        mix(0.1, 0.15, 1.f),
        mix(0.7, 0.95, params2),
        mix(0.1, 0.15, 1.f));

    float val = fbmPerlin(p * speed, 0.5f, 0.f, 98.f + u_Seed * 2.f, 3, 0.6f, 3.f);
    vec4 diffuseColor = vec4(pow(colorWheelGas(val) + 1.f, vec3(2.f)) - 1.f, 1.f);
    float diffuseTerm = dot(normalize(normal.xyz), normalize(lightSource.xyz - gp));
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
    float ambientTerm = 0.3;
    float bf_highlight = max(pow(diffuseTerm, 12.f), 0.f);
    float lightIntensity = diffuseTerm + ambientTerm; 
    out_Col = vec4(diffuseColor.rgb * (lightIntensity + bf_highlight), diffuseColor.a);
    out_Col2 = vec4(0.f);
}
