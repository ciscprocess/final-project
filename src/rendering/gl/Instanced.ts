import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

class Instanced extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  colors: Float32Array;
  normals: Float32Array;
  transCol1: Float32Array;
  transCol2: Float32Array;
  transCol3: Float32Array;
  transCol4: Float32Array;

  numInstances: number;
  bufCol: WebGLBuffer;
  bufTrans1: WebGLBuffer;
  bufTrans2: WebGLBuffer;
  bufTrans3: WebGLBuffer;
  bufTrans4: WebGLBuffer;
  colGenerated: boolean = false;
  trans1Generated: boolean = false;
  trans2Generated: boolean = false;
  trans3Generated: boolean = false;
  trans4Generated: boolean = false;


  constructor() {
    super(); // Call the constructor of the super class. This is required.
  }

  create() {
    this.generateCol();
    this.generateTrans1();
    this.generateTrans2();
    this.generateTrans3();
    this.generateTrans4();
  }

  setInstanceVBOs(
    transMats: Array<mat4>,
    colors: Array<vec4>) {

    let trans1Array:Array<number> = [];
    let trans2Array:Array<number> = [];
    let trans3Array:Array<number> = [];
    let trans4Array:Array<number> = [];
    let colorsArray = [];

    for (let i = 0; i < transMats.length; i++) {
        let trans = transMats[i];
        let col = colors[i];
        trans1Array.push(trans[0]);
        trans1Array.push(trans[1]);
        trans1Array.push(trans[2]);
        trans1Array.push(trans[3]);

        trans2Array.push(trans[4]);
        trans2Array.push(trans[5]);
        trans2Array.push(trans[6]);
        trans2Array.push(trans[7]);

        trans3Array.push(trans[8]);
        trans3Array.push(trans[9]);
        trans3Array.push(trans[10]);
        trans3Array.push(trans[11]);

        trans4Array.push(trans[12]);
        trans4Array.push(trans[13]);
        trans4Array.push(trans[14]);
        trans4Array.push(trans[15]);

        colorsArray.push(col[0]);
        colorsArray.push(col[1]);
        colorsArray.push(col[2]);
        colorsArray.push(col[3]);
    }

    let colorFloats: Float32Array = new Float32Array(colorsArray);
    this.setNumInstances(transMats.length);

    this.colors = colorFloats;
    this.transCol1 = new Float32Array(trans1Array);
    this.transCol2 = new Float32Array(trans2Array);
    this.transCol3 = new Float32Array(trans3Array);
    this.transCol4 = new Float32Array(trans4Array);

    if (!this.bindCol()) {
      console.error("Instance col not bound!");
    }
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    if (!this.bindTrans1()) {
      console.error("1st trans column not generated!");
    };
    gl.bufferData(gl.ARRAY_BUFFER, this.transCol1, gl.STATIC_DRAW);

    if (!this.bindTrans2()) {
      console.error("2nd trans column not generated!");
    };
    gl.bufferData(gl.ARRAY_BUFFER, this.transCol2, gl.STATIC_DRAW);

    if (!this.bindTrans3()) {
      console.error("3rd trans column not generated!");
    };
    gl.bufferData(gl.ARRAY_BUFFER, this.transCol3, gl.STATIC_DRAW);

    if (!this.bindTrans4()) {
      console.error("4th trans column not generated!");
    };
    gl.bufferData(gl.ARRAY_BUFFER, this.transCol4, gl.STATIC_DRAW);
  }

  updateTransVBOs(action: Function) {
    action(this.transCol1, this.transCol2, this.transCol3, this.transCol4);

    if (!this.bindCol()) {
      console.error("Instance col not bound!");
    }
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    if (!this.bindTrans1()) {
      console.error("1st trans column not generated!");
    };
    gl.bufferData(gl.ARRAY_BUFFER, this.transCol1, gl.STATIC_DRAW);

    if (!this.bindTrans2()) {
      console.error("2nd trans column not generated!");
    };
    gl.bufferData(gl.ARRAY_BUFFER, this.transCol2, gl.STATIC_DRAW);

    if (!this.bindTrans3()) {
      console.error("3rd trans column not generated!");
    };
    gl.bufferData(gl.ARRAY_BUFFER, this.transCol3, gl.STATIC_DRAW);

    if (!this.bindTrans4()) {
      console.error("4th trans column not generated!");
    };
    gl.bufferData(gl.ARRAY_BUFFER, this.transCol4, gl.STATIC_DRAW);
  }

  generateCol() {
    this.colGenerated = true;
    this.bufCol = gl.createBuffer();
  }

  generateTrans1() {
    this.trans1Generated = true;
    this.bufTrans1 = gl.createBuffer();
  }

  generateTrans2() {
    this.trans2Generated = true;
    this.bufTrans2 = gl.createBuffer();
  }

  generateTrans3() {
    this.trans3Generated = true;
    this.bufTrans3 = gl.createBuffer();
  }

  generateTrans4() {
    this.trans4Generated = true;
    this.bufTrans4 = gl.createBuffer();
  }

  bindCol(): boolean {
    if (this.colGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    }

    return this.colGenerated;
  }

  bindTrans1(): boolean {
    if (this.trans1Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTrans1);
    }

    return this.trans1Generated;
  }

  bindTrans2(): boolean {
    if (this.trans2Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTrans2);
    }

    return this.trans2Generated;
  }

  bindTrans3(): boolean {
    if (this.trans3Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTrans3);
    }

    return this.trans3Generated;
  }

  bindTrans4(): boolean {
    if (this.trans4Generated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTrans4);
    }

    return this.trans4Generated;
  }

  setNumInstances(num: number) {
    this.numInstances = num;
  }
};

export default Instanced;