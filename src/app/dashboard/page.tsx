"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
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
          console.error("Error fetching session:", sessionError.message);
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
          .select("id, name") // Fixed from "select("id, name")
          .eq("owner", userId);

        if (folderError) {
          console.error("Error fetching folders:", folderError.message);
        } else {
          setFolders(folderData || []);
        }

        const { data: snippetData, error: snippetError } = await supabase
          .from("snippets")
          .select("id, title, content, language, tags")
          .eq("owner", userId);

        if (snippetError) {
          console.error("Error fetching snippets:", snippetError.message);
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
          console.error(
            "Error fetching snippet folders:",
            snippetFoldersError.message
          );
        }

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
          isFavorite: false,
        }));
        console.log("Initial snippets:", formattedSnippets);
        setSnippets(formattedSnippets);
        setFilteredSnippets(formattedSnippets);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      console.log("Window width:", window.innerWidth, "isMobile:", mobile);
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log(
      "Re-filtering snippets. Selected view:",
      selectedView,
      "Snippets:",
      snippets,
      "SelectedSnippetId:",
      selectedSnippetId
    );
    if (selectedView === "favorites") {
      const filtered = snippets.filter((s) => s.isFavorite);
      setFilteredSnippets(filtered);
      console.log("Filtered snippets (favorites):", filtered);
    } else if (selectedView === "all") {
      setFilteredSnippets(snippets);
    } else if (selectedView === "folder" && selectedFolderId) {
      const filtered = snippets.filter((s) =>
        s.folder_ids.includes(selectedFolderId)
      );
      setFilteredSnippets(filtered);
      console.log("Filtered snippets (folder):", filtered);
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
    console.log(
      "View changed to:",
      view,
      "Folder ID:",
      folderId,
      "SelectedSnippetId before:",
      selectedSnippetId
    );
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
    console.log("SelectedSnippetId after:", selectedSnippetId);
  };

  const handleSearch = (query: string) => {
    if (!query) {
      handleViewChange(selectedView, selectedFolderId);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = snippets.filter(
      (snippet) =>
        snippet.title.toLowerCase().includes(lowerQuery) ||
        snippet.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        snippet.language.toLowerCase().includes(lowerQuery)
    );
    setFilteredSnippets(filtered);
    console.log("Search filtered snippets:", filtered);
  };

  const handleSnippetClick = (snippetId: string) => {
    console.log(
      "Selected snippet ID:",
      snippetId,
      "Current selectedSnippetId:",
      selectedSnippetId
    );
    setSelectedSnippetId(snippetId);
  };

  const handleEditorSave = (updatedSnippet: Snippet) => {
    console.log("Saving snippet:", updatedSnippet);
    setSnippets((prev) =>
      prev.map((s) => (s.id === updatedSnippet.id ? updatedSnippet : s))
    );
  };

  const handleEditorCancel = () => {
    console.log("Canceling editor");
    setSelectedSnippetId(null);
  };

  const handleToggleFavorite = (snippetId: string) => {
    setSnippets((prev) =>
      prev.map((s) =>
        s.id === snippetId ? { ...s, isFavorite: !s.isFavorite } : s
      )
    );
    console.log(
      `Toggled favorite for snippet ${snippetId}. Updated snippets:`,
      snippets.map((s) => ({ id: s.id, isFavorite: s.isFavorite }))
    );
  };

  const handleDelete = async (snippetId: string) => {
    console.log("Deleting snippet:", snippetId);
    try {
      // Delete snippet from Supabase
      const { error: snippetError } = await supabase
        .from("snippets")
        .delete()
        .eq("id", snippetId);
      if (snippetError) {
        console.error("Error deleting snippet:", snippetError.message);
        return;
      }

      // Delete associated snippet_folders entries
      const { error: folderError } = await supabase
        .from("snippet_folders")
        .delete()
        .eq("snippet_id", snippetId);
      if (folderError) {
        console.error("Error deleting snippet folders:", folderError.message);
        return;
      }

      // Update local state
      setSnippets((prev) => prev.filter((s) => s.id !== snippetId));
      if (selectedSnippetId === snippetId) {
        setSelectedSnippetId(null); // Close editor if deleting the open snippet
      }
    } catch (err) {
      console.error("Unexpected error deleting snippet:", err);
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
      {/* Navbar */}
      <Navbar user={user} onLogout={handleLogout} />
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar
          user={user}
          onViewChange={handleViewChange}
          onSearch={handleSearch}
          filteredSnippets={filteredSnippets}
          onSnippetClick={handleSnippetClick}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row pt-4 px-4 md:pt-4 md:px-8 gap-4">
          {/* Snippet Card Column - Always visible on desktop, hidden on mobile when editor is active */}
          <div
            className={
              isMobile && selectedSnippetId
                ? "hidden"
                : "w-full md:w-80 flex flex-col gap-4"
            }
          >
            {/* Title */}
            <h2 className="text-2xl font-bold mb-4">Snippets</h2>

            {/* Navigation Display and New Snippet Button */}
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

            {/* Divider */}
            <hr className="border-t border-muted my-2" />

            {/* Snippet Cards */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {filteredSnippets.length > 0 ? (
                filteredSnippets.map((snippet) => (
                  <SnippetCard
                    key={`${snippet.id}-${snippet.isFavorite}`} // Force re-render on favorite change
                    snippet={snippet}
                    isSelected={selectedSnippetId === snippet.id}
                    onClick={() => handleSnippetClick(snippet.id)}
                    onToggleFavorite={() => handleToggleFavorite(snippet.id)}
                    onDelete={handleDelete}
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
                    : "No shared snippets yet—check back later!"}
                </p>
              )}
            </div>
          </div>

          {/* Editor - Desktop (Always Visible, Side-by-Side) */}
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

          {/* Editor - Mobile (Modal) */}
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
