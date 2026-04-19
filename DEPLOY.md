# Vendly — Guía de deploy

Tiempo estimado: **~3 horas** la primera vez, **~30 minutos** para tiendas nuevas.

---

## Requisitos previos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com) (free tier alcanza)
- Cuenta en [Vercel](https://vercel.com) (free tier alcanza)
- Cuenta de MercadoPago con credenciales de producción
- Cuenta en [Resend](https://resend.com) con dominio verificado
- Cuenta en [360dialog](https://www.360dialog.com) (opcional, para WhatsApp)

---

## Paso 1 — Supabase: base de datos

1. Crear nuevo proyecto en [supabase.com/dashboard](https://supabase.com/dashboard)
2. Ir a **SQL Editor** → **New Query**
3. Pegar el contenido completo de `supabase/schema.sql` y ejecutar con **Run**
4. Verificar que las tablas aparezcan en **Table Editor**

### Variables a copiar (Settings → API):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Paso 2 — Supabase: configurar la tienda

En **Table Editor → store_config**, editar el registro creado por el schema:

| Campo | Valor |
|---|---|
| `name` | Nombre de tu tienda |
| `slug` | nombre-sin-espacios |
| `color_primary` | Color principal (hex) |
| `color_accent` | Color de acento (hex) |
| `hero_title` | Título del hero |
| `hero_cta_label` | Texto del botón CTA |
| `whatsapp_number` | Tu número WA (solo dígitos, ej: 5491100000000) |
| `email` | Email de contacto |
| `free_shipping_threshold` | Monto mínimo para envío gratis (null = sin umbral) |
| `shipping_base_price` | Precio base de envío |

Copiar el `id` del registro — lo necesitás como `NEXT_PUBLIC_STORE_ID`.

---

## Paso 3 — Supabase: bucket de imágenes

El schema ya crea el bucket automáticamente. Verificar en **Storage** que exista `products` con visibilidad **Public**.

Si no existe:
1. **Storage** → **New Bucket**
2. Name: `products`, Public: ✓

---

## Paso 4 — MercadoPago

1. Ir a [Tu negocio → Credenciales de producción](https://www.mercadopago.com.ar/settings/account/credentials)
2. Copiar **Access Token** y **Public Key**

### Configurar webhook:
1. **Tu negocio → Notificaciones → Webhooks**
2. URL: `https://tudominio.com/api/webhooks/mp`
3. Eventos: `payment`
4. Copiar el **secret** generado

```
MP_ACCESS_TOKEN=APP_USR-...
MP_PUBLIC_KEY=APP_USR-...
MP_WEBHOOK_SECRET=el_secret_del_webhook
```

---

## Paso 5 — Resend

1. Crear cuenta en [resend.com](https://resend.com)
2. **Domains** → **Add Domain** → verificar DNS de tu dominio
3. **API Keys** → **Create API Key**

```
RESEND_API_KEY=re_...
RESEND_FROM_DOMAIN=tudominio.com
```

---

## Paso 6 — WhatsApp 360dialog (opcional)

1. Crear cuenta en [360dialog Hub](https://hub.360dialog.com)
2. Activar un número de WhatsApp Business
3. Crear las plantillas en Meta Business:
   - `order_confirmation` — confirmación de pedido
   - `abandoned_cart_recovery` — recuperación de carrito
4. Obtener **API Key** del canal

```
WHATSAPP_360DIALOG_API_KEY=tu_api_key
WHATSAPP_FROM_NUMBER=5491100000000
```

Si no usás WhatsApp, dejar estas variables vacías — el código las maneja gracefully.

---

## Paso 7 — Deploy en Vercel

### 7a. Subir código a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tuusuario/tu-repo.git
git push -u origin main
```

### 7b. Crear proyecto en Vercel
1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
2. Seleccionar el repo → **Deploy**

### 7c. Cargar variables de entorno
En **Settings → Environment Variables**, agregar todas las del `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
MP_ACCESS_TOKEN
MP_PUBLIC_KEY
MP_WEBHOOK_SECRET
RESEND_API_KEY
RESEND_FROM_DOMAIN
WHATSAPP_360DIALOG_API_KEY     (opcional)
WHATSAPP_FROM_NUMBER           (opcional)
NEXT_PUBLIC_BASE_URL           (tu dominio final, ej: https://tienda.com)
NEXT_PUBLIC_STORE_ID           (el id de tu store_config)
CRON_SECRET                    (string aleatorio, ej: openssl rand -hex 32)
```

> ⚠️ Asegurarse de marcar todas las variables como **Production + Preview + Development**.

### 7d. Redeploy
Después de cargar las variables: **Deployments → Redeploy** (o hacer un push nuevo).

---

## Paso 8 — Supabase Auth para el admin

1. En Supabase → **Authentication → Settings**
2. **Site URL**: `https://tudominio.com`
3. **Redirect URLs**: agregar `https://tudominio.com/auth/callback`
4. En **Authentication → Users** crear el usuario admin (o simplemente ir a `/admin/login` y pedir el magic link)

---

## Paso 9 — Dominio custom en Vercel

1. **Settings → Domains** → **Add Domain**
2. Agregar `tudominio.com` y `www.tudominio.com`
3. Vercel muestra los registros DNS a configurar en tu registrar
4. Una vez propagado (~1-24h), el SSL se activa automáticamente

---

## Paso 10 — Verificación final

| Check | Cómo verificar |
|---|---|
| Home carga | `https://tudominio.com` |
| Productos se ven | `https://tudominio.com/productos` |
| Carrito funciona | Agregar producto → ver badge en header |
| Checkout → MP | Completar checkout → redirigir a MP |
| Webhook MP | Hacer un pago de prueba → orden debe quedar `approved` |
| Email de confirmación | Verificar inbox después del pago |
| Admin accesible | `https://tudominio.com/admin/login` |
| Cron visible | Vercel → Settings → Cron Jobs |

---

## Para tiendas nuevas (después de la primera)

1. Clonar el repo
2. Crear nuevo proyecto en Supabase → ejecutar `schema.sql`
3. Editar `store_config` con los datos de la nueva tienda
4. Crear nuevo proyecto en Vercel → cargar las nuevas variables de entorno
5. Deploy → listo

**Tiempo: ~30 minutos.**

---

## Troubleshooting

### "Store config not found"
→ Verificar `NEXT_PUBLIC_STORE_ID` coincide con el `id` en la tabla `store_config`.

### Webhook de MP no actualiza la orden
→ Verificar `MP_WEBHOOK_SECRET` y que la URL del webhook en MP apunte a `/api/webhooks/mp`.

### Emails no llegan
→ Verificar que el dominio en Resend esté verificado (DNS propagado) y que `RESEND_FROM_DOMAIN` sea correcto.

### Cron no se ejecuta
→ Los crons de Vercel solo funcionan en proyectos con plan Pro o en producción (no en preview). Verificar en **Settings → Cron Jobs**.
