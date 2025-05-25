"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Cog, CheckCircle } from "lucide-react"

interface DocumentProcessorProps {
  files: File[]
  onDataProcessed: (data: any) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

export default function DocumentProcessor({
  files,
  onDataProcessed,
  isProcessing,
  setIsProcessing,
}: DocumentProcessorProps) {
  const [progress, setProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState("")
  const [extractedData, setExtractedData] = useState<any>(null)
  const [processingSteps, setProcessingSteps] = useState<string[]>([])

  const simulateProcessing = async () => {
    setIsProcessing(true)
    setProgress(0)
    setProcessingSteps([])

    const steps = [
      "Analisi formato documenti...",
      "Estrazione testo e tabelle...",
      "Identificazione materiali...",
      "Calcolo pesi e quantità...",
      "Mappatura dati GWP...",
      "Validazione risultati...",
    ]

    for (let i = 0; i < steps.length; i++) {
      setProcessingSteps((prev) => [...prev, steps[i]])
      setProgress(((i + 1) / steps.length) * 100)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    // Simula dati estratti
    const mockData = {
      materials: [
        { name: "Acciaio al carbonio", quantity: 1250, unit: "tonnellate", gwpFactor: 2.1 },
        { name: "Alluminio", quantity: 85, unit: "tonnellate", gwpFactor: 8.9 },
        { name: "Rame", quantity: 45, unit: "tonnellate", gwpFactor: 3.2 },
        { name: "Fibra di vetro", quantity: 120, unit: "tonnellate", gwpFactor: 1.8 },
        { name: "Vernici e rivestimenti", quantity: 25, unit: "tonnellate", gwpFactor: 4.5 },
      ],
      totalWeight: 1525,
      documentInfo: {
        shipType: "Yacht da crociera",
        length: "65m",
        displacement: "1800 tonnellate",
        cantiere: files[0]?.name.split(".")[0] || "Cantiere",
      },
    }

    setExtractedData(mockData)
    setIsProcessing(false)
  }

  const handleProceed = () => {
    if (extractedData) {
      onDataProcessed(extractedData)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog className="h-5 w-5" />
            Elaborazione Documenti
          </CardTitle>
          <CardDescription>Analisi e estrazione dati dai documenti caricati</CardDescription>
        </CardHeader>
        <CardContent>
          {!isProcessing && !extractedData && (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Pronto per l'elaborazione</h3>
              <p className="text-gray-600 mb-6">
                {files.length} file{"(s)"} pronti per essere analizzati
              </p>
              <Button onClick={simulateProcessing} size="lg">
                Avvia Elaborazione
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progresso elaborazione</span>
                  <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="space-y-2">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {extractedData && !isProcessing && (
            <div className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Elaborazione completata con successo! Dati estratti da {files.length} documento/i.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informazioni Imbarcazione</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">{extractedData.documentInfo.shipType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lunghezza:</span>
                      <span className="font-medium">{extractedData.documentInfo.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dislocamento:</span>
                      <span className="font-medium">{extractedData.documentInfo.displacement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso totale:</span>
                      <span className="font-medium">{extractedData.totalWeight} tonnellate</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Materiali Identificati</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {extractedData.materials.slice(0, 3).map((material: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{material.name}:</span>
                          <span className="font-medium">
                            {material.quantity} {material.unit}
                          </span>
                        </div>
                      ))}
                      <div className="text-xs text-gray-500 pt-2">
                        +{extractedData.materials.length - 3} altri materiali
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProceed} size="lg">
                  Procedi al Calcolo GWP
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">File in Elaborazione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-2 border rounded">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{file.name}</span>
                  {extractedData && <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
