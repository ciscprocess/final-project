#version 300 es
precision highp float;

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

void main()
{
    vec2 ndc = (gl_FragCoord.xy / vec2(u_Dimensions)) * 2.0 - 1.0;

    vec4 p = vec4(ndc.xy, 1, 1);
    p *= 1000.0;
    p = u_InvViewProj * p;

    out_Col = vec4(0.f, 0.f, 0.f, 1.f);
    vec3 rayDir = normalize(p.xyz - u_Eye);
    for (int i = 0; i < 100; i++) {
        vec3 starDir = normalize(
            random3(vec3(float(i), 1.f + float(i), 1.f)) - vec3(0.5, 0.5, 0.5)
        );
        if (dot(starDir, rayDir) > 0.999995) {
            out_Col = vec4(1.f, 1.f, 1.f, 1.f);
        }
    }
}
