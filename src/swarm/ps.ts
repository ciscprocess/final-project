import {vec3} from 'gl-matrix';
class Particle {
    mp: vec3;
    p: vec3;
    v: vec3;
    pBest: vec3;
    fBest: number;

    constructor(p: vec3) {
        this.p = p;
        this.v = vec3.fromValues(
        (Math.random() - 0.5) / 2,
        (Math.random() - 0.5) / 2,
        (Math.random() - 0.5) / 2);
        this.pBest = vec3.fromValues(0, 0, 0);
        this.fBest = -99999999;
    }
}

function sm(c: number, v: vec3) {
    return vec3.fromValues(c * v[0], c * v[1], c * v[2]);
}

function add(v1: vec3, v2: vec3) {
    return vec3.fromValues(v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]);
}

function sub(v1: vec3, v2: vec3) {
    return vec3.fromValues(v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]);
}

class ParticleSwarmCloud {
    neighborhoods: Map<string, [vec3, number]>;
    particles: Array<Particle>;
    fitness: Function;
    nhSize: number;

    w: number;
    c1: number;
    c2: number;

    constructor(n: number, nhSize: number, fitness: Function) {
        this.particles = new Array<Particle>();
        this.fitness = fitness;
        for (let i = 0; i < n; i++) {
            let particle = new Particle(
                vec3.fromValues(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
            ));

            particle.pBest = particle.p;
            particle.mp = particle.p;
            particle.fBest = this.fitness(particle.p, particle.mp);

            this.particles.push(particle);
        }

        this.nhSize = nhSize;
        this.w = 0.6;
        this.c1 = 0.31;
        this.c2 = 0.01;
        this.calcNeighborhoods();
    }

    calcNeighborhoods() {
        this.neighborhoods = new Map<string, [vec3, number]>();
        for (let i = 0; i < this.particles.length; i++) {
            let particle = this.particles[i];
            let nx = Math.round(Math.cos(particle.p[0] * 2) * 10);
            let ny = Math.round(Math.sin(particle.p[1] * 2) * 10);
            let nz = Math.round(particle.p[2] / this.nhSize);
            let coords:string = [nx, ny, nz].join(',');

            if (this.neighborhoods.has(coords)) {
                let old = this.neighborhoods.get(coords);
                this.neighborhoods.set(coords, [add(old[0], particle.p), old[1] + 1]);
            } else {
                this.neighborhoods.set(coords, [particle.p, 1]);
            }
        }
    }

    stepParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            let part = this.particles[i];
            let inertial = sm(this.w, part.v);

            let f:vec3 = this.fitness(part.p, part.mp);
            let r1 = Math.random();
            let r2 = Math.random();
            let pd = sm(this.c1 * r1, sub(f, part.p));

            let nx = Math.round(Math.cos(part.p[0] * 2) * 10);
            let ny = Math.round(Math.sin(part.p[1] * 2) * 10);
            let nz = Math.round(part.p[2] / this.nhSize);
            let g = this.neighborhoods.get([nx, ny, nz].join(','));
            let gBest = sm(1/g[1], g[0]);
            let gd = sm(this.c2 * r2, sub(gBest, part.p));
            let tv = add(inertial, add(pd, gd))
            //tv = add(tv, vec3.fromValues((Math.random() - 0.5) / 50, (Math.random() - 0.5) / 50, (Math.random() - 0.5) / 50));
            
            let len = vec3.length(tv);
            part.v = len == 0 ? part.v : sm(1/len, tv);
            part.p = add(sm(0.01, part.v), part.p);
        }

        this.calcNeighborhoods();
    }
}

export default ParticleSwarmCloud;