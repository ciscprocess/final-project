import {vec3} from 'gl-matrix';
class Particle {
    p: vec3;
    v: vec3;
    pBest: vec3;
    fBest: number;

    constructor(p: vec3) {
        this.p = p;
        this.v = vec3.fromValues(0, 0, 0);
        this.pBest = vec3.fromValues(0, 0, 0);
        this.fBest = -1;
    }
}

class ParticleSwarmCloud {
    neighborhoods: Map<[number, number], number>;
    particles: Array<Particle>;
    fitness: Function;
    constructor(n: number, fitness: Function) {
        this.particles = new Array<Particle>();
        this.fitness = fitness;
        this.neighborhoods = new Map<[number, number], number>();
        for (let i = 0; i < n; i++) {
            this.particles.push(new Particle(
                vec3.fromValues(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
            )));
        }
    }

    stepParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            let part = this.particles[i];
            
        }
    }
}