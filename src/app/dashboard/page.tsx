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

// Define Snippet type for UI
type Snippet = {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  folder_ids: string[];
  isFavorite: boolean;
};

// Supabase snippets table type
type SnippetTable = {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[] | null;
  is_favorite: boolean;
  owner: string;
};

// Supabase snippet_folders table type
type SnippetFolder = {
  snippet_id: string;
  folder_id: string;
};

type Folder = {
  id: string;
  name: string;
};

type FolderWithCount = Folder & {
  snippetCount: number;
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
  const [folders, setFolders] = useState<FolderWithCount[]>([]);
  const [selectedView, setSelectedView] = useState<ViewType>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const validLanguages = [
    "Bash",
    "C",
    "CPP",
    "CSS",
    "Go",
    "HTML",
    "Java",
    "JavaScript",
    "Python",
    "Ruby",
    "Rust",
    "SQL",
    "TypeScript",
  ];

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) {
          setError("Failed to authenticate");
          toast.error("Session error. Please sign out and sign in again.");
          setLoading(false);
          return;
        }

        if (!session) {
          router.push("/auth/sign-in");
          return;
        }

        const userId = session.user.id;
        const isGuest = session.user.email === "guest@example.com";
        const avatar_url = session.user.user_metadata?.avatar_url || null;

        // Check if user exists
        let { data: existingUser, error: userError } = await supabase
          .from("users")
          .select("id, username")
          .eq("id", userId)
          .single();

        if (userError && userError.code !== "PGRST116") {
          setError("Failed to fetch user data");
          toast.error("Failed to fetch user data");
          setLoading(false);
          return;
        }

        let username: string;
        if (!existingUser) {
          // Fallback username from email or userId
          let baseUsername =
            session.user.user_metadata?.preferred_username ||
            session.user.email?.split("@")[0] ||
            `user_${userId.slice(0, 8)}`;

          // Ensure username is >= 3 characters
          if (baseUsername.length < 3) {
            baseUsername = `${baseUsername}_snip`;
          }

          // Handle username conflicts
          let suffix = 0;
          let uniqueUsername = baseUsername;
          if (!isGuest) {
            while (true) {
              const { data: usernameCheck, error: checkError } = await supabase
                .from("users")
                .select("id")
                .eq("username", uniqueUsername)
                .maybeSingle();
              if (checkError) {
                setError("Failed to validate username");
                toast.error("Failed to validate username");
                setLoading(false);
                return;
              }
              if (!usernameCheck) break;
              suffix++;
              uniqueUsername = `${baseUsername}_${suffix}`;
              if (uniqueUsername.length < 3) {
                uniqueUsername = `${uniqueUsername}_snip`;
              }
            }
          } else {
            uniqueUsername = "Guest";
          }

          const insertPayload = {
            id: userId,
            username: uniqueUsername,
            created_at: new Date().toISOString(),
          };

          const { error: insertUserError } = await supabase
            .from("users")
            .insert(insertPayload);
          if (insertUserError) {
            setError("Failed to sync user");
            toast.error("Failed to sync user");
            setLoading(false);
            return;
          }
          username = uniqueUsername;
        } else {
          // Normalize username for guest
          username = isGuest ? "Guest" : existingUser.username;
        }

        setUser({ id: userId, username, avatar_url });

        const { data: folderData, error: folderError } = await supabase
          .from("folders")
          .select("id, name")
          .eq("owner", userId);

        if (folderError) {
          toast.error("Failed to fetch folders");
          setFolders([]);
        } else {
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
        }

        const { data: snippetData, error: snippetError } = await supabase
          .from("snippets")
          .select("id, title, content, language, tags, is_favorite, owner")
          .eq("owner", userId);

        if (snippetError) {
          setError("Failed to load snippets");
          toast.error("Failed to load snippets");
          setLoading(false);
          return;
        }

        const { data: snippetFoldersData, error: snippetFoldersError } =
          await supabase
            .from("snippet_folders")
            .select("snippet_id, folder_id")
            .in(
              "snippet_id",
              (snippetData as SnippetTable[]).map((snippet) => snippet.id)
            );

        if (snippetFoldersError) {
          setSnippets(
            (snippetData as SnippetTable[]).map((snippet) => ({
              id: snippet.id,
              title: snippet.title,
              content: snippet.content,
              language: snippet.language || "",
              tags: snippet.tags || [],
              folder_ids: [],
              isFavorite: snippet.is_favorite,
            }))
          );
        } else {
          const formattedSnippets = (snippetData as SnippetTable[]).map(
            (snippet) => ({
              id: snippet.id,
              title: snippet.title,
              content: snippet.content,
              language: snippet.language || "",
              tags: snippet.tags || [],
              folder_ids: (snippetFoldersData as SnippetFolder[])
                .filter((sf) => sf.snippet_id === snippet.id)
                .map((sf) => sf.folder_id),
              isFavorite: snippet.is_favorite,
            })
          );
          setSnippets(formattedSnippets);
          setFilteredSnippets(formattedSnippets);
        }
      } catch (err) {
        setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, [router]);

  useEffect(() => {
    const subscription = supabase
      .channel("snippets")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "snippets" },
        (payload) => {
          setSnippets((prev) =>
            prev.map((s) =>
              s.id === (payload.new as SnippetTable).id
                ? {
                    ...s,
                    isFavorite: (payload.new as SnippetTable).is_favorite,
                  }
                : s
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "snippets" },
        (payload) => {
          const newSnippet = {
            id: (payload.new as SnippetTable).id,
            title: (payload.new as SnippetTable).title,
            content: (payload.new as SnippetTable).content,
            language: (payload.new as SnippetTable).language || "",
            tags: (payload.new as SnippetTable).tags || [],
            folder_ids: [],
            isFavorite: (payload.new as SnippetTable).is_favorite,
          };
          setSnippets((prev) => [...prev, newSnippet]);
          setFilteredSnippets((prev) => [...prev, newSnippet]);
        }
      )
      .subscribe();

    const folderSubscription = supabase
      .channel("snippet_folders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "snippet_folders" },
        (payload) => {
          setSnippets((prev) =>
            prev.map((s) =>
              s.id === (payload.new as SnippetFolder).snippet_id
                ? {
                    ...s,
                    folder_ids: [
                      ...s.folder_ids,
                      (payload.new as SnippetFolder).folder_id,
                    ],
                  }
                : s
            )
          );
          setFolders((prev) =>
            prev.map((f) =>
              f.id === (payload.new as SnippetFolder).folder_id
                ? { ...f, snippetCount: f.snippetCount + 1 }
                : f
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(folderSubscription);
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

  const foldersForSnippetCard = useMemo(
    () => folders.map(({ id, name }) => ({ id, name })),
    [folders]
  );

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

  const handleEditorSave = async (updatedSnippet: Snippet) => {
    if (!user) {
      toast.error("User not authenticated!");
      return;
    }

    if (!updatedSnippet.title.trim()) {
      toast.error("Snippet title is required!");
      return;
    }
    if (!updatedSnippet.content.trim()) {
      toast.error("Snippet content is required!");
      return;
    }
    if (!updatedSnippet.language) {
      toast.error("Snippet language is required!");
      return;
    }
    if (!validLanguages.includes(updatedSnippet.language)) {
      toast.error(`Invalid language: ${updatedSnippet.language}`);
      return;
    }

    try {
      if (updatedSnippet.id === "") {
        const { data, error } = await supabase
          .from("snippets")
          .insert({
            title: updatedSnippet.title,
            content: updatedSnippet.content,
            language: updatedSnippet.language,
            tags: updatedSnippet.tags,
            is_favorite: updatedSnippet.isFavorite,
            owner: user.id,
          })
          .select()
          .single();

        if (error) {
          throw new Error(error.message || "Failed to save snippet");
        }

        if (!data) {
          throw new Error("No data returned from snippet creation");
        }

        const newSnippet: Snippet = {
          id: data.id,
          title: data.title,
          content: data.content,
          language: data.language || "",
          tags: data.tags || [],
          folder_ids: [],
          isFavorite: data.is_favorite || false,
        };

        if (selectedFolderId) {
          const { error: folderError } = await supabase
            .from("snippet_folders")
            .insert({
              snippet_id: data.id,
              folder_id: selectedFolderId,
            });

          if (folderError) {
            throw new Error(folderError.message || "Failed to assign folder");
          }
          newSnippet.folder_ids = [selectedFolderId];
        }

        setSnippets((prev) => [...prev, newSnippet]);
        setFilteredSnippets((prev) => [...prev, newSnippet]);
        if (selectedFolderId) {
          setFolders((prev) =>
            prev.map((f) =>
              f.id === selectedFolderId
                ? { ...f, snippetCount: f.snippetCount + 1 }
                : f
            )
          );
        }

        toast.success("Snippet created successfully!");
      } else {
        const { error } = await supabase
          .from("snippets")
          .update({
            title: updatedSnippet.title,
            content: updatedSnippet.content,
            language: updatedSnippet.language,
            tags: updatedSnippet.tags,
          })
          .eq("id", updatedSnippet.id)
          .eq("owner", user.id);

        if (error) {
          throw new Error(error.message || "Failed to update snippet");
        }

        setSnippets((prev) =>
          prev.map((s) => (s.id === updatedSnippet.id ? updatedSnippet : s))
        );
        toast.success("Snippet updated successfully!");
      }

      setSelectedSnippetId(null);
    } catch (error) {
      toast.error(
        `Failed to save snippet: ${(error as Error).message || "Unknown error"}`
      );
    }
  };

  const handleEditorCancel = () => {
    setSelectedSnippetId(null);
  };

  const handleToggleFavorite = async (snippetId: string) => {
    const snippet = snippets.find((s) => s.id === snippetId);
    if (!snippet) return;

    const newFavoriteStatus = !snippet.isFavorite;
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
          : "Snippet removed from favorites!"
      );
    } catch (error) {
      setSnippets((prev) =>
        prev.map((s) =>
          s.id === snippetId ? { ...s, isFavorite: !newFavoriteStatus } : s
        )
      );
      toast.error("Failed to update favorite status!");
    }
  };

  const handleDelete = async (snippetId: string) => {
    try {
      const { error: snippetError } = await supabase
        .from("snippets")
        .delete()
        .eq("id", snippetId)
        .eq("owner", user?.id);
      if (snippetError) {
        throw new Error(snippetError.message || "Failed to delete snippet");
      }
      const { error: folderError } = await supabase
        .from("snippet_folders")
        .delete()
        .eq("snippet_id", snippetId);
      if (folderError) {
        throw new Error(
          folderError.message || "Failed to delete snippet folder"
        );
      }
      setSnippets((prev) => prev.filter((s) => s.id !== snippetId));
      if (selectedSnippetId === snippetId) {
        setSelectedSnippetId(null);
      }
      toast.success("Snippet deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete snippet!");
    }
  };

  const handleMoveToFolder = async (
    snippetId: string,
    folderId: string | null,
    updateSidebarFolders?: (folders: FolderWithCount[]) => void
  ) => {
    const snippet = snippets.find((s) => s.id === snippetId);
    if (!snippet) {
      toast.error("Snippet not found!");
      return;
    }
    const oldFolderId = snippet.folder_ids[0] || null;

    try {
      const { data: existingFolder, error: checkError } = await supabase
        .from("snippet_folders")
        .select("folder_id")
        .eq("snippet_id", snippetId)
        .maybeSingle();
      if (checkError) {
        throw new Error("Failed to check folder");
      }
      if (existingFolder && existingFolder.folder_id === folderId) {
        toast.info("Snippet is already in this folder!");
        return;
      }

      const { error: deleteError } = await supabase
        .from("snippet_folders")
        .delete()
        .eq("snippet_id", snippetId);
      if (deleteError) {
        throw new Error("Failed to delete snippet");
      }

      if (folderId) {
        const { error: insertError } = await supabase
          .from("snippet_folders")
          .insert({ snippet_id: snippetId, folder_id: folderId });
        if (insertError) {
          throw new Error("Failed to insert snippet folder");
        }
      }

      setSnippets((prev) =>
        prev.map((s) =>
          s.id === snippetId
            ? { ...s, folder_ids: folderId ? [folderId] : [] }
            : s
        )
      );
      setFolders((prev) => {
        const newFolders = prev.map((f) =>
          f.id === oldFolderId && oldFolderId !== folderId
            ? { ...f, snippetCount: Math.max(0, f.snippetCount - 1) }
            : f.id === folderId && folderId
            ? { ...f, snippetCount: f.snippetCount + 1 }
            : f
        );
        return newFolders;
      });

      if (updateSidebarFolders) {
        updateSidebarFolders(
          folders.map((f) =>
            f.id === oldFolderId && oldFolderId !== folderId
              ? { ...f, snippetCount: Math.max(0, f.snippetCount - 1) }
              : f.id === folderId && folderId
              ? { ...f, snippetCount: f.snippetCount + 1 }
              : f
          )
        );
      }

      toast.success(
        folderId ? "Snippet moved to folder!" : "Snippet removed from folder!"
      );
    } catch (error) {
      toast.error(
        `Failed to move snippet: ${(error as Error).message || "Unknown error"}`
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
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
          setFolders={setFolders}
          folders={folders}
        />
        <div className="flex-1 flex flex-col md:flex-row pt-4 px-4 md:pt-4 md:px-8 gap-2">
          <div
            className={
              isMobile && selectedSnippetId
                ? "hidden"
                : "w-full md:w-80 flex flex-col gap-2"
            }
            {...(isMobile && selectedSnippetId ? { inert: true } : {})}
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
                className="bg-primary text-primary-foreground hover:bg-blue-700 cursor-pointer"
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
                    key={snippet.id}
                    snippet={snippet}
                    isSelected={selectedSnippetId === snippet.id}
                    onClick={() => handleSnippetClick(snippet.id)}
                    onToggleFavorite={() => handleToggleFavorite(snippet.id)}
                    onDelete={handleDelete}
                    onMoveToFolder={(snippetId, folderId) => {
                      handleMoveToFolder(snippetId, folderId, setFolders);
                    }}
                    folders={foldersForSnippetCard}
                  />
                ))
              ) : (
                <p className="text-muted-foreground">
                  {selectedView === "all"
                    ? "No snippets found. Create one to get started!"
                    : selectedView === "folder"
                    ? "No snippets in this folder."
                    : selectedView === "favorites"
                    ? "No favorites yet."
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
                isMobile={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
