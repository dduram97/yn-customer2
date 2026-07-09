/** 관리자 textarea 입력의 줄바꿈을 저장/표시용으로 통일합니다. */
export function normalizeMultilineText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/\u2029/g, "\n");
}

export function splitMultilineText(text: string): string[] {
  return normalizeMultilineText(text).split("\n");
}
