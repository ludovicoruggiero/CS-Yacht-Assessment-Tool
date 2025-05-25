"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, X, CheckCircle } from "lucide-react"

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void
  uploadedFiles: File[]
}

export default function FileUploader({ onFilesUploaded, uploadedFiles }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>(uploadedFiles)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (files.length > 0) {
      onFilesUploaded(files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Carica Documentazione Lightshipweight
          </CardTitle>
          <CardDescription>
            Carica i documenti del tuo cantiere contenenti le informazioni sui materiali e pesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Trascina i file qui o clicca per selezionare</h3>
            <p className="text-gray-600 mb-4">Supporta PDF, Excel, CSV e altri formati di documentazione</p>
            <Input
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv,.txt,.doc,.docx"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                Seleziona File
              </Button>
            </Label>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">File Caricati ({files.length})</h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleUpload} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Procedi con l'Elaborazione
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Suggerimento:</strong> Per risultati ottimali, assicurati che i documenti contengano informazioni
          dettagliate sui materiali, pesi e specifiche tecniche. Il tool è in grado di adattarsi a diversi formati di
          documentazione utilizzati dai cantieri.
        </AlertDescription>
      </Alert>
    </div>
  )
}
