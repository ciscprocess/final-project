#version 300 es
precision highp float;
precision highp int;

const float u_GrassCutoff = 0.5;
const float u_MountainCutoff = 0.59;
const float u_ForestCutoff = 0.3;
const float u_NormDifferential = 0.001;
const float u_MountainSpacing = 0.005;
const float u_MountainGrassCutoff = 0.01;

uniform int u_Time;
uniform float u_Seed;

float randomNoise2(vec3 p, float seed) {
    return fract(sin(dot(p, vec3(12.9898, -78.233, 133.999)))  * (43758.5453 + seed + u_Seed));
}

float randomNoise3(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * (43758.5453 + u_Seed));
}

float randomNoise3(vec3 co){
    float noise = randomNoise3(co.xy);
    return randomNoise3(vec2(noise, co.z));
}

float bias(float time, float bias) {
    return (time / ((((1.0 / bias) - 2.0) * (1.0 - time)) + 1.0));
}

float gain(float time, float gain) {
    float t1 = round(time);
    return (1.f - t1) * (bias(time * 2.0, gain) / 2.0) +
        t1 * (bias(time * 2.0 - 1.0, 1.0 - gain) / 2.0 + 0.5);
}

vec3 getLatticeVector(vec3 p, float seed) {
    return -1.f + 2.f * vec3(randomNoise2(p, 1201.f + seed),
         randomNoise2(p, 44402.f + seed),
         randomNoise2(p, 23103.f + seed));
}

float interpQuintic(float a, float b, float x) {
    float mod = 1.f - 6.f * pow(x, 5.f) + 15.f * pow(x, 4.f) - 10.f * pow(x, 3.f);
    return mix(a, b, 1.f - mod);
}

float interpQuintic3D(vec3 p, float bnl, float bnr, float bfr, float bfl, float tnl, float tnr, float tfr, float tfl) {
    vec3 base = floor(p);
    vec3 diff = p - base;

    float bl = interpQuintic(bnl, bfl, diff.z);
    float br = interpQuintic(bnr, bfr, diff.z);
    float tl = interpQuintic(tnl, tfl, diff.z);
    float tr = interpQuintic(tnr, tfr, diff.z);

    float l = interpQuintic(bl, tl, diff.y);
    float r = interpQuintic(br, tr, diff.y);
    
    return interpQuintic(l, r, diff.x);
}

const ivec3 bnlv = ivec3(0, 0, 0);
const ivec3 bnrv = ivec3(1, 0, 0);
const ivec3 bfrv = ivec3(1, 0, 1);
const ivec3 bflv = ivec3(0, 0, 1);

const ivec3 tnlv = ivec3(0, 1, 0);
const ivec3 tnrv = ivec3(1, 1, 0);
const ivec3 tfrv = ivec3(1, 1, 1);
const ivec3 tflv = ivec3(0, 1, 1);

const vec3 bnlv2 = vec3(0.f, 0.f, 0.f);
const vec3 bnrv2 = vec3(1.f, 0.f, 0.f);
const vec3 bfrv2 = vec3(1.f, 0.f, 1.f);
const vec3 bflv2 = vec3(0.f, 0.f, 1.f);
const vec3 tnlv2 = vec3(0.f, 1.f, 0.f);
const vec3 tnrv2 = vec3(1.f, 1.f, 0.f);
const vec3 tfrv2 = vec3(1.f, 1.f, 1.f);
const vec3 tflv2 = vec3(0.f, 1.f, 1.f);

