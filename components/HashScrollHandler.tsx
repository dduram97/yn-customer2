"use client";

import { useEffect } from "react";
import { scrollToHashTarget } from "@/lib/scroll-to-target";

export default function HashScrollHandler() {
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) return;
      scrollToHashTarget(id);
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return null;
}
