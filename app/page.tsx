"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Calculator, Download, Ship, Settings, CheckCircle } from "lucide-react"
import FileUploader from "@/components/file-uploader"
import DocumentProcessor from "@/components/document-processor"
import ParsingValidation from "@/components/parsing-validation"
import GWPCalculator from "@/components/gwp-calculator"
import ResultsDisplay from "@/components/results-display"
import MaterialsManager from "@/components/materials-manager"

export default function LightshipweightGWPTool() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processedData, setProcessedData] = useState<any>(null)
  const [validatedData, setValidatedData] = useState<any>(null)
  const [gwpResults, setGWPResults] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState("calculator")

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files)
    setCurrentStep(2)
  }

  const handleDataProcessed = (data: any) => {
    setProcessedData(data)
    setCurrentStep(3)
  }

  const handleValidationComplete = (data: any) => {
    setValidatedData(data)
    setCurrentStep(4)
  }

  const handleGWPCalculated = (results: any) => {
    setGWPResults(results)
    setCurrentStep(5)
  }

  const resetTool = () => {
    setUploadedFiles([])
    setProcessedData(null)
    setValidatedData(null)
    setGWPResults(null)
    setCurrentStep(1)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ship className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Lightshipweight GWP Calculator</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your shipyard's lightshipweight documentation and automatically calculate the Global Warming
            Potential (GWP) from cradle to shipyard phase
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              GWP Calculator
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Materials Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    1
                  </div>
                  <span className={`text-sm ${currentStep >= 1 ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                    Upload
                  </span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                  <span className={`text-sm ${currentStep >= 2 ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                    Processing
                  </span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${Math.max(0, ((currentStep - 2) / 4) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    3
                  </div>
                  <span className={`text-sm ${currentStep >= 3 ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                    Validation
                  </span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${Math.max(0, ((currentStep - 3) / 4) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 4 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    4
                  </div>
                  <span className={`text-sm ${currentStep >= 4 ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                    GWP Calculation
                  </span>
                </div>
                <div className="flex-1 h-1 bg-gray-200 mx-4">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${Math.max(0, ((currentStep - 4) / 4) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 5 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    5
                  </div>
                  <span className={`text-sm ${currentStep >= 5 ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                    Results
                  </span>
                </div>
              </div>
            </div>

            {/* Calculator Content */}
            <Tabs value={currentStep.toString()} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="1" disabled={currentStep < 1}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="2" disabled={currentStep < 2}>
                  <FileText className="h-4 w-4 mr-2" />
                  Processing
                </TabsTrigger>
                <TabsTrigger value="3" disabled={currentStep < 3}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validation
                </TabsTrigger>
                <TabsTrigger value="4" disabled={currentStep < 4}>
                  <Calculator className="h-4 w-4 mr-2" />
                  GWP Calculation
                </TabsTrigger>
                <TabsTrigger value="5" disabled={currentStep < 5}>
                  <Download className="h-4 w-4 mr-2" />
                  Results
                </TabsTrigger>
              </TabsList>

              <TabsContent value="1" className="mt-6">
                <FileUploader onFilesUploaded={handleFilesUploaded} uploadedFiles={uploadedFiles} />
              </TabsContent>

              <TabsContent value="2" className="mt-6">
                <DocumentProcessor
                  files={uploadedFiles}
                  onDataProcessed={handleDataProcessed}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              </TabsContent>

              <TabsContent value="3" className="mt-6">
                {processedData && (
                  <ParsingValidation parsedDocuments={processedData} onValidationComplete={handleValidationComplete} />
                )}
              </TabsContent>

              <TabsContent value="4" className="mt-6">
                <GWPCalculator processedData={validatedData} onGWPCalculated={handleGWPCalculated} />
              </TabsContent>

              <TabsContent value="5" className="mt-6">
                {gwpResults ? (
                  <ResultsDisplay gwpResults={gwpResults} onReset={resetTool} />
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">GWP calculation not completed</h3>
                    <p className="text-gray-600">Complete the previous steps to view results</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Info Card */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Supported Formats
                </CardTitle>
                <CardDescription>The tool supports various lightshipweight documentation formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">PDF Documents</h4>
                    <p className="text-sm text-gray-600">Certificates, technical reports, material specifications</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Excel/CSV Files</h4>
                    <p className="text-sm text-gray-600">Material tables, weight calculations, inventories</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Custom Formats</h4>
                    <p className="text-sm text-gray-600">Adaptable to specific shipyard formats</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <MaterialsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
