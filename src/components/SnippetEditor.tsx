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

// Define languages from schema
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
  }, [language]); // Only reinitialize on language change

  // Sync snippet props with state
  useEffect(() => {
    setTitle(snippet.title);
    setLanguage(snippet.language);
    if (snippet.content !== content && viewRef.current) {
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

  const handleSave = () => {
    onSave({
      ...snippet,
      title,
      content,
      language,
      tags: snippet.tags,
      folder_ids: snippet.folder_ids,
      isFavorite: snippet.isFavorite,
    });
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
          onClick={onCancel}
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
            <option key={lang} value={lang.toLowerCase()}>
              {lang}
            </option>
          ))}
        </select>

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
          >
            Save
          </Button>
          <Button
            onClick={onCancel}
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
