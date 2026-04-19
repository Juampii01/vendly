export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-28 rounded-xl bg-slate-200" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-8 w-20 rounded-full bg-slate-200" />)}
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl bg-slate-100 p-4">
            <div className="h-4 w-24 rounded bg-slate-200 shrink-0" />
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-4 w-24 rounded bg-slate-200 ml-auto" />
            <div className="h-6 w-20 rounded-full bg-slate-200" />
            <div className="h-4 w-16 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
