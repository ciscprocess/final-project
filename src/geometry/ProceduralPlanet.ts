import { vec2, vec3, vec4 } from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import { gl } from '../globals';
import Icosphere from './Icosphere';

function bias(time: number, bias: number): number {
    return (time / ((((1.0 / bias) - 2.0) * (1.0 - time)) + 1.0));
}

function gain(time: number, gain: number) {
    if (time < 0.5) {
        return bias(time * 2.0, gain) / 2.0;
    } else {
        return bias(time * 2.0 - 1.0, 1.0 - gain) / 2.0 + 0.5;
    }
}
function fract(n: number) {
    return n - Math.floor(n);
}
function randomNoise2(p: vec3, seed: number) {
    return fract(Math.sin(vec3.dot(p, vec3.fromValues(12.9898, -78.233, 133.999))) * (43758.5453 + seed));
}

function randomNoise3(co: vec2){
    return fract(Math.sin(vec2.dot(co, vec2.fromValues(12.9898, 78.233))) * 43758.5453);
}

function randomNoise33(co: vec3){
    let noise = randomNoise3(vec2.fromValues(co[0], co[1]));
    return randomNoise3(vec2.fromValues(noise, co[2]));
}

function getLatticeVector(p: vec3, seed: number) {
    let x = -1 + 2 * randomNoise2(p, 1201 + seed);
    let y = -1 + 2 * randomNoise2(p, 44402 + seed);
    let z = -1 + 2 * randomNoise2(p, 23103 + seed);

    return vec3.fromValues(x, y, z);
}

function interpQuintic(x: number, a: number, b: number) {
    let mod = 1 - 6 * Math.pow(x, 5) + 15 * Math.pow(x, 4) - 10 * Math.pow(x, 3);
    return mod * a + (1 - mod) * b;
}

function sm(c: number, v: vec3) {
    return vec3.fromValues(c * v[0], c * v[1], c * v[2]);
}

function sub(v1: vec3, v2: vec3) {
    return vec3.fromValues(v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]);
}

function interpQuintic3D(p: vec3, bnl: number, bnr: number, bfr: number, bfl: number, tnl: number, tnr: number, tfr: number, tfl: number) {
    let base = vec3.floor(vec3.create(), p);
    let diff = sub(p, base);

    let bl = interpQuintic(diff[2], bnl, bfl);
    let br = interpQuintic(diff[2], bnr, bfr);
    let tl = interpQuintic(diff[2], tnl, tfl);
    let tr = interpQuintic(diff[2], tnr, tfr);

    let l = interpQuintic(diff[1], bl, tl);
    let r = interpQuintic(diff[1], br, tr);

    return interpQuintic(diff[0], l, r);
}

const bnlv = vec3.fromValues(0, 0, 0);
const bnrv = vec3.fromValues(1, 0, 0);
const bfrv = vec3.fromValues(1, 0, 1);
const bflv = vec3.fromValues(0, 0, 1);

const tnlv = vec3.fromValues(0, 1, 0);
const tnrv = vec3.fromValues(1, 1, 0);
const tfrv = vec3.fromValues(1, 1, 1);
const tflv = vec3.fromValues(0, 1, 1);

const bnlv2 = vec3.fromValues(0., 0., 0.);
const bnrv2 = vec3.fromValues(1., 0., 0.);
const bfrv2 = vec3.fromValues(1., 0., 1.);
const bflv2 = vec3.fromValues(0., 0., 1.);
const tnlv2 = vec3.fromValues(0., 1., 0.);
const tnrv2 = vec3.fromValues(1., 1., 0.);
const tfrv2 = vec3.fromValues(1., 1., 1.);
const tflv2 = vec3.fromValues(0., 1., 1.);

