// Shown instantly while the listing detail renders — makes navigation feel snappy.
export default function LoadingDetail() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Gallery */}
      <div className="h-[260px] rounded-[28px] bg-surface/70 lg:h-[440px]" />

      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-5 w-24 rounded-full bg-surface/70" />
          <div className="h-7 w-3/4 rounded-lg bg-surface/70" />
          <div className="h-4 w-1/2 rounded bg-surface/60" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-surface/60" />
            ))}
          </div>
          <div className="h-24 rounded-xl bg-surface/50" />
        </div>
        <div className="mt-6 lg:col-span-1 lg:mt-0">
          <div className="h-56 rounded-[26px] bg-surface/70" />
        </div>
      </div>
    </div>
  );
}
