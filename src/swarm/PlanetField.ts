import { mat4, vec4, vec3 } from "gl-matrix"

class Planet {
    id: number;
    rungV: number;
    r: number;
    x: vec3;

    localYAngle: number;
    localZAngle: number;
    angleAroundSun: number;

    yAngleV: number;
    sunAngleV: number;

    transform: mat4;

    unhappiness: number = 0;
    madeHappy: boolean = false;
    personalBubble: number = 0.6;
    constructor(id: number) {
        this.id = id;
    }

    updateTransform() {
        this.transform = mat4.create();
        let pos = vec3.fromValues(this.rungV, 0, 0);
        vec3.rotateY(pos, pos, vec3.fromValues(0,0,0), this.angleAroundSun);
        this.x = pos;

        mat4.translate(this.transform, this.transform, this.x);
        mat4.rotateZ(this.transform, this.transform, this.localZAngle);
        mat4.rotateY(this.transform, this.transform, this.localYAngle);
        mat4.scale(this.transform, this.transform, vec3.fromValues(this.r, this.r, this.r));
    }

    sadIfLonely() {
        if (!this.madeHappy) {
            this.unhappiness += 1;
        }
    }

    visit(p: vec3) {
        if ((vec3.dist(p, this.x) - this.r) < this.personalBubble && !this.madeHappy) {
            this.madeHappy = true;
            this.unhappiness = Math.max(0, this.unhappiness - 10);
            console.log('made happy!');
        }
    }

    reset() {
        this.madeHappy = false;
    }

    neediness() {
        return Math.pow(this.unhappiness, 1.1)/ 100;
    }

}

class PlanetField {
    planetId: number = 0;
    planets: Array<Planet>;
    radius: number;
    rings: number;

    // Lives in X-Z plane.
    constructor(radius: number, rings: number, public sunRadius: number = 4) {
        this.planets = new Array<Planet>();
        this.radius = radius;
        this.rings = rings;
    }

    addPlanet(pRadius: number, ring: number, startAngle: number) {
        let step = this.radius / this.rings;
        let r = step * ring;

        let planet = new Planet(this.planetId++);
        planet.angleAroundSun = Math.random() * 7;

        planet.rungV = r;
        planet.localYAngle = 0;
        planet.localZAngle = 0;
        planet.r = pRadius;
        planet.updateTransform();
        planet.sunAngleV =  3 * (0.001 + (Math.random() - 0.01) / 1000.) / r;
        planet.yAngleV =   2 * (0.001 + (Math.random() - 0.01) / 1000.);
        
        this.planets.push(planet);

        return planet;
    }
}

export default PlanetField;