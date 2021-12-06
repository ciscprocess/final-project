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
import ProceduralPlanet from './geometry/ProceduralPlanet';
import Framebuffer from './rendering/gl/Framebuffer';
import PlanetField from './swarm/PlanetField';

export interface IIndexable {
  [key: string]: any;
}

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls : IIndexable = {
  u_Seed: 0,
  'Inertia': 0.6
};

let fb: Framebuffer;
let fb2: Framebuffer;
let ship: Ship;
let quad: ScreenQuad;
let quad2: ScreenQuad;
let flock: BoidFlock;
let planet: Icosphere;
let sun: Icosphere;
let planetField: PlanetField;

function loadScene() {
  ship = new Ship(vec3.fromValues(0, 0, 0), 'StarSparrow01.obj', 'StarSparrow_Red.png');
  ship.create();

  quad = new ScreenQuad();
  quad.create();

  quad2 = new ScreenQuad(-0.001);
  quad2.create();


  planet = new Icosphere(vec3.fromValues(0, 0, 0), 1, 5);
  planet.create();

  planetField = new PlanetField(20, 7);
  planetField.addPlanet(1, 3, 0, 'desert');
  planetField.addPlanet(1.5, 5, 0, 'gas');
  planetField.addPlanet(1.2, 8, 0, 'ocean');
  planetField.addPlanet(0.7, 10, 0, 'gas');
  planetField.addPlanet(1.5, 12, 0, 'rock');
  planetField.addPlanet(1.5, 14, 0, 'desert');
  planetField.addPlanet(1.5, 17, 0, 'rock');
  //planetField.addPlanet(1, 4, 0.4);

  sun = new Icosphere(vec3.create(), planetField.sunRadius, 5);
  sun.create();


  let id = mat4.create();
  mat4.identity(id);
  let instanceMats = new Array<mat4>();
  let instanceCols = new Array<vec4>();
  const numShips = 100;

  flock = new BoidFlock1987(numShips, 2, vec3.dist, planetField);

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
  //const canvas2 = <HTMLCanvasElement>document.getElementById('canvas2');
  const gl = <WebGL2RenderingContext>canvas.getContext('webgl2');
  // const ctx = canvas2.getContext('2d');
  // if (!ctx) {
  //   alert("can't render previews");
  // }
  if (!gl) {
    alert('WebGL 2 not supported!');
  }

  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();
  fb = new Framebuffer(window.innerWidth, window.innerHeight);
  fb.clear();
  fb2 = new Framebuffer(window.innerWidth, window.innerHeight);
  fb2.clear();
  //ctx.fillRect(25, 25, 100, 100);
  //ctx.putImageData(planet.imDat, 0, 0);

  const camera = new Camera(vec3.fromValues(0, 0, 10), vec3.fromValues(0, 0, 0));
  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0,0,1,0);
  gl.enable(gl.DEPTH_TEST);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.blendEquation(gl.FUNC_ADD);

  let uniformVars = [];
  for (let key in controls) {
    if (key.startsWith("u_")) {
      uniformVars.push(key);
    }
  }

  const planetShaders : IIndexable = {};

  for (let planet of ['desert', 'gas', 'ocean', 'rock']) {
    planetShaders[planet] = new ShaderProgram([
      new Shader(gl.VERTEX_SHADER, require('./shaders/planets/shared.glsl') + '\n' + require('./shaders/planets/' + planet +'.vert.glsl')),
      new Shader(gl.FRAGMENT_SHADER, require('./shaders/planets/shared.glsl') + '\n' + require('./shaders/planets/' + planet + '.frag.glsl'))
    ], uniformVars);
  }



  const sunShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/sun-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/sun-frag.glsl')),
  ], uniformVars);

  const postShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/post/passthrough.vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/post/vertical-blur.frag.glsl')),
  ], uniformVars);

  const horizShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/post/passthrough.vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/post/horizontal-blur.frag.glsl')),
  ], uniformVars);

  const passthrough = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/post/passthrough.vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/post/passthrough.frag.glsl')),
  ], uniformVars);

  const shipShader = new ShipShaderProgram(uniformVars);
  const spaceShader = new SpaceShaderProgram(uniformVars);
  shipShader.setTexture(ship.texture);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    fb.bind();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    for (let key in controls) {
      if (key.startsWith("u_")) {
        for (let type in planetShaders) {
          planetShaders[type].setCustomUniform(key, controls[key]);
        }
      }
    }
  
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
    for (let plan of planetField.planets) {
      let planetShader = planetShaders[plan.type];
      planetShader.setCameraEye(camera.controls.eye);
      plan.updateTransform();
      planetShader.setCustomUniform('u_Seed', plan.id);
      renderer.render(camera, planetShader, [planet], plan.transform);
      plan.localYAngle -= plan.yAngleV;
      plan.angleAroundSun += plan.sunAngleV;
    }
    renderer.render(camera, sunShader, [sun]);
    renderer.render(camera, shipShader, [ship]);

    fb2.bind();
    renderer.clear();
    postShader.setTextureSlot(fb.texture, 1);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(camera, postShader, [quad]);

    fb2.clear();
    horizShader.setTextureSlot(fb2.texture, 1);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(camera, horizShader, [quad]);

    sunShader.tickTime();
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    fb.resize(window.innerWidth, window.innerHeight);
    fb2.resize(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
