import { Card, CardContent } from "@/components/ui/card";
import SearchBar from "./searchBar";
import SortSelectInput, { type SortOption } from "./sortSelectInput";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (value: string) => void;
  }>;
  sortOptions?: SortOption[];
  sortBy?: SortOption;
  onSortChange?: (value: SortOption) => void;
  onClearSearch?: () => void;
}

export default function SearchFilter({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  /* filters = [], */
  sortOptions = [],
  sortBy,
  onSortChange,
  onClearSearch,
}: SearchFilterProps) {
  return (
    <Card className="bg-zinc-800/50 border-zinc-700">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            searchTerm={searchTerm}
            searchPlaceholder={searchPlaceholder}
            onSearchChange={onSearchChange}
            onClearSearch={onClearSearch}
          />
          <div className="flex items-center gap-2">
{/*             <Filter className="h-4 w-4 text-zinc-400" />
            {filters.map((filter) => (
              <select
                key={filter.key}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="bg-zinc-700/50 border border-zinc-600 rounded-md px-3 py-2 text-white text-sm"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))} */}
            {sortOptions.length > 0 && onSortChange && sortBy && (
              <>
              <SortSelectInput
                sortOptions={sortOptions}
                selectedOption={sortBy}
                onSortChange={onSortChange}
              />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
