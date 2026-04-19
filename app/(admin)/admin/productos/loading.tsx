export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-36 rounded-xl bg-slate-200" />
        <div className="h-9 w-32 rounded-xl bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-slate-100 overflow-hidden">
            <div className="aspect-square bg-slate-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/3 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
