#version 300 es
#define LUM_THRESHOLD 0.6
precision highp float;
precision highp int;
in vec2 fs_UV;
layout (location = 0) out vec4 out_Col;
layout (location = 1) out vec4 out_Col2;
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

//const float gaussian[121] = float[121](
    //0.003029,0.004007,0.004981,0.005819,0.006388,0.006589,0.006388,0.005819,0.004981,0.004007,0.003029,0.004007,0.005301,0.006589,0.007697,0.00845,0.008717,0.00845,0.007697,0.006589,0.005301,0.004007,0.004981,0.006589,0.008191,0.009569,0.010504,0.010836,0.010504,0.009569,0.008191,0.006589,0.004981,0.005819,0.007697,0.009569,0.011178,0.012271,0.012658,0.012271,0.011178,0.009569,0.007697,0.005819,0.006388,0.00845,0.010504,0.012271,0.01347,0.013896,0.01347,0.012271,0.010504,0.00845,0.006388,0.006589,0.008717,0.010836,0.012658,0.013896,0.014334,0.013896,0.012658,0.010836,0.008717,0.006589,0.006388,0.00845,0.010504,0.012271,0.01347,0.013896,0.01347,0.012271,0.010504,0.00845,0.006388,0.005819,0.007697,0.009569,0.011178,0.012271,0.012658,0.012271,0.011178,0.009569,0.007697,0.005819,0.004981,0.006589,0.008191,0.009569,0.010504,0.010836,0.010504,0.009569,0.008191,0.006589,0.004981,0.004007,0.005301,0.006589,0.007697,0.00845,0.008717,0.00845,0.007697,0.006589,0.005301,0.004007,0.003029,0.004007,0.004981,0.005819,0.006388,0.006589,0.006388,0.005819,0.004981,0.004007,0.003029
//);
float factor = 1.f / (21.f * 21.f);
const int bounds = 10;
void main()
{
    out_Col = texture(u_Sampler, fs_UV);
    out_Col2 = vec4(0.);
}