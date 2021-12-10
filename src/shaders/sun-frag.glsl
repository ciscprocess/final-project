#version 300 es

precision highp float;
precision highp int;

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform sampler2D u_Sampler;
uniform float u_Seed;

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;


layout (location = 0) out vec4 out_Col;
layout (location = 1) out vec4 out_Col2;

const vec4 lightPos = vec4(15, 5, 3, 1);

uniform int u_Time;

float randomNoise2(vec3 p, float seed) {
    return fract(sin(dot(p, vec3(12.9898, -78.233, 133.999)))  * (43758.5453 + seed + u_Seed));
}

float randomNoise3(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float randomNoise3(vec3 co){
    float noise = randomNoise3(co.xy);
    return randomNoise3(vec2(noise, co.z));
}

float bias(float time, float bias) {
    return (time / ((((1.0 / bias) - 2.0) * (1.0 - time)) + 1.0));
}

vec3 getLatticeVector(ivec3 p, float cutoff, float seed) {
    vec3 p2 = vec3(float(p.x), float(p.y), float(p.z));
    float x = -1.f + 2.f * randomNoise2(p2, 1201.f + seed);
    float y = -1.f + 2.f * randomNoise2(p2, 44402.f + seed);
    float z = -1.f + 2.f * randomNoise2(p2, 23103.f + seed);

    return vec3(x, y, z);
}

float interpQuintic(float x, float a, float b) {
    float mod = 1.f - 6.f * pow(x, 5.f) + 15.f * pow(x, 4.f) - 10.f * pow(x, 3.f);
    return mix(a, b, 1.f - mod);
}

float interpQuintic3D(vec3 p, float bnl, float bnr, float bfr, float bfl, float tnl, float tnr, float tfr, float tfl) {
    vec3 base = floor(p);
    vec3 diff = p - base;

    float bl = interpQuintic(diff.z, bnl, bfl);
    float br = interpQuintic(diff.z, bnr, bfr);
    float tl = interpQuintic(diff.z, tnl, tfl);
    float tr = interpQuintic(diff.z, tnr, tfr);

    float l = interpQuintic(diff.y, bl, tl);
    float r = interpQuintic(diff.y, br, tr);

    return interpQuintic(diff.x, l, r);
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
float perlin(vec3 p, float voxelSize, float nonZeroCutoff, float seed) {
    p /= voxelSize;
    vec3 lp2 = floor(p);
    ivec3 lp = ivec3(floor(p.x), floor(p.y), floor(p.z));

    vec3 bnl = getLatticeVector(lp + bnlv, nonZeroCutoff, seed);
    vec3 bnr = getLatticeVector(lp + bnrv, nonZeroCutoff, seed);
    vec3 bfr = getLatticeVector(lp + bfrv, nonZeroCutoff, seed);
    vec3 bfl = getLatticeVector(lp + bflv, nonZeroCutoff, seed);
    vec3 tnl = getLatticeVector(lp + tnlv, nonZeroCutoff, seed);
    vec3 tnr = getLatticeVector(lp + tnrv, nonZeroCutoff, seed);
    vec3 tfr = getLatticeVector(lp + tfrv, nonZeroCutoff, seed);
    vec3 tfl = getLatticeVector(lp + tflv, nonZeroCutoff, seed);

    float dotBnl = dot(p - lp2, bnl);
    float dotBnr = dot(p - lp2 - bnrv2, bnr);
    float dotBfr = dot(p - lp2 - bfrv2, bfr);
    float dotBfl = dot(p - lp2 - bflv2, bfl);

    float dotTnl = dot(p - lp2 - tnlv2, tnl);
    float dotTnr = dot(p - lp2 - tnrv2, tnr);
    float dotTfr = dot(p - lp2 - tfrv2, tfr);
    float dotTfl = dot(p - lp2 - tflv2, tfl);

    return (sqrt3/2.f + interpQuintic3D(p, dotBnl, dotBnr, dotBfr, dotBfl, dotTnl, dotTnr, dotTfr, dotTfl)) / sqrt3;
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
    for (int round = 0; round < rounds; round++) {
        acc += amplitude * perlin(p * freq, voxelSize, nonZeroCutoff, seed);
        normC += amplitude;
        amplitude *= ampDecay;
        freq *= freqGain;
    }

    return acc / normC;
}

vec3 firePalette(float i){

    float T = 1400. + 1300.*i; // Temperature range (in Kelvin).
    vec3 L = vec3(7.4, 5.6, 4.4); // Red, green, blue wavelengths (in hundreds of nanometers).
    L = pow(L,vec3(5.0)) * (exp(1.43876719683e5/(T*L))-1.0);
    return 1.0-exp(-5e8/L); // Exposure level. Set to "50." For "70," change the "5" to a "7," etc.
}

void main()
{
    //vec3 sph = cart2Sph(fs_Pos.x, fs_Pos.y, fs_Pos.z) / vec3(PI2);
    vec3 p = fs_Pos.xyz / 2.f;
    float iTime = float(u_Time) / 100.f;
    float t = fbmPerlin(p + vec3(0., 0., 1.f) * iTime / 6.f, 0.3f, 0.f, 1.f, 2, 0.6, 3.f);
    float t2 = fbmPerlin(p + vec3(0., 0., 1.f) * iTime / 6.f, 0.3f, 0.f, 2.f, 2, 0.6, 3.f);
    t = 1.3f * fbmPerlin(vec3(p.x + t, p.y + t2, p.z) + vec3(0.f, 0.f, 1.f) * iTime / 10.f, 0.3f, 0.f, 2.f, 1, 0.6, 3.f);
    vec3 col = firePalette(bias(t, 0.65));

    out_Col = vec4(col, 1.f); //vec4(diffuseColor.xyz * lightIntensity, 1.f);
    out_Col2 = vec4(0.f);
}
