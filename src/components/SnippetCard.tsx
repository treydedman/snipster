import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Folder = {
  id: string;
  name: string;
};

type Snippet = {
  id: string;
  title: string;
  content: string;
  language: string;
  tags: string[];
  isFavorite: boolean;
  folder_ids: string[];
};

type SnippetCardProps = {
  snippet: Snippet;
  isSelected: boolean;
  onClick: () => void;
  onToggleFavorite: () => void;
  onDelete: (snippetId: string) => void;
  onMoveToFolder: (snippetId: string, folderId: string) => void;
  folders: Folder[];
};

export default function SnippetCard({
  snippet,
  isSelected,
  onClick,
  onToggleFavorite,
  onDelete,
  onMoveToFolder,
  folders,
}: SnippetCardProps) {
  const [localFavorite, setLocalFavorite] = useState(snippet.isFavorite);

  console.log(
    `Rendering SnippetCard for ${snippet.id}. isFavorite: ${snippet.isFavorite}, localFavorite: ${localFavorite}, Selected: ${isSelected}`
  );

  useEffect(() => {
    setLocalFavorite(snippet.isFavorite);
  }, [snippet.isFavorite]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(snippet.id);
  };

  const handleMoveToFolder = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    onMoveToFolder(snippet.id, folderId);
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer border-2 ${
        isSelected
          ? "border-blue-500 bg-card"
          : "border-transparent bg-card hover:bg-zinc-100 dark:hover:bg-zinc-700"
      }`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold truncate">{snippet.title}</h3>
        <div className="flex items-center gap-3">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-6 h-6 rounded-full p-0 text-muted-foreground hover:cursor-pointer hover:bg-transparent forced-no-hover-bg" // Added specific class
                style={{ backgroundColor: "transparent" }} // Inline fallback
                onClick={(e) => e.stopPropagation()}
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuItem
                onClick={handleEdit}
                className="hover:cursor-pointer"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="hover:cursor-pointer">
                  Move to Folder
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {folders.length > 0 ? (
                    folders.map((folder) => (
                      <DropdownMenuItem
                        key={folder.id}
                        onClick={(e) => handleMoveToFolder(e, folder.id)}
                        className="hover:cursor-pointer"
                      >
                        {folder.name}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      No folders available
                    </DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-500 hover:cursor-pointer"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
