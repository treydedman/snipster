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
import { oneDark } from "@codemirror/theme-one-dark";

type SnippetEditorProps = {
  snippet: {
    id: string;
    title: string;
    content: string;
    language: string;
    tags: string[];
  };
  onSave: (updatedSnippet: any) => void;
  onCancel: () => void;
  onNewSnippet: () => void;
  isMobile?: boolean;
};

export default function SnippetEditor({
  snippet,
  onSave,
  onCancel,
  onNewSnippet,
  isMobile,
}: SnippetEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [title, setTitle] = useState(snippet.title);
  const [content, setContent] = useState(snippet.content);
  const [language, setLanguage] = useState(snippet.language);
  const isMounted = useRef(false); // Track if editor has been initialized

  useEffect(() => {
    if (!editorRef.current || isMounted.current) return;

    // Map language to CodeMirror language mode
    const languageMode = () => {
      switch (language.toLowerCase()) {
        case "javascript":
          return javascript();
        case "python":
          return python();
        default:
          return [];
      }
    };

    // Detect theme (assuming a CSS class on the root element)
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
  }, [language]); // Only reinitialize if language changes

  useEffect(() => {
    setTitle(snippet.title);
    setLanguage(snippet.language);
    if (snippet.content !== content) {
      setContent(snippet.content);
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: snippet.content,
          },
        });
      }
    }
  }, [snippet]);

  const handleSave = () => {
    onSave({ ...snippet, title, content, language });
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
        <Button
          onClick={onNewSnippet}
          className="bg-primary text-primary-foreground hover:bg-blue-700"
        >
          New Snippet
        </Button>
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
          className="p-2 rounded bg-muted text-foreground"
        >
          <option value="">Select Language</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
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
            className="bg-primary text-primary-foreground"
          >
            Save
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
