"use client";

import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import SectionHeader from "./SectionHeader";
import { getSeafoodGuidePath, resolveSeafoodSlug } from "@/lib/seafood-guide";
import { trackCategoryClick } from "@/lib/analytics-client";
import type { ProductPreview } from "@/lib/types";

interface HandlingScrollProps {
  previews: ProductPreview[];
}

export default function HandlingScroll({ previews }: HandlingScrollProps) {
  return (
    <section id="home-handling" className="scroll-mt-[72px] space-y-4">
      <SectionHeader title="수산물 손질법" href="/guide/how-to-eat" />

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {previews.map((product) => (
          <Link
            key={product.id}
            id={`search-handling-${product.id}`}
            href={getSeafoodGuidePath(resolveSeafoodSlug(product), "cleaning")}
            onClick={() =>
              trackCategoryClick(`${product.name} 손질법`, "handling", "/")
            }
            className="flex w-[72px] shrink-0 flex-col items-center gap-2 rounded-2xl transition-colors active:opacity-80"
          >
            <div className="h-[72px] w-[72px] overflow-hidden rounded-full">
              <ImagePlaceholder
                label={product.name}
                src={product.imageUrl}
                aspectRatio="square"
                compact
                optimized
                sizes="72px"
                className="h-full rounded-full border-0"
              />
            </div>
            <span className="text-center text-[14px] font-medium text-black">
              {product.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
