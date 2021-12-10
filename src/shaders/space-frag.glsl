#version 300 es
precision highp float;
precision highp int;

uniform mat4 u_InvViewProj;
uniform ivec2 u_Dimensions;
uniform float u_Seed;

layout (location = 0) out vec4 out_Col;
layout (location = 1) out vec4 out_Col2;

vec3 random3 (vec3 p) {
    return fract(sin(vec3(dot(p,vec3(127.1, 311.7, 191.999)),
                          dot(p,vec3(269.5, 183.3, 765.54)),
                          dot(p, vec3(420.69, 631.2,109.21))))
                 *43758.5453);
}

vec3 colorWheelStars(float angle) {
    // [[1.008 0.908 0.898] [0.088 -0.052 0.058] [1.648 1.518 2.348] [0.000 0.308 0.667]]
    vec3 a = vec3(1.008, 0.908, 0.898);
    vec3 b = vec3(0.088, -0.052, 0.058);
    vec3 c = vec3(1.648, 1.518, 2.348);
    vec3 d = vec3(0.000, 0.308, 0.667);
    return (a + b * cos(2.f * 3.14159 * (c * angle + d)));
}

const float rayDotMax = 0.99999995;
const float rayDotMin = 0.99999;
void main()
{
    vec2 ndc = (gl_FragCoord.xy / vec2(u_Dimensions)) * 2.0 - 1.0;
    vec4 p = vec4(ndc.xy, 1, 1);
    p = u_InvViewProj * p;
    vec3 rayDir = normalize(p.xyz);

    // check 8 octants at once to save looping.
    // probably should do into 32nd's even, but no time.
    vec3 rayOctants = sign(rayDir);
    for (int i = 0; i < 14; i++) {
        vec3 starDir = normalize(random3(vec3(float(i), 1.f + float(i) + u_Seed, 2.f) * rayOctants)* rayOctants);
        vec3 props = random3(vec3(float(i) + u_Seed, 1.f + float(i), 5.f));

        // start 'soft' radius.
        float rayDotThresh = mix(rayDotMin, rayDotMax, props.x);
        vec3 white = colorWheelStars(props.x * 2.f) * mix(0.2, 1., props.y);
        out_Col = max(vec4(white * exp((dot(starDir, rayDir) - rayDotThresh) * 130000.f), 1.f), out_Col);
    }

    out_Col2 = vec4(0.);
}