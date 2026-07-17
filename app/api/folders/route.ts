import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/folders — 获取完整文件夹树（顶层 + 嵌套子文件夹）
export async function GET() {
  try {
    const folders = await prisma.folder.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(folders);
  } catch (error) {
    console.error("GET /api/folders error:", error);
    return NextResponse.json({ error: "获取文件夹失败" }, { status: 500 });
  }
}

// POST /api/folders — 新建文件夹
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, parentId } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "文件夹名称不能为空" }, { status: 400 });
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        parentId: parentId || null,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("POST /api/folders error:", error);
    return NextResponse.json({ error: "创建文件夹失败" }, { status: 500 });
  }
}