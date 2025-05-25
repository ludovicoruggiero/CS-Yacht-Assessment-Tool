"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, TrendingUp, CheckCircle, Info } from "lucide-react"

interface GWPCalculatorProps {
  processedData: any
  onGWPCalculated: (results: any) => void
}

export default function GWPCalculator({ processedData, onGWPCalculated }: GWPCalculatorProps) {
  const [isCalculating, setIsCalculating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [gwpResults, setGWPResults] = useState<any>(null)
  const [calculationSteps, setCalculationSteps] = useState<string[]>([])

  const calculateGWP = async () => {
    setIsCalculating(true)
    setProgress(0)
    setCalculationSteps([])

    const steps = [
      "Caricamento database fattori GWP...",
      "Calcolo emissioni per materiale...",
      "Applicazione fattori di trasporto...",
      "Calcolo emissioni di produzione...",
      "Aggregazione risultati totali...",
      "Generazione report finale...",
    ]

    for (let i = 0; i < steps.length; i++) {
      setCalculationSteps((prev) => [...prev, steps[i]])
      setProgress(((i + 1) / steps.length) * 100)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Calcolo GWP simulato
    const materialResults = processedData.materials.map((material: any) => ({
      ...material,
      gwpTotal: material.quantity * material.gwpFactor,
      percentage: 0, // Calcolato dopo
    }))

    const totalGWP = materialResults.reduce((sum: number, material: any) => sum + material.gwpTotal, 0)

    // Calcola percentuali
    materialResults.forEach((material: any) => {
      material.percentage = (material.gwpTotal / totalGWP) * 100
    })

    const results = {
      totalGWP: totalGWP,
      gwpPerTonne: totalGWP / processedData.totalWeight,
      materials: materialResults.sort((a: any, b: any) => b.gwpTotal - a.gwpTotal),
      breakdown: {
        production: totalGWP * 0.75,
        transport: totalGWP * 0.15,
        processing: totalGWP * 0.1,
      },
      benchmarks: {
        industry_average: 2850,
        best_practice: 2200,
        regulatory_limit: 3500,
      },
    }

    setGWPResults(results)
    setIsCalculating(false)
  }

  const handleProceed = () => {
    if (gwpResults) {
      onGWPCalculated(gwpResults)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("it-IT", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calcolo Global Warming Potential (GWP)
          </CardTitle>
          <CardDescription>
            Calcolo delle emissioni di CO₂ equivalente basato sui materiali identificati
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isCalculating && !gwpResults && (
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Il calcolo utilizzerà i fattori GWP standard per i materiali identificati. I risultati sono espressi
                  in tonnellate di CO₂ equivalente.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Materiali da Calcolare</h4>
                  <p className="text-2xl font-bold text-blue-600">{processedData?.materials?.length || 0}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Peso Totale</h4>
                  <p className="text-2xl font-bold text-blue-600">{processedData?.totalWeight || 0} t</p>
                </div>
              </div>

              <div className="text-center">
                <Button onClick={calculateGWP} size="lg" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Avvia Calcolo GWP
                </Button>
              </div>
            </div>
          )}

          {isCalculating && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progresso calcolo</span>
                  <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="space-y-2">
                {calculationSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gwpResults && !isCalculating && (
            <div className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Calcolo GWP completato! Il Global Warming Potential totale è stato calcolato considerando tutti i
                  materiali identificati.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">GWP Totale</p>
                    <p className="text-2xl font-bold text-red-600">{formatNumber(gwpResults.totalGWP)} t CO₂eq</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">GWP per Tonnellata</p>
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(gwpResults.gwpPerTonne)} t CO₂eq/t</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div
                      className={`h-8 w-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        gwpResults.totalGWP < gwpResults.benchmarks.best_practice
                          ? "bg-green-100 text-green-600"
                          : gwpResults.totalGWP < gwpResults.benchmarks.industry_average
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-gray-600">Benchmark</p>
                    <p
                      className={`text-lg font-bold ${
                        gwpResults.totalGWP < gwpResults.benchmarks.best_practice
                          ? "text-green-600"
                          : gwpResults.totalGWP < gwpResults.benchmarks.industry_average
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {gwpResults.totalGWP < gwpResults.benchmarks.best_practice
                        ? "Eccellente"
                        : gwpResults.totalGWP < gwpResults.benchmarks.industry_average
                          ? "Buono"
                          : "Da Migliorare"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top 5 Materiali per Impatto GWP</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gwpResults.materials.slice(0, 5).map((material: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">{material.name}</span>
                            <span className="text-sm text-gray-600">{formatNumber(material.gwpTotal)} t CO₂eq</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${material.percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatNumber(material.percentage)}% del totale
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleProceed} size="lg">
                  Visualizza Risultati Completi
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
