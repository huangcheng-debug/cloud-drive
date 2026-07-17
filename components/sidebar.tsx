"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Folder, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";

interface FolderNode {
  id: string;
  name: string;
  parentId: string | null;
  children: FolderNode[];
}

interface SidebarProps {
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
}

export default function Sidebar({ selectedFolderId, onFolderSelect }: SidebarProps) {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const fetchFolders = useCallback(async () => {
    const res = await fetch("/api/folders");
    if (res.ok) {
      const data = await res.json();
      setFolders(data);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpanded(next);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim() }),
    });
    setNewFolderName("");
    setShowNewFolderInput(false);
    fetchFolders();
  };

  const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("确定要删除此文件夹及其所有内容吗？")) return;
    await fetch(`/api/folders/${id}`, { method: "DELETE" });
    if (selectedFolderId === id) onFolderSelect(null);
    fetchFolders();
  };

  const renderFolderNode = (folder: FolderNode, depth: number) => {
    const isExpanded = expanded.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = folder.children.length > 0;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer group transition-colors ${
            isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => onFolderSelect(folder.id)}
        >
          <button
            className="p-0.5 hover:bg-muted rounded-sm opacity-50 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(folder.id);
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )
            ) : (
              <span className="w-3" />
            )}
          </button>
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          )}
          <span className="text-sm truncate flex-1">{folder.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 flex-shrink-0"
            onClick={(e) => handleDeleteFolder(folder.id, e)}
          >
            <span className="text-xs text-red-400">×</span>
          </Button>
        </div>
        {isExpanded &&
          folder.children.map((child) => renderFolderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="w-60 h-full border-r flex flex-col bg-background">
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Folder className="h-4 w-4" />
          目录
        </h2>
      </div>

      <ScrollArea className="flex-1 px-2 py-1">
        <div
          className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
            selectedFolderId === null ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
          }`}
          onClick={() => onFolderSelect(null)}
        >
          <span className="w-5" />
          <FolderOpen className="h-4 w-4 text-blue-500" />
          <span className="text-sm">全部文件</span>
        </div>
        {folders.map((folder) => renderFolderNode(folder, 0))}
      </ScrollArea>

      <div className="p-2 border-t">
        {showNewFolderInput ? (
          <div className="flex gap-1">
            <Input
              className="h-8 text-sm"
              placeholder="文件夹名称"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createFolder();
                if (e.key === "Escape") setShowNewFolderInput(false);
              }}
              autoFocus
            />
            <Button size="sm" className="h-8" onClick={createFolder}>
              确定
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground text-xs"
            onClick={() => setShowNewFolderInput(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            新建文件夹
          </Button>
        )}
      </div>
    </div>
  );
}