function add(v1: vec3, v2: vec3) {
    return vec3.fromValues(v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]);
}
const sqrt3 = 1.732050807568877;
function perlin(p: vec3, voxelSize: number, seed: number) {
    // p.x += 100.f;
    // p.y += 100.f;
    // p.z += 100.f;
    p = sm(1/voxelSize, p);
    let lp2 = vec3.floor(vec3.create(), p);
    //let lp = vec3vec3(floor(p.x), floor(p.y), floor(p.z));

    let bnl = getLatticeVector(add(lp2, bnlv), seed);
    let bnr = getLatticeVector(add(lp2, bnrv), seed);
    let bfr = getLatticeVector(add(lp2, bfrv), seed);
    let bfl = getLatticeVector(add(lp2, bflv), seed);
    let tnl = getLatticeVector(add(lp2, tnlv), seed);
    let tnr = getLatticeVector(add(lp2, tnrv), seed);
    let tfr = getLatticeVector(add(lp2, tfrv), seed);
    let tfl = getLatticeVector(add(lp2, tflv), seed);

    let dotBnl = vec3.dot(sub(p, lp2), bnl);
    let dotBnr = vec3.dot(sub(sub(p, lp2), bnrv2), bnr);
    let dotBfr = vec3.dot(sub(sub(p, lp2), bfrv2), bfr);
    let dotBfl = vec3.dot(sub(sub(p, lp2), bflv2), bfl);

    let dotTnl = vec3.dot(sub(sub(p, lp2), tnlv2), tnl);
    let dotTnr = vec3.dot(sub(sub(p, lp2), tnrv2), tnr);
    let dotTfr = vec3.dot(sub(sub(p, lp2), tfrv2), tfr);
    let dotTfl = vec3.dot(sub(sub(p, lp2), tflv2), tfl);

    return (sqrt3 / 2. + interpQuintic3D(p, dotBnl, dotBnr, dotBfr, dotBfl, dotTnl, dotTnr, dotTfr, dotTfl)) / sqrt3;
}

function fbmPerlin(
    p: vec3,            // The point in 3D space to get perlin value for
    seed: number,       // Seed for perlin noise.
    rounds: number,     // # of rounds of frequency summation/reconstruction
    ampDecay: number,   // Amplitude decay per 'octave'.
    freqGain: number) { // Frequency gain per 'octave'.

    let acc = 0.;
    let amplitude = 1.;
    let freq = 0.5;
    let normC = 0.;
    for (let round = 0; round < rounds; round++) {
        acc += amplitude * perlin(sm(freq, p), 0.5, seed);
        normC += amplitude;
        amplitude *= ampDecay;
        freq *= freqGain;
    }

    return acc / normC;
}

function clamp(v: number, l: number, u: number) {
    if (v < l) return l;
    if (v > u) return u;
    return v;
}

function getGrassMembership(p: vec3, seed: number = 23.) {
    return fbmPerlin(sm(2.5, p), seed, 4, 0.4, 3.2);
}

const u_GrassCutoff = 0.5;
function terrainNoise(p: vec3, biome: number) {
    let f = clamp((getGrassMembership(p) - u_GrassCutoff) / (1. - u_GrassCutoff), 0., 1.);
    return bias(f, 0.2) * 0.5;
}

function getMountainMembership(p: vec3) {
    return fbmPerlin(p, 24., 4, 0.6, 2.);
}

function getForestMembership(p: vec3) {
    return fbmPerlin(p, 55., 3, 0.6, 3.);
}

const WATER = 0;
const MOUNTAIN = 1;
const FOREST = 2;
const GRASS = 3;
const GRASS_MOUNTAIN = 4;
const u_MountainCutoff = 0.59;
const u_MountainSpacing = 0.005;
const u_ForestCutoff = 0.3;
const u_MountainGrassCutoff = 0.01;

function getBiome(p: vec3, map: any = {}) : number {

    let mountain = getMountainMembership(p);
    let grass = getGrassMembership(p);
    let forest = (grass + getForestMembership(p)) /  2.;
    map.mountain = mountain;
    map.grass = grass;
    map.forest = forest;

    if (grass > u_MountainCutoff) {
        return MOUNTAIN;
    } else if (grass > u_GrassCutoff) {
        if (forest - grass > u_MountainSpacing && forest > u_ForestCutoff) {
            return FOREST;
        }

        if (grass > u_MountainCutoff - u_MountainGrassCutoff) {
            return GRASS_MOUNTAIN;
        }

        return GRASS;
    }

    return WATER;
}

function getWaterNoise(p: vec3) {
    return fbmPerlin(p, 999., 5, 0.6, 3.);
}

function cos(p: vec3) {
    return vec3.fromValues(Math.cos(p[0]), Math.cos(p[1]), Math.cos(p[2]));
}

function colorWheelTransition(angle: number) {
    // base is grass
    let a = vec3.fromValues(0.190, 0.590, 0.190);
    let b = vec3.fromValues(0.500, -0.002, 0.500);
    let c = vec3.fromValues(0.590, 0.690, 0.590);
    let d = vec3.fromValues(0.410, 1.098, 0.410);

    vec3.mul(b, b, cos(sm(2 * 3.14159, add(sm(angle, c), d))));
    vec3.add(a, a, b);
    return sm(0.65, a);
}

