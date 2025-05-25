export interface Material {
  id: string
  name: string
  aliases: string[] // Nomi alternativi per il riconoscimento
  category: string
  gwpFactor: number // kg CO2eq per kg di materiale
  unit: string
  density?: number // kg/m³ se necessario per conversioni
  description?: string
}

export const MATERIALS_DATABASE: Material[] = [
  // ACCIAI
  {
    id: "steel_carbon",
    name: "Acciaio al carbonio",
    aliases: ["acciaio", "steel", "carbon steel", "acciaio carbonio", "ferro"],
    category: "Metalli",
    gwpFactor: 2.1,
    unit: "kg",
    density: 7850,
    description: "Acciaio al carbonio standard per costruzioni navali",
  },
  {
    id: "steel_stainless",
    name: "Acciaio inossidabile",
    aliases: ["inox", "stainless steel", "acciaio inossidabile", "aisi 316", "aisi 304"],
    category: "Metalli",
    gwpFactor: 6.2,
    unit: "kg",
    density: 8000,
    description: "Acciaio inossidabile per ambienti marini",
  },
  {
    id: "steel_galvanized",
    name: "Acciaio zincato",
    aliases: ["acciaio zincato", "galvanized steel", "zincato"],
    category: "Metalli",
    gwpFactor: 2.8,
    unit: "kg",
    density: 7850,
    description: "Acciaio con rivestimento di zinco",
  },

  // ALLUMINIO
  {
    id: "aluminum_primary",
    name: "Alluminio primario",
    aliases: ["alluminio", "aluminum", "aluminium", "lega alluminio"],
    category: "Metalli",
    gwpFactor: 11.5,
    unit: "kg",
    density: 2700,
    description: "Alluminio da produzione primaria",
  },
  {
    id: "aluminum_recycled",
    name: "Alluminio riciclato",
    aliases: ["alluminio riciclato", "recycled aluminum", "alluminio secondario"],
    category: "Metalli",
    gwpFactor: 0.7,
    unit: "kg",
    density: 2700,
    description: "Alluminio da materiale riciclato",
  },

  // RAME E LEGHE
  {
    id: "copper",
    name: "Rame",
    aliases: ["rame", "copper", "cu"],
    category: "Metalli",
    gwpFactor: 3.2,
    unit: "kg",
    density: 8960,
    description: "Rame puro per impianti elettrici",
  },
  {
    id: "bronze",
    name: "Bronzo",
    aliases: ["bronzo", "bronze", "lega bronzo"],
    category: "Metalli",
    gwpFactor: 4.1,
    unit: "kg",
    density: 8800,
    description: "Lega di rame e stagno",
  },
  {
    id: "brass",
    name: "Ottone",
    aliases: ["ottone", "brass", "lega ottone"],
    category: "Metalli",
    gwpFactor: 3.8,
    unit: "kg",
    density: 8500,
    description: "Lega di rame e zinco",
  },

  // MATERIALI COMPOSITI
  {
    id: "fiberglass",
    name: "Fibra di vetro",
    aliases: ["fibra di vetro", "fiberglass", "vetroresina", "grp", "frp"],
    category: "Compositi",
    gwpFactor: 1.8,
    unit: "kg",
    density: 1800,
    description: "Materiale composito fibra di vetro/resina",
  },
  {
    id: "carbon_fiber",
    name: "Fibra di carbonio",
    aliases: ["fibra di carbonio", "carbon fiber", "carbonio", "cfrp"],
    category: "Compositi",
    gwpFactor: 24.0,
    unit: "kg",
    density: 1600,
    description: "Materiale composito in fibra di carbonio",
  },
  {
    id: "kevlar",
    name: "Kevlar",
    aliases: ["kevlar", "aramid", "fibra aramidica"],
    category: "Compositi",
    gwpFactor: 28.5,
    unit: "kg",
    density: 1440,
    description: "Fibra aramidica ad alta resistenza",
  },

  // LEGNO
  {
    id: "teak",
    name: "Teak",
    aliases: ["teak", "legno teak"],
    category: "Legno",
    gwpFactor: 0.4,
    unit: "kg",
    density: 650,
    description: "Legno tropicale per ponti e finiture",
  },
  {
    id: "mahogany",
    name: "Mogano",
    aliases: ["mogano", "mahogany", "legno mogano"],
    category: "Legno",
    gwpFactor: 0.5,
    unit: "kg",
    density: 550,
    description: "Legno pregiato per interni",
  },
  {
    id: "plywood_marine",
    name: "Compensato marino",
    aliases: ["compensato", "plywood", "compensato marino", "multistrato"],
    category: "Legno",
    gwpFactor: 0.8,
    unit: "kg",
    density: 600,
    description: "Pannelli multistrato per uso marino",
  },

  // VERNICI E RIVESTIMENTI
  {
    id: "antifouling_paint",
    name: "Vernice antivegetativa",
    aliases: ["antifouling", "vernice antivegetativa", "antincrostante"],
    category: "Vernici",
    gwpFactor: 4.5,
    unit: "kg",
    density: 1400,
    description: "Vernice per protezione carena",
  },
  {
    id: "primer",
    name: "Primer",
    aliases: ["primer", "fondo", "sottosmalto"],
    category: "Vernici",
    gwpFactor: 3.2,
    unit: "kg",
    density: 1300,
    description: "Vernice di fondo",
  },
  {
    id: "topcoat",
    name: "Smalto di finitura",
    aliases: ["smalto", "topcoat", "finitura", "vernice"],
    category: "Vernici",
    gwpFactor: 3.8,
    unit: "kg",
    density: 1200,
    description: "Vernice di finitura",
  },

  // PLASTICHE E POLIMERI
  {
    id: "pvc",
    name: "PVC",
    aliases: ["pvc", "polivinilcloruro", "vinyl"],
    category: "Plastiche",
    gwpFactor: 2.2,
    unit: "kg",
    density: 1400,
    description: "Cloruro di polivinile",
  },
  {
    id: "polyethylene",
    name: "Polietilene",
    aliases: ["polietilene", "pe", "polyethylene"],
    category: "Plastiche",
    gwpFactor: 1.9,
    unit: "kg",
    density: 950,
    description: "Polietilene ad alta densità",
  },

  // ISOLANTI
  {
    id: "polyurethane_foam",
    name: "Schiuma poliuretanica",
    aliases: ["poliuretano", "schiuma", "isolante", "pu foam"],
    category: "Isolanti",
    gwpFactor: 3.8,
    unit: "kg",
    density: 40,
    description: "Isolante termico in schiuma PU",
  },

  // VETRO
  {
    id: "tempered_glass",
    name: "Vetro temperato",
    aliases: ["vetro", "glass", "vetro temperato", "cristallo"],
    category: "Vetro",
    gwpFactor: 0.9,
    unit: "kg",
    density: 2500,
    description: "Vetro di sicurezza temperato",
  },

  // TESSUTI E VELE
  {
    id: "dacron",
    name: "Dacron",
    aliases: ["dacron", "poliestere", "tessuto vele"],
    category: "Tessuti",
    gwpFactor: 2.1,
    unit: "kg",
    density: 200,
    description: "Tessuto in poliestere per vele",
  },
]

