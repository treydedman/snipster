"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Folder = { id: string; name: string; snippetCount: number };
type ViewType = "all" | "folder" | "favorites" | "shared";

type SidebarProps = {
  onViewChange: (view: ViewType, folderId?: string | null) => void;
  onSearch: (query: string) => void;
};

export default function Sidebar({ onViewChange, onSearch }: SidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>("all");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSharedOpen, setIsSharedOpen] = useState(false);
  const [hasFavorites, setHasFavorites] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      const { data: userData } = await supabase.auth.getSession();
      const userId = userData?.session?.user?.id;

      if (!userId) return;

      const { data: folderData, error: folderError } = await supabase
        .from("folders")
        .select("id, name")
        .eq("owner", userId);

      if (folderError) {
        console.error("Error fetching folders:", folderError);
        return;
      }

      const foldersWithCounts = await Promise.all(
        folderData.map(async (folder: { id: string; name: string }) => {
          const { count } = await supabase
            .from("snippet_folders")
            .select("snippet_id", { count: "exact" })
            .eq("folder_id", folder.id);
          return { ...folder, snippetCount: count || 0 };
        })
      );

      setFolders(foldersWithCounts);
    };

    fetchFolders();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleViewChange = (view: ViewType, folderId: string | null = null) => {
    setCurrentView(view);
    setCurrentFolderId(folderId);
    onViewChange(view, folderId);
  };

  const handleAddFolder = () => {
    console.log("Add new folder clicked");
  };

  return (
    <div className="w-64 bg-card p-4 border-r border-zinc-300 dark:border-zinc-600 h-screen overflow-y-auto">
      <h1 className="text-xl font-bold text-foreground mb-4">Snippets</h1>

      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search snippets…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 pl-8 rounded-md bg-muted text-foreground"
        />
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          🔍
        </span>
      </div>

      <button
        onClick={() => handleViewChange("all", null)}
        className={`w-full text-left p-2 rounded flex items-center gap-2 ${
          currentView === "all" && !currentFolderId
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted"
        }`}
      >
        <span>📋</span> All Snippets
      </button>

      <div className="mt-2">
        <div className="flex justify-between items-center p-2">
          <span className="text-foreground">My Folders</span>
          <button
            onClick={handleAddFolder}
            className="text-muted-foreground hover:text-foreground"
          >
            ➕
          </button>
        </div>
        <hr className="border-t border-muted mb-2" />
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => handleViewChange("folder", folder.id)}
            className={`w-full text-left p-2 rounded flex items-center gap-2 ${
              currentView === "folder" && currentFolderId === folder.id
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <span>🗂️</span> {folder.name} ({folder.snippetCount})
          </button>
        ))}
      </div>

      {hasFavorites && (
        <div className="mt-2">
          <button
            onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
            className="w-full text-left p-2 rounded flex items-center justify-between text-foreground hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <span>⭐</span> Favorites
            </div>
            <span>{isFavoritesOpen ? "▼" : "▶"}</span>
          </button>
          {isFavoritesOpen && (
            <div className="pl-6">
              <p className="text-muted-foreground p-2">
                Favorites will be listed here.
              </p>
            </div>
          )}
        </div>
      )}

      {hasShared && (
        <div className="mt-2">
          <button
            onClick={() => setIsSharedOpen(!isSharedOpen)}
            className="w-full text-left p-2 rounded flex items-center justify-between text-foreground hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <span>🔗</span> Shared Snippets
            </div>
            <span>{isSharedOpen ? "▼" : "▶"}</span>
          </button>
          {isSharedOpen && (
            <div className="pl-6">
              <p className="text-muted-foreground p-2">
                Shared snippets will be listed here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
