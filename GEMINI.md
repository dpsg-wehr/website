# Website DPSG Wehr - Project Context

## Project Overview

This is the source code for the "DPSG Wehr" website, built with **Astro 7**. The site is **completely statically generated** (`output: "static"`) and deployed as a lightweight static container behind Traefik.

**Key Features:**

- **Static Site Generation (SSG):** Optimized for performance, simplicity, and zero runtime overhead.
- **Dynamic Routing:** Content is decoupled from logic. MDX files are stored in a central `content/` directory and rendered via dynamic Astro routes (`src/pages/`).
- **Automated SEO:** Social previews (Open Graph and Twitter Cards) are automatically generated for every page and post using content excerpts and metadata.
- **Automated Testing:** Comprehensive suite including Unit, Component, and E2E tests with unified reporting.
- **Image Optimization:** Uses Astro's built-in `astro:assets` and Sharp engine, optimizing images automatically into modern WebP formats at build time.

## Tech Stack

- **Framework:** [Astro](https://astro.build) (v7)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) v4, [React Icons](https://react-icons.github.io/react-icons/)
- **Content:** Astro MDX integration (`@astrojs/mdx`), `gray-matter` for frontmatter.
- **Toolchain:** [Vite+](https://viteplus.dev) (`vite-plus`, `vp`) – formatting (Oxfmt), linting (Oxlint; ESLint only for `.astro` templates), type checking (tsgolint), unit tests (Vitest), staged-file checks. Configured in `vite.config.ts` and `vitest.config.ts`.
- **Testing:** [Vitest](https://vitest.dev/) (Unit/Component), [Playwright](https://playwright.dev/) (E2E), [Monocart Reporter](https://github.com/cenfun/monocart-reporter).
- **Package Manager:** [pnpm](https://pnpm.io)

## Directory Structure

- `src/`: Application source directory (`components/`, `lib/`, `types/`, `pages/`, `layouts/`, `styles/`, `assets/`).
- `content/`: Raw content managed as MDX and JSON files (Sveltia/Decap CMS compatible).
- `docs/`: Project documentation.
- `e2e/`: Playwright end-to-end test suite.
- `public/`: Static web assets.
- `scripts/`: Utility scripts (`generate-ics.ts`, `generate-search-index.ts`, `run-lighthouse.ts`).
- `docker-compose.yml`: VPS deployment config.
- `nginx.conf`: Nginx config for static file serving, caching, and security headers.

## Development & Testing

### Key Commands

- **Start Development Server:** `pnpm dev` (Runs Astro dev server at `http://localhost:3000`).
- **Run Unit Tests:** `pnpm test` (Vitest through `vp test`, one run) or `pnpm test:watch` (watch mode).
- **Run E2E Tests:** `pnpm test:e2e` (Playwright).
- **Run All Tests:** `pnpm test:all` (Sequential Vitest + Playwright).
- **Typecheck:** `pnpm typecheck` (`astro check && vp check --no-fmt --no-lint`).
- **Lint:** `pnpm lint` (`vp lint` + `eslint .` for `.astro` templates).
- **Format & Checks:** `pnpm check` (format + lint + type check in one pass), `pnpm check:fix` (apply fixes).
- **Build:** `pnpm build` (Static export to `out/`).

## Release & Deployment Workflow

1. **CI/CD with Forgejo Actions (`.forgejo/workflows/deploy.yaml`):**
    - Triggered on push to `main` (production), `dev` (staging), or release tags (`v*`).
    - Builds static website and optimizes images with `pnpm build`.
    - Builds container image using `Dockerfile.static` with standard OCI labels (`org.opencontainers.image.*`) including `source`, `revision`, `version`, and `created`.
    - Tags images with SemVer (`<version>`, `v<version>`, `dev.<run>`, `v<version>-dev.<run>`), major/minor aliases, short/full SHA, and floating tags (`latest` or `dev`).
    - Publishes all tags to the Forgejo Container Registry (`git.linus-fischer.de/linus/website-dpsg-wehr`).
2. **GitOps & Automated Deployment (Komodo + Renovate):**
    - Service configuration stacks are managed in a central Git repository.
    - Renovate bot detects new container image releases/alpha dev tags via the Forgejo registry and standard OCI labels.
    - Merged updates in the service configuration repository trigger webhooks on Komodo, which automatically pulls and rolls out container updates.
