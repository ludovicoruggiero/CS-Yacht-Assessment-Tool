import { MaterialsDatabase, type Material } from "./materials-database"
import { PCRCategorizer, type PCRCategory } from "./pcr-categories"
import { ExcelParser } from "./excel-parser"

export interface ParsedMaterial {
  originalText: string
  material: Material | null
  quantity: number
  unit: string
  confidence: number
  lineNumber?: number
  context?: string
  pcrCategory?: PCRCategory | null
  categoryConfidence?: number
}

export interface ParsedDocument {
  fileName: string
  materials: ParsedMaterial[]
  totalWeight: number
  categoryBreakdown: {
    [categoryId: string]: {
      category: PCRCategory
      materials: ParsedMaterial[]
      totalWeight: number
    }
  }
  metadata: {
    shipType?: string
    length?: string
    displacement?: string
    cantiere?: string
    parseDate: Date
  }
}

export class DocumentParser {
  private materialsDb: MaterialsDatabase
  private excelParser: ExcelParser
  private pcrCategorizer: PCRCategorizer

  constructor() {
    this.materialsDb = new MaterialsDatabase()
    this.excelParser = new ExcelParser()
    this.pcrCategorizer = new PCRCategorizer()
  }

  async parseFile(file: File): Promise<ParsedDocument> {
    const text = await this.extractTextFromFile(file)
    return this.parseText(text, file.name)
  }

  // Metodo pubblico per test
  async parseText(text: string, fileName: string): Promise<ParsedDocument> {
    return this.parseTextInternal(text, fileName)
  }

  private async extractTextFromFile(file: File): Promise<string> {
    const fileExtension = file.name.toLowerCase().split(".").pop()

    try {
      switch (fileExtension) {
        case "txt":
          return await file.text()
        case "csv":
          return await this.excelParser.parseExcelFile(file)
        case "xlsx":
        case "xls":
          return await this.excelParser.parseExcelFile(file)
        default:
          return await file.text()
      }
    } catch (error) {
      console.error("Errore nell'estrazione del testo:", error)
      throw error
    }
  }

  private parseTextInternal(text: string, fileName: string): ParsedDocument {
    const lines = text.split("\n")
    const materials: ParsedMaterial[] = []
    let totalWeight = 0
    let currentCategory: PCRCategory | null = null

    // Pattern per riconoscere i codici PCR formato standard cantieri
    const pcrCodePattern = /^(HS|MP|SS|SE|IS|DE|PA)\s*[–-]\s*(.+)/i

    // Pattern per riconoscere i nomi completi dei macrogruppi (NUOVO)
    const pcrNamePattern =
      /^(Hull and Structures|Machinery and Propulsion|Ship Systems|Ship Electrical Systems and Electronics|Insulation and Fitting Structures|Deck Machinery and Equipment|Paintings)$/i

    // Pattern per materiali con peso
    const materialPatterns = [
      // Pattern: "Material name peso unità"
      /^(.+?)\s+([0-9]+(?:[,.][0-9]+)?)\s*(t|kg|tonnes?|tons?)\s*$/i,
      // Pattern: "Material: peso unità"
      /^(.+?):\s*([0-9]+(?:[,.][0-9]+)?)\s*(t|kg|tonnes?|tons?)\s*$/i,
    ]

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.length < 3) return

      // Controlla se è un codice PCR formato standard cantieri
      const pcrMatch = trimmedLine.match(pcrCodePattern)
      if (pcrMatch) {
        const pcrCode = pcrMatch[1].toUpperCase()
        const categoryName = pcrMatch[2]

        // Mappa i codici PCR alle categorie
        const categoryMap: { [key: string]: string } = {
          HS: "hull_structures",
          MP: "machinery_propulsion",
          SS: "ship_systems",
          SE: "electrical_electronics",
          IS: "insulation_fitting",
          DE: "deck_machinery",
          PA: "paintings",
        }

        const categoryId = categoryMap[pcrCode]
        if (categoryId) {
          currentCategory = this.pcrCategorizer.getCategoryById(categoryId)
        }
        return
      }

      // NUOVO: Controlla se è un nome completo di macrogruppo PCR
      const pcrNameMatch = trimmedLine.match(pcrNamePattern)
      if (pcrNameMatch) {
        const categoryName = pcrNameMatch[1]

        // Mappa i nomi completi alle categorie
        const nameMap: { [key: string]: string } = {
          "Hull and Structures": "hull_structures",
          "Machinery and Propulsion": "machinery_propulsion",
          "Ship Systems": "ship_systems",
          "Ship Electrical Systems and Electronics": "electrical_electronics",
          "Insulation and Fitting Structures": "insulation_fitting",
          "Deck Machinery and Equipment": "deck_machinery",
          Paintings: "paintings",
        }

        const categoryId = nameMap[categoryName]
        if (categoryId) {
          currentCategory = this.pcrCategorizer.getCategoryById(categoryId)
          console.log(`Riconosciuto macrogruppo: ${categoryName} -> ${currentCategory?.code}`)
        }
        return
      }

