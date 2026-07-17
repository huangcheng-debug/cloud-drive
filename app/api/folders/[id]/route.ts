import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFile } from "@/lib/upload";

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

    const folder = await prisma.folder.update({
      where: { id },
      data: { name: name.trim() },
    });

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

    // 获取文件夹及其所有子文件
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        files: true,
        children: {
          include: {
            files: true,
            children: {
              include: {
                files: true,
              },
            },
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "文件夹不存在" }, { status: 404 });
    }

    // 收集所有需要删除的文件路径
    const filePaths: string[] = [];
    function collectFilePaths(f: typeof folder) {
      f.files.forEach((file) => filePaths.push(file.path));
      f.children.forEach((child) => collectFilePaths(child));
    }
    collectFilePaths(folder);

    // 删除磁盘上的文件
    await Promise.all(filePaths.map((fp) => deleteFile(fp)));

    // 删除数据库记录（级联删除子文件夹和文件）
    await prisma.folder.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/folders/[id] error:", error);
    return NextResponse.json({ error: "删除文件夹失败" }, { status: 500 });
  }
}