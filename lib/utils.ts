import type { DeliveryStep } from "./types";

export const DELIVERY_STEPS: {
  key: DeliveryStep;
  label: string;
}[] = [
  { key: "preparing", label: "상품 준비" },
  { key: "picked_up", label: "집하 완료" },
  { key: "in_transit", label: "배송 이동 중" },
  { key: "delivered", label: "배송 완료" },
];

export function getStepIndex(step: DeliveryStep): number {
  return DELIVERY_STEPS.findIndex((s) => s.key === step);
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPhoneForTel(phone: string): string {
  return phone.replace(/[^0-9+]/g, "");
}
