#version 300 es
precision highp float;
precision highp int;

uniform sampler2D u_ColorTex1;
uniform sampler2D u_ColorTex2;
uniform sampler2D u_DepthTex1;
uniform sampler2D u_DepthTex2;

in vec2 fs_UV;
layout (location = 0) out vec4 out_Col;
layout (location = 1) out vec4 out_Col2;

// SOURCE: https://stackoverflow.com/questions/47541674/merging-two-separate-framebuffers-onto-default-framebuffer-after-depth-testing
void main()
{
    ivec2 texcoord = ivec2(floor(gl_FragCoord.xy));
    vec3 baseColor = texelFetch(u_ColorTex1, texcoord, 0).xyz;
    vec3 blurColor = texelFetch(u_ColorTex2, texcoord, 0).xyz;

    const float gamma = 1.6;
    const float exposure = 0.6f;
    baseColor = baseColor * 1.2 + 0.8 * blurColor; // additive blending

    // tone mapping
    vec3 result = vec3(1.0) - exp(-baseColor * exposure);   
    result = pow(result, vec3(1.0 / gamma));
    out_Col = vec4(result, texelFetch(u_ColorTex1, texcoord, 0).w);
}