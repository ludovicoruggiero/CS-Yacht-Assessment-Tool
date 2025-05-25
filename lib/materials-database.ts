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
  private readonly STORAGE_KEY = "yacht-assessment-materials-db"
  private readonly BACKUP_KEY = "yacht-assessment-materials-backup"
  private readonly VERSION_KEY = "yacht-assessment-materials-version"
  private readonly CURRENT_VERSION = "1.0"

  constructor() {
    this.loadFromStorage()
  }

  // Carica i dati da localStorage con sistema di backup robusto
  private loadFromStorage(): void {
    try {
      // Prima prova a caricare i dati principali
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const version = localStorage.getItem(this.VERSION_KEY)

      if (stored && version === this.CURRENT_VERSION) {
        const parsedMaterials = JSON.parse(stored) as Material[]

        // Valida che sia un array valido con almeno un materiale
        if (Array.isArray(parsedMaterials) && this.validateMaterials(parsedMaterials)) {
          this.materials = parsedMaterials
          console.log(`✅ Caricati ${parsedMaterials.length} materiali dal localStorage`)
          return
        }
      }

      // Se i dati principali non sono validi, prova il backup
      const backup = localStorage.getItem(this.BACKUP_KEY)
      if (backup) {
        try {
          const backupData = JSON.parse(backup)
          if (
            backupData.materials &&
            Array.isArray(backupData.materials) &&
            this.validateMaterials(backupData.materials)
          ) {
            this.materials = backupData.materials
            console.log(`🔄 Ripristinati ${backupData.materials.length} materiali dal backup`)
            this.saveToStorage() // Ripristina i dati principali
            return
          }
        } catch (backupError) {
          console.warn("Backup corrotto:", backupError)
        }
      }
    } catch (error) {
      console.warn("Errore nel caricamento dati:", error)
    }

    // Fallback ai dati di default solo se non ci sono dati salvati
    console.log("🔧 Inizializzazione con dati di default")
    this.materials = [...MATERIALS_DATABASE]
    this.saveToStorage()
  }

  // Valida che i materiali abbiano la struttura corretta
  private validateMaterials(materials: Material[]): boolean {
    return materials.every(
      (material) =>
        material.id && material.name && material.category && typeof material.gwpFactor === "number" && material.unit,
    )
  }

  // Salva i dati in localStorage con backup automatico
  private saveToStorage(): void {
    try {
      // Crea backup prima di salvare
      this.createBackup()

      // Salva i dati principali
      const dataToSave = JSON.stringify(this.materials)
      localStorage.setItem(this.STORAGE_KEY, dataToSave)
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION)

      // Verifica che il salvataggio sia andato a buon fine
      const verification = localStorage.getItem(this.STORAGE_KEY)
      if (!verification || verification !== dataToSave) {
        throw new Error("Verifica salvataggio fallita")
      }

      console.log(`💾 Salvati ${this.materials.length} materiali nel localStorage`)
    } catch (error) {
      console.error("❌ Errore nel salvataggio:", error)

      // Prova a liberare spazio e riprovare
      this.cleanupStorage()
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.materials))
        localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION)
        console.log("✅ Salvataggio riuscito dopo pulizia storage")
      } catch (retryError) {
        console.error("❌ Salvataggio fallito anche dopo pulizia:", retryError)
        throw retryError
      }
    }
  }

  // Crea backup automatico
  private createBackup(): void {
    try {
      const backupData = {
        materials: this.materials,
        timestamp: new Date().toISOString(),
        version: this.CURRENT_VERSION,
      }
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData))
    } catch (error) {
      console.warn("Impossibile creare backup:", error)
    }
  }

  // Pulisce lo storage per liberare spazio
  private cleanupStorage(): void {
    try {
      // Rimuovi dati vecchi o non necessari
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes("temp-") || key.includes("cache-"))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key))
      console.log(`🧹 Rimossi ${keysToRemove.length} elementi temporanei`)
    } catch (error) {
      console.warn("Errore nella pulizia storage:", error)
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

  // Aggiungi nuovo materiale con verifica
  addMaterial(material: Material): void {
    try {
      this.materials.push(material)
      this.saveToStorage()

      // Verifica che il materiale sia stato aggiunto
      const verification = this.materials.find((m) => m.id === material.id)
      if (!verification) {
        throw new Error("Materiale non aggiunto correttamente")
      }

      console.log(`✅ Materiale "${material.name}" aggiunto con successo`)
    } catch (error) {
      console.error("❌ Errore nell'aggiunta materiale:", error)
      throw error
    }
  }

  // Aggiorna materiale esistente con verifica
  updateMaterial(id: string, updates: Partial<Material>): boolean {
    try {
      const index = this.materials.findIndex((m) => m.id === id)
      if (index === -1) {
        console.warn(`⚠️ Materiale con ID ${id} non trovato`)
        return false
      }

      const originalMaterial = { ...this.materials[index] }
      this.materials[index] = { ...this.materials[index], ...updates }
      this.saveToStorage()

      // Verifica che l'aggiornamento sia stato salvato
      const verification = this.materials.find((m) => m.id === id)
      if (!verification || verification.gwpFactor === originalMaterial.gwpFactor) {
        // Se il GWP non è cambiato quando doveva cambiare, c'è un problema
        if (updates.gwpFactor && updates.gwpFactor !== originalMaterial.gwpFactor) {
          throw new Error("Aggiornamento non salvato correttamente")
        }
      }

      console.log(`✅ Materiale "${this.materials[index].name}" aggiornato con successo`)
      return true
    } catch (error) {
      console.error("❌ Errore nell'aggiornamento materiale:", error)
      return false
    }
  }

  // Rimuovi materiale con verifica
  removeMaterial(id: string): boolean {
    try {
      const index = this.materials.findIndex((m) => m.id === id)
      if (index === -1) {
        return false
      }

      const materialName = this.materials[index].name
      this.materials.splice(index, 1)
      this.saveToStorage()

      // Verifica che il materiale sia stato rimosso
      const verification = this.materials.find((m) => m.id === id)
      if (verification) {
        throw new Error("Materiale non rimosso correttamente")
      }

      console.log(`✅ Materiale "${materialName}" rimosso con successo`)
      return true
    } catch (error) {
      console.error("❌ Errore nella rimozione materiale:", error)
      return false
    }
  }

  // Cancella tutti i materiali
  clearAllMaterials(): void {
    try {
      this.materials = []
      this.saveToStorage()
      console.log("🗑️ Tutti i materiali sono stati cancellati")
    } catch (error) {
      console.error("❌ Errore nella cancellazione:", error)
      throw error
    }
  }

  // Ripristina i materiali di default
  resetToDefaults(): void {
    try {
      this.materials = [...MATERIALS_DATABASE]
      this.saveToStorage()
      console.log("🔄 Database ripristinato ai valori di default")
    } catch (error) {
      console.error("❌ Errore nel ripristino:", error)
      throw error
    }
  }

  // Importa materiali da array
  importMaterials(materials: Material[]): number {
    let importedCount = 0
    try {
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
          console.warn("Materiale non valido saltato:", material)
        }
      })

      if (importedCount > 0) {
        this.saveToStorage()
        console.log(`📥 Importati ${importedCount} materiali`)
      }
    } catch (error) {
      console.error("❌ Errore nell'importazione:", error)
    }

    return importedCount
  }

  // Esporta tutti i materiali
  exportMaterials(): Material[] {
    return [...this.materials]
  }

  // Metodi di diagnostica e manutenzione
  getStorageInfo(): {
    totalMaterials: number
    storageSize: number
    lastSaved: string | null
    hasBackup: boolean
    version: string | null
  } {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    const backup = localStorage.getItem(this.BACKUP_KEY)
    const version = localStorage.getItem(this.VERSION_KEY)

    let lastSaved = null
    if (backup) {
      try {
        const backupData = JSON.parse(backup)
        lastSaved = backupData.timestamp
      } catch {
        // Ignora errori di parsing
      }
    }

    return {
      totalMaterials: this.materials.length,
      storageSize: stored ? stored.length : 0,
      lastSaved,
      hasBackup: !!backup,
      version,
    }
  }

  // Verifica l'integrità dei dati
  verifyDataIntegrity(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return false

      const parsed = JSON.parse(stored)
      return this.validateMaterials(parsed) && parsed.length === this.materials.length
    } catch (error) {
      console.error("Verifica integrità fallita:", error)
      return false
    }
  }

  // Forza il salvataggio (per debug)
  forceSave(): boolean {
    try {
      this.saveToStorage()
      return this.verifyDataIntegrity()
    } catch (error) {
      console.error("Salvataggio forzato fallito:", error)
      return false
    }
  }
}
