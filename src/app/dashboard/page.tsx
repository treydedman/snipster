"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Sidebar from "@/components/Sidebar"; // Import the Sidebar component

type Snippet = {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  folder_ids: string[];
};

type Folder = {
  id: string;
  name: string;
};

type ViewType = "all" | "folder" | "favorites" | "shared";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null
  );
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedView, setSelectedView] = useState<ViewType>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          setError("Failed to authenticate");
          setLoading(false);
          return;
        }

        if (!session) {
          router.push("/auth/sign-in");
          return;
        }

        const userId = session.user.id;
        console.log("Authenticated user ID:", userId);

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("username")
          .eq("id", userId)
          .single();

        if (userError) {
          console.error("Error fetching user:", userError);
          setUser({ id: userId, username: "User" });
        } else {
          setUser({ id: userId, username: userData.username || "User" });
        }

        const { data: folderData, error: folderError } = await supabase
          .from("folders")
          .select("id, name")
          .eq("owner", userId);

        if (folderError) {
          console.error("Error fetching folders:", folderError);
        } else {
          setFolders(folderData || []);
        }

        const { data: snippetData, error: snippetError } = await supabase
          .from("snippets")
          .select("id, title, content, language, tags")
          .eq("owner", userId);

        if (snippetError) {
          console.error(
            "Error fetching snippets:",
            JSON.stringify(snippetError, null, 2)
          );
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
          console.error("Error fetching snippet folders:", snippetFoldersError);
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
        }));
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

  // Handle view changes from Sidebar
  const handleViewChange = (view: ViewType, folderId: string | null = null) => {
    setSelectedView(view);
    setSelectedFolderId(folderId);
    if (view === "all") {
      setFilteredSnippets(snippets);
    } else if (view === "folder" && folderId) {
      setFilteredSnippets(
        snippets.filter((snippet) => snippet.folder_ids.includes(folderId))
      );
    } else if (view === "favorites") {
      setFilteredSnippets([]);
    } else if (view === "shared") {
      setFilteredSnippets([]);
    }
  };

  // Handle search from Sidebar
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar onViewChange={handleViewChange} onSearch={handleSearch} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Welcome, {user?.username || "Guest"}!
        </h1>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {selectedView === "all"
              ? "All Snippets"
              : selectedView === "folder"
              ? `Snippets in ${
                  folders.find((f) => f.id === selectedFolderId)?.name
                }`
              : selectedView === "favorites"
              ? "Favorites"
              : "Shared Snippets"}
          </h2>
          <Button className="bg-primary text-primary-foreground hover:bg-blue-700">
            New Snippet
          </Button>
        </div>
        {filteredSnippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {snippet.title}
                </h3>
                <SyntaxHighlighter
                  language={snippet.language}
                  style={dracula}
                  customStyle={{ padding: "1rem", borderRadius: "0.5rem" }}
                >
                  {snippet.content}
                </SyntaxHighlighter>
                <div className="mt-2 flex flex-wrap gap-2">
                  {snippet.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
  );
}
