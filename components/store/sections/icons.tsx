import type { TrustBarItem } from '@/types'

export function TrustIcon({ name }: { name: TrustBarItem['icon'] }) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4 } as const
  switch (name) {
    case 'truck':
      return <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
    case 'return':
      return <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
    case 'lock':
      return <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
    case 'ship':
      return <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h5l2 5v4h-2m-5-9v9m-7 0a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z"/></svg>
    case 'star':
      return <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    case 'support':
      return <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
    case 'gift':
      return <svg width="22" height="22" viewBox="0 0 24 24" {...stroke}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
  }
}
