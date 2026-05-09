-- =============================================================================
-- COUPON DESCRIPTION
-- Pedido del cliente: poder aclarar a qué refiere el cupón. Ej.:
-- "Descuento abonando en efectivo en el local"
-- "Aplica solo en remeras de la colección verano"
-- Se muestra en el admin (lista de cupones) y en checkout (debajo del código).
-- =============================================================================

alter table coupons
  add column if not exists description text;
