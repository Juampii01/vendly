import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': root,
    },
  },
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    // Las routes Next.js tocan APIs que esperan ciertas envs presentes — las
    // setteamos en setup.ts. Estos defaults evitan crashes innecesarios.
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_SUPABASE_URL: 'http://test-supabase',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role',
      NEXT_PUBLIC_BASE_URL: 'https://test.vendly.com',
      MP_ACCESS_TOKEN: 'TEST-MP-ACCESS',
      MP_WEBHOOK_SECRET: 'test-mp-webhook-secret',
    },
  },
})
