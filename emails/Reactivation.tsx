import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Img,
  Text,
  Link,
  Hr,
  Font,
} from '@react-email/components'
import type { StoreConfig } from '@/types'

interface ReactivationProps {
  customer: { email: string; full_name: string }
  store: StoreConfig
}

export function Reactivation({ customer, store }: ReactivationProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const firstName = customer.full_name.split(' ')[0]

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
        {firstName}, ¡te extrañamos! Mirá las novedades que tenemos para vos en {store.name}.
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

          {/* Hero */}
          <Section style={styles.heroSection}>
            <Text style={styles.emoji}>💜</Text>
            <Text style={styles.heroTitle}>¡Te extrañamos, {firstName}!</Text>
            <Text style={styles.heroSubtitle}>
              Hace un tiempo que no te vemos por acá. Pasá a ver las novedades que
              preparamos especialmente para vos.
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Beneficio */}
          <Section style={{ ...styles.section, textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                borderRadius: '16px',
                padding: '24px 32px',
                backgroundColor: store.color_primary + '10',
                margin: '0 auto',
              }}
            >
              <Text style={{ ...styles.benefitTitle, color: store.color_primary }}>
                🎉 Hay novedades esperándote
              </Text>
              <Text style={styles.benefitDesc}>
                Nuevos productos, los mejores precios y todo lo que necesitás.
              </Text>
            </div>
          </Section>

          <Hr style={styles.divider} />

          {/* CTA */}
          <Section style={{ ...styles.section, textAlign: 'center', paddingBottom: '32px' }}>
            <Text style={styles.ctaText}>
              Hacé click para ver todo lo nuevo que tenemos para vos.
            </Text>
            <Link
              href={`${baseUrl}/productos`}
              style={{
                ...styles.cta,
                backgroundColor: store.color_primary,
                color: store.color_background,
              }}
            >
              Ver novedades
            </Link>
          </Section>

          {/* Footer */}
          <Section style={{ ...styles.footer, backgroundColor: store.color_primary }}>
            <Text style={{ ...styles.footerText, color: store.color_background }}>
              © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
            </Text>
            {store.email && (
              <Text style={{ ...styles.footerText, color: store.color_background, opacity: 0.6 }}>
                ¿Consultas?{' '}
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
  header: { padding: '24px 32px', textAlign: 'center' },
  logo: { objectFit: 'contain', margin: '0 auto' },
  storeName: { fontSize: '22px', fontWeight: 700, margin: 0 },
  heroSection: { padding: '40px 32px 28px', textAlign: 'center' },
  emoji: { fontSize: '48px', margin: '0 0 12px' },
  heroTitle: { fontSize: '24px', fontWeight: 700, margin: '0 0 12px', color: '#111827' },
  heroSubtitle: { fontSize: '15px', color: '#6b7280', margin: 0, lineHeight: 1.7 },
  section: { padding: '24px 32px' },
  benefitTitle: { fontSize: '18px', fontWeight: 700, margin: '0 0 8px' },
  benefitDesc: { fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: 1.6 },
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
