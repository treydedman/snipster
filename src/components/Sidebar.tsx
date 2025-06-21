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
  DialogDescription,
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
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

type Folder = { id: string; name: string };
type FolderWithCount = Folder & { snippetCount: number };
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
  setFolders: (folders: FolderWithCount[]) => void;
  folders: FolderWithCount[];
};

export default function Sidebar({
  user,
  onViewChange,
  onSearch,
  filteredSnippets,
  onSnippetClick,
  setFolders,
  folders,
}: SidebarProps) {
  const [currentView, setCurrentView] = useState<ViewType>("all");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [editFolderId, setEditFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [deleteFolder, setDeleteFolder] = useState<FolderWithCount | null>(
    null
  );
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      const { data: userData } = await supabase.auth.getSession();
      const currentUserId = userData?.session?.user?.id;
      if (!currentUserId) {
        return;
      }

      setUserId(currentUserId);

      const { data: folderData, error: folderError } = await supabase
        .from("folders")
        .select("id, name")
        .eq("owner", currentUserId);

      if (folderError) {
        toast.error("Failed to fetch folders!");
        setFolders([]);
        return;
      }

      const foldersWithCounts = await Promise.all(
        (folderData as Folder[]).map(async (folder) => {
          const { count, error: countError } = await supabase
            .from("snippet_folders")
            .select("snippet_id", { count: "exact" })
            .eq("folder_id", folder.id);
          if (countError) {
            return { ...folder, snippetCount: 0 };
          }
          return { ...folder, snippetCount: count || 0 };
        })
      );

      setFolders(foldersWithCounts);
    };

    fetchFolders();

    if (userId) {
      const folderChannel = supabase
        .channel(`folders_${userId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "folders" },
          () => {
            fetchFolders();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "snippet_folders" },
          () => {
            fetchFolders();
          }
        )
        .subscribe((status, error) => {
          if (error) {
            toast.error("Failed to subscribe to folder updates!", {
              duration: 5000,
            });
          }
        });

      return () => {
        supabase.removeChannel(folderChannel);
      };
    }
  }, [userId, setFolders]);

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
      toast.error("Folder name cannot be empty!");
      return;
    }

    const { data: userData } = await supabase.auth.getSession();
    const userId = userData?.session?.user?.id;
    if (!userId) {
      toast.error("No user logged in!");
      return;
    }

    try {
      const { data: newFolder, error } = await supabase
        .from("folders")
        .insert({ name: newFolderName, owner: userId })
        .select("id, name")
        .single();
      if (error) {
        toast.error(error.message || "Failed to create folder!");
        return;
      }
      const updatedFolders = [...folders, { ...newFolder, snippetCount: 0 }];
      setFolders(updatedFolders);
      setNewFolderName("");
      setIsAddFolderOpen(false);
      toast.success("Folder created successfully!");
    } catch {
      toast.error("An unexpected error occurred!");
    }
  };

  const handleEditFolder = async () => {
    if (!editFolderName.trim()) {
      toast.error("Folder name cannot be empty!");
      return;
    }

    const { data: userData } = await supabase.auth.getSession();
    const userId = userData?.session?.user?.id;
    if (!userId || !editFolderId) {
      toast.error("No user logged in or invalid folder!");
      return;
    }

    try {
      const { error } = await supabase
        .from("folders")
        .update({ name: editFolderName })
        .eq("id", editFolderId)
        .eq("owner", userId);
      if (error) {
        toast.error(error.message || "Failed to update folder!");
        return;
      }
      setFolders(
        folders.map((f) =>
          f.id === editFolderId ? { ...f, name: editFolderName } : f
        )
      );
      setEditFolderName("");
      setEditFolderId(null);
      setIsEditFolderOpen(false);
      toast.success("Folder updated successfully!");
    } catch {
      toast.error("An unexpected error occurred!");
    }
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolder) {
      return;
    }

    const { data: userData } = await supabase.auth.getSession();
    const userId = userData?.session?.user?.id;
    if (!userId) {
      toast.error("No user logged in!");
      return;
    }

    try {
      const { error: snippetFoldersError } = await supabase
        .from("snippet_folders")
        .delete()
        .eq("folder_id", deleteFolder.id);
      if (snippetFoldersError) {
        toast.error(
          snippetFoldersError.message || "Failed to remove snippet mappings!"
        );
        return;
      }

      const { error: folderError } = await supabase
        .from("folders")
        .delete()
        .eq("id", deleteFolder.id)
        .eq("owner", userId);
      if (folderError) {
        toast.error(folderError.message || "Failed to delete folder!");
        return;
      }

      setFolders(folders.filter((f) => f.id !== deleteFolder.id));
      if (currentView === "folder" && currentFolderId === deleteFolder.id) {
        handleViewChange("all", null);
      }
      setDeleteFolder(null);
      setIsDeleteFolderOpen(false);
      toast.success("Folder deleted successfully!");
    } catch {
      toast.error("An unexpected error occurred!");
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
            : "text-foreground hover:bg-accent"
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
            <DialogContent aria-hidden={undefined}>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Enter a name for your new folder.
                </DialogDescription>
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
          <div key={folder.id} className="flex items-center gap-2">
            <button
              onClick={() => handleViewChange("folder", folder.id)}
              className={`flex-1 text-left p-2 rounded flex items-center gap-2 cursor-pointer ${
                currentView === "folder" && currentFolderId === folder.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
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
            <button
              className="folder-edit-btn text-muted-foreground cursor-pointer p-2"
              onClick={() => {
                setEditFolderId(folder.id);
                setEditFolderName(folder.name);
                setIsEditFolderOpen(true);
              }}
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
            <button
              className="folder-delete-btn text-muted-foreground cursor-pointer p-2"
              onClick={() => {
                setDeleteFolder(folder);
                setIsDeleteFolderOpen(true);
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ))}
        <Dialog open={isEditFolderOpen} onOpenChange={setIsEditFolderOpen}>
          <DialogContent aria-hidden={undefined}>
            <DialogHeader>
              <DialogTitle>Edit Folder</DialogTitle>
              <DialogDescription>
                Update the name of your folder.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="text"
              placeholder="Folder name"
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              className="mt-2"
            />
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditFolderName("");
                  setEditFolderId(null);
                  setIsEditFolderOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditFolder}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isDeleteFolderOpen} onOpenChange={setIsDeleteFolderOpen}>
          <DialogContent aria-hidden={undefined}>
            <DialogHeader>
              <DialogTitle>Delete Folder</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deleteFolder?.name}
                &quot;? This will remove the folder and unlink{" "}
                {deleteFolder?.snippetCount || 0} snippet(s) from it. Snippets
                will remain in your collection.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteFolder(null);
                  setIsDeleteFolderOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteFolder}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <hr className="border-t border-muted my-2" />
      <div className="mt-2">
        <button
          onClick={() => handleViewChange("favorites", null)}
          className={`w-full text-left p-2 border-b border-muted dark:border-zinc-600 flex items-center gap-2 cursor-pointer ${
            currentView === "favorites" && !currentFolderId
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-accent"
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
              className="text-foreground p-1 hover:bg-accent rounded cursor-pointer"
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
              : "text-foreground hover:bg-accent"
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
