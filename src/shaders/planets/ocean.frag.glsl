in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_TransPos;
layout (location = 0) out vec4 out_Col;
layout (location = 1) out vec4 out_Col2;
uniform mat4 u_Model;
uniform vec3 u_Eye;

vec3 colorWheelTransition(float angle) {
    // base is grass
    vec3 a = vec3(0.190, 0.590, 0.190);
    vec3 b = vec3(0.500, -0.002, 0.500);
    vec3 c = vec3(0.590, 0.690, 0.590);
    vec3 d = vec3(0.410, 1.098, 0.410);
    return (a + b * cos(2.f * 3.14159 * (c * angle + d))) * 0.65f;
}

vec3 colorWheelEarth(float angle) {
    // base is grass
    vec3 a = vec3(0.500, 0.660, 0.298);
    vec3 b = vec3(0.328, -0.222, 0.548);
    vec3 c = vec3(0.528, -0.362, 0.468);
    vec3 d = vec3(0.438, -0.052, 0.498);
    return (a + b * cos(2.f * 3.14159 * (c * angle + d))) * 0.75f;
}

vec4 getBiomeColor(vec3 p, vec3 normal, float mountain, float forest, float grass, int biome, vec3 norm) {
    if (biome == WATER) {
        vec3 wp = 0.1f * vec3(0.f, 0.f, float(u_Time) / 50.f) + p;
        float water = getWaterNoise((vec3(mountain, 0.f, grass) + wp) * 2.f);
        return vec4(colorWheelWater(water + 4.f * gain(dot(norm, normalize(u_Eye - fs_TransPos.xyz)), 0.2)), 1.f);
    } else if (biome == FOREST) {
        float perls = randomNoise3(p);
        return vec4(colorWheelForest(bias(perls, 0.25f)) * 0.62f, 1.f);
    } else {
        if (biome == MOUNTAIN) {

            return vec4(colorWheelTransition(1.f), 1.f);
        }

        return vec4(colorWheelEarth(bias(grass, 0.2)), 1.f);
    }
}

void main() {
    vec3 p = fs_Pos.xyz;
    vec4 diffuseColor = vec4(0.5, 0.5, 0.5, 1.f);
    vec3 lightSource;
    lightSource = vec3(0.f);

    vec3 normal = fs_Nor.xyz;
    float mountain = 0.f, forest = 0.f, grass = 0.f;
    int biome = getBiome(p, mountain, forest, grass);

    vec3 p2 = deformTerrainPre(p, grass);
    vec3 mp2 = (u_Model * vec4(p2, 1.f)).xyz;

    mat3 modelInvTr = inverse(transpose(mat3(u_Model)));
    
    
    vec3 p2x = dFdx(p2);
    vec3 p2y = dFdy(p2);
    normal = modelInvTr * mix(normal, normalize(cross(p2x, p2y)), 0.8);

    //normal = modelInvTr * transformNormal(p, p2, normal, 0);
    diffuseColor = getBiomeColor(p, normal.xyz, mountain, forest, grass, biome, normal);
    float diffuseTerm = dot(normalize(normal.xyz), normalize(lightSource.xyz - mp2));
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
    float ambientTerm = 0.3;
    float lightIntensity = diffuseTerm + ambientTerm; 
    float bf_highlight = max(pow(diffuseTerm, 12.f), 0.f);
    out_Col = vec4(diffuseColor.rgb * (lightIntensity + bf_highlight), diffuseColor.a);
    //out_Col = vec4(1.f, 0.,0., 1.);
    out_Col2 = vec4(0.);
}
