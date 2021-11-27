import { vec4, vec3, mat4 } from 'gl-matrix';
import Drawable from './Drawable';
import Instanced from './Instanced';
import { gl } from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;
  attrCol: number;
  ticks: number;

  attrTrans1: number;
  attrTrans2: number;
  attrTrans3: number;
  attrTrans4: number;

  unifModel: WebGLUniformLocation;
  unifModelInvTr: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;
  unifColor: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;
  unifCustomMap: Map<string, WebGLUniformLocation>;

  constructor(shaders: Array<Shader>, uniforms: Array<string>) {
    this.prog = gl.createProgram();
    this.ticks = 0;

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }

    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");
    this.attrCol = gl.getAttribLocation(this.prog, "vs_Col");
    this.attrTrans1 = gl.getAttribLocation(this.prog, "vs_Trans1");
    this.attrTrans2 = gl.getAttribLocation(this.prog, "vs_Trans2");
    this.attrTrans3 = gl.getAttribLocation(this.prog, "vs_Trans3");
    this.attrTrans4 = gl.getAttribLocation(this.prog, "vs_Trans4");
    this.unifModel = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTr = gl.getUniformLocation(this.prog, "u_ModelInvTr");
    this.unifViewProj = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifColor = gl.getUniformLocation(this.prog, "u_Color");
    this.unifTime = gl.getUniformLocation(this.prog, "u_Time");

    this.unifCustomMap = new Map<string, WebGLUniformLocation>();

    for (let v = 0; v < uniforms.length; v++) {
      this.unifCustomMap.set(uniforms[v], gl.getUniformLocation(this.prog, uniforms[v]));
    }
  }

  setCustomUniform(name: string, val: any) {
    this.use();
    if (!this.unifCustomMap.has(name)) {
      return;
    }
  
    let handle = this.unifCustomMap.get(name);
    if (handle === -1) {
      return;
    }
  
    if (typeof val == 'number') {
      gl.uniform1f(handle, val);
    } else if (typeof val == 'boolean') {
      gl.uniform1i(handle, val ? 1 : 0);
    }
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  tickTime() {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1i(this.unifTime, this.ticks++);
      console.log('tiiicks: ' + this.ticks);
    } else {
      console.log('Cannot find time var.');
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTr !== -1) {
      let modelinvtr: mat4 = mat4.create();
      mat4.transpose(modelinvtr, model);
      mat4.invert(modelinvtr, modelinvtr);
      gl.uniformMatrix4fv(this.unifModelInvTr, false, modelinvtr);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setGeometryColor(color: vec4) {
    this.use();
    if (this.unifColor !== -1) {
      gl.uniform4fv(this.unifColor, color);
    }
  }

  draw(d: Drawable) {
    if (d instanceof Instanced) {
      this.drawInstanced(d);
      return;
    }

    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
  }

  drawInstanced(d: Instanced) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrPos, 0); // Advance 1 index in pos VBO for each vertex
    }

    if (this.attrNor != -1 && d.bindNor()) {
      gl.enableVertexAttribArray(this.attrNor);
      gl.vertexAttribPointer(this.attrNor, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrNor, 0); // Advance 1 index in nor VBO for each vertex
    }

    if (this.attrTrans1 != -1 && d.bindTrans1()) {
      gl.enableVertexAttribArray(this.attrTrans1);
      gl.vertexAttribPointer(this.attrTrans1, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTrans1, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    if (this.attrTrans2 != -1 && d.bindTrans2()) {
      gl.enableVertexAttribArray(this.attrTrans2);
      gl.vertexAttribPointer(this.attrTrans2, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTrans2, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    if (this.attrTrans3 != -1 && d.bindTrans3()) {
      gl.enableVertexAttribArray(this.attrTrans3);
      gl.vertexAttribPointer(this.attrTrans3, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTrans3, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    if (this.attrTrans4 != -1 && d.bindTrans4()) {
      gl.enableVertexAttribArray(this.attrTrans4);
      gl.vertexAttribPointer(this.attrTrans4, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(this.attrTrans4, 1); // Advance 1 index in translate VBO for each drawn instance
    }

    d.bindIdx();
    gl.drawElementsInstanced(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0, d.numInstances);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrNor != -1) gl.disableVertexAttribArray(this.attrNor);
    if (this.attrCol != -1) gl.disableVertexAttribArray(this.attrCol);
    if (this.attrTrans1 != -1) gl.disableVertexAttribArray(this.attrTrans1);
    if (this.attrTrans2 != -1) gl.disableVertexAttribArray(this.attrTrans2);
    if (this.attrTrans3 != -1) gl.disableVertexAttribArray(this.attrTrans3);
    if (this.attrTrans4 != -1) gl.disableVertexAttribArray(this.attrTrans4);
  }
};

export default ShaderProgram;
