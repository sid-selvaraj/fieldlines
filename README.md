# Field Lines — Siddharth Selvaraj

Physics research portfolio at [sidselvaraj.science](https://sidselvaraj.science)

## Stack

- [Astro](https://astro.build) — static site generator
- Vanilla CSS with custom properties, no framework
- TypeScript

## Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server at http://localhost:4321
npm run build      # build for production (output → dist/)
npm run preview    # preview the production build locally
```

---

## Adding new content

### New essay

1. Create `src/content/essays/your-title-here.md`
2. Add this frontmatter at the top (copy exactly, change the values):

```markdown
---
title: "Your Essay Title"
date: 2026-04-01
readTime: 7
tags: [physics, tag2]
---

Your essay content goes here. Standard Markdown works: **bold**, *italic*, `code`, headers, lists, etc.
```

- `date` — use `YYYY-MM-DD` format
- `readTime` — estimated reading time in minutes (whole number)
- `tags` — a list of short topic labels

The URL will be `/essays/your-title-here` (matches the filename, without `.md`).

---

### New research note

1. Create `src/content/research/your-slug.md`
2. Add this frontmatter:

```markdown
---
title: "Your Research Note Title"
date: 2026-04-01
status: "Draft"
abstract: "One or two sentences describing what this note is about. This appears on the research list page and at the top of the post."
tags: [QCD, particles]
---

Your note content here.
```

- `status` must be one of: `"Draft"`, `"In Progress"`, or `"Published"`
- `abstract` is required — it shows on the list page and as a block quote on the post

---

### New simulation page

1. Create `src/pages/simulations/your-sim-name.astro` — use the existing files in that folder as a template.
2. Add a card for it in `src/pages/simulations/index.astro` — copy the pattern of the existing `simulations` array entries.

---

## Deploying

The site is configured for Cloudflare Pages with static output. Push to `main` and it deploys automatically.

```bash
git add src/content/essays/my-new-essay.md
git commit -m "add essay: my new essay title"
git push
```
