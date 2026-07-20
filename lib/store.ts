import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { deleteFile } from "./upload";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// ============================================================
// 类型定义
// ============================================================

interface FolderRecord {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FileRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  folderId: string | null;
  createdAt: string;
}

interface StoreData {
  folders: FolderRecord[];
  files: FileRecord[];
}

type FolderWithChildren = FolderRecord & { children: FolderWithChildren[] };

// ============================================================
// Store 单例
// ============================================================

class Store {
  private data: StoreData = { folders: [], files: [] };
  private initialized = false;

  private async init(): Promise<void> {
    if (this.initialized) return;
    try {
      await mkdir(DATA_DIR, { recursive: true });
      if (existsSync(DATA_FILE)) {
        const raw = await readFile(DATA_FILE, "utf-8");
        this.data = JSON.parse(raw);
      }
      this.initialized = true;
    } catch {
      this.data = { folders: [], files: [] };
      this.initialized = true;
    }
  }

  private async save(): Promise<void> {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(this.data, null, 2), "utf-8");
  }

  private genId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  private now(): string {
    return new Date().toISOString();
  }

  // ============================================================
  // 文件夹操作
  // ============================================================

  async getFolderTree(): Promise<FolderWithChildren[]> {
    await this.init();
    return this.buildTree(null);
  }

  private buildTree(parentId: string | null): FolderWithChildren[] {
    return this.data.folders
      .filter((f) => f.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f) => ({
        ...f,
        children: this.buildTree(f.id),
      }));
  }

  async createFolder(name: string, parentId?: string | null): Promise<FolderRecord> {
    await this.init();
    const folder: FolderRecord = {
      id: this.genId(),
      name,
      parentId: parentId || null,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    this.data.folders.push(folder);
    await this.save();
    return folder;
  }

  async updateFolder(id: string, name: string): Promise<FolderRecord> {
    await this.init();
    const folder = this.data.folders.find((f) => f.id === id);
    if (!folder) throw new Error("Folder not found");
    folder.name = name;
    folder.updatedAt = this.now();
    await this.save();
    return folder;
  }

  async deleteFolder(id: string): Promise<void> {
    await this.init();

    // 递归收集所有子文件夹
    const idsToDelete = new Set<string>();
    const collectIds = (folderId: string) => {
      idsToDelete.add(folderId);
      this.data.folders
        .filter((f) => f.parentId === folderId)
        .forEach((f) => collectIds(f.id));
    };
    collectIds(id);

    // 删除关联文件
    const files = this.data.files.filter((f) =>
      f.folderId ? idsToDelete.has(f.folderId) : false
    );
    for (const file of files) {
      await deleteFile(file.path);
    }

    // 从数据中删除
    this.data.files = this.data.files.filter(
      (f) => !f.folderId || !idsToDelete.has(f.folderId)
    );
    this.data.folders = this.data.folders.filter(
      (f) => !idsToDelete.has(f.id)
    );

    await this.save();
  }

  // ============================================================
  // 文件操作
  // ============================================================

  async createFile(file: {
    name: string;
    size: number;
    type: string;
    path: string;
    folderId?: string | null;
  }): Promise<FileRecord> {
    await this.init();
    const record: FileRecord = {
      id: this.genId(),
      name: file.name,
      size: file.size,
      type: file.type,
      path: file.path,
      folderId: file.folderId || null,
      createdAt: this.now(),
    };
    this.data.files.push(record);
    await this.save();
    return record;
  }

  async getFiles(params: {
    folderId?: string | null;
    search?: string;
  }): Promise<FileRecord[]> {
    await this.init();
    let files = [...this.data.files];

    // 按文件夹过滤
    const folderId = params.folderId;
    if (folderId === "null" || folderId === "root" || !folderId) {
      files = files.filter((f) => f.folderId === null);
    } else {
      files = files.filter((f) => f.folderId === folderId);
    }

    // 按搜索词过滤（模糊匹配）
    if (params.search) {
      const s = params.search.toLowerCase();
      files = files.filter((f) => f.name.toLowerCase().includes(s));
    }

    // 按时间倒序
    files.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return files;
  }

  async getFile(id: string): Promise<FileRecord | null> {
    await this.init();
    return this.data.files.find((f) => f.id === id) || null;
  }

  async deleteFileRecord(id: string): Promise<void> {
    await this.init();
    const file = this.data.files.find((f) => f.id === id);
    if (!file) throw new Error("File not found");
    await deleteFile(file.path);
    this.data.files = this.data.files.filter((f) => f.id !== id);
    await this.save();
  }
}

// ============================================================
// 导出单例
// ============================================================

const globalForStore = globalThis as unknown as { store: Store | undefined };

export const store = globalForStore.store ?? new Store();

if (process.env.NODE_ENV !== "production") globalForStore.store = store;