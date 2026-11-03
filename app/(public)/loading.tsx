// Instant skeleton shown while any public page loads — makes nav feel immediate.
export default function LoadingPublic() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-44 rounded-[28px] bg-surface/70" />
      <div className="grid grid-cols-4 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-surface/60" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 rounded-[26px] bg-surface/60" />
        ))}
      </div>
    </div>
  );
}
