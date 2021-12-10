precision highp float;
precision highp int;
in vec2 fs_UV;
layout (location = 0) out vec4 out_Col;
layout (location = 1) out vec4 out_Col2;
uniform ivec2 u_Dimensions;

uniform sampler2D u_Sampler;
#define KERNEL_SIZE 5

const float gaussian[KERNEL_SIZE] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
void main()
{
    vec3 avg = gaussian[0] * texture(u_Sampler, fs_UV).xyz;
    for (int d = 1; d < KERNEL_SIZE; d++) {
        #ifdef BLUR_HORIZONTAL
        float df = float(d) / float(u_Dimensions.x);
        vec2 uv = vec2(clamp(fs_UV.x + df, -1., 1.), fs_UV.y);
        vec2 uv2 = vec2(clamp(fs_UV.x - df, -1., 1.), fs_UV.y);
        #else
        float df = float(d) / float(u_Dimensions.y);
        vec2 uv = vec2(fs_UV.x, clamp(fs_UV.y + df, -1., 1.));
        vec2 uv2 = vec2(fs_UV.x, clamp(fs_UV.y - df, -1., 1.));
        #endif

        vec3 o_color = texture(u_Sampler, uv).xyz;
        avg += gaussian[d] * o_color;

        o_color = texture(u_Sampler, uv2).xyz;
        avg += gaussian[d] * o_color;
    }
    

    out_Col = vec4(avg, texture(u_Sampler, fs_UV).w);
    out_Col2 = vec4(0.);
}
