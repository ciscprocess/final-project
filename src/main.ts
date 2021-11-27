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

export interface IIndexable {
  [key: string]: any;
}

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls : IIndexable = {
  tesselations: 5,
  u_InertiaWeight: 0.6,
  u_IndividualWeight: 0.39,
  u_GroupWeight: 0.01
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let ship: Ship;
let prevTesselations: number = 5;
let cloud: ParticleSwarmCloud;

function project(v:vec3, targ:vec3) {
  let comp = vec3.dot(v, targ) / vec3.dot(targ, targ);
  let p = vec3.create();
  vec3.scale(p, targ, comp);
  return p;
}

function sdBox(p: vec3, b: vec3 )
{
  let q = vec3.create();
  vec3.sub(q, vec3.fromValues(Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2])), b);
  let qq = vec3.create();
  vec3.max(qq, q, vec3.fromValues(0, 0, 0));
  return vec3.length(qq) + Math.min(Math.max(q[0],Math.max(q[1],q[2])),0.0);
}

function sdLink(p: vec3, le:number, r1:number, r2:number) {
  let q = vec3.fromValues(p[0], Math.max(Math.abs(p[1]) - le, 0.0), p[2]);
  return vec2.length(vec2.fromValues(vec2.length(vec2.fromValues(q[0], q[1])) - r1, q[2])) - r2;
}

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
  ship = new Ship(vec3.fromValues(0, 0, 0), 'StarSparrow01.obj', 'StarSparrow_Red.png');
  ship.create();
  let id = mat4.create();
  mat4.identity(id);
  let instanceMats = new Array<mat4>();
  let instanceCols = new Array<vec4>();
  const numShips = 200;
  const lv = 0.001;
  let vLine = vec3.fromValues(0, 1, 0);

  cloud = new ParticleSwarmCloud(numShips, 10, function(x:vec3, a:vec3)
  {
      var l = sdLink(x, 5, 1, 1.4);
      l = vec3.length(x) - l;
      if (l == 0) {
        return vec3.fromValues(0, 0, 0);
      }

      let n = vec3.create();
      vec3.normalize(n, x);
      return vec3.fromValues(l * n[0], l * n[1], l * n[2]);
  });

  for (let i = 0; i < cloud.particles.length; i++) {
    let part = cloud.particles[i];
    let trans = mat4.create();
    mat4.translate(trans, id, part.p);
    mat4.scale(trans, trans, vec3.fromValues(0.06, 0.06, 0.06));

    instanceMats.push(trans);
    instanceCols.push(vec4.fromValues(0, 1, 0, 1));
  }

  ship.setInstanceVBOs(instanceMats, instanceCols);
  ship.initDirections();
  ship.updateDirections(function(dirs: Float32Array) {
    for (let i = 0; i < cloud.particles.length; i++) {
      let part = cloud.particles[i];
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
  gui.add(controls, 'tesselations', 0, 8).step(1);

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
      shipShader.setTexture(ship.texture);
    }
    
    for (let key in controls) {
      if (key.startsWith("u_")) {
        lambert.setCustomUniform(key, controls[key]);
        shipShader.setCustomUniform(key, controls[key]);
      }
    }

    cloud.c1 = controls.u_IndividualWeight;
    cloud.c2 = controls.u_GroupWeight;
    cloud.w = controls.u_InertiaWeight;

    cloud.stepParticles();
    ship.updateTransVBOs(function(t1: Float32Array, t2: Float32Array, t3: Float32Array, t4: Float32Array) {
      let ships = cloud.particles;
      for (let i = 0; i < ships.length; i++) {
        let ship = ships[i];
        t4[i * 4] = ship.p[0];
        t4[i * 4 + 1] = ship.p[1];
        t4[i * 4 + 2] = ship.p[2];
      }
    });

    ship.updateDirections(function(dirs: Float32Array) {
      for (let i = 0; i < cloud.particles.length; i++) {
        let part = cloud.particles[i];
        dirs[4 * i] = part.v[0];
        dirs[4 * i + 1] = part.v[1];
        dirs[4 * i + 2] = part.v[2];
        dirs[4 * i + 3] = 0;
      }
    });

    //lambert.setModelMatrix(mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(4, 0, 0)));
    renderer.render(camera, shipShader, [
      ship
    ]);
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
