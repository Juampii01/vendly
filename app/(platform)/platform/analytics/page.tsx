import type { Metadata } from 'next'
import AnalyticsDashboard from './AnalyticsDashboard'

export const metadata: Metadata = { title: 'Analytics — Platform' }

export default function PlatformAnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Analytics multi-sitio</h1>
        <p className="text-slate-400 mt-1">Métricas agregadas de todos los stores en Vendly.</p>
      </div>
      <AnalyticsDashboard />
    </div>
  )
}