const float sqrt3 = 1.732050807568877;
const float sqrt3div2 = 1.732050807568877 / 2.f;
float perlin(vec3 p, float seed) {
    vec3 lp2 = floor(p);

    vec3 bnl = getLatticeVector(lp2 + bnlv2, seed);
    vec3 bnr = getLatticeVector(lp2 + bnrv2, seed);
    vec3 bfr = getLatticeVector(lp2 + bfrv2, seed);
    vec3 bfl = getLatticeVector(lp2 + bflv2, seed);
    vec3 tnl = getLatticeVector(lp2 + tnlv2, seed);
    vec3 tnr = getLatticeVector(lp2 + tnrv2, seed);
    vec3 tfr = getLatticeVector(lp2 + tfrv2, seed);
    vec3 tfl = getLatticeVector(lp2 + tflv2, seed);

    vec3 dp = p - lp2;
    float dotBnl = dot(dp, bnl);
    float dotBnr = dot(dp - bnrv2, bnr);
    float dotBfr = dot(dp - bfrv2, bfr);
    float dotBfl = dot(dp - bflv2, bfl);

    float dotTnl = dot(dp - tnlv2, tnl);
    float dotTnr = dot(dp - tnrv2, tnr);
    float dotTfr = dot(dp - tfrv2, tfr);
    float dotTfl = dot(dp - tflv2, tfl);

    return (sqrt3div2 + interpQuintic3D(p, dotBnl, dotBnr, dotBfr, dotBfl, dotTnl, dotTnr, dotTfr, dotTfl)) / sqrt3;
}

float fbmPerlin(vec3 p,   // The point in 3D space to get perlin value for
    float voxelSize,      // The size of each voxel in perlin lattice
    float nonZeroCutoff,  // The chance that a given lattice vector is nonzero
    float seed,           // Seed for perlin noise.
    int rounds,           // # of rounds of frequency summation/reconstruction
    float ampDecay,       // Amplitude decay per 'octave'.
    float freqGain) {     // Frequency gain per 'octave'.

    float acc = 0.f;
    float amplitude = 1.f;
    float freq = 0.5f;
    float normC = 0.f;
    p /= voxelSize;
    for (int round = 0; round < rounds; round++) {
        acc += amplitude * perlin(p * freq, u_Seed + seed);
        normC += amplitude;
        amplitude *= ampDecay;
        freq *= freqGain;
    }

    return acc / normC;
}

vec3 colorWheelForest(float angle) {
    vec3 a = vec3(0.f, 0.35, 0.f);
    vec3 b = vec3(0.f, 0.10, 0.f);
    vec3 c = vec3(0, 4.f, 0);
    vec3 d = vec3(0, 0.25, 0.75);
    return a + b * cos(2.f * 3.14159 * (c * angle + d));
}

vec3 colorWheelWater(float angle) {
    vec3 a = vec3(0.0, 0.2, 0.5);
    vec3 b = vec3(0.05, 0.2, 0.25);
    vec3 c = vec3(1, 1, 2);
    vec3 d = vec3(0, 0.25, 0.75);
    return a + b * cos(2.f * 3.14159 * (c * angle + d));
}

float getMountainMembership(vec3 p) {
    return fbmPerlin(p, 0.5f, 1.f, 24.f, 4, 0.6f, 2.f);
}

float getForestMembership(vec3 p) {
    return fbmPerlin(p, 0.5f, 1.f, 55.f, 1, 0.6f, 3.f);
}

float getGrassMembership(vec3 p) {
    return fbmPerlin(p * 2.5f, 0.5f, 1.f, 23.f, 3, 0.3f, 4.7f);
}

const int WATER = 0;
const int MOUNTAIN = 1;
const int FOREST = 2;
const int GRASS = 3;
const int GRASS_MOUNTAIN = 4;

int getBiome(
    in vec3 p,
    out float mountain,
    out float forest,
    out float grass) {

    grass = getGrassMembership(p);
    if (grass > u_MountainCutoff) {
        return MOUNTAIN;
    } else if (grass > u_GrassCutoff) {
        forest = (grass + getForestMembership(p)) /  2.f;
        if (forest - grass > u_MountainSpacing && forest > u_ForestCutoff) {
            return FOREST;
        }

        if (grass > u_MountainCutoff - u_MountainGrassCutoff) {
            return GRASS_MOUNTAIN;
        }

        return GRASS;
    }

    mountain = getMountainMembership(p);
    return WATER;
}

float getWaterNoise(vec3 p) {
    return fbmPerlin(p, 0.5f, 0.2f, 999.f, 4, 0.6f, 3.f);
}

float terrainNoisePre(float grassM) {
    float f = clamp((grassM - u_GrassCutoff) / (1.f - u_GrassCutoff), 0.f, 1.f);
    return bias(f, 0.2f) * 0.5f;
}

