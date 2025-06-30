import type React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  isValid?: boolean
  title: string
  description?: string
  children: React.ReactNode
  isLoading?: boolean
  cancelButtonText?: string
  saveButtonText?: string
}

export default function EditModal({
  isOpen,
  onClose,
  onSave,
  isValid = true,
  title,
  description,
  children,
  isLoading = false,
  cancelButtonText = "Cancelar",
  saveButtonText = "Guardar",
}: EditModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`bg-zinc-800 border-zinc-700 text-white max-w-2xl`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription className="text-zinc-400">{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
            disabled={isLoading}
          >
            {cancelButtonText}
          </Button>
          <Button onClick={onSave} type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={isLoading || !isValid}>
            {saveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
