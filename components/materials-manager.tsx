"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Search, Download, Upload, Save, CheckCircle, AlertTriangle } from "lucide-react"
import { MaterialsDatabase, type Material } from "@/lib/materials-database-supabase"

export default function MaterialsManager() {
  const [materialsDb] = useState(() => new MaterialsDatabase())
  const [materials, setMaterials] = useState<Material[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "error" | "loading">("loading")
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    name: "",
    aliases: [],
    category: "",
    gwpFactor: 0,
    unit: "kg",
    density: 0,
    description: "",
  })

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setIsLoading(true)
        setConnectionStatus("loading")

        const allMaterials = await materialsDb.getAllMaterials()
        setMaterials(allMaterials)
        setFilteredMaterials(allMaterials)
        setConnectionStatus("connected")
      } catch (error) {
        console.error("Errore nel caricamento materiali:", error)
        setConnectionStatus("error")
      } finally {
        setIsLoading(false)
      }
    }

    loadMaterials()
  }, [materialsDb])

  useEffect(() => {
    let filtered = materials

    if (searchTerm) {
      filtered = filtered.filter(
        (material) =>
          material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.aliases.some((alias) => alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
          material.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((material) => material.category === selectedCategory)
    }

    setFilteredMaterials(filtered)
  }, [materials, searchTerm, selectedCategory])

  const categories = Array.from(new Set(materials.map((m) => m.category)))

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.category || !newMaterial.gwpFactor) {
      alert("Please fill in all required fields (Name, Category, GWP Factor)")
      return
    }

    try {
      const material: Material = {
        id: `custom_${Date.now()}`,
        name: newMaterial.name!,
        aliases: newMaterial.aliases || [],
        category: newMaterial.category!,
        gwpFactor: newMaterial.gwpFactor!,
        unit: newMaterial.unit || "kg",
        density: newMaterial.density,
        description: newMaterial.description,
      }

      const success = await materialsDb.addMaterial(material)
      if (success) {
        const updatedMaterials = await materialsDb.getAllMaterials()
        setMaterials(updatedMaterials)
        setNewMaterial({
          name: "",
          aliases: [],
          category: "",
          gwpFactor: 0,
          unit: "kg",
          density: 0,
          description: "",
        })
        setIsAddDialogOpen(false)
        alert("Material added successfully")
      } else {
        alert("Error adding material")
      }
    } catch (error) {
      alert("Error adding material")
      console.error("Add error:", error)
    }
  }

  const handleEditMaterial = async () => {
    if (!editingMaterial) return

    try {
      const success = await materialsDb.updateMaterial(editingMaterial.id, editingMaterial)
      if (success) {
        const updatedMaterials = await materialsDb.getAllMaterials()
        setMaterials(updatedMaterials)
        setEditingMaterial(null)
        setIsEditDialogOpen(false)
        alert("Material updated successfully")
      } else {
        alert("Error updating material")
      }
    } catch (error) {
      alert("Error updating material")
      console.error("Update error:", error)
    }
  }

  const handleDeleteAllMaterials = async () => {
    if (confirm("Are you sure you want to delete ALL materials? This action cannot be undone.")) {
      try {
        const success = await materialsDb.clearAllMaterials()
        if (success) {
          setMaterials([])
          setFilteredMaterials([])
          alert("All materials have been deleted")
        } else {
          alert("Error deleting materials")
        }
      } catch (error) {
        alert("Error deleting materials")
        console.error("Delete error:", error)
      }
    }
  }

  const handleResetToDefaults = async () => {
    if (confirm("Reset to default materials? This will replace all current materials with the original database.")) {
      try {
        const success = await materialsDb.resetToDefaults()
        if (success) {
          const updatedMaterials = await materialsDb.getAllMaterials()
          setMaterials(updatedMaterials)
          alert("Database reset to defaults")
        } else {
          alert("Error resetting database")
        }
      } catch (error) {
        alert("Error resetting database")
        console.error("Reset error:", error)
      }
    }
  }

  const handleDeleteMaterial = async (id: string) => {
    if (confirm("Are you sure you want to delete this material?")) {
      try {
        const success = await materialsDb.removeMaterial(id)
        if (success) {
          const updatedMaterials = await materialsDb.getAllMaterials()
          setMaterials(updatedMaterials)
          alert("Material deleted successfully")
        } else {
          alert("Error deleting material")
        }
      } catch (error) {
        alert("Error deleting material")
        console.error("Delete error:", error)
      }
    }
  }

  const exportDatabase = async () => {
    try {
      const materials = await materialsDb.exportMaterials()
      const data = JSON.stringify(materials, null, 2)
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `materials-database-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert("Error exporting database")
      console.error("Export error:", error)
    }
  }

  const importDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importedMaterials = JSON.parse(e.target?.result as string) as Material[]

        if (!Array.isArray(importedMaterials)) {
          throw new Error("Invalid file format")
        }

        const successCount = await materialsDb.importMaterials(importedMaterials)
        const updatedMaterials = await materialsDb.getAllMaterials()
        setMaterials(updatedMaterials)
        alert(`Successfully imported ${successCount} materials`)

        // Reset file input
        event.target.value = ""
      } catch (error) {
        alert("Error importing file. Please check the file format.")
        console.error("Import error:", error)
      }
    }
    reader.readAsText(file)
  }

  const parseAliases = (aliasesString: string): string[] => {
    return aliasesString
      .split(",")
      .map((alias) => alias.trim())
      .filter((alias) => alias.length > 0)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Materials Database Management
              </CardTitle>
              <CardDescription>
                Add, edit or delete materials from the database to improve automatic recognition
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Connection Status */}
          {connectionStatus === "loading" && (
            <Alert className="mb-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Connecting to Supabase database...</span>
              </div>
            </Alert>
          )}

          {connectionStatus === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Error connecting to database. Some features may not work properly.</AlertDescription>
            </Alert>
          )}

          {connectionStatus === "connected" && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Successfully connected to Supabase database.</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading materials...</span>
            </div>
          ) : (
            <Tabs defaultValue="list" className="w-full">
              <TabsList>
                <TabsTrigger value="list">Materials List</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                {/* Controls */}
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search materials..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Material
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Material</DialogTitle>
                        <DialogDescription>
                          Enter the information for the new material to add to the database
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Material Name *</Label>
                            <Input
                              id="name"
                              value={newMaterial.name}
                              onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                              placeholder="e.g. Stainless steel"
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select
                              value={newMaterial.category}
                              onValueChange={(value) => setNewMaterial({ ...newMaterial, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                                <SelectItem value="New Category">+ New Category</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="aliases">Aliases (comma separated)</Label>
                          <Input
                            id="aliases"
                            value={newMaterial.aliases?.join(", ")}
                            onChange={(e) => setNewMaterial({ ...newMaterial, aliases: parseAliases(e.target.value) })}
                            placeholder="e.g. inox, stainless steel, aisi 316"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="gwpFactor">GWP Factor (kg CO₂eq/kg) *</Label>
                            <Input
                              id="gwpFactor"
                              type="number"
                              step="0.1"
                              value={newMaterial.gwpFactor}
                              onChange={(e) =>
                                setNewMaterial({ ...newMaterial, gwpFactor: Number.parseFloat(e.target.value) })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="unit">Unit</Label>
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
                          <div>
                            <Label htmlFor="density">Density (kg/m³)</Label>
                            <Input
                              id="density"
                              type="number"
                              value={newMaterial.density}
                              onChange={(e) =>
                                setNewMaterial({ ...newMaterial, density: Number.parseFloat(e.target.value) })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newMaterial.description}
                            onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                            placeholder="Material description and characteristics"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddMaterial}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Material
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Materials table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>GWP Factor</TableHead>
                        <TableHead>Aliases</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMaterials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">{material.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{material.category}</Badge>
                          </TableCell>
                          <TableCell>{material.gwpFactor} kg CO₂eq/kg</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {material.aliases.slice(0, 3).map((alias, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {alias}
                                </Badge>
                              ))}
                              {material.aliases.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{material.aliases.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingMaterial({ ...material })
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMaterial(material.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredMaterials.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No materials found with selected filters</div>
                )}

                {/* Action buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={handleDeleteAllMaterials}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </Button>
                    <Button variant="outline" onClick={handleResetToDefaults}>
                      Reset to Defaults
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportDatabase}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Label htmlFor="import-file">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Import
                        </span>
                      </Button>
                    </Label>
                    <Input id="import-file" type="file" accept=".json" onChange={importDatabase} className="hidden" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{materials.length}</p>
                      <p className="text-sm text-gray-600">Total Materials</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{categories.length}</p>
                      <p className="text-sm text-gray-600">Categories</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {materials.reduce((sum, m) => sum + m.aliases.length, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Aliases</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {materials.length > 0
                          ? (materials.reduce((sum, m) => sum + m.gwpFactor, 0) / materials.length).toFixed(1)
                          : 0}
                      </p>
                      <p className="text-sm text-gray-600">Average GWP</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribution by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categories.map((category) => {
                        const count = materials.filter((m) => m.category === category).length
                        const percentage = materials.length > 0 ? (count / materials.length) * 100 : 0
                        return (
                          <div key={category}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{category}</span>
                              <span className="text-sm text-gray-600">
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>Modify the information for the selected material</DialogDescription>
          </DialogHeader>
          {editingMaterial && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Material Name</Label>
                  <Input
                    id="edit-name"
                    value={editingMaterial.name}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingMaterial.category}
                    onValueChange={(value) => setEditingMaterial({ ...editingMaterial, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-aliases">Aliases</Label>
                <Input
                  id="edit-aliases"
                  value={editingMaterial.aliases.join(", ")}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, aliases: parseAliases(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-gwpFactor">GWP Factor</Label>
                  <Input
                    id="edit-gwpFactor"
                    type="number"
                    step="0.1"
                    value={editingMaterial.gwpFactor}
                    onChange={(e) =>
                      setEditingMaterial({ ...editingMaterial, gwpFactor: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Select
                    value={editingMaterial.unit}
                    onValueChange={(value) => setEditingMaterial({ ...editingMaterial, unit: value })}
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
                <div>
                  <Label htmlFor="edit-density">Density</Label>
                  <Input
                    id="edit-density"
                    type="number"
                    value={editingMaterial.density || ""}
                    onChange={(e) =>
                      setEditingMaterial({ ...editingMaterial, density: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingMaterial.description || ""}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMaterial}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
