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
import type { Order, StoreConfig } from '@/types'

interface OrderConfirmationProps {
  order: Order
  store: StoreConfig
}

export function OrderConfirmation({ order, store }: OrderConfirmationProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const orderUrl = `${baseUrl}/orden/${order.id}`

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
      <Preview>
        ¡Tu pedido #{order.id.slice(0, 8).toUpperCase()} fue confirmado! Gracias por comprar en{' '}
        {store.name}.
      </Preview>
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

          {/* Confirmación */}
          <Section style={styles.heroSection}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.heroTitle}>¡Pedido confirmado!</Text>
            <Text style={styles.heroSubtitle}>
              Hola {order.buyer_name}, tu compra fue procesada exitosamente.
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Número de orden */}
          <Section style={styles.section}>
            <Row>
              <Column>
                <Text style={styles.labelSmall}>Número de orden</Text>
                <Text style={styles.orderNumber}>#{order.id.slice(0, 8).toUpperCase()}</Text>
              </Column>
              <Column>
                <Text style={styles.labelSmall}>Estado</Text>
                <Text style={{ ...styles.badge, backgroundColor: store.color_accent + '20', color: store.color_accent }}>
                  Confirmada
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={styles.divider} />

          {/* Items */}
          <Section style={styles.section}>
            <Text style={styles.sectionTitle}>Tu pedido</Text>
            {order.items?.map((item) => (
              <Row key={item.id} style={styles.itemRow}>
                <Column style={{ width: '56px' }}>
                  {item.product_image && (
                    <Img
                      src={item.product_image}
                      alt={item.product_name}
                      width={48}
                      height={64}
                      style={styles.productImg}
                    />
                  )}
                </Column>
                <Column style={{ flex: 1, paddingLeft: '12px' }}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  {item.variant_label && (
                    <Text style={styles.itemVariant}>{item.variant_label}</Text>
                  )}
                  <Text style={styles.itemQty}>Cantidad: {item.quantity}</Text>
                </Column>
                <Column style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <Text style={styles.itemPrice}>{formatPrice(item.subtotal)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={styles.divider} />

          {/* Totales */}
          <Section style={styles.section}>
            <Row style={styles.totalRow}>
              <Column><Text style={styles.totalLabel}>Subtotal</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={styles.totalValue}>{formatPrice(order.subtotal)}</Text></Column>
            </Row>
            {order.discount_amount > 0 && (
              <Row style={styles.totalRow}>
                <Column><Text style={{ ...styles.totalLabel, color: '#16a34a' }}>Descuento</Text></Column>
                <Column style={{ textAlign: 'right' }}><Text style={{ ...styles.totalValue, color: '#16a34a' }}>−{formatPrice(order.discount_amount)}</Text></Column>
              </Row>
            )}
            <Row style={styles.totalRow}>
              <Column><Text style={styles.totalLabel}>Envío</Text></Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={styles.totalValue}>
                  {order.shipping_amount === 0 ? 'Gratis' : formatPrice(order.shipping_amount)}
                </Text>
              </Column>
            </Row>
            <Row style={{ ...styles.totalRow, borderTop: '2px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}>
              <Column><Text style={{ ...styles.totalLabel, fontWeight: 700, fontSize: '16px' }}>Total</Text></Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{ ...styles.totalValue, fontWeight: 700, fontSize: '16px', color: store.color_primary }}>
                  {formatPrice(order.total)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={styles.divider} />

          {/* Dirección de entrega */}
          <Section style={styles.section}>
            <Text style={styles.sectionTitle}>Dirección de entrega</Text>
            <Text style={styles.address}>
              {order.shipping_street}
              {'\n'}
              {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
              {'\n'}
              {order.shipping_country}
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ ...styles.section, textAlign: 'center', paddingBottom: '32px' }}>
            <Link
              href={orderUrl}
              style={{ ...styles.cta, backgroundColor: store.color_primary, color: store.color_background }}
            >
              Ver mi pedido
            </Link>
          </Section>

          {/* Footer */}
          <Section style={{ ...styles.footer, backgroundColor: store.color_primary }}>
            <Text style={{ ...styles.footerText, color: store.color_background }}>
              © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
            </Text>
            {store.email && (
              <Text style={{ ...styles.footerText, color: store.color_background, opacity: 0.7 }}>
                ¿Preguntas? Escribinos a{' '}
                <Link href={`mailto:${store.email}`} style={{ color: store.color_background }}>
                  {store.email}
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  logo: {
    objectFit: 'contain',
    margin: '0 auto',
  },
  storeName: {
    fontSize: '22px',
    fontWeight: 700,
    margin: 0,
  },
  heroSection: {
    padding: '32px 32px 24px',
    textAlign: 'center',
  },
  checkmark: {
    fontSize: '48px',
    margin: '0 0 8px',
    color: '#16a34a',
  },
  heroTitle: {
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 8px',
    color: '#111827',
  },
  heroSubtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
  },
  section: {
    padding: '20px 32px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 16px',
  },
  labelSmall: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 4px',
  },
  orderNumber: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
    fontFamily: 'monospace',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: 600,
    margin: 0,
  },
  itemRow: {
    marginBottom: '16px',
  },
  productImg: {
    borderRadius: '8px',
    objectFit: 'cover',
  },
  itemName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 2px',
  },
  itemVariant: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0 0 2px',
  },
  itemQty: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
  },
  itemPrice: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  totalRow: {
    marginBottom: '6px',
  },
  totalLabel: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  totalValue: {
    fontSize: '14px',
    color: '#111827',
    margin: 0,
  },
  address: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: 'pre-line',
  },
  cta: {
    display: 'inline-block',
    padding: '14px 32px',
    borderRadius: '999px',
    fontSize: '15px',
    fontWeight: 700,
    textDecoration: 'none',
  },
  divider: {
    borderColor: '#e5e7eb',
    margin: '0 32px',
  },
  footer: {
    padding: '24px 32px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '12px',
    margin: '4px 0',
  },
}
