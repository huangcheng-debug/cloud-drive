import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

// PATCH /api/folders/[id] — 重命名文件夹
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "文件夹名称不能为空" }, { status: 400 });
    }

    const folder = await store.updateFolder(id, name.trim());
    return NextResponse.json(folder);
  } catch (error) {
    console.error("PATCH /api/folders/[id] error:", error);
    return NextResponse.json({ error: "重命名文件夹失败" }, { status: 500 });
  }
}

// DELETE /api/folders/[id] — 删除文件夹及其所有子文件和子文件夹
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await store.deleteFolder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/folders/[id] error:", error);
    return NextResponse.json({ error: "删除文件夹失败" }, { status: 500 });
  }
}