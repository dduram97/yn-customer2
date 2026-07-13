import { NextResponse } from "next/server";
import type { CustomerNewsMediaType } from "@/lib/customer-news";
import {
  createCustomerNews,
  deleteCustomerNews,
  listAllCustomerNews,
  updateCustomerNews,
} from "@/lib/customer-news";

export const dynamic = "force-dynamic";

function parseMediaType(
  value: unknown
): CustomerNewsMediaType | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (value === "image" || value === "gif" || value === "video") return value;
  return undefined;
}

export async function GET() {
  try {
    const items = await listAllCustomerNews();
    return NextResponse.json({ items });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load news";
    console.error("[admin/news GET]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      mediaUrl?: string | null;
      mediaType?: string | null;
      imageUrl?: string | null;
      isActive?: boolean;
      showOnHome?: boolean;
    };

    const item = await createCustomerNews({
      title: body.title ?? "",
      content: body.content ?? "",
      mediaUrl: body.mediaUrl ?? body.imageUrl,
      mediaType: parseMediaType(body.mediaType) ?? undefined,
      isActive: body.isActive,
      showOnHome: body.showOnHome,
    });
    return NextResponse.json({ item });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create news";
    console.error("[admin/news POST]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      title?: string;
      content?: string;
      mediaUrl?: string | null;
      mediaType?: string | null;
      imageUrl?: string | null;
      isActive?: boolean;
      showOnHome?: boolean;
    };

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const hasMediaField =
      body.mediaUrl !== undefined ||
      body.imageUrl !== undefined ||
      body.mediaType !== undefined;

    const item = await updateCustomerNews(body.id, {
      title: body.title,
      content: body.content,
      ...(hasMediaField
        ? {
            mediaUrl:
              body.mediaUrl !== undefined
                ? body.mediaUrl
                : body.imageUrl !== undefined
                  ? body.imageUrl
                  : undefined,
            mediaType: parseMediaType(body.mediaType),
          }
        : {}),
      isActive: body.isActive,
      showOnHome: body.showOnHome,
    });
    return NextResponse.json({ item });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update news";
    console.error("[admin/news PUT]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await deleteCustomerNews(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete news";
    console.error("[admin/news DELETE]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
