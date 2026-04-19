// Loading genérico para el admin — aparece instantáneamente en cualquier página
export default function AdminLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-slate-200 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="rounded-2xl bg-slate-100 h-64" />
    </div>
  )
}