function colorWheelTransition2(angle: number) {
    // base is grass
    let a = vec3.fromValues(0.070, 0.468, 0.070);
    let b = vec3.fromValues(0.500, -0.112, 0.500);
    let c = vec3.fromValues(0.188, -0.252, 0.188);
    let d = vec3.fromValues(0.938, 1.658, 0.938);
    vec3.mul(b, b, cos(sm(2 * 3.14159, add(sm(angle, c), d))));
    vec3.add(a, a, b);
    return sm(0.75, a);
}

function colorWheelEarth(angle: number) {
    // base is grass
    let a = vec3.fromValues(0.500, 0.660, 0.298);
    let b = vec3.fromValues(0.328, -0.222, 0.548);
    let c = vec3.fromValues(0.528, -0.362, 0.468);
    let d = vec3.fromValues(0.438, -0.052, 0.498);
    vec3.mul(b, b, cos(sm(2 * 3.14159, add(sm(angle, c), d))));
    vec3.add(a, a, b);
    return sm(0.75, a);
}

function colorWheelForest(angle: number) {
    let a = vec3.fromValues(0., 0.35, 0.);
    let b = vec3.fromValues(0., 0.10, 0.);
    let c = vec3.fromValues(0, 4., 0);
    let d = vec3.fromValues(0, 0.25, 0.75);
    vec3.mul(b, b, cos(sm(2 * 3.14159, add(sm(angle, c), d))));
    return vec3.add(a, a, b);
}

function colorWheelGrass(angle: number) {
    let a = vec3.fromValues(0., 0.7, 0.);
    let b = vec3.fromValues(0., 0.2, 0.);
    let c = vec3.fromValues(0, 4., 0);
    let d = vec3.fromValues(0, 0.25, 0.0);
    vec3.mul(b, b, cos(sm(2 * 3.14159, add(sm(angle, c), d))));
    return vec3.add(a, a, b);
}

function colorWheelWater(angle: number) {
    let a = vec3.fromValues(0.0, 0.2, 0.5);
    let b = vec3.fromValues(0.05, 0.2, 0.25);
    let c = vec3.fromValues(1, 1, 2);
    let d = vec3.fromValues(0, 0.25, 0.75);
    vec3.mul(b, b, cos(sm(2 * 3.14159, add(sm(angle, c), d))));
    return vec3.add(a, a, b);
}

function getBiomeColor(p: vec3,
    normal: vec3,
    mountain: number,
    forest: number,
    grass: number,
    biome: number) {
    if (biome == WATER) {
        let wp = sm(0.1, add(vec3.fromValues(0., 0., /*float(u_Time)*/ 0), p));
        let water = getWaterNoise(sm(2, add(vec3.fromValues(mountain, forest, grass),  wp)));
        //return vec4(colorWheelWater(water + 4.f * gain(dot(fs_Nor.xyz, normalize(u_CameraEye)), 0.2)), 1.f);
        return colorWheelWater(water);
    } else if (biome == FOREST) {
        let perls = randomNoise33(p);
        return sm(0.62, colorWheelForest(bias(perls, 0.25)));
    } else {
        if (biome == MOUNTAIN) {
            let originalNormal = vec3.normalize(vec3.create(), p);
            let perp = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), originalNormal, vec3.fromValues(0.,1.,0.)));
            let v1 = clamp(vec3.dot(originalNormal, normal), 0., 1.);
            let v2 = clamp(vec3.dot(normal, perp), 0., 1.);
            let v = vec2.fromValues(1. - v1, 1. -  v2);

            return colorWheelTransition(bias(vec2.dot(v,v), 0.8));
        }

        let grass2 = getGrassMembership(sm(16., p));
        return colorWheelEarth(bias(grass2, bias(grass, 0.2)));
    }
}

function deformTerrain(p: vec3, biome: number) {
    let mod = terrainNoise(p, biome);
    return sm((1 + mod), p);
}

