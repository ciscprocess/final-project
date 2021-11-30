import { vec3 } from "gl-matrix";
import GenericBoidFlock, { Boid, DistMetric, random3, add, sub, sm } from "./BoidFlock";

class BoidFlock1987 extends GenericBoidFlock {
    constructor(n: number, nhSize: number, distF: DistMetric = vec3.dist) {
        super(n, nhSize, distF);
        for (let i = 0; i < n; i++) {
            this.boids.push(new Boid(random3(-1, 1)));
        }
    }

    stepBoids() {
        this.calcNeighborhoods();
        for (let i = 0; i < this.boids.length; i++) {
            let boid = this.boids[i];
            boid.x = add(sm(0.03, boid.v), boid.x);
            let neighbors = this.getClosestBoids(boid, 5);
            let np = vec3.create();
            let displacement = vec3.create();
            for (let j = 0; j < neighbors.length; j++) {
                let nb = neighbors[j];
                vec3.add(np, np, nb[1].x);
                vec3.add(displacement, displacement, sm(1 / (nb[0] * nb[0] + 0.0000001), sub(boid.x, nb[1].x)));
            }

            let d = sub(sm(1 / neighbors.length, np), boid.x);
            vec3.add(d, d, sm(0.4, displacement));
            vec3.normalize(d, d);
            boid.v = add(sm(0.97, boid.v), sm(0.03, d));
            vec3.normalize(boid.v, boid.v);
        }
    }
}

export default BoidFlock1987;