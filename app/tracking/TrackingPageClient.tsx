"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TrackingList from "@/components/TrackingList";
import Button from "@/components/Button";
import type { TrackingApiResponse, TrackingData } from "@/lib/types";

export default function TrackingPageClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("t");

  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchTracking() {
      try {
        const res = await fetch(
          `/api/tracking?token=${encodeURIComponent(token!)}`
        );
        const json: TrackingApiResponse = await res.json();

        if (!res.ok || !json.success) {
          setError(json.error ?? "배송 정보를 불러올 수 없습니다.");
          return;
        }

        if (!json.data) {
          setError("배송 정보를 불러올 수 없습니다.");
          return;
        }

        setTrackingData(json.data);
      } catch {
        setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    }

    fetchTracking();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
        <p className="mt-4 text-body">배송 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="py-6 text-center">
        <p className="text-[16px] leading-relaxed text-body">
          카카오톡 알림톡의 배송조회 버튼을 통해
          <br />
          접속해 주세요.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 py-6 text-center">
        <p className="text-[16px] font-medium text-black">{error}</p>
        <p className="text-[14px] text-body">
          링크가 만료되었거나 유효하지 않을 수 있습니다.
        </p>
        <Button href="/contact" variant="outline">
          문의하기
        </Button>
      </div>
    );
  }

  if (!trackingData) {
    return null;
  }

  return <TrackingList data={trackingData} />;
}
