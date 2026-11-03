export default function LoadingAdmin() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-2xl bg-surface/70" />
        <div className="h-20 rounded-2xl bg-surface/70" />
      </div>
      <div className="h-14 rounded-2xl bg-surface/70" />
      <div className="h-16 rounded-2xl bg-surface/60" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-surface/60" />
        ))}
      </div>
    </div>
  );
}
