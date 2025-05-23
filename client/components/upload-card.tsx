"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileUp, Loader2, Plus, ChevronDown, ChevronUp } from "lucide-react"

interface UploadCardProps {
  onFileUpload: (file: File) => void
  isAnalyzing: boolean
  isMinimized: boolean
  onNewUpload: () => void
  hasContract: boolean
}

export function UploadCard({ onFileUpload, isAnalyzing, isMinimized, onNewUpload, hasContract }: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      onFileUpload(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      onFileUpload(file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleNewUploadClick = () => {
    onNewUpload()
    setSelectedFile(null)
  }

  // Minimized view
  if (isMinimized && !isExpanded) {
    return (
      <Card className="shadow-sm bg-white border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                <FileUp className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {isAnalyzing ? "Analyzing Contract..." : hasContract ? "Contract Analyzed" : "Upload Contract"}
                </h3>
                <p className="text-sm text-gray-500">{selectedFile ? selectedFile.name : "No file selected"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasContract && (
                <Button
                  onClick={handleNewUploadClick}
                  variant="outline"
                  size="sm"
                  className="min-w-[44px] min-h-[44px]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Contract
                </Button>
              )}
              <Button
                onClick={() => setIsExpanded(true)}
                variant="ghost"
                size="sm"
                className="min-w-[44px] min-h-[44px]"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Expanded view
  return (
    <Card className={`relative ${isDragging ? "border-indigo-500 border-2" : ""} shadow-md bg-white`}>
      <CardContent className="p-6">
        {isMinimized && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsExpanded(false)}
              variant="ghost"
              size="sm"
              className="min-w-[44px] min-h-[44px]"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-gray-200"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mb-4 text-indigo-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Upload Contract</h2>
          <p className="mb-4 text-sm text-gray-500 text-center">
            Drag and drop your contract file here, or click the button below
          </p>
          <Button
            onClick={handleButtonClick}
            size="lg"
            className="font-semibold bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-6 min-w-[160px]"
          >
            <FileUp className="mr-2 h-5 w-5" /> Select File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          {selectedFile && <p className="mt-4 text-sm text-gray-600">Selected: {selectedFile.name}</p>}
        </div>

        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-lg">
            <Loader2 className="w-12 h-12 mb-4 text-indigo-600 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-900">Analyzing...</h3>
            <p className="text-sm text-gray-500">Please wait while we analyze your contract</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
