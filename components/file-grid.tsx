"use client";

import { useState, useEffect, useCallback } from "react";
import FileCard from "@/components/file-card";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
}

interface FileGridProps {
  folderId: string | null;
  search: string;
  refreshKey: number;
}

export default function FileGrid({ folderId, search, refreshKey }: FileGridProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (folderId) params.set("folderId", folderId);
    if (search) params.set("search", search);

    const res = await fetch(`/api/files?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setFiles(data);
    }
    setLoading(false);
  }, [folderId, search]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshKey]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/files/${id}`, { method: "DELETE" });
    fetchFiles();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        加载中...
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
        <span className="text-5xl mb-3">📂</span>
        <p className="text-sm">{search ? "没有找到匹配的文件" : "此文件夹为空"}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
      {files.map((file) => (
        <FileCard key={file.id} file={file} onDelete={handleDelete} />
      ))}
    </div>
  );
}