"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faMagnifyingGlass,
  faFolder,
  faFolderOpen,
  faPlus,
  faStar,
  faShareNodes,
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

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
    <div className="w-64 bg-card p-4 border-r border-zinc-100 dark:border-none h-screen overflow-y-auto">
      {/* Top Title */}
      <h1 className="text-xl font-bold text-foreground mb-4">Snippets</h1>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 pl-8 rounded-md bg-muted text-foreground"
        />
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </span>
      </div>

      {/* All Snippets */}
      <button
        onClick={() => handleViewChange("all", null)}
        className={`w-full text-left p-2 rounded flex items-center gap-2 cursor-pointer ${
          currentView === "all" && !currentFolderId
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-700"
        }`}
      >
        <FontAwesomeIcon icon={faCode} />
        <span>All Snippets</span>
      </button>

      {/* My Folders */}
      <div className="mt-2">
        <div className="flex justify-between items-center p-2 border-b border-muted dark:border-zinc-600">
          <span className="text-foreground">My Folders</span>
          <button
            onClick={handleAddFolder}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <hr className="border-t border-muted mb-2" />
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => handleViewChange("folder", folder.id)}
            className={`w-full text-left p-2 rounded flex items-center gap-2 cursor-pointer ${
              currentView === "folder" && currentFolderId === folder.id
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-700"
            }`}
          >
            <FontAwesomeIcon
              icon={
                currentView === "folder" && currentFolderId === folder.id
                  ? faFolderOpen
                  : faFolder
              }
            />
            <span>
              {folder.name} ({folder.snippetCount})
            </span>
          </button>
        ))}
      </div>

      {/* Favorites (Collapsible) */}
      {hasFavorites && (
        <div className="mt-2">
          <button
            onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
            className="w-full text-left p-2 rounded flex items-center justify-between text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faStar} />
              <span>Favorites</span>
            </div>
            <FontAwesomeIcon
              icon={isFavoritesOpen ? faChevronDown : faChevronRight}
            />
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

      {/* Shared Snippets (Collapsible) */}
      {hasShared && (
        <div className="mt-2">
          <button
            onClick={() => setIsSharedOpen(!isSharedOpen)}
            className="w-full text-left p-2 rounded flex items-center justify-between text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShareNodes} />
              <span>Shared Snippets</span>
            </div>
            <FontAwesomeIcon
              icon={isSharedOpen ? faChevronDown : faChevronRight}
            />
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
