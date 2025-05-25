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
  HelpCircle,
  Package,
  Target,
} from "lucide-react"
import type { GWPCalculation } from "@/lib/gwp-calculator"

interface ResultsDisplayProps {
  gwpResults: GWPCalculation
  onReset: () => void
}

export default function ResultsDisplay({ gwpResults, onReset }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Add null check
  if (!gwpResults) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results available</h3>
          <p className="text-gray-600 mb-4">Complete the GWP calculation to view results</p>
          <Button onClick={onReset}>Return to Start</Button>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(num)
  }

  const downloadReport = () => {
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
    if (!gwpResults || !gwpResults.totalGWP || !gwpResults.benchmarks) {
      return { status: "unknown", color: "gray", icon: HelpCircle }
    }

    if (gwpResults.totalGWP < gwpResults.benchmarks.best_practice) {
      return { status: "excellent", color: "green", icon: CheckCircle }
    } else if (gwpResults.totalGWP < gwpResults.benchmarks.industry_average) {
      return { status: "good", color: "yellow", icon: CheckCircle }
    } else {
      return { status: "needs_improvement", color: "red", icon: AlertTriangle }
    }
  }

  // Get macro-group analysis
  const getMacroGroupAnalysis = () => {
    const macroGroups: {
      [key: string]: { name: string; code: string; totalGWP: number; materials: any[]; percentage: number }
    } = {}

    gwpResults.results.forEach((result) => {
      if (result.material.pcrCategory) {
        const categoryId = result.material.pcrCategory.id
        if (!macroGroups[categoryId]) {
          macroGroups[categoryId] = {
            name: result.material.pcrCategory.name,
            code: result.material.pcrCategory.code,
            totalGWP: 0,
            materials: [],
            percentage: 0,
          }
        }
        macroGroups[categoryId].totalGWP += result.gwpTotal
        macroGroups[categoryId].materials.push(result)
      }
    })

    // Calculate percentages
    Object.values(macroGroups).forEach((group) => {
      group.percentage = gwpResults.totalGWP > 0 ? (group.totalGWP / gwpResults.totalGWP) * 100 : 0
    })

    // Sort by impact
    return Object.entries(macroGroups)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalGWP - a.totalGWP)
  }

  const macroGroupAnalysis = getMacroGroupAnalysis()
  const benchmark = getBenchmarkStatus()
  const BenchmarkIcon = benchmark.icon

  // Color scheme for macro-groups
  const getColorForIndex = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-indigo-500",
      "bg-pink-500",
    ]
    return colors[index % colors.length]
  }

  const getTextColorForIndex = (index: number) => {
    const colors = [
      "text-blue-600",
      "text-green-600",
      "text-yellow-600",
      "text-red-600",
      "text-purple-600",
      "text-indigo-600",
      "text-pink-600",
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">GWP Calculation Results</h2>
          <p className="text-gray-600">Complete Global Warming Potential report with macro-group analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            New Calculation
          </Button>
        </div>
      </div>

      {/* Alert with status */}
      <Alert className={`border-${benchmark.color}-200 bg-${benchmark.color}-50`}>
        <BenchmarkIcon className={`h-4 w-4 text-${benchmark.color}-600`} />
        <AlertDescription>
          <strong>GWP Status:</strong> Your project has an environmental impact that is{" "}
          {benchmark.status === "excellent" && "excellent - well below industry best practices"}
          {benchmark.status === "good" && "good - in line with industry best practices"}
          {benchmark.status === "needs_improvement" && "needs improvement - above industry average"}
        </AlertDescription>
      </Alert>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="macrogroups">
            <Package className="h-4 w-4 mr-2" />
            Macro-Groups
          </TabsTrigger>
          <TabsTrigger value="materials">
            <PieChart className="h-4 w-4 mr-2" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <BarChart3 className="h-4 w-4 mr-2" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <FileText className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Main metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Total GWP</p>
                <p className="text-3xl font-bold text-red-600">{formatNumber(gwpResults.totalGWP / 1000)}</p>
                <p className="text-xs text-gray-500">t CO₂ equivalent</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">GWP per Tonne</p>
                <p className="text-3xl font-bold text-blue-600">{formatNumber(gwpResults.gwpPerTonne / 1000)}</p>
                <p className="text-xs text-gray-500">t CO₂eq per tonne</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Macro-Groups</p>
                <p className="text-3xl font-bold text-green-600">{macroGroupAnalysis.length}</p>
                <p className="text-xs text-gray-500">PCR categories</p>
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
                <p className="text-xs text-gray-500">vs industry average</p>
              </CardContent>
            </Card>
          </div>

          {/* Benchmark comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmark Comparison</CardTitle>
              <CardDescription>Your project's position relative to maritime industry standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Best Practice</span>
                  <span className="text-sm text-green-600 font-medium">
                    {formatNumber(gwpResults.benchmarks.best_practice / 1000)} t CO₂eq
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "30%" }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Industry Average</span>
                  <span className="text-sm text-yellow-600 font-medium">
                    {formatNumber(gwpResults.benchmarks.industry_average / 1000)} t CO₂eq
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "50%" }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Your Project</span>
                  <span className={`text-sm font-medium text-${benchmark.color}-600`}>
                    {formatNumber(gwpResults.totalGWP / 1000)} t CO₂eq
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
                  <span className="text-sm font-medium">Regulatory Limit</span>
                  <span className="text-sm text-red-600 font-medium">
                    {formatNumber(gwpResults.benchmarks.regulatory_limit / 1000)} t CO₂eq
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="macrogroups" className="space-y-6">
          {/* Macro-group impact visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                PCR Macro-Group Impact Analysis
              </CardTitle>
              <CardDescription>
                Visual representation of how each PCR macro-group contributes to the total GWP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Visual pie chart representation */}
                <div className="flex justify-center">
                  <div className="relative w-64 h-64">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {macroGroupAnalysis.map((group, index) => {
                        const startAngle = macroGroupAnalysis
                          .slice(0, index)
                          .reduce((sum, g) => sum + (g.percentage / 100) * 360, 0)
                        const endAngle = startAngle + (group.percentage / 100) * 360
                        const largeArcFlag = group.percentage > 50 ? 1 : 0

                        const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180)
                        const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180)
                        const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180)
                        const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180)

                        const pathData = [
                          `M 100 100`,
                          `L ${x1} ${y1}`,
                          `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          `Z`,
                        ].join(" ")

                        const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6366F1", "#EC4899"]

                        return (
                          <path
                            key={group.id}
                            d={pathData}
                            fill={colors[index % colors.length]}
                            stroke="white"
                            strokeWidth="2"
                            className="hover:opacity-80 transition-opacity"
                          />
                        )
                      })}
                    </svg>
                  </div>
                </div>

                {/* Legend and details */}
                <div className="grid md:grid-cols-2 gap-4">
                  {macroGroupAnalysis.map((group, index) => (
                    <Card key={group.id} className="relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getColorForIndex(index)}`} />
                      <CardContent className="p-4 pl-6">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{group.code}</span>
                              <span className="font-medium text-sm">{group.name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${getTextColorForIndex(index)}`}>
                              {formatNumber(group.totalGWP / 1000)}t
                            </div>
                            <div className="text-xs text-gray-500">{group.percentage.toFixed(1)}% of total</div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full ${getColorForIndex(index)}`}
                            style={{ width: `${Math.min(100, group.percentage)}%` }}
                          />
                        </div>

                        <div className="text-xs text-gray-600">
                          {group.materials.length} materials • Avg:{" "}
                          {formatNumber(group.totalGWP / group.materials.length / 1000)}t per material
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Impact ranking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Impact Ranking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {macroGroupAnalysis.map((group, index) => (
                        <div key={group.id} className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{group.code}</span>
                              <span className="font-medium">{group.name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${getTextColorForIndex(index)}`}>
                              {formatNumber(group.totalGWP / 1000)}t CO₂eq
                            </div>
                            <div className="text-xs text-gray-500">{group.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Materials Analysis</CardTitle>
              <CardDescription>GWP impact of each material identified in the documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gwpResults.results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">
                          {result.material.material?.name || result.material.originalText}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatNumber(result.material.quantity / 1000)} t ×{" "}
                          {result.material.material?.gwpFactor || "2.5"} kg CO₂eq/kg
                        </p>
                        {result.material.pcrCategory && (
                          <p className="text-xs text-blue-600 mt-1">
                            {result.material.pcrCategory.code} - {result.material.pcrCategory.name}
                          </p>
                        )}
                        {result.material.confidence < 0.8 && (
                          <p className="text-xs text-yellow-600">
                            Confidence: {Math.round(result.material.confidence * 100)}%
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{formatNumber(result.gwpTotal / 1000)} t CO₂eq</p>
                        <p className="text-sm text-gray-600">{formatNumber(result.percentage)}% of total</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, result.percentage)}%` }}
                      />
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
              <CardTitle>Emissions Breakdown by Phase</CardTitle>
              <CardDescription>Distribution of emissions across different lifecycle phases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(gwpResults.breakdown.production / 1000)}
                    </p>
                    <p className="text-sm text-gray-600">Material Production</p>
                    <p className="text-xs text-gray-500">75% of total</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {formatNumber(gwpResults.breakdown.transport / 1000)}
                    </p>
                    <p className="text-sm text-gray-600">Transportation</p>
                    <p className="text-xs text-gray-500">15% of total</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatNumber(gwpResults.breakdown.processing / 1000)}
                    </p>
                    <p className="text-sm text-gray-600">Processing</p>
                    <p className="text-xs text-gray-500">10% of total</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Material Production</span>
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Transportation</span>
                      <span className="text-sm text-gray-600">15%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-orange-600 h-3 rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Processing</span>
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
              <CardTitle>GWP Reduction Recommendations</CardTitle>
              <CardDescription>Specific suggestions to improve the project's environmental impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gwpResults.stats.identificationRate < 80 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>High Priority:</strong> Improve material documentation. Only{" "}
                      {gwpResults.stats.identificationRate.toFixed(1)}% of materials were correctly identified.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Macro-group specific recommendations */}
                {macroGroupAnalysis.slice(0, 3).map((group, index) => (
                  <Alert key={group.id}>
                    <Package className="h-4 w-4" />
                    <AlertDescription>
                      <strong>
                        {group.code} - {group.name}:
                      </strong>{" "}
                      This macro-group contributes {group.percentage.toFixed(1)}% ({formatNumber(group.totalGWP / 1000)}
                      t CO₂eq) of total GWP. Consider optimizing materials in this category for maximum impact
                      reduction.
                    </AlertDescription>
                  </Alert>
                ))}

                {gwpResults.results
                  .slice(0, 3)
                  .filter((r) => r.material.material)
                  .map((result, index) => (
                    <Alert key={index}>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Material #{index + 1}:</strong> {result.material.material?.name} contributes{" "}
                        {result.percentage.toFixed(1)}% of total GWP. Consider more sustainable alternatives.
                      </AlertDescription>
                    </Alert>
                  ))}

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>General:</strong> Consider recycled materials where possible to reduce overall environmental
                    impact.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Identification Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Identified materials:</p>
                    <p className="font-bold">{gwpResults.stats.identifiedMaterials}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Unidentified materials:</p>
                    <p className="font-bold">{gwpResults.stats.unidentifiedMaterials}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Identification rate:</p>
                    <p className="font-bold">{gwpResults.stats.identificationRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total weight:</p>
                    <p className="font-bold">{formatNumber(gwpResults.stats.totalWeight / 1000)} t</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
