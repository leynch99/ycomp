import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin";

const MAX_SIZE = 4 * 1024 * 1024; // 4 MB

/** POST /api/admin/upload — upload image to Vercel Blob, returns URL */
export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Файл занадто великий (макс 4 MB)" },
      { status: 400 }
    );
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Дозволені формати: JPEG, PNG, WebP, GIF" },
      { status: 400 }
    );
  }

  try {
    const blob = await put(`products/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Помилка завантаження. Перевір BLOB_READ_WRITE_TOKEN." },
      { status: 500 }
    );
  }
}
