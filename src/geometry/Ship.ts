import {vec3, vec4} from 'gl-matrix';
import {gl} from '../globals';
import Instanced from '../rendering/gl/Instanced';
import * as Loader from 'webgl-obj-loader';

function loadFileSync(path:string) {
  let request = new XMLHttpRequest();
  request.open("GET", path, false);
  request.send();
  if (request.status !== 200) {
    alert('Cannot load ' + path);
  }

  return request.responseText;
}

function loadTexture(url: string) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be downloaded over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn off mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value: number) {
  return (value & (value - 1)) == 0;
}

class Ship extends Instanced {
  objString: string;
  center: vec4;
  dirGenerated: boolean = false;
  bufDirection: WebGLBuffer;
  directions: Float32Array;
  uvs: Float32Array;
  texture: WebGLTexture;

  constructor(pos: vec3, objPath: string, texturePath: string) {
    super();
    this.center = vec4.fromValues(pos[0], pos[1], pos[2], 1);
    this.objString = loadFileSync(objPath);
    this.texture = loadTexture(texturePath);
  }

  create() {
    super.create();
    // this.indices = new Uint32Array([
    //   0, 1, 2,
    //   0, 2, 3,

    //   4, 5, 6,
    //   4, 6, 7,

    //   8, 9, 10,
    //   8, 10, 11,

    //   12, 13, 14,
    //   12, 14, 15,

    //   16, 17, 18,
    //   16, 18, 19,

    //   20, 21, 22,
    //   20, 22, 23]);
    // this.normals = new Float32Array([0, 0, 1, 0,
    //     0, 0, 1, 0,
    //     0, 0, 1, 0,
    //     0, 0, 1, 0,

    //     0, 0, -1, 0,
    //     0, 0, -1, 0,
    //     0, 0, -1, 0,
    //     0, 0, -1, 0,

    //     1, 0, 0, 0,
    //     1, 0, 0, 0,
    //     1, 0, 0, 0,
    //     1, 0, 0, 0,

    //     -1, 0, 0, 0,
    //     -1, 0, 0, 0,
    //     -1, 0, 0, 0,
    //     -1, 0, 0, 0,

    //     0, 1, 0, 0,
    //     0, 1, 0, 0,
    //     0, 1, 0, 0,
    //     0, 1, 0, 0,

    //     0, -1, 0, 0,
    //     0, -1, 0, 0,
    //     0, -1, 0, 0,
    //   0, -1, 0, 0]);
    // this.positions = new Float32Array([
    //   -1, -1, 1, 1,
    //   1, -1, 1, 1,
    //   1, 1, 1, 1,
    //   -1, 1, 1, 1,

    //   -1, -1, -1, 1,
    //   1, -1, -1, 1,
    //   1, 1, -1, 1,
    //   -1, 1, -1, 1,

    //   1, -1, -1, 1,
    //   1, 1, -1, 1,
    //   1, 1, 1, 1,
    //   1, -1, 1, 1,

    //   -1, -1, -1, 1,
    //   -1, 1, -1, 1,
    //   -1, 1, 1, 1,
    //   -1, -1, 1, 1,

    //   -1, 1, -1, 1,
    //   1, 1, -1, 1,
    //   1, 1, 1, 1,
    //   -1, 1, 1, 1,

    //   -1, -1, -1, 1,
    //   1, -1, -1, 1,
    //   1, -1, 1, 1,
    //   -1, -1, 1, 1]);

    let posTemp: Array<number> = [];
    let norTemp: Array<number> = [];
    let uvsTemp: Array<number> = [];
    let idxTemp: Array<number> = [];

    var loadedMesh = new Loader.Mesh(this.objString);

    for (var i = 0; i < loadedMesh.vertices.length; i++) {
      posTemp.push(loadedMesh.vertices[i]);
      if (i % 3 == 2) posTemp.push(1.0);
    }

    for (var i = 0; i < loadedMesh.vertexNormals.length; i++) {
      norTemp.push(loadedMesh.vertexNormals[i]);
      if (i % 3 == 2) norTemp.push(0.0);
    }

    uvsTemp = loadedMesh.textures;
    idxTemp = loadedMesh.indices;

    // white vert color for now
    this.colors = new Float32Array(posTemp.length);
    for (var i = 0; i < posTemp.length; ++i) {
      this.colors[i] = 1.0;
    }

    this.indices = new Uint32Array(idxTemp);
    this.normals = new Float32Array(norTemp);
    this.positions = new Float32Array(posTemp);
    this.uvs = new Float32Array(uvsTemp);

    this.directions = new Float32Array(this.numInstances * 4);

    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateUV();
    this.generateTrans1();
    this.generateTrans2();
    this.generateTrans3();
    this.generateTrans4();
    this.generateDirection();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufUV);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
  }

  initDirections() {
    this.directions = new Float32Array(this.numInstances * 4);
  }

  updateDirections(action: Function) {
    action(this.directions);

    if (!this.bindDirection()) {
      console.error('Cannot bind instanced directions!');
    }

    gl.bufferData(gl.ARRAY_BUFFER, this.directions, gl.STATIC_DRAW);
  }

  generateDirection() {
    this.bufDirection = gl.createBuffer();
    this.dirGenerated = true;
  }

  bindDirection(): boolean {
    if (this.dirGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufDirection);
    }
    return this.dirGenerated;
  }

  drawMode() {
    return gl.TRIANGLES;
  }
};

export default Ship;