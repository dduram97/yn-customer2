"use client";

import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import SectionHeader from "./SectionHeader";
import { getSeafoodGuidePath, resolveSeafoodSlug } from "@/lib/seafood-guide";
import { trackCategoryClick } from "@/lib/analytics-client";
import type { ProductPreview } from "@/lib/types";

interface StorageScrollProps {
  previews: ProductPreview[];
}

export default function StorageScroll({ previews }: StorageScrollProps) {
  return (
    <section id="home-storage" className="scroll-mt-[72px] space-y-4">
      <SectionHeader title="수산물 보관법" href="/guide/storage" />

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {previews.map((product) => (
          <Link
            key={product.id}
            id={`search-storage-${product.id}`}
            href={getSeafoodGuidePath(resolveSeafoodSlug(product), "storage")}
            onClick={() =>
              trackCategoryClick(`${product.name} 보관법`, "storage", "/")
            }
            className="w-[130px] shrink-0 rounded-2xl transition-colors active:opacity-90"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              <div className="h-[150px]">
                <ImagePlaceholder
                  label={product.name}
                  src={product.imageUrl}
                  aspectRatio="square"
                  compact
                  optimized
                  sizes="130px"
                  className="h-full rounded-none border-0"
                />
              </div>
              <div className="px-3 py-3">
                <p className="text-[12px] text-body">보관법</p>
                <p className="mt-0.5 text-[15px] font-bold text-black">{product.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
