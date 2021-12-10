# CIS 566 Final Project: Space Swarming
Nathaniel Korzekwa

## Introduction
The idea behind this project is to implement a space-themed simulation of
spaceships (or optionally other agents) exhibiting swarm behavior. I
experimented with a handful of different flocking/swarming algorithms, and ended
up settling on a custom Boids-influenced algorithm based on touring around the
generated solar system.

The planets get lonely, and only the swarming ships can make them feel better!
Over time, planets gain in loneliness and thus become needy. The neediness grows
super-linearly so even if ships are far away, the increasing rate of neediness
will cause ships to go beserk if the planets are ignored too long.

<p align="center">
  <img src="https://user-images.githubusercontent.com/6472567/145521127-db6b299d-b546-48be-b97d-6eae4f3409f8.png">
</p>
<p align="center">Default scene.</p>

## Features
### Star Backdrop
The stars in the backdrop are pretty simple, and they are based off of the idea
behind Adam Mally's 'procedural skybox' as presented in CIS 560. Rays are cast
from the origin based on the world-space position of the fragment coordinate.

From that, we can get a normalized 'ray' vector from the origin, and stars are
represented as specific points on a sphere. The 'ray' vector is can be dotted
with the vector representing the star's position on the unit spehere, and an
exponential falloff function is used to create a blurred radius.

I had originally hoped (and may revisit) the idea of adding nebulae noise to the
backdrop but that might be a project in and of itself unless I wanted to directly
take some work from elsewhere.

<p align="center">
  <img src="https://user-images.githubusercontent.com/6472567/145521125-67c28125-4e68-40f4-9306-cf2e624e808e.png">
</p>
<p align="center">The stars.</p>

### Procedural Planets
Extending on the idea from HW1, I decided to make a whole solar system of
planets. There are 4 'types' of planets:
- An Ocean-style planet (this is taken from my HW1 with some optimizations)
- A Gas planet (very simple noise-textured sphere with y-axis distortions)
- A desert planet (layered perlin noise with arid color palette)
- A rock/ice planet (uses worley noise points and distance to transform input
to FBM/perlin)

I would have liked to explore anisotropic noise for the rock planet to simulate
desert terrain (and to have a noise type other than Perlin... yeeesh). I may
revisit it, but the math was too heavy for my tired brain at the end of all my
projects.

### Swarming Ships
The ships follow an algorithm close to Boids. The basic idea is that at each
step, a given ship's position is updated by the following rule:

    x' = x + s * d

Where x' is the new position, x is the old position, s is a configurable speed
coefficient and d is the ship's direction or heading.

After updating each ship's position, the direction is also updated. I will
refrain from writing an update formula here since it is likely confusing, and
will instead give a high level overview:

1. Collision detection is done on all other ships, planets, and the sun: the
inverse of the squared distance is calculated, and the vector FROM the potential
colliding object to the ship is added, weighted by the squared distance.
2. Displacement from the ship's N nearest neighbors is computed and summed (N is
configurable, and there is an optional maximum distance).
3. Direction vectors of the nearest N neighbors are summed.
4. Planets have a "neediness value" that grows quadratically with time 
(and diminishes when ships are nearby). The the vectors from the ship to all
planets weighted by neediness and inverse distance are summed.
5. A "default" swarming formation is calculated by an SDF of a sphere
around the sun. The vector to the closest point on that sphere is calulated
and weighted by a configurable coefficient.

All the above values are summed together to get a new vector, and that vector is
normalized, let's call it v. Then, the new direction vector d is found by:

    d = d * inertia + v * (1 - inertia)


## Architecture
The basic design follows from the interplay between the swarm engine and the
3D representations of the agents. All the ship positionl and orientational
calculations are done CPU side and piped into a shader for instanced ships:

    ----------------
    |     UI       |
    | Set Params   |
    |              |
    ----------------
        |
        v
    ----------------            -----------------
    |     CPU      |   on tick  |     GPU       |
    | Swarm Update |  ------>   | Render Agents |
    |              |            |               |
    ----------------            -----------------

### Rendering stuff
I also have implemented a partial 2-pass bloom implementation. It proceeds as
follows:

1. Using multi-target rendering, all ships are drawn to a separate buffer. The
main buffer is blurred using a horizontal and vertical gaussian pass. MTR ensures
that when I combine the framebuffers, the depth testing is done properly.

2. The blurred image (excluding ships) is averaged together with the original
image, and tone-mapping is done. Unfortunately, I couldn't figure out how to
write to textures with more than BYTES per color channel (drawing to float
textures is not supported in WebGL. Int16/32 are allowed, but that has it's own
headache I didn't want to deal with), so HDR was not able to be used.

3. The bloom-ed planets are drawn alongside the untouched ships, giving the
planets a bit of a glow (though the color has bled a bit :().

## Changes
I ditched the original Particle Search Optimization method. It turns out that
it's just what it says it is: an optimization method. It's not meant for flocking
or agents with orientation. It also likes to converge which is obviously not
what I was going for.

I did however try a number of different implementations of swarming and flocking
which are still in the 'swarm' source folder.

## References
- Color palette for sun: https://www.shadertoy.com/view/XlSSzK
- Bloom inspiration: https://learnopengl.com/Advanced-Lighting/Bloom
- Space ship model: https://www.cgtrader.com/free-3d-models/space/spaceship/star-sparrow-modular-spaceship
- Texturing: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
- Lots of stuff from 560 and previous homeworks.
