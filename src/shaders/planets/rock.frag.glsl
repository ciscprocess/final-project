in vec4 fs_Pos;
in vec4 fs_Nor;
out vec4 out_Col;
uniform mat4 u_Model;

vec3 colorWheelRock(float angle) {
    // base is grass
    // [[0.378 0.398 0.410] [0.500 0.500 0.500] [1.000 1.000 1.000] [0.928 0.943 0.947]]
    vec3 a = vec3(0.378, 0.398, 0.410);
    vec3 b = vec3(0.500, 0.500, 0.500);
    vec3 c = vec3(1.000, 1.000, 1.000);
    vec3 d = vec3(0.928, 0.943, 0.947) * 1.5;
    return (a + b * cos(2.f * 3.14159 * (c * angle + d))) * 0.65f;
}


void main() {
    vec3 p = fs_Pos.xyz;
    vec4 diffuseColor = vec4(0.5, 0.5, 0.5, 1.f);
    vec3 lightSource;
    lightSource = vec3(0.f);

    vec3 normal = fs_Nor.xyz;
    float rock = getRockNoise(p);
    vec3 p2 = deformRockTerrain(p, rock);
    vec3 mp2 = (u_Model * vec4(p2, 1.f)).xyz;

    mat3 modelInvTr = inverse(transpose(mat3(u_Model)));
    
    vec3 p2x = dFdx(p2);
    vec3 p2y = dFdy(p2);
    normal = mix(normal, normalize(cross(p2x, p2y)), 0.8);

    //normal = modelInvTr * transformNormal(p, p2, normal, 0);

    diffuseColor = vec4(colorWheelRock(rock), 1.f);

    float diffuseTerm = dot(normalize(normal.xyz), normalize(lightSource.xyz - mp2));
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
    float ambientTerm = 0.2;
    float lightIntensity = diffuseTerm + ambientTerm; 
    float bf_highlight = max(pow(diffuseTerm, 12.f), 0.f);
    out_Col = vec4(diffuseColor.rgb * (lightIntensity + bf_highlight), diffuseColor.a);
    //out_Col = vec4(1.f, 0.,0., 1.);
}
