"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import { toast } from "sonner";

type Snippet = {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  folder_ids: string[];
  isFavorite: boolean;
};

type SnippetEditorProps = {
  snippet: Snippet;
  onSave: (updatedSnippet: Snippet) => void;
  onCancel: () => void;
  isMobile?: boolean;
};

// Match Supabase language_type enum (capitalized)
const languages = [
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

export default function SnippetEditor({
  snippet,
  onSave,
  onCancel,
  isMobile,
}: SnippetEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [title, setTitle] = useState(snippet.title);
  const [content, setContent] = useState(snippet.content);
  const [language, setLanguage] = useState(snippet.language);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>(snippet.tags || []);
  const isMounted = useRef(false);

  // Initialize CodeMirror editor
  useEffect(() => {
    if (!editorRef.current || isMounted.current) return;

    // Map language to CodeMirror language mode
    const languageMode = () => {
      switch (language.toLowerCase()) {
        case "javascript":
        case "typescript":
          return javascript({
            typescript: language.toLowerCase() === "typescript",
          });
        case "python":
          return python();
        case "c":
        case "cpp":
          return cpp();
        case "css":
          return css();
        case "html":
          return html();
        case "java":
          return java();
        case "rust":
          return rust();
        case "sql":
          return sql();
        case "bash":
        case "go":
        case "ruby":
          return [];
        default:
          return [];
      }
    };

    // Detect theme
    const isDarkMode = document.documentElement.classList.contains("dark");

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        languageMode(),
        isDarkMode ? oneDark : [],
        keymap.of(defaultKeymap),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setContent(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    isMounted.current = true;

    return () => {
      view.destroy();
      viewRef.current = null;
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Sync snippet props with state
  useEffect(() => {
    setTitle(snippet.title);
    setLanguage(snippet.language);
    setTags(snippet.tags || []);
    setTagsInput("");
    if (viewRef.current) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: snippet.content,
        },
      });
      setContent(snippet.content);
    }
  }, [snippet]);

  const handleTagsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
  };

  const handleTagsSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      processTags();
    }
  };

  const processTags = () => {
    if (!tagsInput.trim()) return;

    const newTags = tagsInput
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag && /^[a-z0-9-]+$/.test(tag))
      .filter((tag) => !tags.includes(tag));

    if (newTags.length === 0) {
      if (tagsInput.trim()) {
        toast.error("Invalid tag format. Use letters, numbers, or hyphens.");
      }
      setTagsInput("");
      return;
    }

    if (tags.length + newTags.length > 10) {
      toast.error("Maximum 10 tags allowed.");
      setTagsInput("");
      return;
    }

    setTags([...tags, ...newTags]);
    setTagsInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = () => {
    // Process any remaining tags in input
    processTags();

    if (!title.trim()) {
      toast.error("Snippet title is required!");
      return;
    }
    if (!content.trim()) {
      toast.error("Snippet content is required!");
      return;
    }
    if (!language) {
      toast.error("Snippet language is required!");
      return;
    }

    onSave({
      ...snippet,
      title,
      content,
      language,
      tags,
      folder_ids: snippet.folder_ids,
      isFavorite: snippet.isFavorite,
    });
  };

  const handleCancel = () => {
    // Reset state to initial values
    setTitle(snippet.title);
    setContent(snippet.content);
    setLanguage(snippet.language);
    setTags(snippet.tags || []);
    setTagsInput("");
    // Clear CodeMirror content
    if (viewRef.current) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: snippet.content,
        },
      });
    }
    // Call parent onCancel to close editor
    onCancel();
  };

  return (
    <div
      className={`bg-card border border-muted shadow-lg p-4 rounded-lg ${
        isMobile ? "fixed inset-0 z-50 h-full w-full" : "flex-1 h-full"
      } flex flex-col`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Editor</h2>
      </div>

      {isMobile && (
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-foreground"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}

      {/* Editor Form */}
      <div className="flex flex-col gap-4 flex-1">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Snippet Title"
          className="p-2 rounded bg-muted text-foreground"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 rounded bg-muted text-foreground hover:bg-accent focus:ring-accent"
        >
          <option value="">Select Language</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        {/* Tags Input */}
        <div>
          <input
            type="text"
            value={tagsInput}
            onChange={handleTagsInput}
            onKeyDown={handleTagsSubmit}
            placeholder="Enter tags, separated by commas (ex: sql, query)"
            className="p-2 rounded bg-muted text-foreground w-full"
          />
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm text-blue-500 bg-muted px-2 py-1 rounded flex items-center"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <FontAwesomeIcon icon={faTimes} size="xs" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CodeMirror Editor */}
        <div
          ref={editorRef}
          className="flex-1 border border-muted rounded overflow-auto"
          style={{ minHeight: "200px" }}
        />

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-blue-700 cursor-pointer"
            disabled={!title.trim() || !content.trim() || !language}
          >
            Save
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
