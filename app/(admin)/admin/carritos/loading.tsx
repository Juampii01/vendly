export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-slate-200 mb-2" />
      <div className="h-4 w-32 rounded bg-slate-200 mb-6" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-slate-100 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 rounded bg-slate-200" />
                <div className="h-3 w-48 rounded bg-slate-200" />
                <div className="flex gap-2 mt-2">
                  {[...Array(3)].map((_, j) => <div key={j} className="h-6 w-20 rounded-full bg-slate-200" />)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-6 w-20 rounded bg-slate-200" />
                <div className="flex gap-2">
                  <div className="h-8 w-24 rounded-lg bg-slate-200" />
                  <div className="h-8 w-32 rounded-lg bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
