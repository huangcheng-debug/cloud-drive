"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import FileGrid from "@/components/file-grid";
import SearchBar from "@/components/search-bar";
import UploadButton from "@/components/upload-button";

export default function Home() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

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
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-card/50">
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