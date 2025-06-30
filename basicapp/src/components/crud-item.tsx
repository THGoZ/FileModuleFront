import type React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

interface CrudItemProps {
  id: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  children: React.ReactNode;
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
  }>;
  statusBadge?: React.ReactNode;
}

export default function CrudItem({
  id,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onViewDetails,
  children,
  customActions = [],
  statusBadge,
}: CrudItemProps) {
  return (
    <Card
      className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800/70 transition-colors py-1 gap-1"
      onClick={onViewDetails}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={() => {
                onSelect(id);
              }}
              className="border-zinc-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
            />
            {statusBadge}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
              align="end"
            >
              <DropdownMenuItem
                onClick={(e) => {onEdit(); e.stopPropagation();}}
                className="hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {customActions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={(e) => {action.onClick(); e.stopPropagation();}}
                  className={`hover:bg-zinc-700 focus:bg-zinc-700 cursor-pointer ${
                    action.variant === "destructive"
                      ? "text-red-400 hover:text-white focus:text-white"
                      : ""
                  }`}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={(e) => {onDelete(); e.stopPropagation();}}
                className="hover:bg-red-600 focus:bg-red-600 cursor-pointer text-red-400 hover:text-white focus:text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Borrar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">{children}</CardContent>
    </Card>
  );
}
