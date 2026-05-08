import type { StoreConfig, Category, Product } from '@/types'

// Contexto común que cada sección recibe junto con su `content`.
// El HomeRenderer lo arma una vez y lo pasa a cada componente.
export interface SectionContext {
  store: StoreConfig
  categories: Category[]
  featured: Product[]
  all: Product[]
}
