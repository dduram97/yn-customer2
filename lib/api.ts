import type { DeliveryStep } from "./types";

const ORDER_MANAGER_API_URL =
  process.env.ORDER_MANAGER_API_URL ?? "http://localhost:3001";
const ORDER_MANAGER_API_KEY = process.env.ORDER_MANAGER_API_KEY ?? "";

export async function fetchTrackingFromOrderManager(
  token: string
): Promise<Response> {
  return fetch(`${ORDER_MANAGER_API_URL}/api/tracking?token=${encodeURIComponent(token)}`, {
    headers: {
      Authorization: `Bearer ${ORDER_MANAGER_API_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}

const STATUS_TO_STEP: Record<string, DeliveryStep> = {
  상품준비: "preparing",
  "상품 준비": "preparing",
  집하완료: "picked_up",
  "집하 완료": "picked_up",
  배송중: "in_transit",
  "배송 이동 중": "in_transit",
  배송완료: "delivered",
  "배송 완료": "delivered",
};

export function mapStatusToStep(status: string): DeliveryStep {
  return STATUS_TO_STEP[status] ?? "preparing";
}

export function validateTrackingToken(token: string | null): string | null {
  if (!token || token.trim().length === 0) {
    return null;
  }
  if (token.length > 512) {
    return null;
  }
  return token.trim();
}
