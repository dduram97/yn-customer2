import { NextRequest, NextResponse } from "next/server";
import {
  fetchTrackingFromOrderManager,
  mapStatusToStep,
  validateTrackingToken,
} from "@/lib/api";
import type { TrackingApiResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const token = validateTrackingToken(
    request.nextUrl.searchParams.get("token")
  );

  if (!token) {
    return NextResponse.json<TrackingApiResponse>(
      { success: false, error: "유효하지 않은 접근입니다." },
      { status: 400 }
    );
  }

  try {
    const response = await fetchTrackingFromOrderManager(token);

    if (!response.ok) {
      const status = response.status;
      if (status === 401 || status === 403) {
        return NextResponse.json<TrackingApiResponse>(
          { success: false, error: "인증이 만료되었습니다. 알림톡 링크를 다시 확인해주세요." },
          { status: 401 }
        );
      }
      if (status === 404) {
        return NextResponse.json<TrackingApiResponse>(
          { success: false, error: "배송 정보를 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      return NextResponse.json<TrackingApiResponse>(
        { success: false, error: "배송 정보를 불러올 수 없습니다." },
        { status: 502 }
      );
    }

    const raw = await response.json();

    const data: TrackingApiResponse["data"] = {
      productName: raw.productName,
      courier: raw.courier,
      trackingNumber: raw.trackingNumber,
      status: raw.status,
      location: raw.location ?? "",
      step: mapStatusToStep(raw.status),
    };

    return NextResponse.json<TrackingApiResponse>({
      success: true,
      data,
    });
  } catch {
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json<TrackingApiResponse>({
        success: true,
        data: {
          productName: "과메기 세트",
          courier: "CJ대한통운",
          trackingNumber: "123456789012",
          status: "배송 이동 중",
          location: "대전 물류센터",
          step: "in_transit",
        },
      });
    }

    return NextResponse.json<TrackingApiResponse>(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
