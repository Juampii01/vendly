export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-28 rounded-xl bg-slate-200" />
        <div className="h-9 w-28 rounded-xl bg-slate-200" />
      </div>
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl bg-slate-100 p-4">
            <div className="h-5 w-28 rounded bg-slate-200 font-mono" />
            <div className="h-4 w-20 rounded bg-slate-200" />
            <div className="h-4 w-16 rounded bg-slate-200" />
            <div className="h-5 w-14 rounded-full bg-slate-200 ml-auto" />
            <div className="h-8 w-20 rounded-lg bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
