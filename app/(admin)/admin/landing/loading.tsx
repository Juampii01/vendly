export default function Loading() {
  return (
    <div className="flex h-full animate-pulse">
      {/* Left panel */}
      <div className="w-[340px] shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="h-9 w-full rounded-xl bg-slate-100" />
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-hidden">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="rounded-xl bg-slate-100 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-5 w-10 rounded-full bg-slate-200" />
              </div>
              <div className="h-3 w-40 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="h-9 w-full rounded-xl bg-slate-200" />
        </div>
      </div>

      {/* Right preview */}
      <div className="flex-1 bg-slate-50 flex flex-col">
        <div className="h-12 border-b border-slate-200 bg-white px-4 flex items-center gap-3">
          <div className="h-5 w-48 rounded bg-slate-200" />
          <div className="ml-auto flex gap-2">
            <div className="h-7 w-20 rounded-lg bg-slate-200" />
            <div className="h-7 w-20 rounded-lg bg-slate-200" />
          </div>
        </div>
        <div className="flex-1 m-4 rounded-2xl bg-slate-200" />
      </div>
    </div>
  )
}