export class MaterialsDatabase {
  private materials: Material[]
  private readonly STORAGE_KEY = "lightshipweight-materials-db"

  constructor() {
    this.loadFromStorage()
  }

  // Carica i dati da localStorage o usa i dati di default
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const parsedMaterials = JSON.parse(stored) as Material[]
        // Valida che sia un array valido
        if (Array.isArray(parsedMaterials) && parsedMaterials.length > 0) {
          this.materials = parsedMaterials
          return
        }
      }
    } catch (error) {
      console.warn("Error loading materials from storage:", error)
    }

    // Fallback ai dati di default
    this.materials = [...MATERIALS_DATABASE]
    this.saveToStorage()
  }

  // Salva i dati in localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.materials))
    } catch (error) {
      console.error("Error saving materials to storage:", error)
    }
  }

  // Cerca materiale per nome o alias
  findMaterial(searchTerm: string): Material | null {
    const term = searchTerm.toLowerCase().trim()

    return (
      this.materials.find(
        (material) =>
          material.name.toLowerCase().includes(term) ||
          material.aliases.some((alias) => alias.toLowerCase().includes(term) || term.includes(alias.toLowerCase())),
      ) || null
    )
  }

  // Cerca materiali per categoria
  getMaterialsByCategory(category: string): Material[] {
    return this.materials.filter((material) => material.category.toLowerCase() === category.toLowerCase())
  }

  // Ottieni tutti i materiali
  getAllMaterials(): Material[] {
    return [...this.materials] // Ritorna una copia per evitare modifiche dirette
  }

  // Aggiungi nuovo materiale
  addMaterial(material: Material): void {
    this.materials.push(material)
    this.saveToStorage()
  }

  // Aggiorna materiale esistente
  updateMaterial(id: string, updates: Partial<Material>): boolean {
    const index = this.materials.findIndex((m) => m.id === id)
    if (index !== -1) {
      this.materials[index] = { ...this.materials[index], ...updates }
      this.saveToStorage()
      return true
    }
    return false
  }

  // Rimuovi materiale
  removeMaterial(id: string): boolean {
    const index = this.materials.findIndex((m) => m.id === id)
    if (index !== -1) {
      this.materials.splice(index, 1)
      this.saveToStorage()
      return true
    }
    return false
  }

  // Cancella tutti i materiali
  clearAllMaterials(): void {
    this.materials = []
    this.saveToStorage()
  }

  // Ripristina i materiali di default
  resetToDefaults(): void {
    this.materials = [...MATERIALS_DATABASE]
    this.saveToStorage()
  }

  // Importa materiali da array
  importMaterials(materials: Material[]): number {
    let importedCount = 0
    materials.forEach((material) => {
      try {
        // Valida che il materiale abbia i campi essenziali
        if (material.name && material.category && typeof material.gwpFactor === "number") {
          // Assicurati che abbia un ID unico
          const materialWithId = {
            ...material,
            id: material.id || `imported_${Date.now()}_${importedCount}`,
          }
          this.materials.push(materialWithId)
          importedCount++
        }
      } catch (error) {
        console.warn("Skipped invalid material:", material)
      }
    })

    if (importedCount > 0) {
      this.saveToStorage()
    }

    return importedCount
  }

  // Esporta tutti i materiali
  exportMaterials(): Material[] {
    return [...this.materials]
  }
}
