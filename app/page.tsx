"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Calculator, Download, Ship } from "lucide-react"
import FileUploader from "@/components/file-uploader"
import DocumentProcessor from "@/components/document-processor"
import GWPCalculator from "@/components/gwp-calculator"
import ResultsDisplay from "@/components/results-display"

export default function LightshipweightGWPTool() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processedData, setProcessedData] = useState<any>(null)
  const [gwpResults, setGWPResults] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files)
    setCurrentStep(2)
  }

  const handleDataProcessed = (data: any) => {
    setProcessedData(data)
    setCurrentStep(3)
  }

  const handleGWPCalculated = (results: any) => {
    setGWPResults(results)
    setCurrentStep(4)
  }

  const resetTool = () => {
    setUploadedFiles([])
    setProcessedData(null)
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
            Carica la documentazione lightshipweight del tuo cantiere e ottieni automaticamente il calcolo del Global
            Warming Potential (GWP)
          </p>
        </div>

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
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
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
                Elaborazione
              </span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${Math.max(0, ((currentStep - 2) / 3) * 100)}%` }}
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
                Calcolo GWP
              </span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${Math.max(0, ((currentStep - 3) / 3) * 100)}%` }}
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
                Risultati
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={currentStep.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="1" disabled={currentStep < 1}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Documenti
            </TabsTrigger>
            <TabsTrigger value="2" disabled={currentStep < 2}>
              <FileText className="h-4 w-4 mr-2" />
              Elaborazione
            </TabsTrigger>
            <TabsTrigger value="3" disabled={currentStep < 3}>
              <Calculator className="h-4 w-4 mr-2" />
              Calcolo GWP
            </TabsTrigger>
            <TabsTrigger value="4" disabled={currentStep < 4}>
              <Download className="h-4 w-4 mr-2" />
              Risultati
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
            <GWPCalculator processedData={processedData} onGWPCalculated={handleGWPCalculated} />
          </TabsContent>

          <TabsContent value="4" className="mt-6">
            <ResultsDisplay gwpResults={gwpResults} onReset={resetTool} />
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Formati Supportati
            </CardTitle>
            <CardDescription>Il tool supporta diversi formati di documentazione lightshipweight</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Documenti PDF</h4>
                <p className="text-sm text-gray-600">Certificati, report tecnici, specifiche materiali</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Fogli Excel/CSV</h4>
                <p className="text-sm text-gray-600">Tabelle materiali, calcoli peso, inventari</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Formati Personalizzati</h4>
                <p className="text-sm text-gray-600">Adattabile ai formati specifici di ogni cantiere</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