const u_NormDifferential = 0.001;
function transformNormal(p: vec3, dp: vec3, normal:vec3, biome:number) {
    let tangent = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), vec3.fromValues(0., 1., 0.), normal));
    let bitangent = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), tangent, normal));

    let dt = deformTerrain(add(p, sm(u_NormDifferential, tangent)), biome);
    let db = deformTerrain(add(p, sm(u_NormDifferential, bitangent)), biome);

    return vec3.normalize(vec3.create(), vec3.cross(vec3.create(), sub(dp, db), sub(dp, dt)));
}

function getImagePixel(image: ImageData, x: number, y: number) {
    let base = (y * (image.width * 4)) + (x * 4);
    return vec4.fromValues(
        image.data[base],
        image.data[base + 1],
        image.data[base + 2],
        image.data[base + 3]);
}

function setImagePixel(image: ImageData, x:number, y:number, col: vec4) {
    let base = (y * (image.width * 4)) + (x * 4);
    image.data[base] = col[0];
    image.data[base + 1] = col[1];
    image.data[base + 2] = col[2];
    image.data[base + 3] = col[3];
}

function sph2Cart(r: number, theta: number, phi: number) {
    return vec3.fromValues(
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi));
}

function cart2Sph(x: number, y: number, z: number) {
    let r = vec3.len(vec3.fromValues(x, y, z));
    let phi = Math.acos(z / r);
    let theta = Math.asin(y / (Math.sin(phi) * r));
    return vec3.fromValues(theta, phi, r);
}

class ProceduralPlanet extends Icosphere {
    center: vec4;
    colorTexture: WebGLTexture;
    normalTexture: WebGLTexture;
    imDat: ImageData;

    constructor(center: vec3, public radius: number, public seed: number) {
        super(center, radius, 4); // Call the constructor of the super class. This is required.
        this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    }

    create() {
        super.create();
        this.generateCol();
        this.cols = new Float32Array(this.positions.length);
        for (let i = 0; i < this.cols.length; i += 4) {
            this.cols[i] = 0;
            this.cols[i + 1] = 1;
            this.cols[i + 2] = 0;
            this.cols[i + 3] = 1;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        gl.bufferData(gl.ARRAY_BUFFER, this.cols, gl.STATIC_DRAW);
    }

    deformSurface() {
        for (let i = 0; i < this.positions.length / 4; i++) {
            let p = vec3.fromValues(
                this.positions[i * 4],
                this.positions[i * 4 + 1],
                this.positions[i * 4 + 2]);
            
            let p2 = deformTerrain(p, 0);
            this.positions[i * 4] = p2[0];
            this.positions[i * 4 + 1] = p2[1];
            this.positions[i * 4 + 2] = p2[2];

            let n = vec3.fromValues(
                this.normals[i * 4],
                this.normals[i * 4 + 1],
                this.normals[i * 4 + 2]);

            let n2 = transformNormal(p, p2, n, 0);
            this.normals[i * 4] = n2[0];
            this.normals[i * 4 + 1] = n2[1];
            this.normals[i * 4 + 2] = n2[2];

            let t = {mountain: 0, forest: 0, grass: 0};
            let biome = getBiome(p, t);
            let c = getBiomeColor(p, n2, t.mountain, t.forest, t.grass, biome);

            this.cols[i * 4] = c[0];
            this.cols[i * 4 + 1] = c[1];
            this.cols[i * 4 + 2] = c[2];
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        gl.bufferData(gl.ARRAY_BUFFER, this.cols, gl.STATIC_DRAW);
    }

    generateColorMapTexture() {
        const tWidth = 256;
        const tHeight = 256;
        const pi2 = 2 * 3.14159;
        let data = new ImageData(tWidth, tHeight);
        for (let xi = 0; xi < data.width; xi++) {
            for (let yi = 0; yi < data.height; yi++) {
                let x = xi / data.width;
                let y = yi / data.height;
                let theta = x * pi2;
                let phi = y * pi2;

                let p = sph2Cart(this.radius, theta, phi);
                let t = {mountain: 0, forest: 0, grass: 0};
                let biome = getBiome(p, t);
                let c = getBiomeColor(p, vec3.fromValues(1,1,1), t.mountain, t.forest, t.grass, biome);
                setImagePixel(data, xi, yi, vec4.fromValues(
                    clamp(c[0] * 255, 0, 255),
                    clamp(c[1] * 255, 0, 255),
                    clamp(c[2] * 255, 0, 255),
                    255));
            }
        }

        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, data);
        gl.generateMipmap(gl.TEXTURE_2D);

        this.imDat = data;
        this.colorTexture = texture;
    }
};

export default ProceduralPlanet;
