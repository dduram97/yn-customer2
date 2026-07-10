import { revalidatePath } from "next/cache";

/** Invalidate customer-facing pages after CMS content changes. */
export function revalidateCustomerPages(): void {
  revalidatePath("/", "layout");
  revalidatePath("/guide/how-to-eat");
  revalidatePath("/guide/storage");
  revalidatePath("/faq");
  revalidatePath("/contact");
  revalidatePath("/seafood", "layout");
  revalidatePath("/seafood/[slug]/cleaning", "page");
  revalidatePath("/seafood/[slug]/storage", "page");
}
