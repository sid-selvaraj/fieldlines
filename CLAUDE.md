# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build for production (outputs to dist/)
npm run preview   # Preview production build locally
```

## Architecture

This is an [Astro](https://astro.build) project using strict TypeScript.

**Routing:** File-based via `src/pages/`. Each `.astro` or `.md` file in `src/pages/` becomes a URL route automatically.

**Components:** Place reusable `.astro` components in `src/components/` (not yet created).

**Static assets:** Anything in `public/` is served at the root URL (e.g., `public/favicon.svg` → `/favicon.svg`).

**Astro component syntax:** `.astro` files use a frontmatter fence (`---`) for server-side TypeScript/JavaScript, followed by HTML template markup. There is no client-side JS by default — interactivity requires explicit `client:*` directives.

**TypeScript:** Configured with `astro/tsconfigs/strict`. Astro generates types in `.astro/types.d.ts`.

## Repository

This repo (`sid-selvaraj/fieldlines`) is **public**. Never commit WIP files, temp/debug scripts, or anything with sensitive content. Only commit polished, intentional changes.
