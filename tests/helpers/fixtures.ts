import type { CartItem, CheckoutFormData } from '@/types'

export const STORE_A = 'store-a-uuid'
export const STORE_B = 'store-b-uuid'   // tenant distinto, para tests de cross-tenant

export const productRow = (over: Partial<{ id: string; price: number; is_active: boolean }> = {}) => ({
  id: 'p-rem-001',
  price: 19500,
  is_active: true,
  ...over,
})

export const variantRow = (over: Partial<{
  id: string; price_override: number | null; is_active: boolean; stock: number; product_id: string
}> = {}) => ({
  id: 'v-rem-001-m',
  price_override: null,
  is_active: true,
  stock: 5,
  product_id: 'p-rem-001',
  ...over,
})

export const storeConfigRow = (over: Partial<{
  free_shipping_threshold: number | null; shipping_base_price: number; currency: string; base_url: string
}> = {}) => ({
  free_shipping_threshold: 30000,
  shipping_base_price: 2500,
  currency: 'ARS',
  base_url: 'https://store-a.vendly.com',
  ...over,
})

export const couponRow = (over: Partial<{
  id: string; code: string; type: 'percentage' | 'fixed'; value: number;
  min_order_amount: number | null; max_uses: number | null; uses_count: number;
  expires_at: string | null; is_active: boolean; store_id: string
}> = {}) => ({
  id: 'cpn-1',
  code: 'WELCOME10',
  type: 'percentage' as const,
  value: 10,
  min_order_amount: null,
  max_uses: null,
  uses_count: 0,
  expires_at: null,
  is_active: true,
  store_id: STORE_A,
  ...over,
})

export const cartItem = (over: Partial<CartItem> = {}): CartItem => ({
  product_id: 'p-rem-001',
  variant_id: 'v-rem-001-m',
  product: {
    id: 'p-rem-001',
    name: 'Remera Spriovanni N°001',
    slug: 'remera-spriovanni-001',
    images: ['https://cdn/img1.jpg'],
    price: 19500,
  },
  variant: {
    id: 'v-rem-001-m',
    product_id: 'p-rem-001',
    attributes: { talle: 'M', color: 'Negro' },
    sku: null,
    stock: 5,
    price_override: null,
    is_active: true,
  },
  quantity: 1,
  // unit_price del cliente — el server lo IGNORA y usa el precio de DB.
  // Lo dejamos a propósito en valor distinto para verificar el comportamiento.
  unit_price: 1, // valor "trampa" → debería ser ignorado y reemplazado por 19500
  ...over,
})

export const buyer = (over: Partial<CheckoutFormData> = {}): CheckoutFormData => ({
  full_name: 'Juan Test',
  email: 'juan@test.com',
  phone: '1144556677',
  street: 'Calle Falsa 123',
  city: 'CABA',
  state: 'CABA',
  zip: '1414',
  country: 'AR',
  ...over,
})
