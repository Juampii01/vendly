// Tipos compartidos entre el route server-side y el cliente PlatformDesignStudio.
// Este archivo NO importa 'server-only' — puede ser importado desde cliente.

export interface DesignMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ProductAction {
  action: 'create' | 'update' | 'delete'
  product_id?: string
  data?: {
    name?: string
    description?: string
    price?: number
    compare_at_price?: number | null
    is_active?: boolean
    is_featured?: boolean
    tags?: string[]
    category_slug?: string | null
    images?: string[]
  }
}

export interface CategoryAction {
  action: 'create' | 'update' | 'delete'
  category_id?: string
  data?: {
    name?: string
    description?: string
    position?: number
    is_active?: boolean
  }
}
