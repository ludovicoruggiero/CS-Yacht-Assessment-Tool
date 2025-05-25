import { supabase, type DatabaseMaterial } from "./supabase"

export interface Material {
  id: string
  name: string
  aliases: string[]
  category: string
  gwpFactor: number
  unit: string
  density?: number
  description?: string
}

export class MaterialsDatabase {
  private cache: Material[] = []
  private lastFetch = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minuti

  constructor() {
    // Carica i dati iniziali
    this.loadMaterials()
  }

  // Converte da formato database a formato applicazione
  private dbToMaterial(dbMaterial: DatabaseMaterial): Material {
    return {
      id: dbMaterial.id,
      name: dbMaterial.name,
      aliases: dbMaterial.aliases || [],
      category: dbMaterial.category,
      gwpFactor: Number(dbMaterial.gwp_factor),
      unit: dbMaterial.unit,
      density: dbMaterial.density ? Number(dbMaterial.density) : undefined,
      description: dbMaterial.description || undefined,
    }
  }

  // Converte da formato applicazione a formato database
  private materialToDb(material: Material): Omit<DatabaseMaterial, "created_at" | "updated_at"> {
    return {
      id: material.id,
      name: material.name,
      aliases: material.aliases,
      category: material.category,
      gwp_factor: material.gwpFactor,
      unit: material.unit,
      density: material.density,
      description: material.description,
    }
  }

  // Carica materiali da Supabase
  private async loadMaterials(): Promise<void> {
    try {
      const { data, error } = await supabase.from("materials").select("*").order("name")

      if (error) {
        console.error("Errore nel caricamento materiali:", error)
        return
      }

      if (data) {
        this.cache = data.map(this.dbToMaterial)
        this.lastFetch = Date.now()
      }
    } catch (error) {
      console.error("Errore nella connessione a Supabase:", error)
    }
  }

  // Verifica se la cache è valida
  private isCacheValid(): boolean {
    return Date.now() - this.lastFetch < this.CACHE_DURATION
  }

  // Ottieni tutti i materiali
  async getAllMaterials(): Promise<Material[]> {
    if (!this.isCacheValid()) {
      await this.loadMaterials()
    }
    return [...this.cache]
  }

  // Cerca materiale per nome o alias
  async findMaterial(searchTerm: string): Promise<Material | null> {
    const materials = await this.getAllMaterials()
    const term = searchTerm.toLowerCase().trim()

    return (
      materials.find(
        (material) =>
          material.name.toLowerCase().includes(term) ||
          material.aliases.some((alias) => alias.toLowerCase().includes(term) || term.includes(alias.toLowerCase())),
      ) || null
    )
  }

  // Cerca materiali per categoria
  async getMaterialsByCategory(category: string): Promise<Material[]> {
    const materials = await this.getAllMaterials()
    return materials.filter((material) => material.category.toLowerCase() === category.toLowerCase())
  }

  // Aggiungi nuovo materiale
  async addMaterial(material: Material): Promise<boolean> {
    try {
      const dbMaterial = this.materialToDb(material)

      const { error } = await supabase.from("materials").insert([dbMaterial])

      if (error) {
        console.error("Errore nell'aggiunta del materiale:", error)
        return false
      }

      // Aggiorna la cache
      this.cache.push(material)
      return true
    } catch (error) {
      console.error("Errore nell'aggiunta del materiale:", error)
      return false
    }
  }

  // Aggiorna materiale esistente
  async updateMaterial(id: string, updates: Partial<Material>): Promise<boolean> {
    try {
      // Trova il materiale esistente
      const existingMaterial = this.cache.find((m) => m.id === id)
      if (!existingMaterial) {
        return false
      }

      // Crea il materiale aggiornato
      const updatedMaterial = { ...existingMaterial, ...updates }
      const dbUpdates = this.materialToDb(updatedMaterial)

      const { error } = await supabase
        .from("materials")
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("Errore nell'aggiornamento del materiale:", error)
        return false
      }

      // Aggiorna la cache
      const index = this.cache.findIndex((m) => m.id === id)
      if (index !== -1) {
        this.cache[index] = updatedMaterial
      }

      return true
    } catch (error) {
      console.error("Errore nell'aggiornamento del materiale:", error)
      return false
    }
  }

  // Rimuovi materiale
  async removeMaterial(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("materials").delete().eq("id", id)

      if (error) {
        console.error("Errore nella rimozione del materiale:", error)
        return false
      }

      // Aggiorna la cache
      this.cache = this.cache.filter((m) => m.id !== id)
      return true
    } catch (error) {
      console.error("Errore nella rimozione del materiale:", error)
      return false
    }
  }

  // Cancella tutti i materiali
  async clearAllMaterials(): Promise<boolean> {
    try {
      const { error } = await supabase.from("materials").delete().neq("id", "") // Elimina tutti i record

      if (error) {
        console.error("Errore nella cancellazione di tutti i materiali:", error)
        return false
      }

      // Svuota la cache
      this.cache = []
      return true
    } catch (error) {
      console.error("Errore nella cancellazione di tutti i materiali:", error)
      return false
    }
  }

  // Ripristina i materiali di default (già inseriti nel database)
  async resetToDefaults(): Promise<boolean> {
    try {
      // Prima cancella tutti i materiali
      await this.clearAllMaterials()

      // Poi ricarica dalla query SQL iniziale
      // I dati di default sono già nel database, quindi ricarica semplicemente
      await this.loadMaterials()
      return true
    } catch (error) {
      console.error("Errore nel ripristino dei materiali di default:", error)
      return false
    }
  }

  // Importa materiali da array
  async importMaterials(materials: Material[]): Promise<number> {
    let importedCount = 0

    for (const material of materials) {
      try {
        // Valida che il materiale abbia i campi essenziali
        if (material.name && material.category && typeof material.gwpFactor === "number") {
          // Assicurati che abbia un ID unico
          const materialWithId = {
            ...material,
            id: material.id || `imported_${Date.now()}_${importedCount}`,
          }

          const success = await this.addMaterial(materialWithId)
          if (success) {
            importedCount++
          }
        }
      } catch (error) {
        console.warn("Materiale saltato per errore:", material, error)
      }
    }

    return importedCount
  }

  // Esporta tutti i materiali
  async exportMaterials(): Promise<Material[]> {
    return await this.getAllMaterials()
  }

  // Forza il refresh della cache
  async refreshCache(): Promise<void> {
    this.lastFetch = 0
    await this.loadMaterials()
  }

  // Ottieni statistiche del database
  async getStats(): Promise<{
    totalMaterials: number
    categories: string[]
    lastUpdate: Date | null
  }> {
    const materials = await this.getAllMaterials()
    const categories = Array.from(new Set(materials.map((m) => m.category)))

    return {
      totalMaterials: materials.length,
      categories,
      lastUpdate: this.lastFetch > 0 ? new Date(this.lastFetch) : null,
    }
  }
}
