"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SnippetCard from "@/components/SnippetCard";
import SnippetEditor from "@/components/SnippetEditor";

type Snippet = {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  folder_ids: string[];
  isFavorite: boolean;
};

type Folder = {
  id: string;
  name: string;
};

type ViewType = "all" | "folder" | "favorites" | "shared";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    username: string;
    avatar_url?: string | null;
  } | null>(null);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedView, setSelectedView] = useState<ViewType>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setError("Failed to authenticate");
          setLoading(false);
          return;
        }

        if (!session) {
          router.push("/auth/sign-in");
          return;
        }

        const userId = session.user.id;
        const isGuest =
          session.user.email === "guest@example.com" ||
          session.user.user_metadata?.role === "guest";
        const username = isGuest
          ? "Guest"
          : session.user.user_metadata?.username || "User";
        const avatar_url = session.user.user_metadata?.avatar_url || null;
        setUser({ id: userId, username, avatar_url });

        const { data: folderData, error: folderError } = await supabase
          .from("folders")
          .select("id, name")
          .eq("owner", userId);

        if (folderError) {
          setFolders([]);
        } else {
          setFolders(folderData || []);
        }

        const { data: snippetData, error: snippetError } = await supabase
          .from("snippets")
          .select("id, title, content, language, tags, is_favorite")
          .eq("owner", userId);

        if (snippetError) {
          setError("Failed to load snippets");
          setLoading(false);
          return;
        }

        const { data: snippetFoldersData, error: snippetFoldersError } =
          await supabase
            .from("snippet_folders")
            .select("snippet_id, folder_id")
            .in(
              "snippet_id",
              snippetData.map((snippet: { id: string }) => snippet.id)
            );

        if (snippetFoldersError) {
          setSnippets(
            snippetData.map((snippet: any) => ({
              id: snippet.id,
              title: snippet.title,
              content: snippet.content,
              language: snippet.language.toLowerCase(),
              tags: snippet.tags,
              folder_ids: [],
              isFavorite: snippet.is_favorite,
            }))
          );
        } else {
          const formattedSnippets = snippetData.map((snippet: any) => ({
            id: snippet.id,
            title: snippet.title,
            content: snippet.content,
            language: snippet.language.toLowerCase(),
            tags: snippet.tags,
            folder_ids: snippetFoldersData
              ? snippetFoldersData
                  .filter((sf: any) => sf.snippet_id === snippet.id)
                  .map((sf: any) => sf.folder_id)
              : [],
            isFavorite: snippet.is_favorite,
          }));
          setSnippets(formattedSnippets);
          setFilteredSnippets(formattedSnippets);
        }
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, [router]);

  // Real-time subscription for snippet updates
  useEffect(() => {
    const subscription = supabase
      .channel("snippets")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "snippets" },
        (payload) => {
          setSnippets((prev) =>
            prev.map((s) =>
              s.id === payload.new.id
                ? { ...s, isFavorite: payload.new.is_favorite }
                : s
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedView === "favorites") {
      setFilteredSnippets(snippets.filter((s) => s.isFavorite));
    } else if (selectedView === "all") {
      setFilteredSnippets(snippets);
    } else if (selectedView === "folder" && selectedFolderId) {
      setFilteredSnippets(
        snippets.filter((s) => s.folder_ids.includes(selectedFolderId))
      );
    } else if (selectedView === "shared") {
      setFilteredSnippets([]);
    }
  }, [snippets, selectedView, selectedFolderId]);

  const selectedSnippet = useMemo(() => {
    return (
      snippets.find((s) => s.id === selectedSnippetId) || {
        id: "",
        title: "",
        content: "",
        language: "",
        tags: [],
        folder_ids: [],
        isFavorite: false,
      }
    );
  }, [selectedSnippetId, snippets]);

  const handleViewChange = (view: ViewType, folderId: string | null = null) => {
    if (
      view !== "all" &&
      view !== "favorites" &&
      view !== "shared" &&
      !folderId
    ) {
      setSelectedSnippetId(null);
    }
    setSelectedView(view);
    setSelectedFolderId(folderId);
  };

  const handleSearch = (query: string) => {
    if (!query) {
      handleViewChange(selectedView, selectedFolderId);
      return;
    }
    const lowerQuery = query.toLowerCase();
    setFilteredSnippets(
      snippets.filter(
        (snippet) =>
          snippet.title.toLowerCase().includes(lowerQuery) ||
          snippet.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
          snippet.language.toLowerCase().includes(lowerQuery)
      )
    );
  };

  const handleSnippetClick = (snippetId: string) => {
    setSelectedSnippetId(snippetId);
  };

  const handleEditorSave = (updatedSnippet: Snippet) => {
    setSnippets((prev) =>
      prev.map((s) => (s.id === updatedSnippet.id ? updatedSnippet : s))
    );
  };

  const handleEditorCancel = () => {
    setSelectedSnippetId(null);
  };

  const handleToggleFavorite = async (snippetId: string) => {
    const snippet = snippets.find((s) => s.id === snippetId);
    if (!snippet) return;

    const newFavoriteStatus = !snippet.isFavorite;

    // Optimistically update the UI
    setSnippets((prev) =>
      prev.map((s) =>
        s.id === snippetId ? { ...s, isFavorite: newFavoriteStatus } : s
      )
    );

    try {
      const { error } = await supabase
        .from("snippets")
        .update({ is_favorite: newFavoriteStatus })
        .eq("id", snippetId)
        .eq("owner", user?.id);

      if (error) {
        throw new Error(error.message || "Failed to update favorite status");
      }

      toast.success(
        newFavoriteStatus
          ? "Snippet added to favorites!"
          : "Snippet removed from favorites."
      );
    } catch (error) {
      // Revert on error
      setSnippets((prev) =>
        prev.map((s) =>
          s.id === snippetId ? { ...s, isFavorite: !newFavoriteStatus } : s
        )
      );
      toast.error("Failed to update favorite status.");
    }
  };

  const handleDelete = async (snippetId: string) => {
    try {
      const { error: snippetError } = await supabase
        .from("snippets")
        .delete()
        .eq("id", snippetId);
      if (snippetError) throw snippetError;

      const { error: folderError } = await supabase
        .from("snippet_folders")
        .delete()
        .eq("snippet_id", snippetId);
      if (folderError) throw folderError;

      setSnippets((prev) => prev.filter((s) => s.id !== snippetId));
      if (selectedSnippetId === snippetId) {
        setSelectedSnippetId(null);
      }
    } catch (error) {
      toast.error("Failed to delete snippet.");
    }
  };

  const handleMoveToFolder = async (snippetId: string, folderId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("snippet_folders")
        .delete()
        .eq("snippet_id", snippetId);
      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from("snippet_folders")
        .insert({ snippet_id: snippetId, folder_id: folderId });
      if (insertError) throw insertError;

      setSnippets((prev) =>
        prev.map((s) =>
          s.id === snippetId ? { ...s, folder_ids: [folderId] } : s
        )
      );
      toast.success("Snippet moved to folder.");
    } catch (error) {
      toast.error("Failed to move snippet to folder.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="flex flex-col md:flex-row">
        <Sidebar
          user={user}
          onViewChange={handleViewChange}
          onSearch={handleSearch}
          filteredSnippets={filteredSnippets}
          onSnippetClick={handleSnippetClick}
        />

        <div className="flex-1 flex flex-col md:flex-row pt-4 px-4 md:pt-4 md:px-8 gap-4">
          <div
            className={
              isMobile && selectedSnippetId
                ? "hidden"
                : "w-full md:w-80 flex flex-col gap-4"
            }
          >
            <h2 className="text-2xl font-bold mb-4">Snippets</h2>

            <div className="flex justify-between items-center">
              <p className="text-base font-medium truncate mb-2">
                {selectedView === "all"
                  ? "All Snippets"
                  : selectedView === "folder"
                  ? `Snippets in ${
                      folders.find((f) => f.id === selectedFolderId)?.name
                    }`
                  : selectedView === "favorites"
                  ? "Favorites"
                  : "Shared Snippets"}
              </p>
              <Button
                className="bg-primary text-primary-foreground hover:bg-blue-700"
                onClick={() => setSelectedSnippetId(null)}
              >
                New Snippet
              </Button>
            </div>

            <hr className="border-t border-muted my-2" />

            <div className="flex-1 overflow-y-auto space-y-4">
              {filteredSnippets.length > 0 ? (
                filteredSnippets.map((snippet) => (
                  <SnippetCard
                    key={`${snippet.id}-${snippet.isFavorite}`}
                    snippet={snippet}
                    isSelected={selectedSnippetId === snippet.id}
                    onClick={() => handleSnippetClick(snippet.id)}
                    onToggleFavorite={() => handleToggleFavorite(snippet.id)}
                    onDelete={handleDelete}
                    onMoveToFolder={handleMoveToFolder}
                    folders={folders}
                  />
                ))
              ) : (
                <p className="text-muted-foreground">
                  {selectedView === "all"
                    ? "No snippets found. Create one to get started!"
                    : selectedView === "folder"
                    ? "No snippets in this folder."
                    : selectedView === "favorites"
                    ? "No favorites yet—star a snippet to add it here!"
                    : "Shared snippets will be listed here."}
                </p>
              )}
            </div>
          </div>

          {!isMobile && (
            <div className="flex-1">
              <SnippetEditor
                snippet={selectedSnippet}
                onSave={handleEditorSave}
                onCancel={handleEditorCancel}
                onNewSnippet={() => setSelectedSnippetId(null)}
                isMobile={false}
              />
            </div>
          )}

          {isMobile && selectedSnippetId && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <SnippetEditor
                snippet={selectedSnippet}
                onSave={handleEditorSave}
                onCancel={handleEditorCancel}
                onNewSnippet={() => setSelectedSnippetId(null)}
                isMobile={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
