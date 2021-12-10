#version 300 es
precision highp float;
precision highp int;

uniform mat4 u_InvViewProj;
uniform ivec2 u_Dimensions;
uniform vec3 u_Eye;

out vec4 out_Col;

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p, vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)))) * 43758.5453);
}

vec3 random3( vec3 p ) {
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


void main()
{
    vec2 ndc = (gl_FragCoord.xy / vec2(u_Dimensions)) * 2.0 - 1.0;

    vec4 p = vec4(ndc.xy, 1, 1);
    p *= 1.0;
    p = u_InvViewProj * p;

    out_Col = vec4(0.f, 0.f, 0.f, 1.f);
    vec3 rayDir = normalize(p.xyz - u_Eye);
    vec3 rayOctants = sign(rayDir);
    for (int i = 0; i < 40; i++) {
        vec3 starDir = normalize(random3(vec3(float(i), 1.f + float(i), 2.f)) * rayOctants);
        
        const float rayDotMax = 0.99999995;
        const float rayDotMin = 0.99999;

        vec3 props = random3(vec3(float(i), 1.f + float(i), 5.f));
        float rayDotThresh = mix(rayDotMin, rayDotMax, props.x);

        //const float rayDotMax = 0.99997;
        vec3 white = colorWheelStars(props.x * 2.f) * mix(0.2, 1., props.y);
        out_Col = max(vec4(white * exp((dot(starDir, rayDir) - rayDotThresh) * 130000.f), 1.f), out_Col);
    //     if (dot(starDir, rayDir) > rayDotMax) {
    //         out_Col = vec4(1.f);
    //     }
    }
}