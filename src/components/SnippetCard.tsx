import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

type Snippet = {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
};

type SnippetCardProps = {
  snippet: Snippet;
  isSelected: boolean;
  onClick: () => void;
};

export default function SnippetCard({
  snippet,
  isSelected,
  onClick,
}: SnippetCardProps) {
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
        <FontAwesomeIcon icon={faEllipsisV} className="text-muted-foreground" />
      </div>
      <div className="mt-1">
        <span className="text-sm bg-muted px-2 py-1 rounded">
          {snippet.language}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {snippet.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded"
          >
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
