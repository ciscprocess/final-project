#version 300 es

precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;

out vec4 out_Col;

const vec4 lightPos = vec4(15, 5, 3, 1);
void main()
{
    vec4 diffuseColor = vec4(0.6f, 0.f, 0.f, 1.f);

    float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_Pos - lightPos));
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);

    float ambientTerm = 0.2;
    float lightIntensity = diffuseTerm + ambientTerm;
    out_Col = diffuseColor * lightIntensity;
}
