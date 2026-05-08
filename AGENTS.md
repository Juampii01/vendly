<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Home pages: config-driven (HomeRenderer)

The store homepage uses a config-driven section system. **Don't write new `*HomePage.tsx` components per vertical** — the legacy ones (`AthleticHomePage`, `ModoHomePage`, `LibreriaHomePage`, etc.) exist only for back-compat and will be migrated.

## How it works

Each store's home is an array of sections stored in `store_config.home_layout` (JSONB). When `home_layout` is set, [app/(store)/page.tsx](app/(store)/page.tsx) routes to [HomeRenderer](components/store/HomeRenderer.tsx), which dispatches each section to a reusable component in [components/store/sections/](components/store/sections/). When `home_layout` is null, the legacy `if (site_type === 'X')` dispatcher kicks in (back-compat).

Section types live in [types/index.ts](types/index.ts) under `HomeSection` — discriminated union, exhaustive in the renderer.

## To add a section type

1. Add the variant to `HomeSectionType` and `HomeSection` in [types/index.ts](types/index.ts)
2. Define `XxxContent` interface
3. Create `components/store/sections/Xxx.tsx` taking `{ content, ctx: SectionContext }`
4. Register in [HomeRenderer.tsx](components/store/HomeRenderer.tsx) switch (TS exhaustiveness check enforces this)
5. Export from [sections/index.ts](components/store/sections/index.ts)

## To onboard a new store

1. Create the store row in `store_config` (existing flow via /platform/stores/new)
2. Pick a preset from [lib/home-presets.ts](lib/home-presets.ts): `athletic`, `default`, or `minimal`
3. Apply: `node scripts/apply-home-preset.mjs <store_id> <preset_name>`
4. The store renders immediately. Customize per-store by editing `home_layout` in DB (admin UI for this is pending).

## Theme tokens

Colors stay in `store_config.color_*` (5 fields). Other design tokens (typography, radius, container max-width) go in `store_config.theme_tokens` JSONB. Defaults live in [lib/theme.ts](lib/theme.ts) → `DEFAULT_THEME_TOKENS`. The layout injects all as CSS vars (`--color-*`, `--font-*`, `--radius-*`, `--container-max`).

## Migration

Schema changes: [supabase/migration_home_layout.sql](supabase/migration_home_layout.sql). Adds `home_layout` and `theme_tokens` columns. Apply once per env via Supabase SQL editor.
