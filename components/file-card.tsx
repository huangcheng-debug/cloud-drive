"use client";

import { formatFileSize, getFileIcon } from "@/lib/utils";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
}

interface FileCardProps {
  file: FileItem;
  onDelete: (id: string) => void;
}

export default function FileCard({ file, onDelete }: FileCardProps) {
  const handleDownload = () => {
    window.open(`/api/files/${file.id}/download`, "_blank");
  };

  const handleDelete = () => {
    if (confirm(`确定要删除「${file.name}」吗？`)) {
      onDelete(file.id);
    }
  };

  return (
    <div className="group relative flex flex-col items-center p-4 rounded-xl border bg-card hover:shadow-md transition-all hover:border-primary/30">
      <span className="text-4xl mb-2 select-none">{getFileIcon(file.type)}</span>
      <span className="text-sm font-medium text-center truncate w-full" title={file.name}>
        {file.name}
      </span>
      <span className="text-xs text-muted-foreground mt-1">
        {formatFileSize(file.size)}
      </span>

      <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload} title="下载">
          <Download className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={handleDelete} title="删除">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}