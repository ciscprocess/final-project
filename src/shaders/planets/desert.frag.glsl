in vec4 fs_Pos;
in vec4 fs_Nor;
out vec4 out_Col;
uniform mat4 u_Model;

vec3 colorWheelDesert(float angle) {
    // base is grass
    // [[0.968 0.578 0.078] [-0.002 0.168 0.108] [0.298 1.958 3.138] [-0.162 -0.052 0.667]]
    vec3 a = vec3(0.968, 0.578, 0.078);
    vec3 b = vec3(-0.002, 0.168, 0.108);
    vec3 c = vec3(0.298, 1.958, 3.138);
    vec3 d = vec3(-0.162, -0.052, 0.667);
    return (a + b * cos(2.f * 3.14159 * (c * angle + d))) * 0.65f;
}

vec3 colorWheelDesert2(float angle) {
    // base is grass
    // [[0.638 0.318 0.170] [-0.072 0.068 0.078] [2.128 1.338 1.608] [0.000 0.000 0.000]]
    vec3 a = vec3(0.638, 0.318, 0.170);
    vec3 b = vec3(-0.072, 0.068, 0.078);
    vec3 c = vec3(2.128, 1.338, 1.608);
    vec3 d = vec3(0., 0., 0.);
    return (a + b * cos(2.f * 3.14159 * (c * angle + d))) * 0.8f;
}

void main() {
    vec3 p = fs_Pos.xyz;
    vec4 diffuseColor = vec4(0.5, 0.5, 0.5, 1.f);
    vec3 lightSource;
    lightSource = vec3(0.f);

    vec3 normal = fs_Nor.xyz;

    vec3 p2 = deformTerrainDesert(p);
    vec3 mp2 = (u_Model * vec4(p2, 1.f)).xyz;

    mat3 modelInvTr = inverse(transpose(mat3(u_Model)));
    
    
    vec3 p2x = dFdx(p2);
    vec3 p2y = dFdy(p2);
    normal = modelInvTr * mix(normal, normalize(cross(p2x, p2y)), 0.8);

    //normal = modelInvTr * transformNormal(p, p2, normal, 0);
    float base = getDesertBase(p);
    float desert = getDesertMembership(base, getDesertGarnish(p));
    if (base < 0.41) {
        diffuseColor = vec4(colorWheelDesert(desert), 1.f);
    } else {
        diffuseColor = vec4(colorWheelDesert2(desert), 1.f);
    }

    float diffuseTerm = dot(normalize(normal.xyz), normalize(lightSource.xyz - mp2));
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
    float ambientTerm = 0.3;
    float lightIntensity = diffuseTerm + ambientTerm; 
    float bf_highlight = max(pow(diffuseTerm, 12.f), 0.f);
    out_Col = vec4(diffuseColor.rgb * (lightIntensity + bf_highlight), diffuseColor.a);
    //out_Col = vec4(1.f, 0.,0., 1.);
}
