---
title: "What Feynman diagrams actually mean (and what they don't)"
date: 2026-03-15
readTime: 8
tags: [QED, Feynman, notation]
---

When I first encountered Feynman diagrams, I made the same mistake that most people do: I thought they were pictures of what actually happens when particles interact.

They're not.

## What They Actually Are

A Feynman diagram is a *bookkeeping device* for calculating a probability amplitude. Each diagram corresponds to a term in a perturbative expansion — a mathematical series where you approximate a complicated answer by adding up simpler and simpler contributions.

In quantum electrodynamics (QED), the coupling constant is the fine structure constant α ≈ 1/137. Because this number is so small, you can approximate the interaction between electrons by looking at just the first few diagrams. Each additional vertex in the diagram adds a factor of α, making the contribution smaller.

## The Perturbation Series

The probability amplitude for electron-electron scattering is:

```
M = M₁ + M₂ + M₃ + ...
```

Where M₁ is the "tree level" diagram (single photon exchange), M₂ includes all one-loop corrections, and so on. The actual probability is |M|².

In practice, physicists often only compute the first few terms because α is so small that the rest are negligible for most purposes. But for some experiments — like measuring the electron's magnetic moment — you need many loop orders to match experimental precision.

## What a Diagram Is Not

The diagram doesn't depict:

- The actual path of the electron
- A sequence of events in time (the time axis is conventional)
- A literal photon being emitted and absorbed

The "virtual photon" in the diagram is not a real photon. It's a mathematical term in the propagator — it doesn't even need to satisfy E² = p²c². This is why I've stopped thinking of Feynman diagrams as pictures and started thinking of them as *notation*.

## Why This Matters

Getting this right matters because the alternative — taking diagrams too literally — leads to confusion about what quantum field theory actually says. The theory's actual claims are about cross-sections and decay rates, which are extracted by squaring amplitudes, not by staring at lines and arrows.

This is a lesson Feynman himself tried to teach. In *QED: The Strange Theory of Light and Matter*, he's very careful to say that these are "ways of drawing" the calculation, not depictions of physical processes.

## A Useful Lie?

There's a real question about whether the pedagogical usefulness of treating diagrams as physical pictures outweighs the conceptual confusion they cause. My current view: learn them as notation first, let the physical intuition come later.
