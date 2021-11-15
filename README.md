# CIS 566 Final Project: Space Swarming
Nathaniel Korzekwa

## Introduction
The idea behind this project is to implement a space-themed simulation of
spaceships (or optionally other agents) exhibiting swarm behavior. The main focus
is to allow the ships/agents to swarm using Particle Search Optimization and
Stochastic Diffusion Search according to density fields. These fields can either
be generated procedurally or uploaded.

If time allows, I also hope to explore some more swarm algorithms and behaviors
and perhaps also explore the interaction of such swarm algorithms with inputs
other than density fields.

## Goal
I hope to achieve a visually polished, animated 3D scene replete with swarming
agents, space decor, and parameter tuning. This idea can be extended in an
exciting number of ways, but I am trying to keep the scope limited, at least
initially.

## Inspiration/reference
The main reference point I will be using the material in this
[textbook](https://link.springer.com/content/pdf/10.1007%2F978-3-642-36955-1.pdf).
There is a shockingly large amount of good information in there, but I will be
specifically referencing: "Swarmic Sketches and Attention Mechanism" by Mohammad
Majid al-Rifaie1 and John Mark Bishop.

## Specification
The following features will be added, in loose order of importance. Note that 
asterisk-tagged items are probably examples of scope creep and I will treat them
as optional.

1. Swarmic Engine for simulating swarming agents through a density field.
2. Smooth animation in 3D of the swarming agents.
3. Employing some kind of agent model (probably a spaceship) for the agents, and
the associated animation and lighting of said model.
4. Ability to upload (or at least choose from a list of) density fields that the
ships will follow
5. Space backdrop similar to procedural skybox with at least stars (and
optionally cool patterns like nebulae)
6. 1-3 Simple procedural planets or suns around which the agents can swarm (*).
7. Ability to procedurally generate density fields for unique swarming patterns (*).

## Techniques
I will use the techniques outlined in [the paper linked above](https://link.springer.com/content/pdf/10.1007%2F978-3-642-36955-1.pdf). In particular, this paper discusses Stochastic
Diffusion Search along with Particle Swarm Optimization. I may only need to end
up implementing one of them, but I will evaluate that as I get results.

The rest of the material like animation, lighting, noise generation, procedural
skybox, etc. will be from my experience in CIS 560 and this class.

## Design
The basic design will follow from the interplay between the swarm engine and the
3D representations of the agents. At this point I am not 100% sure where
everything should live. My initial thinking is that the swarm algorithm updates
should occur CPU-side and then be piped over to the GPU via instanced geometry:

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

I am thinking this for my initial approach since the swarm size is not large,
and generally computing these things CPU side is MUCH simpler. This may, however,
require me to move it out of WebGL since JavaScript is slow.

If I need to, I can look into implementing the algorithm GPU side but I do not
expect that to be easy.

## Timeline:
### Milestone 2
At this point, I will have implemented the core of the swarming algorithm in its
final form (not sure where it will live -- GPU or CPU), and it should at least
work for animating simple `GL_POINTS` in 3D.

### Milestone 3
For this milestone, the algorithm should have been extended to work with models
of the final assets I wish to use, as well as the ability to fully adjust the
parameters to the swarming algorthm(s) along with specifying a density field.

Ideally, there will be a nice space backdrop and some planets to join the tango
as well, but in the (likely) event this is too much, they will be cut if they
don't make this milestone.

### Final Submission
At this point, the lighting and animation should be portfolio quality. I am
hoping that it evokes the calming wonder that space tends to provide.