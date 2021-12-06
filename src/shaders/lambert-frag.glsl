#version 300 es

precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;

out vec4 out_Col;

const vec4 lightPos = vec4(0, 0, 0, 1.f);

const float PI2 = 2.f * 3.14159;
const float PId2 = 3.14159 / 2.;


void main()
{
    
    vec4 diffuseColor = vec4(0., 0., 1., 1.);

    float diffuseTerm = 0.5 + dot(normalize(fs_Nor), normalize(lightPos - fs_Pos));
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
    diffuseTerm = smoothstep(0.f, 1.f, diffuseTerm);
    float ambientTerm = 0.3;
    float lightIntensity = diffuseTerm + ambientTerm;
    out_Col = vec4(diffuseColor.xyz * lightIntensity, 1.f);

    // if (sph.x < 0. || sph.y < 0. || sph.z < 0.) {
    //     out_Col = vec4(1., 0., 0., 1.);
    // }
}
