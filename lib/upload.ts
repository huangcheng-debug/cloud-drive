import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function saveFile(buffer: Buffer, fileName: string): Promise<string> {
  await ensureUploadDir();
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${fileName}`;
  const filePath = path.join(UPLOAD_DIR, uniqueName);
  await writeFile(filePath, buffer);
  return filePath;
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch {
    // 文件可能已不存在，忽略错误
  }
}

async function ensureUploadDir(): Promise<void> {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch {
    // 目录已存在
  }
}

export function getUploadDir(): string {
  return UPLOAD_DIR;
}