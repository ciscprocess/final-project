#version 300 es

uniform sampler2D u_ColorTex1;
uniform sampler2D u_ColorTex2;
uniform sampler2D u_DepthTex1;
uniform sampler2D u_DepthTex2;

in vec2 fs_UV;
out vec4 out_Col;

// SOURCE: https://stackoverflow.com/questions/47541674/merging-two-separate-framebuffers-onto-default-framebuffer-after-depth-testing
void main()
{
    ivec2 texcoord = ivec2(floor(gl_FragCoord.xy));
    float depth0 = texelFetch(Depth0, texcoord, 0).r;
    float depth1 = texelFetch(Depth1, texcoord, 0).r;

    // possibly reversed depending on your depth buffer ordering strategy
    if (depth0 < depth1) {
        FragColor = texelFetch(Color0, texcoord, 0);
    } else {
        FragColor = texelFetch(Color1, texcoord, 0);
    }
}