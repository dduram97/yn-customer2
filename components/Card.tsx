import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border bg-white p-5",
        onClick && "cursor-pointer active:opacity-90 transition-opacity",
        className
      )}
    >
      {children}
    </div>
  );
}
