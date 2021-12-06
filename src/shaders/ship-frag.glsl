#version 300 es

precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform sampler2D u_Sampler;
in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;
in vec2 fs_UV;

out vec4 out_Col;

const vec4 lightPos = vec4(15, 5, 3, 1);
void main()
{
    vec4 diffuseColor = texture(u_Sampler, fs_UV);

    float diffuseTerm = 0.5 + dot(normalize(fs_Nor), normalize(lightPos - fs_Pos));
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
    diffuseTerm = smoothstep(0.f, 1.f, diffuseTerm);

    float ambientTerm = 0.3f;
    float lightIntensity = diffuseTerm + ambientTerm;
    out_Col = vec4(diffuseColor.xyz * lightIntensity, 1.f);
}
