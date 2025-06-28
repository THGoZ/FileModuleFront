import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch?: () => void;
  searchPlaceholder?: string;
}

export default function SearchBar({
  searchTerm,
  searchPlaceholder = "Buscar...",
  onSearchChange,
  onClearSearch,
}: SearchBarProps) {


  const handleClear = () => {
    onSearchChange("");
    if (onClearSearch) {
      onClearSearch();
    }
  };

  return (
    <div className="flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-red-500" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-zinc-700/50 border-zinc-600 text-white placeholder:text-zinc-400 rounded-none
          focus:ring-red-500"
        />
        <Button
          onClick={handleClear}
          className={`absolute right-0 top-0 text-zinc-400 hover:text-white hover:bg-zinc-500/80
          ${
            searchTerm.trim() === "" ? "opacity-0" : "opacity-100"
          } transition-all duration-200`}
          variant={"ghost"}
          size={"icon"}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
