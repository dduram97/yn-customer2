"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FaqItemProps {
  id: string;
  question: string;
  answer: string;
}

export default function FaqItem({ id, question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash === `#${id}`) {
      setOpen(true);
    }
  }, [id]);

  return (
    <div
      id={id}
      className="scroll-mt-24 rounded-2xl border-b border-border transition-colors"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left active:opacity-70"
      >
        <span className="text-[16px] font-bold leading-snug text-black">
          {question}
        </span>
        <span
          className={cn(
            "mt-0.5 shrink-0 text-xl text-body transition-transform",
            open && "rotate-45"
          )}
          aria-hidden
        >
          +
        </span>
      </button>
      {open && (
        <p className="pb-4 text-[16px] leading-relaxed text-body">{answer}</p>
      )}
    </div>
  );
}
