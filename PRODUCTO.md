# Vendly — Documento de Producto

> Última actualización: Abril 2026  
> Estado: En desarrollo activo

---

## ¿Qué es Vendly?

Vendly es una plataforma SaaS multi-tenant para crear y gestionar sitios web y tiendas online. El operador de plataforma (vos) construye y entrega sitios a sus clientes. Cada cliente recibe su propio sitio, panel de administración, dominio y herramientas de gestión — sin ver nada del resto de la plataforma.

**La propuesta de valor en una línea:**
> Construís el sitio una vez, lo entregás con accesos y panel limitado, y el cliente lo gestiona solo desde ahí en adelante.

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 15 (App Router, Server Components) |
| Base de datos | Supabase (PostgreSQL + Row Level Security) |
| Hosting | Vercel (multi-tenant por subdominio) |
| Email | Resend (por store o global fallback) |
| Pagos | MercadoPago (por store o global fallback) |
| WhatsApp | 360dialog Cloud API |
| IA | Anthropic Claude (haiku para diseño, sonnet para contenido) |
| Estilos | Tailwind CSS |

---

## Arquitectura multi-tenant

Cada sitio vive en un subdominio propio:
- En producción: `slug.vendly.com` o dominio personalizado `mitienda.com`
- En desarrollo: `slug.localhost:3000`

El middleware de Next.js detecta el subdominio y enruta al contexto correcto. Cada store tiene su propia configuración, credenciales de integraciones, usuarios y datos completamente aislados.

```
vendly.com          → plataforma (operador)
ona-store.vendly.com → tienda Ona (cliente 1)
adidas.vendly.com   → tienda Adidas (cliente 2)
mitienda.com        → dominio personalizado (cliente 3)
```

---

## Tipos de sitio

Vendly no es solo para tiendas. Cada sitio creado tiene un `site_type` que define qué secciones, rutas y panel de administración recibe.

### Tipos disponibles (roadmap)

#### `ecommerce` — Tienda online ✅ (actual)
Para: ropa, calzado, electrodomésticos, cualquier producto físico o digital.

**Secciones del sitio:**
- Home con hero, marquee, editorial, split image
- Catálogo de productos con filtros
- Detalle de producto
- Carrito de compras
- Checkout con datos de envío
- Pasarela de pago (MercadoPago)
- Confirmación de orden

**Panel de administración:**
- Dashboard con métricas de ventas
- Productos (crear, editar, stock, variantes)
- Órdenes (estados, historial)
- Clientes (base de datos)
- Carritos abandonados + recuperación por WhatsApp
- Usuarios y roles

---

#### `landing` — Página de presentación 🔜 (próximo)
Para: negocios de servicios, profesionales, emprendimientos, eventos, apps.

**Secciones configurables:**
- Hero con CTA
- Sobre nosotros / historia
- Servicios o características
- Testimonios de clientes
- Precios / planes
- Galería de fotos
- Formulario de contacto
- FAQ
- Mapa / ubicación

**Panel de administración:**
- Dashboard con visitas y formularios recibidos
- Editor de secciones (activar/desactivar, reordenar)
- Mensajes de contacto recibidos
- Configuración general

---

#### `portfolio` — Portafolio / estudio 🔜 (próximo)
Para: fotógrafos, diseñadores, arquitectos, creativos, agencias.

**Secciones configurables:**
- Hero con frase y foto
- Proyectos / trabajos (galería)
- Servicios ofrecidos
- Sobre el artista / estudio
- Proceso de trabajo
- Clientes y logos
- Formulario de contacto / presupuesto

**Panel de administración:**
- Gestión de proyectos (subir fotos, describir)
- Formularios de consulta recibidos

---

#### `restaurant` — Restaurante / café 🔜 (próximo)
Para: restaurantes, bares, cafeterías, rotiserías, casas de comida.

**Secciones configurables:**
- Hero con foto del local
- Menú organizado por categorías
- Sobre el local / historia
- Galería del espacio
- Horarios y ubicación
- Reservas (formulario o link externo)
- WhatsApp directo para pedidos

**Panel de administración:**
- Gestión del menú (platos, categorías, precios, disponibilidad)
- Reservas recibidas

---

#### `services` — Empresa de servicios 🔜 (próximo)
Para: inmobiliarias, estudios contables, clínicas, talleres, consultoras.

**Secciones configurables:**
- Hero corporativo
- Servicios detallados
- Equipo / profesionales
- Casos de éxito / experiencia
- Proceso de trabajo
- Clientes y certificaciones
- Formulario de consulta / turno
- Blog / novedades (opcional)

**Panel de administración:**
- Editor de servicios
- Gestión de equipo
- Consultas recibidas

