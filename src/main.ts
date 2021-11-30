import { vec2, vec3, vec4, mat4 } from 'gl-matrix';
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
import ParticleSwarmCloud from './swarm/ps';
import ShipShaderProgram from './rendering/gl/ShipShaderProgram';
import BoidFlock1987 from './swarm/BoidFlock1987';
import BoidFlock from './swarm/BoidFlock';
import SpaceShaderProgram from './rendering/gl/SpaceShaderProgram';
import ScreenQuad from './geometry/ScreenQuad';

export interface IIndexable {
  [key: string]: any;
}

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls : IIndexable = {
  u_InertiaWeight: 0.6,
  u_IndividualWeight: 0.39,
  u_GroupWeight: 0.01
};

let ship: Ship;
let quad: ScreenQuad;
let flock: BoidFlock;

function loadScene() {
  ship = new Ship(vec3.fromValues(0, 0, 0), 'StarSparrow01.obj', 'StarSparrow_Red.png');
  ship.create();

  quad = new ScreenQuad();
  quad.create();

  let id = mat4.create();
  mat4.identity(id);
  let instanceMats = new Array<mat4>();
  let instanceCols = new Array<vec4>();
  const numShips = 200;

  flock = new BoidFlock1987(numShips, 2);

  for (let i = 0; i < flock.boids.length; i++) {
    let part = flock.boids[i];
    let trans = mat4.create();
    mat4.translate(trans, id, part.x);
    mat4.scale(trans, trans, vec3.fromValues(0.06, 0.06, 0.06));

    instanceMats.push(trans);
    instanceCols.push(vec4.fromValues(0, 1, 0, 1));
  }

  ship.setInstanceVBOs(instanceMats, instanceCols);
  ship.initDirections();
  ship.updateDirections(function(dirs: Float32Array) {
    for (let i = 0; i < flock.boids.length; i++) {
      let part = flock.boids[i];
      dirs[4 * i] = part.v[0];
      dirs[4 * i + 1] = part.v[1];
      dirs[4 * i + 2] = part.v[2];
      dirs[4 * i + 3] = 0;
    }
  });
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
  for (let v in controls) {
    if (v.startsWith("u_")) {
      gui.add(controls, v);
    }
  }

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

  let uniformVars = [];
  for (let key in controls) {
    if (key.startsWith("u_")) {
      uniformVars.push(key);
    }
  }

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ], uniformVars);

  const shipShader = new ShipShaderProgram(uniformVars);
  const spaceShader = new SpaceShaderProgram(uniformVars);
  shipShader.setTexture(ship.texture);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    //renderer.clear();
    
    // for (let key in controls) {
    //   if (key.startsWith("u_")) {
    //     lambert.setCustomUniform(key, controls[key]);
    //     shipShader.setCustomUniform(key, controls[key]);
    //   }
    // }

    flock.stepBoids();
    ship.updateTransVBOs(function(t1: Float32Array, t2: Float32Array, t3: Float32Array, t4: Float32Array) {
      let ships = flock.boids;
      for (let i = 0; i < ships.length; i++) {
        let ship = ships[i];
        t4[i * 4] = ship.x[0];
        t4[i * 4 + 1] = ship.x[1];
        t4[i * 4 + 2] = ship.x[2];
      }
    });

    ship.updateDirections(function(dirs: Float32Array) {
      for (let i = 0; i < flock.boids.length; i++) {
        let part = flock.boids[i];
        dirs[4 * i] = part.v[0];
        dirs[4 * i + 1] = part.v[1];
        dirs[4 * i + 2] = part.v[2];
        dirs[4 * i + 3] = 0;
      }
    });

    renderer.render(camera, spaceShader, [quad]);
    renderer.render(camera, shipShader, [ship]);
    stats.end();

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
