import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef } from "react";

type Snippet = {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  isFavorite: boolean;
};

type SnippetCardProps = {
  snippet: Snippet;
  isSelected: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
  onDelete: (snippetId: string) => void;
};

export default function SnippetCard({
  snippet,
  isSelected,
  onClick,
  onToggleFavorite,
  onDelete,
}: SnippetCardProps) {
  const [localFavorite, setLocalFavorite] = useState(snippet.isFavorite);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  console.log(
    `Rendering SnippetCard for ${snippet.id}. isFavorite: ${snippet.isFavorite}, localFavorite: ${localFavorite}, Selected: ${isSelected}`
  );

  useEffect(() => {
    setLocalFavorite(snippet.isFavorite);
  }, [snippet.isFavorite]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onClick();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onDelete(snippet.id);
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer border-2 ${
        isSelected
          ? "border-blue-500 bg-card" // Changed to blue border
          : "border-transparent bg-card hover:bg-zinc-100 dark:hover:bg-zinc-700"
      }`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold truncate">{snippet.title}</h3>
        <div className="flex items-center gap-2 relative">
          <span
            className={`cursor-pointer text-xl ${
              localFavorite ? "text-yellow-400" : "text-gray-400"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setLocalFavorite(!localFavorite);
              onToggleFavorite();
            }}
          >
            {localFavorite ? "★" : "☆"}
          </span>
          <div ref={menuRef}>
            <FontAwesomeIcon
              icon={faEllipsisV}
              className="text-muted-foreground cursor-pointer"
              onClick={handleMenuToggle}
            />
            {isMenuOpen && (
              <div className="absolute right-0 top-6 bg-background border border-muted rounded shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  onClick={handleEdit}
                >
                  Edit
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-1">
        <span className="text-sm px-2 py-1 rounded dark:text-white font-bold">
          {snippet.language}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {snippet.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="text-sm text-blue-500 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
        {snippet.tags.length > 3 && (
          <span className="text-sm text-muted-foreground">
            +{snippet.tags.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}
