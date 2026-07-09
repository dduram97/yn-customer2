export const HOME_SECTION_SCROLL_OFFSET = 72;

export function scrollToHomeSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  const top =
    element.getBoundingClientRect().top +
    window.scrollY -
    HOME_SECTION_SCROLL_OFFSET;

  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}