float terrainNoise(vec3 p) {
    return terrainNoisePre(getGrassMembership(p));
}

vec3 deformTerrainPre(vec3 p, float grassM) {
    float mod = terrainNoisePre(grassM);
    return p * (1.f + mod);
}

vec3 deformTerrain(vec3 p) {
    float mod = terrainNoise(p);
    return p * (1.f + mod);
}

vec3 transformNormal(vec3 p, vec3 dp, vec3 normal, int biome) {
    vec3 tangent =  cross(vec3(0.f, 1.f, 0.f), normal);
    vec3 bitangent = cross(tangent, normal);

    vec3 dt = deformTerrain(p + u_NormDifferential * tangent);
    vec3 db = deformTerrain(p + u_NormDifferential * bitangent);

    return normalize(cross(dp - db, dp - dt));
}

float getDesertBase(vec3 p) {
    float m = fbmPerlin(p, 0.4f, 1.f, 245.f + u_Seed, 1, 0.3f, 3.5f) * 0.8f;
    m = clamp(m, 0.4, 10.f);
    return m;
}

float getDesertGarnish(vec3 p) {
    float layer = fbmPerlin(p * 3.5f, 0.4f, 1.f, 245.f + u_Seed, 2, 0.3f, 3.5f) * 0.8 * 0.3;
    return layer;
}
float getDesertMembership(float base, float garnish) {
    return base * 1.5f + garnish;
}

vec3 deformTerrainDesert(vec3 p) {
    float mod = getDesertMembership(getDesertBase(p), getDesertGarnish(p));
    return p * (1.f + mod / 2.) / 2.;
}

// float getRockNoise(vec3 p) {
//     return fbmPerlin(p, 0.2f, 1.f, 245.f, 3, 0.4f, 3.5f);
// }

// vec3 deformRockTerrain(vec3 p, float noise) {
//     return p * (1. + noise);
// }

const float PI2 = 2.f * 3.14159;
 const float PId2 = 3.14159 / 2.;
vec3 cart2Sph(float x, float y, float z) {
     float r = length(vec3(x, y, z));
     float phi = acos(z / r);
     float theta = PId2 + asin(y / (sin(phi) * r));
     return vec3(theta, phi, r);
}

vec3 sph2Cart(float r, float theta, float phi) {
    return vec3(
        r * cos(theta) * sin(phi),
        r * sin(theta) * sin(phi),
        r * cos(phi));
}

struct Worley {
    vec3 diff;
    vec3 point;
};

const float WORLEY_SQUARES = 20.f;
Worley worley_noise(vec3 uv) {
    vec3 uv_w = uv * WORLEY_SQUARES;
    vec3 uv_int = floor(uv_w);
    float min_dist = 999999.f;
    vec3 min_diff = vec3(0, 0, 0);
    vec3 min_point = vec3(0, 0, 0);
    for (int z = -1; z <=1; z++) {
        for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
                vec3 neighbor = uv_int +  vec3(float(x), float(y), float(z));

                // Work off of absolute coords to help my ailing brain...
                vec3 point = (neighbor + vec3(randomNoise2(neighbor.xyz, 1.f + u_Seed), randomNoise2(neighbor.xyz, 2.f + u_Seed), randomNoise2(neighbor.xyz, 3.f + u_Seed))) / WORLEY_SQUARES;
                vec3 diff = point - uv;
                float lness = 2.f;
                float dist = pow(pow(diff.x, lness) + pow(diff.y, lness), 1.f / lness);
                if (dist < min_dist) {
                    min_dist = dist;
                    min_diff = -diff;
                    min_point = point;
                }
            }
        }
    }
    Worley ww;
    ww.diff = min_diff;
    ww.point = min_point;
    return ww;
}

float getRockNoise(vec3 p) {
    Worley noise = worley_noise(p / 10.f);
    p = (p + noise.point) * length(noise.diff) * 1.3;
    return fbmPerlin(p * 10., 0.2f, 1.f, 871.f + u_Seed, 2, 0.4f, 3.5f);
}

vec3 deformRockTerrain(vec3 p, float noise) {
    return p * (1. + noise);
}