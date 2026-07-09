import { splitMultilineText } from "@/lib/multiline-text";
import { cn } from "@/lib/utils";

interface MultilineTextProps {
  text: string;
  className?: string;
}

export default function MultilineText({ text, className }: MultilineTextProps) {
  const lines = splitMultilineText(text);

  return (
    <p className={cn("text-[16px] leading-relaxed text-body", className)}>
      {lines.map((line, index) => (
        <span key={`${index}-${line}`}>
          {line}
          {index < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}
