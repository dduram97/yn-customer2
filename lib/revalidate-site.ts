import { revalidatePath, revalidateTag } from "next/cache";
import { SITE_CONTENT_CACHE_TAG } from "@/lib/site-content";

/** Invalidate customer-facing pages after CMS content changes. */
export function revalidateCustomerPages(): void {
  revalidateTag(SITE_CONTENT_CACHE_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/guide/how-to-eat");
  revalidatePath("/guide/storage");
  revalidatePath("/faq");
  revalidatePath("/contact");
  revalidatePath("/seafood", "layout");
  revalidatePath("/seafood/[slug]/cleaning", "page");
  revalidatePath("/seafood/[slug]/storage", "page");
}
