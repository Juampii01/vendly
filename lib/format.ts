export function formatVariantLabel(attributes: Record<string, string>): string {
  return Object.entries(attributes)
    .map(([key, val]) => `${key}: ${val}`)
    .join(' / ')
}

/**
 * Formatea un número como precio usando la localización y moneda del store.
 *
 * @param n        - Monto numérico
 * @param currency - Código ISO 4217 (por defecto 'ARS'). Usar store.currency en contextos con store.
 * @param locale   - Locale BCP 47 (por defecto 'es-AR'). Usar store.locale en contextos con store.
 */
export function formatPrice(n: number, currency = 'ARS', locale = 'es-AR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n)
}
