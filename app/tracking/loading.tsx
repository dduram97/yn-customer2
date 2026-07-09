function TrackingFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-ocean border-t-transparent" />
      <p className="mt-4 text-navy/60">페이지를 불러오는 중...</p>
    </div>
  );
}

export default function TrackingLoading() {
  return <TrackingFallback />;
}
