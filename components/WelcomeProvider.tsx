"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "yn-welcome-shown";
const FADE_IN_MS = 400;
const HOLD_MS = 2400;
const FADE_OUT_MS = 400;
const DOT_STEP_MS = 480;
const WELCOME_IMAGE_SRC = "/images/re-welcome-background.png";
const WELCOME_IMAGE_WIDTH = 2160;
const WELCOME_IMAGE_HEIGHT = 3840;
const WELCOME_IMAGE_ASPECT = WELCOME_IMAGE_WIDTH / WELCOME_IMAGE_HEIGHT;
const WELCOME_DESKTOP_HORIZONTAL_PADDING = 40;
const WELCOME_DESKTOP_MAX_WIDTH = 720;
const MOBILE_MAX_WIDTH_QUERY = "(max-width: 768px)";

// Dot positions from the original loading layout (percentage-based).
const DOT_POSITIONS = [
  { left: 46.176, top: 56.613 },
  { left: 50.0, top: 56.606 },
  { left: 53.856, top: 56.601 },
] as const;
const DOT_SIZE = {
  width: (8.9 / 376) * 100,
  height: (8.9 / 679) * 100,
};

type WelcomePhase = "fade-in" | "visible" | "fade-out";

const WelcomeReadyContext = createContext(true);

export function useWelcomeReady() {
  return useContext(WelcomeReadyContext);
}

function readWelcomeSeen() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function clearWelcomePendingClass() {
  document.documentElement.classList.remove("yn-welcome-pending");
}

function getWelcomeImageDisplayWidth() {
  if (typeof window === "undefined") {
    return WELCOME_DESKTOP_MAX_WIDTH;
  }

  const devicePixelRatio = window.devicePixelRatio || 1;
  const sharpCap = Math.floor(WELCOME_IMAGE_WIDTH / devicePixelRatio);
  const isMobile = window.matchMedia(MOBILE_MAX_WIDTH_QUERY).matches;

  if (!isMobile) {
    const available =
      window.innerWidth - WELCOME_DESKTOP_HORIZONTAL_PADDING;
    return Math.min(available, WELCOME_DESKTOP_MAX_WIDTH, sharpCap);
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const widthByContain = Math.min(
    viewportWidth,
    viewportHeight * WELCOME_IMAGE_ASPECT
  );

  return Math.min(widthByContain, sharpCap);
}

function useWelcomeImageDisplayWidth() {
  const [displayWidth, setDisplayWidth] = useState(WELCOME_DESKTOP_MAX_WIDTH);

  useLayoutEffect(() => {
    const update = () => setDisplayWidth(getWelcomeImageDisplayWidth());

    update();

    const mediaQuery = window.matchMedia(MOBILE_MAX_WIDTH_QUERY);
    mediaQuery.addEventListener("change", update);
    window.addEventListener("resize", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return displayWidth;
}

function WelcomeDotsOverlay() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, DOT_STEP_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {DOT_POSITIONS.map((position, index) => {
        const isActive = activeIndex === index;

        return (
          <span
            key={index}
            className="absolute rounded-full bg-white transition-all duration-300 ease-in-out"
            style={{
              left: `${position.left}%`,
              top: `${position.top}%`,
              width: `${DOT_SIZE.width}%`,
              height: `${DOT_SIZE.height}%`,
              opacity: isActive ? 0.8 : 0.25,
              transform: `translate(-50%, -50%) scale(${isActive ? 1.1 : 1})`,
            }}
          />
        );
      })}
    </div>
  );
}

interface WelcomeOverlayProps {
  phase: WelcomePhase;
  contentVisible: boolean;
}

function WelcomeOverlay({ phase, contentVisible }: WelcomeOverlayProps) {
  const isFadingOut = phase === "fade-out";
  const imageDisplayWidth = useWelcomeImageDisplayWidth();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-navy px-0 ease-in-out sm:px-5"
      style={{
        opacity: isFadingOut ? 0 : 1,
        transitionProperty: "opacity",
        transitionDuration: `${isFadingOut ? FADE_OUT_MS : FADE_IN_MS}ms`,
        pointerEvents: isFadingOut ? "none" : "auto",
      }}
      aria-live="polite"
      aria-label="환영 메시지"
      aria-hidden={isFadingOut}
    >
      <div
        className="mx-auto ease-in-out"
        style={{
          opacity: contentVisible ? 1 : 0,
          transitionProperty: "opacity",
          transitionDuration: `${FADE_IN_MS}ms`,
          width: imageDisplayWidth,
          maxWidth: "100vw",
        }}
      >
        <div className="relative">
          {/* Native PNG as-is (2160×3840). No Next/Image optimization. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={WELCOME_IMAGE_SRC}
            alt=""
            width={WELCOME_IMAGE_WIDTH}
            height={WELCOME_IMAGE_HEIGHT}
            decoding="sync"
            loading="eager"
            fetchPriority="high"
            className="block h-auto max-w-full"
            style={{ width: imageDisplayWidth }}
          />

          <WelcomeDotsOverlay />
        </div>

        <p className="sr-only">
          안녕하세요 고객님. 주문해주셔서 감사합니다. 정성을 담아 준비하겠습니다.
        </p>
      </div>
    </div>
  );
}

export default function WelcomeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [welcomeActive, setWelcomeActive] = useState(false);
  const [appReady, setAppReady] = useState(true);
  const [phase, setPhase] = useState<WelcomePhase>("fade-in");
  const [contentVisible, setContentVisible] = useState(false);

  useLayoutEffect(() => {
    if (isAdmin) {
      clearWelcomePendingClass();
      setAppReady(true);
      setWelcomeActive(false);
      return;
    }

    if (readWelcomeSeen()) {
      clearWelcomePendingClass();
      setAppReady(true);
      setWelcomeActive(false);
      return;
    }

    setWelcomeActive(true);
    setAppReady(false);
    setPhase("fade-in");
    setContentVisible(false);

    const contentFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setContentVisible(true));
    });

    const visibleTimer = window.setTimeout(() => {
      setPhase("visible");
    }, FADE_IN_MS);

    const fadeOutTimer = window.setTimeout(() => {
      setPhase("fade-out");
      clearWelcomePendingClass();
      setAppReady(true);
    }, FADE_IN_MS + HOLD_MS);

    const doneTimer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // ignore
      }
      setWelcomeActive(false);
    }, FADE_IN_MS + HOLD_MS + FADE_OUT_MS);

    return () => {
      window.cancelAnimationFrame(contentFrame);
      window.clearTimeout(visibleTimer);
      window.clearTimeout(fadeOutTimer);
      window.clearTimeout(doneTimer);
    };
  }, [isAdmin]);

  return (
    <WelcomeReadyContext.Provider value={appReady}>
      {children}
      {welcomeActive && !isAdmin ? (
        <WelcomeOverlay phase={phase} contentVisible={contentVisible} />
      ) : null}
    </WelcomeReadyContext.Provider>
  );
}
