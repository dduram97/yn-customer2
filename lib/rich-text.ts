export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function plainTextToHtml(text: string): string {
  if (!text.trim()) return "";

  return text
    .split("\n")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

export function linesToListHtml(lines: string[]): string {
  const items = lines.filter((line) => line.trim());
  if (!items.length) return "";

  return `<ul>${items.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function applyRichTextCommand(command: string, value?: string) {
  document.execCommand(command, false, value);
}
