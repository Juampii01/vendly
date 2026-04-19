import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Hr,
  Font,
} from '@react-email/components'
import type { AbandonedCart, StoreConfig } from '@/types'

interface AbandonedCartEmailProps {
  cart: AbandonedCart
  store: StoreConfig
  isSecondEmail: boolean
}

export function AbandonedCart({ cart, store, isSecondEmail }: AbandonedCartEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const recoveryUrl = `${baseUrl}/checkout?recover=${cart.recovery_token}`
  const firstName = cart.buyer_name?.split(' ')[0] ?? 'cliente'

  const preview = isSecondEmail
    ? `${firstName}, ¿todavía estás pensando? Tu carrito te espera.`
    : `${firstName}, olvidaste algo en tu carrito de ${store.name}.`

  return (
    <Html lang="es">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={{ ...styles.header, backgroundColor: store.color_primary }}>
            {store.logo_url ? (
              <Img
                src={store.logo_url}
                alt={store.name}
                width={140}
                height={48}
                style={styles.logo}
              />
            ) : (
              <Text style={{ ...styles.storeName, color: store.color_background }}>
                {store.name}
              </Text>
            )}
          </Section>

          {/* Hero */}
          <Section style={styles.heroSection}>
            <Text style={styles.emoji}>{isSecondEmail ? '🤔' : '🛍️'}</Text>
            <Text style={styles.heroTitle}>
              {isSecondEmail
                ? '¿Todavía estás pensando?'
                : `${firstName}, dejaste algo en tu carrito`}
            </Text>
            <Text style={styles.heroSubtitle}>
              {isSecondEmail
                ? 'Tus productos están reservados, pero no por mucho tiempo. ¡No te quedes sin ellos!'
                : 'Guardamos tu carrito para que puedas retomar tu compra cuando quieras.'}
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Productos del carrito */}
          {cart.cart_data?.length > 0 && (
            <Section style={styles.section}>
              <Text style={styles.sectionTitle}>Tus productos</Text>
              {cart.cart_data.slice(0, 3).map((item, idx) => {
                const img = item.product.images[0] ?? null
                return (
                  <Row key={idx} style={styles.itemRow}>
                    <Column style={{ width: '56px' }}>
                      {img ? (
                        <Img
                          src={img}
                          alt={item.product.name}
                          width={48}
                          height={64}
                          style={styles.productImg}
                        />
                      ) : (
                        <div style={styles.productImgPlaceholder} />
                      )}
                    </Column>
                    <Column style={{ flex: 1, paddingLeft: '12px' }}>
                      <Text style={styles.itemName}>{item.product.name}</Text>
                      {item.variant && (
                        <Text style={styles.itemVariant}>
                          {Object.entries(item.variant.attributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' / ')}
                        </Text>
                      )}
                      <Text style={styles.itemQty}>Cantidad: {item.quantity}</Text>
                    </Column>
                    <Column style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Text style={styles.itemPrice}>
                        {formatPrice(item.unit_price * item.quantity)}
                      </Text>
                    </Column>
                  </Row>
                )
              })}
              {cart.cart_data.length > 3 && (
                <Text style={styles.moreItems}>
                  + {cart.cart_data.length - 3} producto{cart.cart_data.length - 3 !== 1 ? 's' : ''} más
                </Text>
              )}

              {/* Subtotal */}
              <Row style={styles.subtotalRow}>
                <Column>
                  <Text style={styles.subtotalLabel}>Subtotal</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={styles.subtotalValue}>{formatPrice(cart.subtotal)}</Text>
                </Column>
              </Row>
            </Section>
          )}

          <Hr style={styles.divider} />

          {/* CTA */}
          <Section style={{ ...styles.section, textAlign: 'center', paddingBottom: '32px' }}>
            <Text style={styles.ctaText}>
              {isSecondEmail
                ? 'Esta es tu última oportunidad de recuperar tu carrito.'
                : 'Hacé click para retomar tu compra exactamente donde la dejaste.'}
            </Text>
            <Link
              href={recoveryUrl}
              style={{
                ...styles.cta,
                backgroundColor: store.color_primary,
                color: store.color_background,
              }}
            >
              {isSecondEmail ? 'Completar mi compra ahora' : 'Volver a mi carrito'}
            </Link>
          </Section>

          {/* Footer */}
          <Section style={{ ...styles.footer, backgroundColor: store.color_primary }}>
            <Text style={{ ...styles.footerText, color: store.color_background }}>
              © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
            </Text>
            <Text style={{ ...styles.footerText, color: store.color_background, opacity: 0.6 }}>
              Recibiste este email porque iniciaste una compra en nuestra tienda.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: '#f3f4f6',
    fontFamily: 'Inter, Arial, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    padding: '24px 32px',
    textAlign: 'center',
  },
  logo: { objectFit: 'contain', margin: '0 auto' },
  storeName: { fontSize: '22px', fontWeight: 700, margin: 0 },
  heroSection: { padding: '32px 32px 24px', textAlign: 'center' },
  emoji: { fontSize: '48px', margin: '0 0 8px' },
  heroTitle: { fontSize: '22px', fontWeight: 700, margin: '0 0 10px', color: '#111827' },
  heroSubtitle: { fontSize: '15px', color: '#6b7280', margin: 0, lineHeight: 1.6 },
  section: { padding: '20px 32px' },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 16px',
  },
  itemRow: { marginBottom: '16px' },
  productImg: { borderRadius: '8px', objectFit: 'cover' },
  productImgPlaceholder: {
    width: '48px',
    height: '64px',
    borderRadius: '8px',
    backgroundColor: '#e5e7eb',
  },
  itemName: { fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 2px' },
  itemVariant: { fontSize: '12px', color: '#9ca3af', margin: '0 0 2px' },
  itemQty: { fontSize: '12px', color: '#6b7280', margin: 0 },
  itemPrice: { fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 },
  moreItems: { fontSize: '13px', color: '#9ca3af', margin: '8px 0 16px' },
  subtotalRow: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '12px',
    marginTop: '8px',
  },
  subtotalLabel: { fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 },
  subtotalValue: { fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 },
  ctaText: { fontSize: '14px', color: '#6b7280', margin: '0 0 20px', lineHeight: 1.6 },
  cta: {
    display: 'inline-block',
    padding: '14px 36px',
    borderRadius: '999px',
    fontSize: '15px',
    fontWeight: 700,
    textDecoration: 'none',
  },
  divider: { borderColor: '#e5e7eb', margin: '0 32px' },
  footer: { padding: '24px 32px', textAlign: 'center' },
  footerText: { fontSize: '12px', margin: '4px 0' },
}
