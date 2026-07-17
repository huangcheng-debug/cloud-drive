"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/sidebar";
import FileGrid from "@/components/file-grid";
import SearchBar from "@/components/search-bar";
import UploadButton from "@/components/upload-button";

export default function Home() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleUploaded = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        selectedFolderId={selectedFolderId}
        onFolderSelect={(id) => {
          setSelectedFolderId(id);
          setSearch("");
        }}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-2 px-3 py-2.5 border-b bg-card/50">
          {/* 移动端汉堡菜单 */}
          <button
            className="md:hidden p-1.5 hover:bg-muted rounded-md shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="打开目录"
          >
            <Menu className="h-5 w-5" />
          </button>

          <SearchBar value={search} onChange={setSearch} />
          <div className="flex-1" />
          <UploadButton folderId={selectedFolderId} onUploaded={handleUploaded} />
        </header>

        <div className="flex-1 overflow-auto">
          <FileGrid
            folderId={selectedFolderId}
            search={search}
            refreshKey={refreshKey}
          />
        </div>
      </div>
    </div>
  );
}