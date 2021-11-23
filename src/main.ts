import { vec3, vec4, mat4 } from 'gl-matrix';
const Stats = require('stats-js');
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import { setGL } from './globals';
import ShaderProgram, { Shader } from './rendering/gl/ShaderProgram';
import Ship from './geometry/Ship';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  color: [128, 128, 128],
  warpDirectionX: 1,
  warpDirectionY: 0,
  warpDirectionZ: 0
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let ship: Ship;
let prevTesselations: number = 5;
let ticks: number = 0;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
  ship = new Ship(vec3.fromValues(0, 0, 0));
  ship.create();
  let id = mat4.create();
  mat4.identity(id);
  let instanceMats = new Array<mat4>();
  let instanceCols = new Array<vec4>();
  const numShips = 10000;
  for (let i = 0; i < numShips; i++) {
    let trans = mat4.create();
    mat4.translate(trans, id, vec3.fromValues(0,0,0));//Math.random(), Math.random(), Math.random()));
    instanceMats.push(trans);
    instanceCols.push(vec4.fromValues(0, 1, 0, 1));
  }
  ship.setInstanceVBOs(instanceMats, instanceCols);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'Load Scene');
  gui.add(controls, 'warpDirectionX');
  gui.add(controls, 'warpDirectionY');
  gui.add(controls, 'warpDirectionZ');
  gui.addColor(controls, 'color');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement>document.getElementById('canvas');
  const gl = <WebGL2RenderingContext>canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);
  
  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    if (controls.tesselations != prevTesselations) {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }

    ship.updatePosVBOs(function(t1: Float32Array, t2: Float32Array, t3: Float32Array, t4: Float32Array) {
      let insts = t1.length / 4;
      for (let i = 0; i < insts; i++) {
        t4[i * 4] += (Math.random() - 0.5) / 5;
        t4[i * 4 + 1] += (Math.random() - 0.5) / 5;
        t4[i * 4 + 2] += (Math.random() - 0.5) / 5;
      }
    });

    lambert.setGeometryColor(
      vec4.fromValues(
        controls.color[0] / 255.,
        controls.color[1] / 255.,
        controls.color[2] / 255.,
        1));

    lambert.setWarpDirection(
      vec3.fromValues(
        controls.warpDirectionX,
        controls.warpDirectionY,
        controls.warpDirectionZ));

    lambert.setModelMatrix(mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(4, 0, 0)));
    renderer.render(camera, lambert, [
      ship
    ]);
    stats.end();
    ticks += 0.05;

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