---

## Funcionalidades actuales

### Plataforma (operador)

| Feature | Estado |
|---------|--------|
| Panel multi-store con listado de sitios | ✅ |
| Crear / gestionar stores | ✅ |
| Ver métricas por store (órdenes, revenue) | ✅ |
| Activar / desactivar / suspender stores | ✅ |
| Monitor de salud multi-store (pages, APIs, SEO) | ✅ |
| Gestión de dominios personalizados | ✅ |
| Vista de integraciones por store (MP, Resend, WA) | ✅ |
| Analytics global (revenue, órdenes, todos los stores) | ✅ |
| Asistente de diseño IA por store | ✅ |

### Tienda (ecommerce)

| Feature | Estado |
|---------|--------|
| Catálogo con filtros por categoría | ✅ |
| Detalle de producto con variantes | ✅ |
| Carrito persistente (localStorage) | ✅ |
| Checkout completo con datos de envío | ✅ |
| Pago con MercadoPago | ✅ |
| Cupones de descuento (% y monto fijo, max usos, expiración) | ✅ |
| Órdenes con estados y historial | ✅ |
| Email de confirmación de orden (Resend) | ✅ |
| Recuperación de carritos abandonados (email drip 2 pasos) | ✅ |
| Recuperación de carritos abandonados (WhatsApp automático) | ✅ |
| PWA (installable, offline support) | ✅ |
| SEO meta tags por store | ✅ |

### Panel de administración (store owner)

| Feature | Estado |
|---------|--------|
| Dashboard con métricas del día y gráfico 30 días | ✅ |
| Gestión de productos (crear, editar, activar, stock) | ✅ |
| Gestión de órdenes con cambio de estado | ✅ |
| Base de clientes | ✅ |
| Gestión de usuarios y roles (owner / admin) | ✅ |
| Branding: logo y nombre en el panel | ✅ |

---

## Funcionalidades en desarrollo

### 1. Carritos abandonados — panel manual + WhatsApp + cupones 🔨

**Problema que resuelve:** Hoy los carritos se recuperan automáticamente por cron, pero el dueño de la tienda no puede ver quién los abandonó ni actuar manualmente.

**Lo que se construye:**
- Nueva página `/admin/carritos` con listado: nombre, teléfono, productos, total, hace cuánto
- Botón **"Enviar WhatsApp"** por carrito → abre modal
- Modal: sugiere cupón personalizado (`NOMBRE20`), porcentaje, cantidad de usos
- Al confirmar: crea el cupón en la DB y abre `wa.me/549...` con el mensaje ya escrito
- El mensaje incluye: saludo con nombre, productos del carrito, link de recuperación con cupón

**Flujo completo:**
```
Admin ve carrito → hace clic en "Enviar WhatsApp" → modal con cupón sugerido
→ ajusta los valores → "Generar y abrir WhatsApp" → se crea el cupón
→ se abre wa.me con mensaje pre-armado → admin lo envía desde su celular
```

**Por qué link wa.me y no API automática:**
No requiere cuenta Business de Meta verificada. El admin envía desde su propio WhatsApp, lo que genera más confianza en el receptor. La API automática es Fase 2.

---

### 2. Gestión de cupones — panel admin 🔨

**Problema que resuelve:** La tabla de cupones existe pero no hay UI para crearlos ni gestionarlos.

**Lo que se construye:**
- Nueva página `/admin/cupones`
- Lista de cupones con: código, tipo, valor, usos actuales/máximos, estado, expiración
- Formulario para crear cupón: código (manual o auto-generado), tipo (% o fijo), valor, usos máximos, fecha de expiración, monto mínimo de compra
- Botón para desactivar / reactivar

---

### 3. Email de entrega al cliente 🔜

**Problema que resuelve:** Cuando el sitio está listo y el operador lo activa, no hay ningún email formal que llegue al cliente con sus accesos.

**Lo que se construye:**
- Template Resend de bienvenida/entrega
- Contenido: URL del sitio, email y contraseña del owner, instrucciones básicas, links a tutoriales, contacto de soporte
- Se dispara automáticamente cuando el operador cambia el status del store a `active`
- Opcional: el operador puede personalizar el mensaje antes de enviar

---

### 4. Analytics de visitas en el admin del store 🔜

**Problema que resuelve:** El dashboard del store solo muestra métricas de ventas. No hay datos de visitas, páginas vistas ni comportamiento.

**Lo que se construye:**
- Script de analytics propio embebido en el store (sin cookies, sin GDPR complejo)
- Tabla `page_views` en Supabase: timestamp, path, referrer, store_id
- Widget en el dashboard del admin: visitas hoy, visitas 30 días, páginas más vistas
- Sin dependencia de Google Analytics ni servicios externos

