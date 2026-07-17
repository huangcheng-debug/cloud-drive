import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const file = await prisma.file.findUnique({ where: { id } });

    if (!file) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    const buffer = await readFile(file.path);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        "Content-Length": String(file.size),
      },
    });
  } catch (error) {
    console.error("GET /api/files/[id]/download error:", error);
    return NextResponse.json({ error: "下载文件失败" }, { status: 500 });
  }
}