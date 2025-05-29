"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileUp, Loader2, Plus, ChevronDown, ChevronUp, CheckCircle } from "lucide-react"

interface UploadCardProps {
  onFileUpload: (file: File) => void
  isAnalyzing: boolean
  isMinimized: boolean
  onNewUpload: () => void
  hasContract: boolean
}

const analysisSteps = [
  "Uploading document...",
  "Processing PDF content...",
  "Creating knowledge base...",
  "Initializing AI agents...",
  "Analyzing contract terms...",
  "Researching legal precedents...",
  "Generating recommendations...",
  "Finalizing analysis..."
]

export function UploadCard({ onFileUpload, isAnalyzing, isMinimized, onNewUpload, hasContract }: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Progress simulation during analysis
  useEffect(() => {
    let interval: NodeJS.Timeout
    let stepInterval: NodeJS.Timeout

    if (isAnalyzing) {
      // Reset progress when analysis starts
      setCurrentStep(0)
      setProgress(0)

      // Simulate progress over 2-3 minutes
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev // Stop at 95% until real completion
          return prev + Math.random() * 2 + 0.5 // Gradually increase
        })
      }, 2000)

      // Change step every 15-20 seconds
      stepInterval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % analysisSteps.length)
      }, 18000)
    } else {
      // Reset when analysis completes
      if (hasContract) {
        setProgress(100)
        setCurrentStep(analysisSteps.length - 1)
        setTimeout(() => {
          setProgress(0)
          setCurrentStep(0)
        }, 2000)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
      if (stepInterval) clearInterval(stepInterval)
    }
  }, [isAnalyzing, hasContract])

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
    setProgress(0)
    setCurrentStep(0)
  }

  // Don't minimize during analysis - keep it expanded to show progress
  const shouldMinimize = isMinimized && !isAnalyzing && !isExpanded

  // Minimized view (only when not analyzing)
  if (shouldMinimize) {
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
                    {hasContract ? "Contract Analyzed" : "Upload Contract"}
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

  // Expanded view (including during analysis)
  return (
      <Card className={`relative ${isDragging ? "border-indigo-500 border-2" : ""} shadow-md bg-white`}>
        <CardContent className="p-6">
          {isMinimized && !isAnalyzing && (
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

          {/* Analysis Progress Overlay */}
          {isAnalyzing && (
              <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Analyzing Contract</h3>
                      <p className="text-sm text-gray-600">{analysisSteps[currentStep]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{Math.round(progress)}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Step Progress */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Step {currentStep + 1} of {analysisSteps.length}</span>
                  <span>This may take 2-3 minutes</span>
                </div>

                {/* Mini steps indicator */}
                <div className="flex space-x-1 mt-3">
                  {analysisSteps.map((_, index) => (
                      <div
                          key={index}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              index <= currentStep ? 'bg-indigo-500' : 'bg-gray-200'
                          }`}
                      />
                  ))}
                </div>
              </div>
          )}

          {/* Upload Area */}
          <div
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-all duration-200 ${
                  isAnalyzing
                      ? "border-gray-300 bg-gray-50"
                      : "border-gray-200 hover:border-indigo-300"
              }`}
              onDragOver={!isAnalyzing ? handleDragOver : undefined}
              onDragLeave={!isAnalyzing ? handleDragLeave : undefined}
              onDrop={!isAnalyzing ? handleDrop : undefined}
          >
            {isAnalyzing ? (
                <>
                  <CheckCircle className="w-12 h-12 mb-4 text-green-500" />
                  <h2 className="mb-2 text-xl font-semibold text-gray-900">File Uploaded Successfully</h2>
                  <p className="mb-4 text-sm text-gray-500 text-center">
                    {selectedFile?.name || "Your contract"} is being processed by our AI agents
                  </p>
                </>
            ) : (
                <>
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
                </>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                disabled={isAnalyzing}
            />
            {selectedFile && !isAnalyzing && (
                <p className="mt-4 text-sm text-gray-600">Selected: {selectedFile.name}</p>
            )}
          </div>
        </CardContent>
      </Card>
  )
}