import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  external?: boolean;
}

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
  external,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-2xl font-semibold transition-all active:scale-[0.98]";

  const variants = {
    primary: "bg-black text-white",
    secondary: "bg-navy text-white",
    outline: "border-2 border-black text-black bg-white",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-6 py-3.5 text-base",
    lg: "px-6 py-4 text-[17px]",
  };

  const classes = cn(baseStyles, variants[variant], sizes[size], className);

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
