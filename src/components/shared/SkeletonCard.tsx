export function SkeletonCard() {
  return (
    <div className="product-card overflow-hidden" aria-hidden="true">
      {/* Image skeleton */}
      <div className="skeleton" style={{ aspectRatio: '3/4' }} />
      {/* Info skeleton */}
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="flex items-center gap-2">
          {[1,2,3].map(i => (
            <div key={i} className="skeleton w-4 h-4 rounded-full" />
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-5 w-20 rounded" />
          <div className="skeleton h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
}
