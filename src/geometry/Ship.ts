import {vec3, vec4} from 'gl-matrix';
import {gl} from '../globals';
import Instanced from '../rendering/gl/Instanced';

class Ship extends Instanced {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;

  constructor(pos: vec3) {
    super();
    this.center = vec4.fromValues(pos[0], pos[1], pos[2], 1);
  }

  create() {

    this.indices = new Uint32Array([0]);
    this.normals = new Float32Array([0, 0, 1, 0]);
    this.positions = new Float32Array(this.center);

    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateTrans1();
    this.generateTrans2();
    this.generateTrans3();
    this.generateTrans4();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
  }

  drawMode() : GLenum {
      return gl.POINTS;
  }
};

export default Ship;