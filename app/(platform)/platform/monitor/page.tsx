import type { Metadata } from 'next'
import MonitorDashboard from './MonitorDashboard'

export const metadata: Metadata = { title: 'Monitor — Vendly Platform' }

export default function MonitorPage() {
  return <MonitorDashboard />
}
