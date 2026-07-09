import type { CSSProperties } from "react";
import type { GuideTextStyle } from "@/lib/types";

export function styleToClassName(style?: GuideTextStyle): string {
  const classes: string[] = [];

  switch (style?.fontSize) {
    case "sm":
      classes.push("text-[13px]");
      break;
    case "base":
      classes.push("text-[15px]");
      break;
    case "lg":
      classes.push("text-[17px]");
      break;
    case "xl":
      classes.push("text-[20px]");
      break;
    case "2xl":
      classes.push("text-[24px]");
      break;
    case "3xl":
      classes.push("text-[28px]");
      break;
    default:
      break;
  }

  if (style?.fontWeight === "bold") classes.push("font-bold");
  if (style?.fontStyle === "italic") classes.push("italic");
  if (style?.textDecoration === "underline") classes.push("underline");

  switch (style?.textAlign) {
    case "center":
      classes.push("text-center");
      break;
    case "right":
      classes.push("text-right");
      break;
    default:
      classes.push("text-left");
      break;
  }

  if (style?.highlight) classes.push("bg-yellow-200");

  return classes.join(" ");
}

export function styleToInlineStyle(style?: GuideTextStyle): CSSProperties {
  return {
    color: style?.color || undefined,
  };
}
