import { SortDesc } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export type SortDirection = "ASC" | "DESC";

export interface SortOption {
  key: string;
  label: string;
  direction: SortDirection;
}

export interface SortSelectInputProps {
  sortOptions: SortOption[];
  selectedOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

export default function SortSelectInput({
  sortOptions,
  selectedOption,
  onSortChange,
}: SortSelectInputProps) {
  const setSortBy = (value: string) => {
    const option = sortOptions.find((option) => option.key === value);
    if (option) {
      onSortChange(option);
    }
  };

  const handleSortDirection = () => {
    const newDirection: SortOption = {
      ...selectedOption,
      direction: selectedOption.direction === "ASC" ? "DESC" : "ASC",
    };

    onSortChange(newDirection);
  };

  return (
    <div className="flex items-center">
      <Select
        value={selectedOption.key}
        onValueChange={(value) => setSortBy(value)}
      >
        <SelectTrigger className="w-[180px] bg-zinc-700/50 border border-zinc-600 rounded-none px-3 py-2 text-white text-sm focus:border-zinc-500 cursor-pointer">
          <SelectValue placeholder="Selecciona un criterio de orden" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-none">
          {sortOptions.map((option) => (
            <SelectItem
              className="hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer rounded-none"
              value={option.key}
              key={option.key}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        className="p-2 text-red-500 hover:text-red-400 rounded-none hover:bg-zinc-700/50 hover:border-zinc-700/50 transition-colors"
        onClick={handleSortDirection}
      >
        <div
          className={`transition-transform ${
            selectedOption.direction === "ASC" ? "rotate-180" : ""
          } ease-in-out duration-200`}
        >
          <SortDesc className="h-8 w-8" />
        </div>
      </Button>
    </div>
  );
}
