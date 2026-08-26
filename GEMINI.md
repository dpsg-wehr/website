# Website DPSG Wehr - Project Context

## Project Overview

This is the source code for the "DPSG Wehr" website, built with **Next.js 16** (App Router). The site is **completely statically generated** (`output: "export"`) and deployed as a lightweight static container behind Traefik.

**Key Features:**

- **Static Site Generation (SSG):** Optimized for performance, simplicity, and low hosting costs.
- **Dynamic Routing:** Content is decoupled from logic. MDX files are stored in a central `content/` directory and rendered via dynamic route templates.
- **Automated SEO:** Social previews (Open Graph and Twitter Cards) are automatically generated for every page and post using content excerpts.
- **Automated Testing:** Comprehensive suite including Unit, Component, and E2E tests with unified reporting.
- **Image Optimization:** Uses `next-image-export-optimizer` for build-time optimization compatible with static export.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com), [React Icons](https://react-icons.github.io/react-icons/)
- **Content:** MDX rendered via `next-mdx-remote`, `gray-matter` for frontmatter.
- **Testing:** [Vitest](https://vitest.dev/) (Unit/Component), [Playwright](https://playwright.dev/) (E2E), [Monocart Reporter](https://github.com/cenfun/monocart-reporter).
- **Package Manager:** [pnpm](https://pnpm.io)

## Directory Structure

- `app/`: Next.js App Router directory.
- `content/`: Raw content managed as MDX and JSON files.
- `docs/`: Project documentation (Architecture, etc.).
- `scripts/`: Utility scripts (`setup-vps.sh`, `vps-deploy.sh`, `generate-ics.ts`, `generate-search-index.ts`).
- `docker-compose.yml`: VPS deployment config.
- `nginx.conf`: Nginx config for static file serving, caching, and security headers.

## Development & Testing

### Key Commands

- **Start Development Server:** `pnpm dev` (Runs at `http://localhost:3000`).
- **Run Unit Tests:** `pnpm test` (Vitest watch mode).
- **Run E2E Tests:** `pnpm test:e2e` (Playwright).
- **Run All Tests:** `pnpm test:all` (Sequential Vitest + Playwright).
- **Build:** `pnpm build` (Static export).
- **Export & Optimize:** `pnpm export` (Build + Image optimizer + Inlined CSS).
- **Setup VPS:** `./scripts/setup-vps.sh` (Initializes env/webhook config).

## Release & Deployment Workflow

1. **CI/CD with Forgejo Actions (`.forgejo/workflows/deploy.yaml`):**
    - Triggered on push to `main` or `dev`.
    - Builds static website and optimizes images with `next-image-export-optimizer`.
    - Packages into lightweight `nginx:alpine` image (`Dockerfile.static`).
    - Streams Docker image directly to the VPS over Tailscale SSH (`docker save | ssh docker load`) and runs `docker compose up -d` with rolling updates.
2. **VPS Minimal Deployment:**
    - VPS only maintains `docker-compose.yml`, `.env`, and `public/generated`.
    - `website` serves production (`dpsg-wehr.de`).
    - `website-dev` serves dev preview (`dev.dpsg-wehr.de`) routed via Traefik behind Authentik forward-auth middleware.
