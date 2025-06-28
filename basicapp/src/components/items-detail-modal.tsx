import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2 } from "lucide-react";

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary";
    disabled?: boolean;
  }>;
  badges?: Array<{
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }>;
  metadata?: Array<{
    label: string;
    value: string | React.ReactNode;
    icon?: React.ReactNode;
  }>;
  showDefaultActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export default function ItemDetailsModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  actions = [],
  badges = [],
  metadata = [],
  showDefaultActions = true,
  onEdit,
  onDelete,
  className = "",
}: ItemDetailsModalProps) {
  const defaultActions = [];

  if (showDefaultActions) {
    if (onEdit) {
      defaultActions.push({
        label: "Editar",
        icon: <Edit className="h-4 w-4" />,
        onClick: onEdit,
        variant: "outline" as const,
        disabled: false,
      });
    }
    if (onDelete) {
      defaultActions.push({
        label: "Borrar",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: onDelete,
        variant: "destructive" as const,
        disabled: false,
      });
    }
  }

  const allActions = [...actions, ...defaultActions];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`bg-zinc-800 border-zinc-700 text-white max-w-4xl max-h-[90vh] overflow-hidden ${className}`}
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold text-white pr-8">
                {title}
              </DialogTitle>
              {subtitle && (
                <DialogDescription className="text-zinc-400 mt-1">
                  {subtitle}
                </DialogDescription>
              )}
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.variant || "secondary"}
                  className={`${badge.className || ""}`}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Metadata */}
          {metadata.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pt-2">
              {metadata.map((item, index) => (
                <div key={index} className="items-center gap-2 text-sm">
                  <div className="flex items-center gap-1 mb-2">
                    {item.icon && (
                      <span className="text-zinc-400">{item.icon}</span>
                    )}
                    <span className="text-zinc-400">{item.label}:</span>
                  </div>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </DialogHeader>
        {/* Content */}
        {children && (
          <div className="overflow-y-auto max-h-[60vh] pr-2">{children}</div>
        )}
        {/* Actions */}
        {allActions.length > 0 && (
          <>
            <Separator className="bg-zinc-700" />
            <div className="flex flex-wrap gap-2 justify-center">
              {allActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={
                    action.variant === "destructive"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : action.variant === "outline"
                      ? "border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      : ""
                  }
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
