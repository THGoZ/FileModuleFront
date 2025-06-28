import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

interface BulkActionsProps {
  selectedCount: number
  onBulkDelete: () => void
  onClearSelection: () => void
  customActions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: "default" | "destructive" | "outline"
  }>
}

export default function BulkActions({
  selectedCount,
  onBulkDelete,
  onClearSelection,
  customActions = [],
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <Card className="bg-red-900/20 border-red-800/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-white">
            {selectedCount} item{selectedCount !== 1 ? "s" : ""} seleccionado{selectedCount !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            {customActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={action.onClick}
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Borrar seleccionados
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            >
              Limpiar selección
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
