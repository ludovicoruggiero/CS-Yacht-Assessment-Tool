"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  Edit,
  Plus,
  Search,
  Save,
  X,
  Check,
  HelpCircle,
  Package,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ParsedDocument, ParsedMaterial } from "@/lib/document-parser"
import { MaterialsDatabase, type Material } from "@/lib/materials-database-supabase"
import { PCRCategorizer, type PCRCategory } from "@/lib/pcr-categories"

interface ValidationMaterial extends ParsedMaterial {
  isValidated: boolean
  userModified: boolean
  suggestedMaterials?: Material[]
}

interface ParsingValidationProps {
  parsedDocuments: ParsedDocument[]
  onValidationComplete: (validatedDocuments: ParsedDocument[]) => void
}

export default function ParsingValidation({ parsedDocuments, onValidationComplete }: ParsingValidationProps) {
  const [materialsDb] = useState(() => new MaterialsDatabase())
  const [pcrCategorizer] = useState(() => new PCRCategorizer())
  const [validationMaterials, setValidationMaterials] = useState<ValidationMaterial[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isAddMaterialDialogOpen, setIsAddMaterialDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    name: "",
    aliases: [],
    category: "",
    gwpFactor: 0,
    unit: "kg",
    description: "",
  })

  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([])
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false)

  const loadAvailableMaterials = async () => {
    setIsLoadingMaterials(true)
    try {
      const materials = await materialsDb.getAllMaterials()
      setAvailableMaterials(materials)
    } catch (error) {
      console.error("Errore nel caricamento materiali:", error)
    } finally {
      setIsLoadingMaterials(false)
    }
  }

  useEffect(() => {
    loadAvailableMaterials()
  }, [materialsDb])

  useEffect(() => {
    const initializeValidationMaterials = async () => {
      const allMaterials: ValidationMaterial[] = []

      for (const doc of parsedDocuments) {
        for (const material of doc.materials) {
          const suggestedMaterials =
            material.material === null ? await getSuggestedMaterials(material.originalText) : []

          const validationMaterial: ValidationMaterial = {
            ...material,
            isValidated: material.material !== null && material.confidence > 0.8,
            userModified: false,
            suggestedMaterials,
          }
          allMaterials.push(validationMaterial)
        }
      }

      setValidationMaterials(allMaterials)

      // Espandi tutte le categorie di default
      const categories = new Set<string>()
      allMaterials.forEach((material) => {
        if (material.pcrCategory) {
          categories.add(material.pcrCategory.id)
        }
      })
      setExpandedCategories(categories)
    }

    initializeValidationMaterials()
  }, [parsedDocuments])

  const getSuggestedMaterials = async (searchText: string): Promise<Material[]> => {
    const allMaterials = await materialsDb.getAllMaterials()
    const searchLower = searchText.toLowerCase()

    return allMaterials
      .filter((material) => {
        const nameMatch = material.name.toLowerCase().includes(searchLower)
        const aliasMatch = material.aliases.some(
          (alias) => alias.toLowerCase().includes(searchLower) || searchLower.includes(alias.toLowerCase()),
        )
        return nameMatch || aliasMatch
      })
      .slice(0, 5)
  }

  const handleMaterialSelection = (index: number, selectedMaterial: Material) => {
    setValidationMaterials((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        material: selectedMaterial,
        confidence: 1.0,
        isValidated: true,
        userModified: true,
      }
      return updated
    })
  }

  const handleCategorySelection = (index: number, selectedCategory: PCRCategory) => {
    setValidationMaterials((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        pcrCategory: selectedCategory,
        categoryConfidence: 1.0,
        userModified: true,
      }
      return updated
    })
  }

  const handleQuantityChange = (index: number, newQuantity: number) => {
    setValidationMaterials((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        quantity: newQuantity * 1000,
        userModified: true,
      }
      return updated
    })
  }

  const handleAddCustomMaterial = (index: number) => {
    if (!newMaterial.name || !newMaterial.category || !newMaterial.gwpFactor) {
      alert("Compila tutti i campi obbligatori")
      return
    }

    const customMaterial: Material = {
      id: `custom_${Date.now()}`,
      name: newMaterial.name!,
      aliases: newMaterial.aliases || [],
      category: newMaterial.category!,
      gwpFactor: newMaterial.gwpFactor!,
      unit: newMaterial.unit || "kg",
      description: newMaterial.description,
    }

    materialsDb.addMaterial(customMaterial)
    handleMaterialSelection(index, customMaterial)

    setNewMaterial({
      name: "",
      aliases: [],
      category: "",
      gwpFactor: 0,
      unit: "kg",
      description: "",
    })
    setIsAddMaterialDialogOpen(false)
    setEditingIndex(null)
  }

  const handleValidationToggle = (index: number) => {
    setValidationMaterials((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        isValidated: !updated[index].isValidated,
      }
      return updated
    })
  }

  const handleRemoveMaterial = (index: number) => {
    setValidationMaterials((prev) => prev.filter((_, i) => i !== index))
  }

  const handleComplete = () => {
    const validatedDocuments: ParsedDocument[] = parsedDocuments.map((doc) => ({
      ...doc,
      materials: [],
    }))

    let materialIndex = 0
    parsedDocuments.forEach((doc, docIndex) => {
      const docMaterials = validationMaterials.slice(materialIndex, materialIndex + doc.materials.length)
      validatedDocuments[docIndex].materials = docMaterials.map((vm) => ({
        originalText: vm.originalText,
        material: vm.material,
        quantity: vm.quantity,
        unit: vm.unit,
        confidence: vm.confidence,
        lineNumber: vm.lineNumber,
        context: vm.context,
        pcrCategory: vm.pcrCategory,
        categoryConfidence: vm.categoryConfidence,
      }))
      materialIndex += doc.materials.length
    })

    // Ricalcola i pesi totali e category breakdown
    validatedDocuments.forEach((doc) => {
      doc.totalWeight = doc.materials.reduce((sum, material) => sum + material.quantity, 0)

      // Ricalcola category breakdown
      const categoryBreakdown: { [categoryId: string]: any } = {}
      doc.materials.forEach((material) => {
        if (material.pcrCategory) {
          const categoryId = material.pcrCategory.id
          if (!categoryBreakdown[categoryId]) {
            categoryBreakdown[categoryId] = {
              category: material.pcrCategory,
              materials: [],
              totalWeight: 0,
            }
          }
          categoryBreakdown[categoryId].materials.push(material)
          categoryBreakdown[categoryId].totalWeight += material.quantity
        }
      })
      doc.categoryBreakdown = categoryBreakdown
    })

    onValidationComplete(validatedDocuments)
  }

  const getFilteredMaterials = () => {
    let filtered = validationMaterials

    if (searchTerm) {
      filtered = filtered.filter(
        (material) =>
          material.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.material?.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    switch (selectedFilter) {
      case "identified":
        return filtered.filter((m) => m.material !== null)
      case "unidentified":
        return filtered.filter((m) => m.material === null)
      case "uncategorized":
        return filtered.filter((m) => m.pcrCategory === null)
      case "low_confidence":
        return filtered.filter((m) => m.confidence < 0.8)
      case "user_modified":
        return filtered.filter((m) => m.userModified)
      default:
        return filtered
    }
  }

  const getStats = () => {
    const total = validationMaterials.length
    const identified = validationMaterials.filter((m) => m.material !== null).length
    const categorized = validationMaterials.filter((m) => m.pcrCategory !== null).length
    const validated = validationMaterials.filter((m) => m.isValidated).length
    const userModified = validationMaterials.filter((m) => m.userModified).length

    return { total, identified, categorized, validated, userModified }
  }

  const getMaterialsByCategory = () => {
    const filteredMaterials = getFilteredMaterials()
    const categories: { [categoryId: string]: { category: PCRCategory; materials: ValidationMaterial[] } } = {}
    const uncategorized: ValidationMaterial[] = []

    filteredMaterials.forEach((material) => {
      if (material.pcrCategory) {
        const categoryId = material.pcrCategory.id
        if (!categories[categoryId]) {
          categories[categoryId] = {
            category: material.pcrCategory,
            materials: [],
          }
        }
        categories[categoryId].materials.push(material)
      } else {
        uncategorized.push(material)
      }
    })

    return { categories, uncategorized }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const stats = getStats()
  const { categories, uncategorized } = getMaterialsByCategory()
  const allCategories = pcrCategorizer.getAllCategories()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Validazione Parsing Materiali e Macrogruppi PCR
          </CardTitle>
          <CardDescription>
            Verifica e correggi i materiali identificati organizzati per macrogruppi PCR.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistiche */}
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-600">Materiali Totali</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.identified}</p>
                <p className="text-sm text-gray-600">Identificati</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.categorized}</p>
                <p className="text-sm text-gray-600">Categorizzati PCR</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.validated}</p>
                <p className="text-sm text-gray-600">Validati</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{stats.userModified}</p>
                <p className="text-sm text-gray-600">Modificati</p>
              </CardContent>
            </Card>
          </div>

          {/* Alert di stato */}
          {stats.categorized < stats.total && (
            <Alert className="mb-4">
              <Package className="h-4 w-4" />
              <AlertDescription>
                <strong>Attenzione:</strong> {stats.total - stats.categorized} materiali non sono stati assegnati a un
                macrogruppo PCR. Assegnali manualmente per un'analisi completa per categoria.
              </AlertDescription>
            </Alert>
          )}

          {/* Filtri e ricerca */}
          <div className="flex gap-4 items-center mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cerca materiali..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i materiali</SelectItem>
                <SelectItem value="identified">Solo identificati</SelectItem>
                <SelectItem value="unidentified">Non identificati</SelectItem>
                <SelectItem value="uncategorized">Senza macrogruppo</SelectItem>
                <SelectItem value="low_confidence">Bassa confidenza</SelectItem>
                <SelectItem value="user_modified">Modificati dall'utente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Materiali organizzati per macrogruppo */}
          <div className="space-y-4">
            {Object.entries(categories).map(([categoryId, categoryData]) => {
              const isExpanded = expandedCategories.has(categoryId)
              const totalWeight = categoryData.materials.reduce((sum, m) => sum + m.quantity, 0)

              return (
                <Card key={categoryId}>
                  <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(categoryId)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {categoryData.category.code}
                                </Badge>
                                <h3 className="font-medium">{categoryData.category.name}</h3>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{categoryData.category.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">{(totalWeight / 1000).toFixed(1)}t</p>
                            <p className="text-sm text-gray-600">{categoryData.materials.length} materiali</p>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {categoryData.materials.map((material, idx) => {
                            const globalIndex = validationMaterials.indexOf(material)
                            return (
                              <div key={globalIndex} className="p-3 border rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm mb-1">{material.originalText}</div>
                                    <div className="flex items-center gap-2 mb-2">
                                      {material.material ? (
                                        <Badge variant="secondary" className="text-xs">
                                          {material.material.name}
                                        </Badge>
                                      ) : (
                                        <Badge variant="destructive" className="text-xs">
                                          Non identificato
                                        </Badge>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <div
                                          className={`w-2 h-2 rounded-full ${
                                            material.confidence > 0.8
                                              ? "bg-green-500"
                                              : material.confidence > 0.5
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                          }`}
                                        />
                                        <span className="text-xs text-gray-600">
                                          {Math.round(material.confidence * 100)}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <Label className="text-xs">Peso (t):</Label>
                                        <Input
                                          type="number"
                                          step="0.1"
                                          value={(material.quantity / 1000).toFixed(1)}
                                          onChange={(e) =>
                                            handleQuantityChange(globalIndex, Number.parseFloat(e.target.value))
                                          }
                                          className="w-20 h-6 text-xs"
                                        />
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleValidationToggle(globalIndex)}
                                        className={material.isValidated ? "text-green-600" : "text-gray-400"}
                                      >
                                        {material.isValidated ? (
                                          <Check className="h-4 w-4" />
                                        ) : (
                                          <HelpCircle className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 ml-4">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>Modifica Materiale</DialogTitle>
                                          <DialogDescription>
                                            Modifica il materiale e il macrogruppo PCR
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <Label>Testo originale:</Label>
                                            <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                                              {material.originalText}
                                            </p>
                                          </div>

                                          <div>
                                            <Label>Materiali disponibili:</Label>
                                            <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
                                              {isLoadingMaterials ? (
                                                <div className="flex items-center justify-center p-4">
                                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                  <span className="ml-2">Caricamento materiali...</span>
                                                </div>
                                              ) : (
                                                availableMaterials.map((dbMaterial) => (
                                                  <Button
                                                    key={dbMaterial.id}
                                                    variant="ghost"
                                                    className="w-full justify-start text-left h-auto p-2"
                                                    onClick={() => {
                                                      handleMaterialSelection(globalIndex, dbMaterial)
                                                    }}
                                                  >
                                                    <div>
                                                      <div className="font-medium">{dbMaterial.name}</div>
                                                      <div className="text-xs text-gray-500">
                                                        {dbMaterial.category} - {dbMaterial.gwpFactor} kg CO₂eq/kg
                                                      </div>
                                                    </div>
                                                  </Button>
                                                ))
                                              )}
                                            </div>
                                          </div>

                                          <div className="border-t pt-4">
                                            <Button
                                              variant="outline"
                                              onClick={() => {
                                                setEditingIndex(globalIndex)
                                                setIsAddMaterialDialogOpen(true)
                                              }}
                                              className="w-full"
                                            >
                                              <Plus className="h-4 w-4 mr-2" />
                                              Aggiungi Nuovo Materiale
                                            </Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveMaterial(globalIndex)}
                                      className="text-red-600"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )
            })}

            {/* Materiali non categorizzati */}
            {uncategorized.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <Package className="h-5 w-5" />
                    Materiali Non Categorizzati ({uncategorized.length})
                  </CardTitle>
                  <CardDescription>Questi materiali non sono stati assegnati a un macrogruppo PCR</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {uncategorized.map((material) => {
                      const globalIndex = validationMaterials.indexOf(material)
                      return (
                        <div key={globalIndex} className="p-3 border rounded-lg bg-yellow-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm mb-1">{material.originalText}</div>
                              <div className="flex items-center gap-2">
                                <Select
                                  value=""
                                  onValueChange={(value) => {
                                    const category = allCategories.find((c) => c.id === value)
                                    if (category) handleCategorySelection(globalIndex, category)
                                  }}
                                >
                                  <SelectTrigger className="w-64 h-6 text-xs">
                                    <SelectValue placeholder="Assegna macrogruppo PCR" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {allCategories.map((category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.code} - {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{(material.quantity / 1000).toFixed(1)}t</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pulsante di completamento */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              Progresso: {stats.validated}/{stats.total} materiali validati | {stats.categorized}/{stats.total}{" "}
              categorizzati PCR
            </div>
            <Button onClick={handleComplete} size="lg" disabled={stats.validated < stats.total * 0.8}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Conferma e Procedi al Calcolo GWP
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog per aggiungere materiale personalizzato */}
      <Dialog open={isAddMaterialDialogOpen} onOpenChange={setIsAddMaterialDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aggiungi Materiale Personalizzato</DialogTitle>
            <DialogDescription>Crea un nuovo materiale per questo elemento non identificato</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custom-name">Nome Materiale *</Label>
                <Input
                  id="custom-name"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  placeholder="es. Acciaio speciale"
                />
              </div>
              <div>
                <Label htmlFor="custom-category">Categoria *</Label>
                <Select
                  value={newMaterial.category}
                  onValueChange={(value) => setNewMaterial({ ...newMaterial, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Metalli">Metalli</SelectItem>
                    <SelectItem value="Compositi">Compositi</SelectItem>
                    <SelectItem value="Legno">Legno</SelectItem>
                    <SelectItem value="Vernici">Vernici</SelectItem>
                    <SelectItem value="Plastiche">Plastiche</SelectItem>
                    <SelectItem value="Isolanti">Isolanti</SelectItem>
                    <SelectItem value="Vetro">Vetro</SelectItem>
                    <SelectItem value="Tessuti">Tessuti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="custom-aliases">Alias (separati da virgola)</Label>
              <Input
                id="custom-aliases"
                value={newMaterial.aliases?.join(", ")}
                onChange={(e) =>
                  setNewMaterial({
                    ...newMaterial,
                    aliases: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0),
                  })
                }
                placeholder="es. acciaio speciale, special steel"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custom-gwp">Fattore GWP (kg CO₂eq/kg) *</Label>
                <Input
                  id="custom-gwp"
                  type="number"
                  step="0.1"
                  value={newMaterial.gwpFactor}
                  onChange={(e) => setNewMaterial({ ...newMaterial, gwpFactor: Number.parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="custom-unit">Unità</Label>
                <Select
                  value={newMaterial.unit}
                  onValueChange={(value) => setNewMaterial({ ...newMaterial, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="m³">m³</SelectItem>
                    <SelectItem value="m²">m²</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="custom-description">Descrizione</Label>
              <Textarea
                id="custom-description"
                value={newMaterial.description}
                onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                placeholder="Descrizione del materiale"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMaterialDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={() => handleAddCustomMaterial(editingIndex!)}>
              <Save className="h-4 w-4 mr-2" />
              Salva e Applica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
