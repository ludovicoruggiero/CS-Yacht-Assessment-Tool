"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit, Plus, Save, Check, Search, X } from "lucide-react"
import type { Material } from "@/lib/materials-database-supabase"

interface ValidationMaterial {
  originalText: string
  material: Material | null
}

interface MaterialEditorDialogProps {
  material: ValidationMaterial
  globalIndex: number
  availableMaterials: Material[]
  isLoadingMaterials: boolean
  onMaterialSelection: (index: number, material: Material) => void
  onAddMaterial: (index: number) => void
}

export function MaterialEditorDialog({
  material,
  globalIndex,
  availableMaterials,
  isLoadingMaterials,
  onMaterialSelection,
  onAddMaterial,
}: MaterialEditorDialogProps) {
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [temporarySelectedMaterial, setTemporarySelectedMaterial] = useState<Material | null>(null)

  // Reset temporary selection when dialog opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setTemporarySelectedMaterial(material.material) // Start with current material
      setSearchTerm("") // Reset search
    } else {
      setTemporarySelectedMaterial(null) // Reset when closing
      setSearchTerm("")
    }
  }

  const handleSave = () => {
    if (temporarySelectedMaterial) {
      onMaterialSelection(globalIndex, temporarySelectedMaterial)
    }
    setIsOpen(false)
    setTemporarySelectedMaterial(null)
  }

  const handleCancel = () => {
    setIsOpen(false)
    setTemporarySelectedMaterial(null)
  }

  // Filter materials based on search and category
  const getFilteredMaterials = () => {
    let filtered = availableMaterials

    // Filter by category
    if (selectedMaterialCategory !== "all") {
      filtered = filtered.filter((m) => m.category === selectedMaterialCategory)
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.category.toLowerCase().includes(term) ||
          m.aliases.some((alias) => alias.toLowerCase().includes(term)),
      )
    }

    return filtered
  }

  const filteredMaterials = getFilteredMaterials()

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Modifica Materiale</DialogTitle>
          <DialogDescription>
            Seleziona un materiale dalla lista e clicca Salva per applicare le modifiche
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Panel - Current Material Info */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Testo originale:</Label>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md border mt-1">{material.originalText}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Materiale attuale:</Label>
                <div className="mt-1 p-3 bg-blue-50 rounded-md border border-blue-200">
                  {material.material ? (
                    <div>
                      <div className="font-medium text-blue-700">{material.material.name}</div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {material.material.category}
                      </Badge>
                      <div className="text-xs text-blue-600 mt-1">{material.material.gwpFactor} kg CO₂eq/kg</div>
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">Nessun materiale assegnato</span>
                  )}
                </div>
              </div>

              {/* Temporary selection preview */}
              {temporarySelectedMaterial && temporarySelectedMaterial !== material.material && (
                <div>
                  <Label className="text-sm font-medium">Nuovo materiale selezionato:</Label>
                  <div className="mt-1 p-3 bg-green-50 rounded-md border border-green-200">
                    <div className="font-medium text-green-700">{temporarySelectedMaterial.name}</div>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {temporarySelectedMaterial.category}
                    </Badge>
                    <div className="text-xs text-green-600 mt-1">{temporarySelectedMaterial.gwpFactor} kg CO₂eq/kg</div>
                  </div>
                </div>
              )}

              {/* Add new material button */}
              <div className="border-t pt-4">
                <Button variant="outline" onClick={() => onAddMaterial(globalIndex)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Nuovo Materiale
                </Button>
              </div>
            </div>

            {/* Right Panel - Material Selection */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="space-y-4 mb-4">
                {/* Search */}
                <div>
                  <Label className="text-sm font-medium">Cerca materiali:</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cerca per nome, categoria o alias..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <Label className="text-sm font-medium">Filtra per categoria:</Label>
                  <Select value={selectedMaterialCategory} onValueChange={setSelectedMaterialCategory}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Tutte le categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le categorie</SelectItem>
                      {Array.from(new Set(availableMaterials.map((m) => m.category))).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Results count */}
                <div className="text-sm text-gray-600">
                  {filteredMaterials.length} materiali trovati
                  {searchTerm && ` per "${searchTerm}"`}
                  {selectedMaterialCategory !== "all" && ` in ${selectedMaterialCategory}`}
                </div>
              </div>

              {/* Materials List */}
              <div className="flex-1 min-h-0">
                <Label className="text-sm font-medium">Materiali disponibili:</Label>
                <div className="mt-1 border rounded-md h-96 overflow-y-auto">
                  {isLoadingMaterials ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Caricamento materiali...</span>
                    </div>
                  ) : filteredMaterials.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>Nessun materiale trovato</p>
                        {searchTerm && <p className="text-sm">Prova a modificare i criteri di ricerca</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filteredMaterials.map((dbMaterial) => {
                        const isSelected = temporarySelectedMaterial?.id === dbMaterial.id
                        const isCurrent = material.material?.id === dbMaterial.id

                        return (
                          <Button
                            key={dbMaterial.id}
                            variant={isSelected ? "default" : "ghost"}
                            className={`w-full justify-start text-left h-auto p-3 ${
                              isCurrent ? "bg-blue-50 border border-blue-200" : ""
                            }`}
                            onClick={() => setTemporarySelectedMaterial(dbMaterial)}
                          >
                            <div className="flex items-start w-full">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium truncate">{dbMaterial.name}</span>
                                  {isCurrent && (
                                    <Badge variant="outline" className="text-xs">
                                      attuale
                                    </Badge>
                                  )}
                                  {isSelected && <Check className="h-4 w-4 text-white flex-shrink-0" />}
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {dbMaterial.category}
                                  </Badge>
                                  <span className="text-xs text-gray-600">{dbMaterial.gwpFactor} kg CO₂eq/kg</span>
                                </div>
                                {dbMaterial.aliases.length > 0 && (
                                  <div className="text-xs text-gray-500 truncate">
                                    Alias: {dbMaterial.aliases.slice(0, 3).join(", ")}
                                    {dbMaterial.aliases.length > 3 && "..."}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={!temporarySelectedMaterial || temporarySelectedMaterial === material.material}
          >
            <Save className="h-4 w-4 mr-2" />
            Salva Modifiche
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
