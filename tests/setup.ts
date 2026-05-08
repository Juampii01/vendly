// Global setup for Vitest. Runs once before any test file.
//
// Las routes Next.js importan transitively `next/server`, que en algunos casos
// requiere globals tipo Request/Response/TextEncoder. Node 20+ ya los trae;
// este archivo queda como anclaje por si necesitamos shims más adelante.
//
// También suprimimos console.error de los handlers para que los logs esperados
// (orderError, MP error) no ensucien el output del test runner. Cada test puede
// re-habilitarlo con `vi.spyOn(console, 'error').mockRestore()` si necesita.

import { vi, afterEach } from 'vitest'

vi.spyOn(console, 'error').mockImplementation(() => {})

afterEach(() => {
  vi.clearAllMocks()
})
