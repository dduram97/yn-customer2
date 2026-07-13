import { revalidatePath } from "next/cache";
import {
  createSupabaseAdmin,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { inferMediaTypeFromUrl } from "@/lib/media";

export type CustomerNewsMediaType = "image" | "gif" | "video";

export interface CustomerNewsItem {
  id: string;
  title: string;
  content: string;
  /** Resolved display URL (media_url preferred, else legacy image_url). */
  mediaUrl: string | null;
  mediaType: CustomerNewsMediaType | null;
  /** @deprecated Prefer mediaUrl — kept for older callers. */
  imageUrl: string | null;
  isActive: boolean;
  showOnHome: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerNewsInput {
  title: string;
  content: string;
  mediaUrl?: string | null;
  mediaType?: CustomerNewsMediaType | null;
  /** Legacy alias — mapped to mediaUrl when mediaUrl omitted. */
  imageUrl?: string | null;
  isActive?: boolean;
  showOnHome?: boolean;
}

export interface CustomerNewsPageResult {
  items: CustomerNewsItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const CUSTOMER_NEWS_PAGE_SIZE = 10;

type NewsRow = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  media_url?: string | null;
  media_type?: string | null;
  is_active: boolean;
  show_on_home?: boolean | null;
  created_at: string;
  updated_at: string;
};

function resolveMediaUrl(row: NewsRow): string | null {
  const media = row.media_url?.trim() || null;
  if (media) return media;
  const legacy = row.image_url?.trim() || null;
  return legacy;
}

function resolveMediaType(
  row: NewsRow,
  mediaUrl: string | null
): CustomerNewsMediaType | null {
  if (!mediaUrl) return null;
  const explicit =
    row.media_type === "image" ||
    row.media_type === "gif" ||
    row.media_type === "video"
      ? row.media_type
      : undefined;
  return inferMediaTypeFromUrl(mediaUrl, explicit);
}

function mapRow(row: NewsRow): CustomerNewsItem {
  const mediaUrl = resolveMediaUrl(row);
  return {
    id: row.id,
    title: row.title,
    content: row.content ?? "",
    mediaUrl,
    mediaType: resolveMediaType(row, mediaUrl),
    imageUrl: mediaUrl,
    isActive: row.is_active,
    showOnHome: row.show_on_home === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function ensureNewsDb() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
}

function revalidateNewsPages(id?: string) {
  revalidatePath("/notice");
  revalidatePath("/");
  if (id) revalidatePath(`/notice/${id}`);
}

/** True when PostgREST schema is missing media_url / media_type (migration not applied). */
function isMissingMediaColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  if (err.code === "PGRST204") {
    const message = (err.message ?? "").toLowerCase();
    return message.includes("media_url") || message.includes("media_type");
  }
  const message = (err.message ?? "").toLowerCase();
  return (
    message.includes("media_url") ||
    message.includes("media_type") ||
    message.includes("schema cache")
  );
}

function isMissingShowOnHomeColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  const message = (err.message ?? "").toLowerCase();
  return message.includes("show_on_home");
}

/** Keep only one home-featured row. */
async function clearOtherHomeFeatured(exceptId: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("customer_news")
    .update({ show_on_home: false })
    .eq("show_on_home", true)
    .neq("id", exceptId);

  if (error && !isMissingShowOnHomeColumnError(error)) {
    throw error;
  }
}

function buildLegacyImageOnlyRow(fields: {
  title?: string;
  content?: string;
  is_active?: boolean;
  media_url?: string | null;
  media_type?: string | null;
  image_url?: string | null;
}) {
  const imageUrl =
    (typeof fields.media_url === "string" && fields.media_url.trim()) ||
    (typeof fields.image_url === "string" && fields.image_url.trim()) ||
    null;
  const row: Record<string, unknown> = {
    image_url: imageUrl,
  };
  if (typeof fields.title === "string") row.title = fields.title;
  if (typeof fields.content === "string") row.content = fields.content;
  if (typeof fields.is_active === "boolean") row.is_active = fields.is_active;
  return row;
}

function normalizeMediaFields(input: CustomerNewsInput | Partial<CustomerNewsInput>) {
  const rawUrl =
    input.mediaUrl !== undefined
      ? input.mediaUrl
      : input.imageUrl !== undefined
        ? input.imageUrl
        : undefined;

  if (rawUrl === undefined) return null;

  const mediaUrl = rawUrl?.trim() || null;
  if (!mediaUrl) {
    return { media_url: null, media_type: null, image_url: null };
  }

  const mediaType =
    input.mediaType === "image" ||
    input.mediaType === "gif" ||
    input.mediaType === "video"
      ? input.mediaType
      : inferMediaTypeFromUrl(mediaUrl);

  // Keep image_url in sync so older SQL / tools still see a URL.
  return {
    media_url: mediaUrl,
    media_type: mediaType,
    image_url: mediaUrl,
  };
}

/** Active news for customer pages (newest first). */
export async function listActiveCustomerNews(
  limit?: number
): Promise<CustomerNewsItem[]> {
  ensureNewsDb();
  const supabase = createSupabaseAdmin();
  let query = supabase
    .from("customer_news")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (typeof limit === "number" && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as NewsRow[] | null)?.map(mapRow) ?? [];
}

/** Single home-featured active news (at most one). */
export async function getHomeFeaturedCustomerNews(): Promise<CustomerNewsItem | null> {
  ensureNewsDb();
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("customer_news")
    .select("*")
    .eq("is_active", true)
    .eq("show_on_home", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingShowOnHomeColumnError(error)) return null;
    throw error;
  }
  if (!data) return null;
  return mapRow(data as NewsRow);
}

