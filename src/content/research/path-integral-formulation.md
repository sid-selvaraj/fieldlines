---
title: "Research Journal: Notes on the Path Integral"
date: 2026-07-17
status: "In Progress"
abstract: "Working through Feynman's path integral formulation and grappling with why classical mechanics emerges as a limiting case of quantum mechanics. Applications to black hole dynamics."
tags: [path integral, quantum mechanics, action principle, Feynman]
---

Date: July 17, 2026  
Subject: Feynman's Path Integral and the Quantum Action

I spent the better part of the day buried in Feynman's path integral formulation again. There is something fundamentally haunting about this perspective on quantum mechanics. Most of the physics I've learned up to this point treats a particle like it has a "trajectory"—a path it takes from A to B. But Feynman throws that out the window. He suggests that a particle doesn't take one path; it takes all of them simultaneously. Every possible route, no matter how wild, is a possibility, and each one carries a specific "weight."

## The Mathematical Framework

The math behind this is as beautiful as it is intimidating. We represent the probability amplitude for a particle moving from point a to point b as an integral over every possible path $x(t)$:

$$K(b,a)=\int_a^b \mathcal{D}x \, e^{iS[x(t)]/\hbar}$$

The "$S$" in that exponent is the **Action**, which is the integral of the Lagrangian over time:

$$S[x]=\int L(x, \dot{x}, t) \, dt$$

where the Lagrangian $L = T - V$ is the difference between kinetic and potential energy.

## Classical Mechanics as a Limit

What hit me while I was working through the derivation today is why the "classical" world looks the way it does. In the quantum realm, these paths interfere with each other—some cancel out (destructive interference), and others reinforce each other (constructive interference). 

When the action $S$ is much, much larger than Planck's constant ($\hbar$), the oscillations are so rapid that almost everything cancels out except for the path where the action is **stationary** ($\delta S=0$). That stationary path is the one Newton's laws predicted centuries ago.

It's mind-blowing: classical mechanics is just the "shadow" cast by this massive, infinite summation of all quantum possibilities. The principle of least action—which seems like a mysterious variational principle in classical mechanics—is revealed to be the natural consequence of quantum path averaging when $S \gg \hbar$.

This is why the correspondence principle works: quantum mechanics naturally reduces to classical mechanics in the limit of large action (or equivalently, large mass, long times, or systems where $\hbar$ is negligible relative to typical action values).

## Applications to My Research

I feel like I'm finally starting to grasp why this is so critical for the simulation work I'm doing. If I want to model black hole quantum dynamics and entropy curves, I can't just use classical equations. The path integral gives a framework for understanding how quantum effects modify the classical geometries.

Near black hole singularities, the action becomes comparable to $\hbar$, and the path integral integral becomes essential. Different spacetime geometries contribute to the path integral with different phases, and interference between them can modify the effective geometry perceived by infalling matter.

This connects directly to recent work on the holographic dual of black hole thermodynamics, where gravitational dynamics are understood through a path integral over metrics, weighted by the exponential of the Einstein-Hilbert action.

## Next Steps

I need to work through the details of how to apply path integrals to gravity—the Euclidean path integral over metrics, the role of instantons in gravitational physics, and how this connects to the thermodynamic properties of black holes. The path integral is the key to bridging quantum information and spacetime geometry.
