import { vec3 } from "gl-matrix";
import GenericBoidFlock, { Boid, DistMetric, random3, add, sub, sm } from "./BoidFlock";
import PlanetField from "./PlanetField";

class BoidFlock1987 extends GenericBoidFlock {
    average: vec3;

    inertia: number = 0.97;
    constructor(
        n: number,
        nhSize: number,
        distF: DistMetric = vec3.dist,
        public planets: PlanetField = new PlanetField(0, 0)) {
        super(n, nhSize, distF);
        for (let i = 0; i < n; i++) {
            this.boids.push(new Boid(random3(-1, 1)));
        }

        this.average = vec3.create();
    }

    stepBoids() {
        this.calcNeighborhoods();

        let newAverage = vec3.create();
        for (let i = 0; i < this.boids.length; i++) {
            let boid = this.boids[i];
            boid.x = add(sm(0.06, boid.v), boid.x);
            let neighbors = this.getClosestBoids(boid, 5);
            let np = vec3.create();
            let displacement = vec3.create();
            for (let j = 0; j < neighbors.length; j++) {
                let nb = neighbors[j];
                vec3.add(np, np, nb[1].x);
                vec3.add(displacement, displacement, sm(1 / (nb[0] * nb[0] + 0.0000001), sub(boid.x, nb[1].x)));
            }

            let d = sub(sm(1 / neighbors.length, np), boid.x);
            vec3.add(d, sm(0.01, d), sm(0.4, displacement));

            // BEGIN avoid average pos
            // let away = vec3.create();
            // vec3.sub(away, boid.x, this.average);
            // vec3.normalize(away, away);
            // vec3.add(d, d, sm(0.2, away));

            // END
            // BEGIN avoid sun
            let sunDist = vec3.length(boid.x) - this.planets.sunRadius;
            vec3.add(d, d, sm(1 / (sunDist * sunDist + 0.0000001), boid.x));
            // END

            // BEGIN attract to planets
            for (let planet of this.planets.planets) {
                let dir = sub(planet.x, boid.x);
                let dist = vec3.len(dir) - planet.r;
                vec3.normalize(dir, dir);
                vec3.add(d, d, sm(0.3 * (1 / (dist + 0.00000001)) * planet.neediness(), dir));
            }
            // END

            // BEGIN avoid planet collision
            for (let planet of this.planets.planets) {
                planet.visit(boid.x);
                let dist = vec3.distance(boid.x, planet.x) - planet.r;
                vec3.add(d, d, sm(10 / (dist * dist * dist + 0.0000001), sub(boid.x, planet.x)));
            }
            // END

            // BEGIN HARD-CODED SPHERE SDF!!
            let surface = sm(8, vec3.normalize(vec3.create(), boid.x));
            let goalDiff = sub(surface, boid.x);
            vec3.add(d, d, sm(0.07, goalDiff));
            // END

            // BEGIN direction matching
            for (let j = 0; j < neighbors.length; j++) {
                let nb = neighbors[j];
                vec3.add(d, d, sm(0.1, nb[1].v));
            }
            // END

            vec3.normalize(d, d);
            boid.v = add(sm(0.97, boid.v), sm(0.03, d));
            vec3.normalize(boid.v, boid.v);

            vec3.add(newAverage, newAverage, boid.x);
        }

        this.average = sm(1 / this.boids.length, newAverage);

        for (let planet of this.planets.planets) {
            planet.sadIfLonely();
            planet.reset();
        }
    }
}

export default BoidFlock1987;