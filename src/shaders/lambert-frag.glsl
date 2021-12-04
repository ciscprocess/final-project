#version 300 es

precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform sampler2D u_Sampler;

in vec4 fs_Pos;
in vec4 fs_Nor;
in vec4 fs_Col;

out vec4 out_Col;

const vec4 lightPos = vec4(0, 0, 0, 1.f);

const float PI2 = 2.f * 3.14159;
const float PId2 = 3.14159 / 2.;
vec3 cart2Sph(float x, float y, float z) {
    float r = length(vec3(x, y, z));
    float phi = acos(z / r);
    float theta = PId2 + asin(y / (sin(phi) * r));
    return vec3(theta, phi, r);
}


void main()
{
    vec3 sph = cart2Sph(fs_Pos.x, fs_Pos.y, fs_Pos.z) / vec3(PI2);
    
    vec4 diffuseColor = vec4(texture(u_Sampler, sph.xy).xyz, 1.f);//fs_Col;//vec4(0.6f, 0.f, 0.f, 1.f);

    float diffuseTerm = dot(normalize(fs_Nor), normalize(lightPos - fs_Pos));
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);

    float ambientTerm = 0.2;
    float lightIntensity = diffuseTerm + ambientTerm;
    out_Col = vec4(diffuseColor.xyz * lightIntensity, 1.f);

    // if (sph.x < 0. || sph.y < 0. || sph.z < 0.) {
    //     out_Col = vec4(1., 0., 0., 1.);
    // }
}
