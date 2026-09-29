# Website DPSG Wehr - Agent Rules & Architecture Guidelines

This repository is built with **Astro 7** (Static Site Generation with React islands where needed) and **Tailwind CSS v4**.

---

## 1. Core Operating Philosophy: Safety Nets, Not Guard Rails

- **Derisk the Merge Button:** You must never declare a task complete or submit a pull request without full local automated verification. You are responsible for ensuring your changes are 100% bug-free, typechecked, and tested before requesting human review.
- **Investigate Before Rewriting:** For non-trivial tasks or unexpected bugs, run an audit first. Inspect root causes, examine edge cases, and outline a minimal fix before modifying critical application code.
- **Burn Tokens on Verification:** When in doubt, add unit tests (`Vitest`) or integration/accessibility tests (`Playwright`). Tests are the safety net that enables rapid parallel shipping.

---

## 2. Hard Invariants & Non-Negotiables

- **Pure Static Site Generation (SSG):** `output: "static"` in `astro.config.mjs`. All HTML pages and assets are pre-rendered into `out/`. Never introduce Node runtime server-side dependencies in production code.
- **Client/Server Boundary:** Never access `window`, `document`, or browser APIs outside of React client island lifecycle hooks (`useEffect`, event handlers) or guarded client checks.
- **Language Conventions:**
    - **Internal / Code:** Always write code, comments, documentation, commit messages, and agent conversation responses in **English**.
    - **User Interface / Content:** All user-facing website content, labels, and MDX articles are in **German**.
- **Package Manager:** Strictly use **pnpm** (version specified in `packageManager`).

---

## 3. Tech Stack & Directory Structure

- **Framework:** Astro 7 (`src/pages/`, `src/layouts/`)
- **React Islands:** React 19 (`src/components/`) used selectively via `client:load`, `client:visible`, or `client:idle` for interactive widgets (calendar, search, lightbox).
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`), dark mode compatible.
- **Content:** MDX files in `content/` with YAML frontmatter, managed statically and compatible with Decap CMS (`public/admin/`).
- **Pre-build Scripts:**
    - `scripts/generate-ics.ts`: Generates calendar ICS feeds (`public/events.ics`, `public/internal-events.ics`).
    - `scripts/generate-search-index.ts`: Pre-indexes site content for Fuse.js search.
- **Testing Suites:**
    - Unit/Component: `Vitest` (`*.test.ts`, `*.test.tsx`)
    - End-to-End & A11y: `Playwright` (`e2e/*.spec.ts`) with `@axe-core/playwright` accessibility audits.

---

## 4. Verification Protocol (The Golden Gate)

Before completing any task or preparing a commit/PR, you MUST run and pass:

```bash
pnpm typecheck && pnpm lint && pnpm test:all && pnpm build
```

1. **`pnpm typecheck`** (`astro check && tsc --noEmit`): Zero TypeScript or Astro component diagnostic errors.
2. **`pnpm lint`** (`eslint .`): Zero ESLint errors.
3. **`pnpm test:all`** (`pnpm test --run && pnpm test:e2e`): All Vitest and Playwright test suites must pass (100% pass rate).
4. **`pnpm build`** (`astro build`): Generates static output in `out/` with zero missing asset or prerendering errors.

---

## 5. Git, Worktree & Issue Conventions

- **Worktree Isolation:** Work on isolated branches/worktrees per task. Never clobber uncommitted work on base branches.
- **Conventional Commits:** Write clean, structured commit messages compatible with Semantic Release:
    - `feat: add calendar export button on events page`
    - `fix: resolve hydration mismatch on mobile sidebar`
    - `test: add e2e test for photo gallery lightbox`
    - `refactor: simplify search index generation logic`
- **Issue Linking:** Reference Forgejo/GitHub issues in commit messages and PR descriptions:
    - Use `Fixes #<id>` or `Closes #<id>` to ensure automated closing upon merge.
- **Pull Request Linking:** When working in T3 Code, link every created PR to the thread immediately.
- **CLI:** This repo is hosted on Forgejo so use the fj cli.
