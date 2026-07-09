import { scrollToHomeSection } from "@/lib/home-scroll";

export const SEARCH_HIGHLIGHT_CLASS = "search-target-highlight";
const HIGHLIGHT_DURATION_MS = 1800;

export function scrollToTargetCentered(targetId: string): boolean {
  const element = document.getElementById(targetId);
  if (!element) return false;

  const top =
    element.getBoundingClientRect().top +
    window.scrollY -
    window.innerHeight / 2 +
    element.offsetHeight / 2;

  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  highlightTarget(element);
  return true;
}

export function highlightTarget(element: HTMLElement) {
  element.classList.remove(SEARCH_HIGHLIGHT_CLASS);
  void element.offsetWidth;
  element.classList.add(SEARCH_HIGHLIGHT_CLASS);

  window.setTimeout(() => {
    element.classList.remove(SEARCH_HIGHLIGHT_CLASS);
  }, HIGHLIGHT_DURATION_MS);
}

export function scrollToHashTarget(hashId: string) {
  if (!hashId) return;

  if (hashId === "home-handling" || hashId === "home-storage") {
    scrollToHomeSection(hashId);
    return;
  }

  window.setTimeout(() => {
    scrollToTargetCentered(hashId);
  }, 100);
}
