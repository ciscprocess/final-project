import { vec4, vec3, mat4, vec2 } from 'gl-matrix';
import { gl } from '../../globals';
import ShaderProgram, { Shader }  from './ShaderProgram';

class SpaceShaderProgram extends ShaderProgram {
    unifInvViewProj: WebGLUniformLocation;

    constructor(uniforms: Array<string>) {
        super([
            new Shader(gl.VERTEX_SHADER, require('../../shaders/space-vert.glsl')),
            new Shader(gl.FRAGMENT_SHADER, require('../../shaders/space-frag.glsl'))
        ], uniforms);

        this.unifInvViewProj = gl.getUniformLocation(this.prog, 'u_InvViewProj');
    }

    setViewProjMatrix(vp: mat4) {
        super.setViewProjMatrix(vp);

        if (this.unifInvViewProj !== -1) {
            let inv = mat4.invert(mat4.create(), vp);
            gl.uniformMatrix4fv(this.unifInvViewProj, false, inv);
        }
    }
};

export default SpaceShaderProgram;