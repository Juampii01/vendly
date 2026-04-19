export default function Loading() {
  return (
    <div className="flex h-full animate-pulse">
      {/* Left sidebar panel */}
      <div className="w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col gap-4 p-4">
        <div className="h-5 w-28 rounded bg-slate-200" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 rounded bg-slate-200" />
              <div className="h-9 w-full rounded-xl bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="mt-auto">
          <div className="h-9 w-full rounded-xl bg-slate-200" />
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-2xl bg-slate-200 aspect-[9/16] sm:aspect-video" />
      </div>
    </div>
  )
}
