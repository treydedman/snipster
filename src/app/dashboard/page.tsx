"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";

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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null
  );
  const [folders, setFolders] = useState<Folder[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
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

        // Fetch user profile for username
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

        // Fetch folders
        const { data: folderData, error: folderError } = await supabase
          .from("folders")
          .select("id, name")
          .eq("owner", userId);

        if (folderError) {
          console.error("Error fetching folders:", folderError);
        } else {
          setFolders(folderData || []);
        }

        // Fetch snippets
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

        // Fetch folder associations
        const { data: snippetFoldersData, error: snippetFoldersError } =
          await supabase
            .from("snippet_folders")
            .select("snippet_id, folder_id")
            .in(
              "snippet_id",
              snippetData.map((snippet) => snippet.id)
            );

        if (snippetFoldersError) {
          console.error("Error fetching snippet folders:", snippetFoldersError);
        }

        const formattedSnippets = snippetData.map((snippet) => ({
          id: snippet.id,
          title: snippet.title,
          content: snippet.content,
          language: snippet.language.toLowerCase(),
          tags: snippet.tags,
          folder_ids: snippetFoldersData
            ? snippetFoldersData
                .filter((sf) => sf.snippet_id === snippet.id)
                .map((sf) => sf.folder_id)
            : [],
        }));
        setSnippets(formattedSnippets);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, [router]);

  const filteredSnippets = selectedFolder
    ? snippets.filter((snippet) => snippet.folder_ids.includes(selectedFolder))
    : snippets.filter((snippet) => snippet.folder_ids.length === 0);

  const desktopSnippetsCount = snippets.filter(
    (snippet) => snippet.folder_ids.length === 0
  ).length;

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
      <div className="w-64 bg-card p-4 border-r border-zinc-300 dark:border-zinc-600">
        <h2 className="text-xl font-semibold text-foreground mb-4">Folders</h2>
        <ul className="space-y-2">
          <li>
            <button
              className={`w-full text-left p-2 rounded ${
                selectedFolder === null
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
              onClick={() => setSelectedFolder(null)}
            >
              Desktop ({desktopSnippetsCount})
            </button>
          </li>
          {folders.map((folder) => {
            const folderSnippetCount = snippets.filter((snippet) =>
              snippet.folder_ids.includes(folder.id)
            ).length;
            return (
              <li key={folder.id}>
                <button
                  className={`w-full text-left p-2 rounded ${
                    selectedFolder === folder.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  {folder.name} ({folderSnippetCount})
                </button>
              </li>
            );
          })}
        </ul>
        <Button className="mt-4 w-full bg-primary text-primary-foreground hover:bg-blue-700">
          New Folder
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Welcome, {user?.username || "Guest"}!
        </h1>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {selectedFolder === null
              ? "Desktop Snippets"
              : `Snippets in ${
                  folders.find((f) => f.id === selectedFolder)?.name
                }`}
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
            {selectedFolder === null
              ? "No snippets on your desktop. Create one to get started!"
              : "No snippets in this folder."}
          </p>
        )}
      </div>
    </div>
  );
}
