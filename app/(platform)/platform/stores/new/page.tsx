import { createServiceClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import NewStoreWizard from './NewStoreWizard'

export const metadata: Metadata = { title: 'Crear store — Platform' }

export default async function NewStorePage() {
  const supabase = createServiceClient()
  const { data: templates } = await supabase
    .from('store_templates')
    .select('id, name, description, color_primary, color_accent, color_background, color_text, hero_title')
    .eq('is_active', true)
    .order('position')

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Crear nuevo store</h1>
        <p className="text-slate-400 mt-1">Configurá los datos básicos y elegí una plantilla de diseño.</p>
      </div>
      <NewStoreWizard templates={templates ?? []} />
    </div>
  )
}
