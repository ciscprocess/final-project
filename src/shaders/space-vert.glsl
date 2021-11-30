#version 300 es
in vec4 vs_Pos;

void main()
{
    // Omit view projection since this is used for a primitive raytracer.
    gl_Position = vs_Pos;
}
