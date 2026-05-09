/**
 * Demo catalog para el flagship de Adidas.
 *
 * Adidas es una tienda demo/portfolio: si la DB no tiene productos
 * (o los productos no tienen imágenes), tanto la home como /productos
 * caen a este catálogo hardcoded para que el showcase nunca se vea
 * pobre — es lo que un prospect ve al entrar al sitio.
 *
 * Compartido entre AdidasHomePage y AdidasCatalogPage para mantener
 * la experiencia coherente entre las dos vistas.
 */

export interface ShowcaseProduct {
  name: string
  category: string
  price: string
  image: string
  badge?: string
}

export const ADIDAS_DEMO_PRODUCTS: ShowcaseProduct[] = [
  { name: 'Speedline Pro 9',       category: 'Running',     price: '$229.000', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85', badge: 'NUEVO' },
  { name: 'Court Classic Vintage', category: 'Originals',   price: '$185.000', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=900&q=85' },
  { name: 'Stride 24',             category: 'Training',    price: '$195.000', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=900&q=85' },
  { name: 'Court Pro Black',       category: 'Basketball',  price: '$249.000', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&q=85', badge: 'EDICIÓN' },
  { name: 'Track Crew Negro',      category: 'Apparel',     price: '$89.000',  image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=900&q=85' },
  { name: 'Performance Tee',       category: 'Apparel',     price: '$45.000',  image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=85' },
  { name: 'Goalkeeper Pro',        category: 'Football',    price: '$215.000', image: 'https://images.unsplash.com/photo-1487956382158-bb926046304a?w=900&q=85' },
  { name: 'Backpack Tech 24L',     category: 'Accesorios',  price: '$72.000',  image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85' },
  { name: 'Trail Runner X',        category: 'Running',     price: '$259.000', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=900&q=85' },
  { name: 'Studio Tights',         category: 'Training',    price: '$78.000',  image: 'https://images.unsplash.com/photo-1556906781-2f0520405b71?w=900&q=85' },
  { name: 'Marathon Lite',         category: 'Running',     price: '$199.000', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=900&q=85', badge: 'NUEVO' },
  { name: 'Hooded Stripes',        category: 'Apparel',     price: '$115.000', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=85' },
  { name: 'Court Mid 70',          category: 'Originals',   price: '$169.000', image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=900&q=85' },
  { name: 'Boost Run Elite',       category: 'Running',     price: '$289.000', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&q=85', badge: 'EDICIÓN' },
  { name: 'Compression Long',      category: 'Training',    price: '$58.000',  image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=900&q=85' },
  { name: 'Training Shorts 7"',    category: 'Training',    price: '$48.000',  image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=900&q=85' },
]

export const ADIDAS_CATEGORIES = [
  { slug: 'running',     name: 'Running' },
  { slug: 'training',    name: 'Training' },
  { slug: 'football',    name: 'Football' },
  { slug: 'basketball',  name: 'Basketball' },
  { slug: 'originals',   name: 'Originals' },
  { slug: 'apparel',     name: 'Apparel' },
  { slug: 'accesorios',  name: 'Accesorios' },
]

export function shouldUseAdidasDemo(products: { images?: string[] | null }[] | null | undefined): boolean {
  if (!products || products.length === 0) return true
  return products.every(p => !p.images?.[0])
}
