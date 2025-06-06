"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faCode,
  faFolder,
  faFolderOpen,
  faPlus,
  faStar,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";

type Folder = { id: string; name: string; snippetCount: number };
type ViewType = "all" | "folder" | "favorites" | "shared";
type Snippet = {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  folder_ids: string[];
  isFavorite: boolean;
};

type User = {
  id: string;
  username: string;
  avatar_url?: string | null;
};

type SidebarProps = {
  user: User | null;
  onViewChange: (view: ViewType, folderId?: string | null) => void;
  onSearch: (query: string) => void;
  filteredSnippets: Snippet[];
  onSnippetClick: (snippetId: string) => void;
};

export default function Sidebar({
  user,
  onViewChange,
  onSearch,
  filteredSnippets,
  onSnippetClick,
}: SidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>("all");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    const fetchFolders = async () => {
      const { data: userData } = await supabase.auth.getSession();
      const userId = userData?.session?.user?.id;

      if (!userId) return;

      const { data: folderData, error: folderError } = await supabase
        .from("folders")
        .select("id, name")
        .eq("owner", userId);

      if (folderError) return;

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

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty.");
      return;
    }

    const { data: userData } = await supabase.auth.getSession();
    const userId = userData?.session?.user?.id;

    if (!userId) {
      toast.error("No user logged in.");
      return;
    }

    try {
      const { error } = await supabase
        .from("folders")
        .insert({ name: newFolderName, owner: userId })
        .select("id, name")
        .single();

      if (error) {
        toast.error(error.message || "Failed to create folder.");
        return;
      }

      const { data: newFolderData } = await supabase
        .from("folders")
        .select("id, name")
        .eq("name", newFolderName)
        .eq("owner", userId)
        .single();

      setFolders([...folders, { ...newFolderData, snippetCount: 0 }]);
      setNewFolderName("");
      setIsAddFolderOpen(false);
      toast.success("Folder created successfully.");
    } catch {
      toast.error("An unexpected error occurred.");
    }
  };

  const favoriteSnippets = filteredSnippets
    .filter((snippet) => snippet.isFavorite)
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="w-full md:w-64 flex-none bg-card p-4 border-r border-zinc-100 dark:border-none">
      {user && (
        <p className="text-sm text-muted-foreground mb-2">
          Hi, {user.username}
        </p>
      )}

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

      <hr className="border-t border-muted my-2" />

      <div className="mt-2">
        <div className="flex justify-between items-center p-2 border-b border-muted dark:border-zinc-600">
          <span className="text-foreground">My Folders</span>
          <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
            <DialogTrigger asChild>
              <button
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setIsAddFolderOpen(true)}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <Input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="mt-2"
              />
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewFolderName("");
                    setIsAddFolderOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddFolder}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

      <hr className="border-t border-muted my-2" />

      <div className="mt-2">
        <button
          onClick={() => handleViewChange("favorites", null)}
          className={`w-full text-left p-2 border-b border-muted dark:border-zinc-600 flex items-center gap-2 cursor-pointer ${
            currentView === "favorites" && !currentFolderId
              ? "bg-primary text-primary-foreground"
              : "text-foreground"
          }`}
        >
          <FontAwesomeIcon icon={faStar} />
          <span>Favorites ({favoriteSnippets.length})</span>
        </button>
        <hr className="border-t border-muted mb-2" />
        {favoriteSnippets.length > 0 ? (
          favoriteSnippets.map((snippet) => (
            <div
              key={snippet.id}
              className="text-foreground p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded cursor-pointer"
              onClick={() => onSnippetClick(snippet.id)}
            >
              {snippet.title}
            </div>
          ))
        ) : (
          <p className="text-muted-foreground p-2">
            No favorites yet—star a snippet to add it here!
          </p>
        )}
      </div>

      <hr className="border-t border-muted my-2" />

      <div className="mt-2">
        <button
          onClick={() => handleViewChange("shared", null)}
          className={`w-full text-left p-2 border-b border-muted dark:border-zinc-600 flex items-center gap-2 cursor-pointer ${
            currentView === "shared" && !currentFolderId
              ? "bg-primary text-primary-foreground"
              : "text-foreground"
          }`}
        >
          <FontAwesomeIcon icon={faShareNodes} />
          <span>Shared</span>
        </button>
        <hr className="border-t border-muted mb-2" />
        <p className="text-muted-foreground p-2">
          Shared snippets will be listed here.
        </p>
      </div>
    </div>
  );
}