      // Salta header
      if (this.isHeaderLine(trimmedLine)) return

      // Prova a fare il match con i pattern dei materiali
      for (const pattern of materialPatterns) {
        const match = trimmedLine.match(pattern)
        if (match) {
          const materialName = this.cleanMaterialName(match[1])
          const quantityStr = match[2].replace(",", ".") // Converti virgola europea in punto
          const unit = match[3] || "t"

          const quantity = Number.parseFloat(quantityStr)
          if (isNaN(quantity) || quantity <= 0) continue

          const normalizedUnit = this.normalizeUnit(unit)
          const quantityInKg = this.convertToKg(quantity, normalizedUnit)

          // Cerca il materiale nel database
          const material = this.materialsDb.findMaterial(materialName)

          const parsedMaterial: ParsedMaterial = {
            originalText: trimmedLine,
            material: material,
            quantity: quantityInKg,
            unit: "kg",
            confidence: material ? this.calculateConfidence(materialName, material) : 0,
            lineNumber: index + 1,
            context: this.getContext(lines, index),
            pcrCategory: currentCategory,
            categoryConfidence: currentCategory ? 0.9 : 0,
          }

          materials.push(parsedMaterial)
          totalWeight += quantityInKg
          break
        }
      }
    })

    // Crea il breakdown per categoria
    const categoryBreakdown: { [categoryId: string]: any } = {}

    materials.forEach((material) => {
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

    const metadata = this.extractMetadata(text, fileName)

    return {
      fileName,
      materials,
      totalWeight,
      categoryBreakdown,
      metadata,
    }
  }

  private isHeaderLine(line: string): boolean {
    const headerKeywords = ["macrogruppo", "materiale", "peso", "unità", "material", "weight", "category"]

    const lowerLine = line.toLowerCase()
    return headerKeywords.some((keyword) => lowerLine.includes(keyword)) && !/[0-9]/.test(line)
  }

  private cleanMaterialName(name: string): string {
    return name
      .replace(/[^\w\s()-]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  private normalizeUnit(unit: string): string {
    const unitLower = unit.toLowerCase()
    if (unitLower.includes("tonne") || unitLower.includes("ton") || unitLower === "t") {
      return "tonnes"
    }
    return "kg"
  }

  private convertToKg(quantity: number, unit: string): number {
    switch (unit) {
      case "tonnes":
        return quantity * 1000
      case "kg":
        return quantity
      default:
        return quantity * 1000 // Default assume tonnellate
    }
  }

  private calculateConfidence(searchTerm: string, material: Material): number {
    const term = searchTerm.toLowerCase()

    if (material.name.toLowerCase() === term) return 1.0
    if (material.aliases.some((alias) => alias.toLowerCase() === term)) return 0.95
    if (material.name.toLowerCase().includes(term) || term.includes(material.name.toLowerCase())) {
      return 0.8
    }
    if (material.aliases.some((alias) => alias.toLowerCase().includes(term) || term.includes(alias.toLowerCase()))) {
      return 0.7
    }

    return 0.5
  }

  private getContext(lines: string[], currentIndex: number): string {
    const start = Math.max(0, currentIndex - 2)
    const end = Math.min(lines.length, currentIndex + 3)
    return lines.slice(start, end).join(" | ")
  }

  private extractMetadata(text: string, fileName: string) {
    return {
      cantiere: fileName.split(".")[0],
      parseDate: new Date(),
    }
  }

  getParsingStats(parsedDoc: ParsedDocument) {
    const totalMaterials = parsedDoc.materials.length
    const identifiedMaterials = parsedDoc.materials.filter((m) => m.material !== null).length
    const categorizedMaterials = parsedDoc.materials.filter((m) => m.pcrCategory !== null).length
    const highConfidenceMaterials = parsedDoc.materials.filter((m) => m.confidence > 0.8).length

    return {
      totalMaterials,
      identifiedMaterials,
      categorizedMaterials,
      unidentifiedMaterials: totalMaterials - identifiedMaterials,
      uncategorizedMaterials: totalMaterials - categorizedMaterials,
      identificationRate: totalMaterials > 0 ? (identifiedMaterials / totalMaterials) * 100 : 0,
      categorizationRate: totalMaterials > 0 ? (categorizedMaterials / totalMaterials) * 100 : 0,
      highConfidenceRate: totalMaterials > 0 ? (highConfidenceMaterials / totalMaterials) * 100 : 0,
      averageConfidence:
        totalMaterials > 0 ? parsedDoc.materials.reduce((sum, m) => sum + m.confidence, 0) / totalMaterials : 0,
    }
  }
}
