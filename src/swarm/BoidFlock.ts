import {ReadonlyVec3, vec3} from 'gl-matrix';
export function sm(c: number, v: vec3) {
    return vec3.fromValues(c * v[0], c * v[1], c * v[2]);
}

export function add(v1: vec3, v2: vec3) {
    return vec3.fromValues(v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]);
}

export function sub(v1: vec3, v2: vec3) {
    return vec3.fromValues(v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]);
}

export function random(lower:number, upper:number) {
    return lower + (upper - lower) * Math.random();
}

export function random3(lower:number, upper:number) {
    return vec3.fromValues(
        random(lower, upper),
        random(lower, upper),
        random(lower, upper));
}


export class Boid {
    x: vec3;
    v: vec3;
    a: vec3;
    constructor(x: vec3) {
        this.x = x;
        this.v = random3(-0.25, 0.25);
        this.a = vec3.create();
    }
}

export type DistMetric = (a: ReadonlyVec3, b: ReadonlyVec3) => number;
abstract class GenericBoidFlock {
    neighborhoods: Map<string, Array<Boid>>;
    boids: Array<Boid>;
    n: number;
    nhSize: number;
    distF: DistMetric;

    constructor(n: number, nhSize: number, distF: DistMetric = vec3.dist) {
        this.n = n;
        this.nhSize = nhSize;
        this.distF = distF;
        this.boids = [];
    }

    calcNeighborhoods() {
        this.neighborhoods = new Map<string, Array<Boid>>();
        for (let i = 0; i < this.boids.length; i++) {
            let boid = this.boids[i];

            // Can this be faster?
            let coords: string = this.getNeighborhoodCoords(boid).join(',');

            if (this.neighborhoods.has(coords)) {
                let old = this.neighborhoods.get(coords);
                old.push(boid);
            } else {
                this.neighborhoods.set(coords, [boid]);
            }
        }
    }

    getNeighborhoodCoords(boid: Boid) {
        let nx = Math.round(boid.x[0] / this.nhSize);
        let ny = Math.round(boid.x[1] / this.nhSize);
        let nz = Math.round(boid.x[2] / this.nhSize);
        return [nx, ny, nz];
    }

    insertIfLess(l: Array<[number, Boid]>, b: Boid, d: number) {
        if (l.length == 0 || l[l.length - 1][0] > d) {
            l.push([d, b])
        }
    }

    getClosestBoids(boid: Boid, count: number) {
        let nc = this.getNeighborhoodCoords(boid);
        let closest:Array<[number, Boid]> = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    let dnc = [nc[0] + dx, nc[1] + dy, nc[2] + dz].join(',');
                    if (this.neighborhoods.has(dnc)) {
                        let ns = this.neighborhoods.get(dnc);
                        for (let i = 0; i < ns.length; i++) {
                            let neigh = ns[i];
                            this.insertIfLess(closest, neigh, this.distF(neigh.x, boid.x))
                        }
                    }
                }
            }   
        }

        if (count > closest.length) {
            return closest;
        }

        return closest.splice(closest.length - count);
    }

    abstract stepBoids() : void;
}

export default GenericBoidFlock;