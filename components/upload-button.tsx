"use client";

import { useRef, useState, useCallback, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadButtonProps {
  folderId: string | null;
  onUploaded: () => void;
}

export default function UploadButton({ folderId, onUploaded }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      if (folderId) formData.append("folderId", folderId);

      try {
        const res = await fetch("/api/files", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          onUploaded();
        } else {
          const data = await res.json();
          alert(data.error || "上传失败");
        }
      } catch {
        alert("上传失败");
      }
      setUploading(false);
    },
    [folderId, onUploaded]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="gap-1.5"
      >
        {uploading ? (
          <>
            <span className="animate-spin">⏳</span>
            上传中...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            上传
          </>
        )}
      </Button>

      {/* 拖拽上传覆盖层 */}
      {dragOver && (
        <div
          className="fixed inset-0 z-50 bg-primary/10 backdrop-blur-sm flex items-center justify-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-card border-2 border-dashed border-primary rounded-2xl p-12 text-center">
            <Upload className="h-12 w-12 mx-auto text-primary mb-4" />
            <p className="text-lg font-semibold">释放文件以上传</p>
            <p className="text-sm text-muted-foreground mt-1">
              文件将上传到当前文件夹
            </p>
          </div>
        </div>
      )}
    </>
  );
}