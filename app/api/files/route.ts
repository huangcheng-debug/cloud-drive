import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { saveFile } from "@/lib/upload";

// GET /api/files?folderId=&search= — 获取文件列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search") || "";

    const files = await store.getFiles({ folderId, search });
    return NextResponse.json(files);
  } catch (error) {
    console.error("GET /api/files error:", error);
    return NextResponse.json({ error: "获取文件列表失败" }, { status: 500 });
  }
}

// POST /api/files — 上传文件
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = await saveFile(buffer, file.name);

    const record = await store.createFile({
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      path: filePath,
      folderId: folderId && folderId !== "null" && folderId !== "root" ? folderId : null,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("POST /api/files error:", error);
    return NextResponse.json({ error: "上传文件失败" }, { status: 500 });
  }
}