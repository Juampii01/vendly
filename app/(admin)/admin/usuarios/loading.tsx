export default function Loading() {
  return (
    <div className="p-6 md:p-8 animate-pulse">
      <div className="mb-8">
        <div className="h-8 w-28 rounded-xl bg-slate-200" />
        <div className="h-4 w-64 rounded bg-slate-200 mt-2" />
      </div>
      <div className="space-y-2">
        <div className="flex gap-4 px-4 pb-2">
          {['w-20', 'w-28', 'w-16'].map((w, i) => (
            <div key={i} className={`h-3 ${w} rounded bg-slate-200`} />
          ))}
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl bg-slate-100 p-4">
            <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0" />
            <div className="h-4 w-48 rounded bg-slate-200" />
            <div className="h-5 w-16 rounded-full bg-slate-200 ml-auto" />
            <div className="h-8 w-20 rounded-lg bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
