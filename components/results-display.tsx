"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Download,
  RotateCcw,
  TrendingUp,
  PieChart,
  BarChart3,
  FileText,
  Share2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

interface ResultsDisplayProps {
  gwpResults: any
  onReset: () => void
}

export default function ResultsDisplay({ gwpResults, onReset }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("it-IT", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num)
  }

  const downloadReport = () => {
    // Simula download del report
    const reportData = {
      timestamp: new Date().toISOString(),
      gwpResults: gwpResults,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gwp-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getBenchmarkStatus = () => {
    if (gwpResults.totalGWP < gwpResults.benchmarks.best_practice) {
      return { status: "excellent", color: "green", icon: CheckCircle }
    } else if (gwpResults.totalGWP < gwpResults.benchmarks.industry_average) {
      return { status: "good", color: "yellow", icon: CheckCircle }
    } else {
      return { status: "needs_improvement", color: "red", icon: AlertTriangle }
    }
  }

  const benchmark = getBenchmarkStatus()
  const BenchmarkIcon = benchmark.icon

  return (
    <div className="space-y-6">
      {/* Header con azioni */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Risultati Calcolo GWP</h2>
          <p className="text-gray-600">Report completo del Global Warming Potential</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Scarica Report
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Condividi
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Nuovo Calcolo
          </Button>
        </div>
      </div>

      {/* Alert con status */}
      <Alert className={`border-${benchmark.color}-200 bg-${benchmark.color}-50`}>
        <BenchmarkIcon className={`h-4 w-4 text-${benchmark.color}-600`} />
        <AlertDescription>
          <strong>Status GWP:</strong> Il tuo progetto ha un impatto ambientale{" "}
          {benchmark.status === "excellent" && "eccellente - ben al di sotto delle best practice del settore"}
          {benchmark.status === "good" && "buono - in linea con le best practice del settore"}
          {benchmark.status === "needs_improvement" && "che necessita miglioramenti - sopra la media del settore"}
        </AlertDescription>
      </Alert>

      {/* Tabs per diverse visualizzazioni */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Panoramica
          </TabsTrigger>
          <TabsTrigger value="materials">
            <PieChart className="h-4 w-4 mr-2" />
            Materiali
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <BarChart3 className="h-4 w-4 mr-2" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <FileText className="h-4 w-4 mr-2" />
            Raccomandazioni
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metriche principali */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">GWP Totale</p>
                <p className="text-3xl font-bold text-red-600">{formatNumber(gwpResults.totalGWP)}</p>
                <p className="text-xs text-gray-500">t CO₂ equivalente</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">GWP per Tonnellata</p>
                <p className="text-3xl font-bold text-blue-600">{formatNumber(gwpResults.gwpPerTonne)}</p>
                <p className="text-xs text-gray-500">t CO₂eq per tonnellata</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <PieChart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Media Settore</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatNumber(gwpResults.benchmarks.industry_average)}
                </p>
                <p className="text-xs text-gray-500">t CO₂ equivalente</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div
                  className={`h-8 w-8 mx-auto mb-2 rounded-full flex items-center justify-center bg-${benchmark.color}-100`}
                >
                  <BenchmarkIcon className={`h-4 w-4 text-${benchmark.color}-600`} />
                </div>
                <p className="text-sm text-gray-600 mb-1">Performance</p>
                <p className={`text-2xl font-bold text-${benchmark.color}-600`}>
                  {Math.round((gwpResults.benchmarks.industry_average / gwpResults.totalGWP) * 100)}%
                </p>
                <p className="text-xs text-gray-500">vs media settore</p>
              </CardContent>
            </Card>
          </div>

          {/* Confronto benchmark */}
          <Card>
            <CardHeader>
              <CardTitle>Confronto con Benchmark del Settore</CardTitle>
              <CardDescription>
                Posizionamento del tuo progetto rispetto agli standard del settore navale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Best Practice</span>
                  <span className="text-sm text-green-600 font-medium">
                    {formatNumber(gwpResults.benchmarks.best_practice)} t CO₂eq
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "30%" }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Media Settore</span>
                  <span className="text-sm text-yellow-600 font-medium">
                    {formatNumber(gwpResults.benchmarks.industry_average)} t CO₂eq
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "50%" }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Il Tuo Progetto</span>
                  <span className={`text-sm font-medium text-${benchmark.color}-600`}>
                    {formatNumber(gwpResults.totalGWP)} t CO₂eq
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-${benchmark.color}-600 h-2 rounded-full`}
                    style={{
                      width: `${Math.min(100, (gwpResults.totalGWP / gwpResults.benchmarks.regulatory_limit) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Limite Normativo</span>
                  <span className="text-sm text-red-600 font-medium">
                    {formatNumber(gwpResults.benchmarks.regulatory_limit)} t CO₂eq
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analisi Dettagliata Materiali</CardTitle>
              <CardDescription>Impatto GWP di ogni materiale identificato nella documentazione</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gwpResults.materials.map((material: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{material.name}</h4>
                        <p className="text-sm text-gray-600">
                          {formatNumber(material.quantity)} {material.unit} × {material.gwpFactor} t CO₂eq/t
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{formatNumber(material.gwpTotal)} t CO₂eq</p>
                        <p className="text-sm text-gray-600">{formatNumber(material.percentage)}% del totale</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${material.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Breakdown Emissioni per Fase</CardTitle>
              <CardDescription>Distribuzione delle emissioni nelle diverse fasi del ciclo di vita</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(gwpResults.breakdown.production)}</p>
                    <p className="text-sm text-gray-600">Produzione Materiali</p>
                    <p className="text-xs text-gray-500">75% del totale</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{formatNumber(gwpResults.breakdown.transport)}</p>
                    <p className="text-sm text-gray-600">Trasporto</p>
                    <p className="text-xs text-gray-500">15% del totale</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatNumber(gwpResults.breakdown.processing)}
                    </p>
                    <p className="text-sm text-gray-600">Lavorazione</p>
                    <p className="text-xs text-gray-500">10% del totale</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Produzione Materiali</span>
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Trasporto</span>
                      <span className="text-sm text-gray-600">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-orange-600 h-3 rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Lavorazione</span>
                      <span className="text-sm text-gray-600">10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-purple-600 h-3 rounded-full" style={{ width: "10%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Raccomandazioni per la Riduzione del GWP</CardTitle>
              <CardDescription>Suggerimenti specifici per migliorare l'impatto ambientale del progetto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Priorità Alta:</strong> Sostituire l'alluminio con leghe più sostenibili potrebbe ridurre il
                    GWP di circa 15-20%.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Priorità Media:</strong> Ottimizzare la logistica di trasporto dei materiali per ridurre le
                    emissioni del 5-8%.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Priorità Bassa:</strong> Considerare materiali riciclati dove possibile per un ulteriore
                    miglioramento del 3-5%.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Potenziale di Miglioramento</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Implementando tutte le raccomandazioni, il GWP potrebbe essere ridotto a:
                </p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(gwpResults.totalGWP * 0.72)} t CO₂eq</p>
                <p className="text-sm text-gray-600">Una riduzione del 28% rispetto al valore attuale</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
