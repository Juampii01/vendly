export default function Loading() {
  return (
    <div className="p-6 md:p-8 space-y-8 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 w-36 rounded-xl bg-slate-200" />
        <div className="h-4 w-72 rounded bg-slate-200 mt-2" />
      </div>

      {/* Main config card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="h-10 w-full rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="h-24 w-full rounded-xl bg-slate-100" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-32 rounded-xl bg-slate-200" />
        </div>
      </div>

      {/* Domain card */}
      <div>
        <div className="h-6 w-40 rounded-lg bg-slate-200 mb-1" />
        <div className="h-4 w-80 rounded bg-slate-200 mt-2 mb-4" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-4">
          <div className="h-10 w-full rounded-xl bg-slate-100" />
          <div className="h-9 w-28 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  )
}
