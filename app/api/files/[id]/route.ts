import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await store.deleteFileRecord(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/files/[id] error:", error);
    return NextResponse.json({ error: "删除文件失败" }, { status: 500 });
  }
}