/** Paginated active news for /notice. */
export async function listActiveCustomerNewsPage(options?: {
  page?: number;
  pageSize?: number;
}): Promise<CustomerNewsPageResult> {
  ensureNewsDb();
  const pageSize = Math.max(
    1,
    options?.pageSize ?? CUSTOMER_NEWS_PAGE_SIZE
  );
  const page = Math.max(1, options?.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createSupabaseAdmin();
  const { data, error, count } = await supabase
    .from("customer_news")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: (data as NewsRow[] | null)?.map(mapRow) ?? [],
    total,
    page,
    pageSize,
    totalPages,
  };
}

/** Single active news item for customer detail pages. */
export async function getActiveCustomerNewsById(
  id: string
): Promise<CustomerNewsItem | null> {
  ensureNewsDb();
  if (!id) return null;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("customer_news")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRow(data as NewsRow);
}

export interface AdjacentCustomerNews {
  /** Older active news (목록에서 아래쪽). */
  prev: CustomerNewsItem | null;
  /** Newer active news (목록에서 위쪽). */
  next: CustomerNewsItem | null;
}

/** Previous (older) / next (newer) active neighbors by created_at. */
export async function getAdjacentActiveCustomerNews(
  item: CustomerNewsItem
): Promise<AdjacentCustomerNews> {
  ensureNewsDb();
  const supabase = createSupabaseAdmin();

  const [olderRes, newerRes] = await Promise.all([
    supabase
      .from("customer_news")
      .select("*")
      .eq("is_active", true)
      .lt("created_at", item.createdAt)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("customer_news")
      .select("*")
      .eq("is_active", true)
      .gt("created_at", item.createdAt)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (olderRes.error) throw olderRes.error;
  if (newerRes.error) throw newerRes.error;

  return {
    prev: olderRes.data ? mapRow(olderRes.data as NewsRow) : null,
    next: newerRes.data ? mapRow(newerRes.data as NewsRow) : null,
  };
}

/** All news for admin (newest first). */
export async function listAllCustomerNews(): Promise<CustomerNewsItem[]> {
  ensureNewsDb();
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("customer_news")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as NewsRow[] | null)?.map(mapRow) ?? [];
}

export async function createCustomerNews(
  input: CustomerNewsInput
): Promise<CustomerNewsItem> {
  ensureNewsDb();
  const title = input.title.trim();
  if (!title) throw new Error("제목을 입력해 주세요.");

  const mediaFields = normalizeMediaFields(input) ?? {
    media_url: null,
    media_type: null,
    image_url: null,
  };

  const showOnHome = input.showOnHome === true;
  const supabase = createSupabaseAdmin();
  const fullRow: Record<string, unknown> = {
    title,
    content: input.content ?? "",
    ...mediaFields,
    is_active: input.isActive !== false,
    show_on_home: showOnHome,
  };

  const legacyBase = buildLegacyImageOnlyRow({
    title,
    content: input.content ?? "",
    is_active: input.isActive !== false,
    media_url: (mediaFields.media_url as string | null) ?? null,
    media_type: (mediaFields.media_type as string | null) ?? null,
    image_url: (mediaFields.image_url as string | null) ?? null,
  });

  const candidates: Record<string, unknown>[] = [
    fullRow,
    { ...legacyBase, show_on_home: showOnHome },
    (() => {
      const { show_on_home: _omit, ...rest } = fullRow;
      return rest;
    })(),
    legacyBase,
  ];

  let data: NewsRow | null = null;
  let error: unknown = null;

  for (const row of candidates) {
    const result = await supabase
      .from("customer_news")
      .insert(row)
      .select("*")
      .single();
    data = (result.data as NewsRow | null) ?? null;
    error = result.error;
    if (!error) break;
    if (
      !isMissingMediaColumnError(error) &&
      !isMissingShowOnHomeColumnError(error)
    ) {
      break;
    }
  }

  if (error) throw error;
  if (!data) throw new Error("소식 저장에 실패했습니다.");
  const item = mapRow(data);
  if (showOnHome) {
    await clearOtherHomeFeatured(item.id);
  }
  revalidateNewsPages(item.id);
  return item;
}

export async function updateCustomerNews(
  id: string,
  input: Partial<CustomerNewsInput>
): Promise<CustomerNewsItem> {
  ensureNewsDb();
  if (!id) throw new Error("Invalid news id");

  const patch: Record<string, unknown> = {};
  if (typeof input.title === "string") {
    const title = input.title.trim();
    if (!title) throw new Error("제목을 입력해 주세요.");
    patch.title = title;
  }
  if (typeof input.content === "string") patch.content = input.content;
  if (typeof input.isActive === "boolean") patch.is_active = input.isActive;
  if (typeof input.showOnHome === "boolean") {
    patch.show_on_home = input.showOnHome;
  }

  const mediaFields = normalizeMediaFields(input);
  if (mediaFields) Object.assign(patch, mediaFields);

  const supabase = createSupabaseAdmin();
  let { data, error } = await supabase
    .from("customer_news")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error && isMissingMediaColumnError(error) && mediaFields) {
    const legacyPatch = buildLegacyImageOnlyRow({
      ...patch,
      ...mediaFields,
    });
    if (typeof input.showOnHome === "boolean") {
      legacyPatch.show_on_home = input.showOnHome;
    }
    const retry = await supabase
      .from("customer_news")
      .update(legacyPatch)
      .eq("id", id)
      .select("*")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error && isMissingShowOnHomeColumnError(error)) {
    const { show_on_home: _omit, ...withoutHome } = patch;
    if (Object.keys(withoutHome).length === 0) {
      throw new Error(
        "홈 대표 소식 기능을 쓰려면 supabase/customer-news-featured.sql 을 실행해 주세요."
      );
    }
    const retry = await supabase
      .from("customer_news")
      .update(withoutHome)
      .eq("id", id)
      .select("*")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) throw error;
  const item = mapRow(data as NewsRow);
  if (input.showOnHome === true) {
    await clearOtherHomeFeatured(item.id);
  }
  revalidateNewsPages(item.id);
  return item;
}

export async function deleteCustomerNews(id: string): Promise<void> {
  ensureNewsDb();
  if (!id) throw new Error("Invalid news id");

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("customer_news").delete().eq("id", id);
  if (error) throw error;
  revalidateNewsPages(id);
}
