# Website DPSG Wehr - AI Agent Rules & Architecture Guidelines

This repository is built with **Astro 7** (Static Site Generation with React islands where needed) and **Tailwind CSS v4**.

## Key Guidelines

- **Language:** Always communicate and respond in English.
- **Architecture:** Astro is used for SSG (`output: "static"` in `astro.config.mjs`, output dir `out/`).
- **Pages & Routing:** Astro pages are located in `src/pages/`. Layouts are in `src/layouts/`.
- **Content:** MDX content is in `content/` and loaded statically. Decap CMS admin is configured in `public/admin/`.
- **Testing:**
    - Vitest runs unit and component tests: `pnpm test` or `pnpm test --run`.
    - Playwright runs E2E tests: `pnpm test:e2e`.
    - Run all tests: `pnpm test:all`.
- **Verification:** Always ensure `pnpm lint`, `pnpm typecheck`, `pnpm test:all`, and `pnpm build` pass with 0 errors.
