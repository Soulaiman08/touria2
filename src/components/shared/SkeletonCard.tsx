export function SkeletonCard() {
  return (
    <div className="product-card overflow-hidden" aria-hidden="true">
      <div className="skeleton" style={{ aspectRatio: '3/4' }} />
      <div className="p-3.5 sm:p-4 space-y-2.5">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="flex items-center gap-1.5 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton w-3.5 h-3.5 rounded-full" />
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-5 w-20 rounded" />
          <div className="skeleton h-4 w-12 rounded" />
        </div>
      </div>
    </div>
  )
}
