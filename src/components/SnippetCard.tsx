"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  onMoveToFolder: (snippetId: string, folderId: string | null) => void;
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
    setIsDeleteDialogOpen(false);
  };

  const handleMoveToFolder = (e: React.MouseEvent, folderId: string | null) => {
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
          <FontAwesomeIcon
            icon={localFavorite ? faStarSolid : faStarRegular}
            className={`cursor-pointer text-xl ${
              localFavorite ? "text-yellow-400" : "text-gray-400"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setLocalFavorite(!localFavorite);
              onToggleFavorite();
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-6 h-6 rounded-full p-0 text-muted-foreground hover:cursor-pointer hover:bg-transparent forced-no-hover-bg"
                style={{ backgroundColor: "transparent" }}
                onClick={(e) => e.stopPropagation()}
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" aria-hidden={undefined}>
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
                <DropdownMenuSubContent className="max-h-48 overflow-y-auto">
                  <DropdownMenuItem
                    onClick={(e) => handleMoveToFolder(e, null)}
                    className="hover:cursor-pointer"
                  >
                    Remove from Folder
                  </DropdownMenuItem>
                  {folders.length > 0 ? (
                    folders.map((folder) => (
                      <DropdownMenuItem
                        key={folder.id}
                        onClick={(e) => handleMoveToFolder(e, folder.id)}
                        className={`hover:cursor-pointer ${
                          snippet.folder_ids.includes(folder.id)
                            ? "font-bold"
                            : ""
                        }`}
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
              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-500 hover:cursor-pointer"
                  >
                    Delete
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Snippet</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete &quot;{snippet.title}
                      &quot;? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
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
