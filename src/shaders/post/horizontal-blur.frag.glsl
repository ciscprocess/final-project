#version 300 es
#define LUM_THRESHOLD 0.6
precision highp float;
precision highp int;
in vec2 fs_UV;
out vec4 out_Col;
uniform ivec2 u_Dimensions;

uniform sampler2D u_Sampler;
/*const float gaussian[121] = float[121](
    0.006849, 0.007239, 0.007559, 0.007795, 0.007941, 0.00799, 0.007941, 0.007795, 0.007559, 0.007239, 0.006849,
    0.007239, 0.007653, 0.00799, 0.00824, 0.008394, 0.008446, 0.008394, 0.00824, 0.00799, 0.007653, 0.007239,
    0.007559, 0.00799, 0.008342, 0.008604, 0.008764, 0.008819, 0.008764, 0.008604, 0.008342, 0.00799, 0.007559,
    0.007795, 0.00824, 0.008604, 0.008873, 0.009039, 0.009095, 0.009039, 0.008873, 0.008604, 0.00824, 0.007795,
    0.007941, 0.008394, 0.008764, 0.009039, 0.009208, 0.009265, 0.009208, 0.009039, 0.008764, 0.008394, 0.007941,
    0.00799, 0.008446, 0.008819, 0.009095, 0.009265, 0.009322, 0.009265, 0.009095, 0.008819, 0.008446, 0.00799,
    0.007941, 0.008394, 0.008764, 0.009039, 0.009208, 0.009265, 0.009208, 0.009039, 0.008764, 0.008394, 0.007941,
    0.007795, 0.00824, 0.008604, 0.008873, 0.009039, 0.009095, 0.009039, 0.008873, 0.008604, 0.00824, 0.007795,
    0.007559, 0.00799, 0.008342, 0.008604, 0.008764, 0.008819, 0.008764, 0.008604, 0.008342, 0.00799, 0.007559,
    0.007239, 0.007653, 0.00799, 0.00824, 0.008394, 0.008446, 0.008394, 0.00824, 0.00799, 0.007653, 0.007239,
    0.006849, 0.007239, 0.007559, 0.007795, 0.007941, 0.00799, 0.007941, 0.007795, 0.007559, 0.007239, 0.006849);*/

const float gaussian[11] = 
    float[11](
        0.090825,0.090875,0.090915,0.090943,0.09096,0.090965,0.09096,0.090943,0.090915,0.090875,0.090825);
float factor = 1.f / (10.f);
const int bounds = 5;
void main()
{
    vec3 pointColor = texture(u_Sampler, fs_UV).xyz;
    vec3 avg = vec3(0.);
    for (int dx = -bounds; dx <= bounds; dx++) {
        if (dx != 0) {
            float dfx = float(dx) / float(u_Dimensions.x);
            vec2 uv = vec2(clamp(fs_UV.x + dfx, -1., 1.), fs_UV.y);
            vec3 o_color = texture(u_Sampler, uv).xyz;

            // Use grayscale to approximate luminance.
            float luminance = 0.21 * o_color.r + 0.72 * o_color.g + 0.07 * o_color.b;
            float plum = 0.21 * pointColor.r + 0.72 * pointColor.g + 0.07 * pointColor.b;
            // if (luminance > LUM_THRESHOLD) {
            //     avg += factor * o_color * clamp((LUM_THRESHOLD - plum) / LUM_THRESHOLD, 0.f, 1.f);
            // }
            if (luminance > LUM_THRESHOLD) {
                avg += gaussian[5 + dx] * o_color * clamp((LUM_THRESHOLD - plum) / LUM_THRESHOLD, 0.f, 1.f); 
            }
        }
    }
    

    out_Col = vec4(avg + pointColor, texture(u_Sampler, fs_UV).w);
}
