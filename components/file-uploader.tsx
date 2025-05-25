"use client"

import type React from "react"

import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

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
    <div className="flex flex-col space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-dashed border-2 rounded-md p-4 flex flex-col items-center justify-center bg-muted hover:bg-accent cursor-pointer ${
          dragActive ? "bg-accent" : ""
        }`}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.csv,.txt,.doc,.docx"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <Label htmlFor="file-upload" className="cursor-pointer">
          <Button variant="outline" type="button" asChild>
            <span>Select Files</span>
          </Button>
        </Label>
        {dragActive ? <p>Drop files here...</p> : <p>Drag and drop files here, or click to select files</p>}
      </div>

      {files.length > 0 && (
        <ul>
          {files.map((file: File, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span>{file.name}</span>
              <span>({formatFileSize(file.size)})</span>
              <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && <Button onClick={handleUpload}>Upload Files</Button>}
    </div>
  )
}
