export default function Loading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-8 w-28 rounded-xl bg-slate-200 mb-6" />
      <div className="space-y-2">
        <div className="flex gap-4 px-4 pb-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-3 w-24 rounded bg-slate-200" />)}
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl bg-slate-100 p-4">
            <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0" />
            <div className="h-4 w-36 rounded bg-slate-200" />
            <div className="h-4 w-44 rounded bg-slate-200" />
            <div className="h-4 w-20 rounded bg-slate-200 ml-auto" />
            <div className="h-4 w-16 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
