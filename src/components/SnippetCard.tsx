import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

type Snippet = {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  isFavorite: boolean; // Added this line
};

type SnippetCardProps = {
  snippet: Snippet;
  isSelected: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
};

export default function SnippetCard({
  snippet,
  isSelected,
  onClick,
  onToggleFavorite,
}: SnippetCardProps) {
  const [localFavorite, setLocalFavorite] = useState(snippet.isFavorite);
  console.log(
    `Rendering SnippetCard for ${snippet.id}. isFavorite: ${snippet.isFavorite}, localFavorite: ${localFavorite}, Selected: ${isSelected}`
  );

  useEffect(() => {
    setLocalFavorite(snippet.isFavorite);
  }, [snippet.isFavorite]);

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer ${
        isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-card hover:bg-zinc-100 dark:hover:bg-zinc-700"
      }`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold truncate">{snippet.title}</h3>
        <div className="flex items-center gap-2">
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
          <FontAwesomeIcon
            icon={faEllipsisV}
            className="text-muted-foreground"
          />
        </div>
      </div>
      <div className="mt-1">
        <span className="text-sm px-2 py-1 rounded text-white font-bold">
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
