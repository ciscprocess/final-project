import { vec4, vec3, mat4 } from 'gl-matrix';
import Drawable from './Drawable';
import { gl } from '../../globals';
import ShaderProgram, { Shader }  from './ShaderProgram';
import Ship from '../../geometry/Ship';

class ShipShaderProgram extends ShaderProgram {
    attrDirection: number;
    attrUV: number;

    constructor(uniforms: Array<string>) {
        super([
            new Shader(gl.VERTEX_SHADER, require('../../shaders/ship-vert.glsl')),
            new Shader(gl.FRAGMENT_SHADER, require('../../shaders/ship-frag.glsl'))
        ], uniforms);

        this.attrDirection = gl.getAttribLocation(this.prog, "vs_Direction");
        this.attrUV = gl.getAttribLocation(this.prog, "vs_UV");
    }

    draw(d: Drawable) {
        if (!(d instanceof Ship)) {
            throw new Error('Cannot draw non-ship with ship shader.');
        }

        if (this.attrDirection != -1 && d.bindDirection()) {
            gl.enableVertexAttribArray(this.attrDirection);
            gl.vertexAttribPointer(this.attrDirection, 4, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrDirection, 1);
        }

        if (this.attrUV != -1 && d.bindUV()) {
            gl.enableVertexAttribArray(this.attrUV);
            gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(this.attrUV, 0);
        }

        this.drawInstanced(d);
    }
};

export default ShipShaderProgram;