---

### 5. Tipos de sitio — landing pages y más 🔜

**Problema que resuelve:** Vendly solo sirve para ecommerce. Clientes con negocios de servicios, profesionales o negocios locales no tienen dónde entrar.

**Lo que se construye:**
- Campo `site_type` en `store_config`: `ecommerce` | `landing` | `portfolio` | `restaurant` | `services`
- El operador elige el tipo al crear el sitio
- El frontend renderiza las secciones correspondientes al tipo
- El admin muestra/oculta secciones según el tipo (un landing no tiene "Productos" ni "Órdenes")
- El asistente de diseño IA adapta su lenguaje y sugerencias al tipo de sitio
- Sistema de secciones JSON para landing: el operador activa/desactiva y reordena secciones

---

### 6. Onboarding del store owner 🔜

**Problema que resuelve:** El dueño de la tienda recibe acceso pero no sabe por dónde empezar.

**Lo que se construye:**
- Checklist de primeros pasos en el dashboard: "Agregá tu primer producto", "Configurá los medios de pago", "Personalizá tu tienda"
- Cada ítem tiene un link a la sección correspondiente
- Se marca completado automáticamente cuando el usuario completa la acción
- Desaparece una vez completados todos los pasos

---

### 7. Permisos granulares por rol 🔜

**Problema que resuelve:** Hoy `owner` y `admin` ven exactamente lo mismo. No hay forma de limitar qué puede hacer cada usuario.

**Lo que se construye:**
- Tabla de permisos por store: `can_edit_products`, `can_view_orders`, `can_manage_users`, etc.
- El owner puede configurar los permisos de cada admin desde `/admin/usuarios`
- El backend valida los permisos en cada endpoint sensible

---

## Modelo de entrega al cliente

Cuando un sitio está terminado, esto es lo que recibe el cliente:

1. **El sitio publicado** — activo en su subdominio o dominio personalizado
2. **Acceso al panel** — email y contraseña enviados por mail formal
3. **Panel simplificado** — solo ve lo que necesita operar (no el lado plataforma)
4. **Métricas básicas** — ventas, órdenes, carritos (analytics de visitas próximamente)
5. **Herramientas de recuperación** — carritos abandonados con WhatsApp y cupones
6. **Email de entrega formal** — con todos los accesos, URL y guía de uso
7. **Monitor silencioso** — el operador recibe alertas si algo falla, el cliente no ve nada raro

---

## Lo que NO accede el cliente

- El panel de plataforma (`vendly.com/platform`)
- El asistente de diseño IA (solo el operador)
- Los datos de otros stores
- Las credenciales de integraciones (solo las usa el sistema)
- El monitor de salud técnico

---

## Integraciones por store

Cada store puede tener sus propias credenciales o usar las globales de la plataforma como fallback:

| Integración | Uso | Config |
|-------------|-----|--------|
| **MercadoPago** | Cobros online | `mp_access_token` + `mp_public_key` por store |
| **Resend** | Emails transaccionales | `resend_api_key` + `resend_from_domain` por store |
| **WhatsApp (360dialog)** | Mensajes automáticos y manuales | `wa_api_key` + `wa_from_number` por store |

---

## Roadmap resumido

```
HOY             Ecommerce completo, diseño IA, monitor, analytics global
↓
Q2 2026         Carritos → panel manual + WhatsApp + cupones
                Cupones → UI de gestión
                Email de entrega al activar store
↓
Q3 2026         Analytics de visitas en el admin del store
                Tipos de sitio: landing page
                Onboarding checklist para store owner
↓
Q4 2026         Tipos de sitio: portfolio, restaurant, services
                Permisos granulares por rol
                WhatsApp Business API (envío automático sin intervención manual)
                Blog / entradas para sitios de servicios
↓
2027            App mobile para el dueño de la tienda
                Marketplace de templates
                Reportes exportables (PDF/Excel)
                Integración con sistemas de gestión (facturación, ERP)
```

---

## Glosario

| Término | Significado |
|---------|-------------|
| **Operador** | Vos — el que usa la plataforma para crear sitios para clientes |
| **Store / Sitio** | Un sitio web creado en Vendly para un cliente |
| **Store owner** | El cliente que recibe el sitio y lo administra |
| **Admin** | Usuario secundario que el owner puede agregar a su panel |
| **Tenant config** | Las credenciales propias de cada store (MP, Resend, WA) |
| **Site type** | El tipo de sitio: ecommerce, landing, portfolio, etc. |
| **Recovery token** | Token único para recuperar un carrito abandonado |
| **Cron** | Tarea automática que corre periódicamente (ej. envío de mails de carritos) |
