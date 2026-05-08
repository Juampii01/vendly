import type { ThemeTokens, StoreConfig } from '@/types'

// Defaults sensatos para todo lo NO especificado en store.theme_tokens.
// Match con el look "athletic" que ya teníamos en AthleticHomePage.tsx,
// porque es el que más stores usan hoy.
export const DEFAULT_THEME_TOKENS: Required<Omit<ThemeTokens, 'radius'>> & { radius: Required<NonNullable<ThemeTokens['radius']>> } = {
  fontHeading:       'Inter, system-ui, sans-serif',
  fontBody:          'Inter, system-ui, sans-serif',
  headingWeight:     '900',
  headingTransform:  'uppercase',
  headingTracking:   '-0.02em',
  radius: { sm: '4px', md: '8px', lg: '16px' },
  sectionPaddingY:   'py-16 md:py-20',
  containerMaxWidth: '1440px',
}

/** Merge tokens del store con defaults. Cualquier campo undefined cae al default. */
export function resolveTokens(store: Pick<StoreConfig, 'theme_tokens'>): typeof DEFAULT_THEME_TOKENS {
  const t = store.theme_tokens ?? {}
  return {
    fontHeading:       t.fontHeading       ?? DEFAULT_THEME_TOKENS.fontHeading,
    fontBody:          t.fontBody          ?? DEFAULT_THEME_TOKENS.fontBody,
    headingWeight:     t.headingWeight     ?? DEFAULT_THEME_TOKENS.headingWeight,
    headingTransform:  t.headingTransform  ?? DEFAULT_THEME_TOKENS.headingTransform,
    headingTracking:   t.headingTracking   ?? DEFAULT_THEME_TOKENS.headingTracking,
    radius: {
      sm: t.radius?.sm ?? DEFAULT_THEME_TOKENS.radius.sm,
      md: t.radius?.md ?? DEFAULT_THEME_TOKENS.radius.md,
      lg: t.radius?.lg ?? DEFAULT_THEME_TOKENS.radius.lg,
    },
    sectionPaddingY:   t.sectionPaddingY   ?? DEFAULT_THEME_TOKENS.sectionPaddingY,
    containerMaxWidth: t.containerMaxWidth ?? DEFAULT_THEME_TOKENS.containerMaxWidth,
  }
}

/** CSS string con todas las variables (--vendly-*) para inyectar en <style>. */
export function tokensToCssVars(store: Pick<StoreConfig, 'theme_tokens' | 'color_primary' | 'color_secondary' | 'color_accent' | 'color_background' | 'color_text'>): string {
  const t = resolveTokens(store)
  return `:root {
    --color-primary:   ${store.color_primary};
    --color-secondary: ${store.color_secondary};
    --color-accent:    ${store.color_accent};
    --color-bg:        ${store.color_background};
    --color-text:      ${store.color_text};
    --font-heading:    ${t.fontHeading};
    --font-body:       ${t.fontBody};
    --heading-weight:  ${t.headingWeight};
    --heading-tracking:${t.headingTracking};
    --radius-sm:       ${t.radius.sm};
    --radius-md:       ${t.radius.md};
    --radius-lg:       ${t.radius.lg};
    --container-max:   ${t.containerMaxWidth};
  }`
}
