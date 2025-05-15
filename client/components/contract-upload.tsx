"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, ArrowRight, FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function ContractUpload() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)

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
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleAnalyze = () => {
    router.push("/risk-summary")
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900">Contract Analysis</h1>
        <p className="text-lg text-muted-foreground">
          Upload your contract to get an AI-powered analysis of potential risks and negotiation points
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="mb-8 overflow-hidden shadow-soft">
          <CardContent className="p-0">
            <div
              className={`drop-zone p-12 ${isDragging ? "drop-zone-active" : "border-gray-200"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!file ? (
                <div className="flex flex-col items-center">
                  <div className="mb-6 rounded-full bg-highlight-blue-light p-5">
                    <Upload className="h-10 w-10 text-highlight-blue" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">Drag and drop your contract</h3>
                  <p className="mb-6 text-muted-foreground">Supports PDF files up to 10MB</p>
                  <label htmlFor="file-upload">
                    <Button
                      variant="outline"
                      className="cursor-pointer border-highlight-blue text-highlight-blue hover:bg-highlight-blue hover:text-white"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <FileUp className="mr-2 h-4 w-4" />
                      Browse files
                    </Button>
                    <input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="mb-6 rounded-full bg-green-100 p-5">
                    <FileText className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">{file.name}</h3>
                  <p className="mb-6 text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <div className="flex gap-3">
                    <label htmlFor="file-upload">
                      <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        Change file
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <Button className="bg-highlight-blue hover:bg-highlight-blue-dark" onClick={handleAnalyze}>
                      Analyze Contract
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid gap-6 md:grid-cols-2"
      >
        <Card className="card-hover cursor-pointer shadow-soft">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-highlight-blue-light p-3">
              <FileText className="h-6 w-6 text-highlight-blue" />
            </div>
            <div>
              <h3 className="font-medium">Recent Contracts</h3>
              <p className="text-sm text-muted-foreground">View your previously analyzed contracts</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer shadow-soft">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-highlight-blue-light p-3">
              <ArrowRight className="h-6 w-6 text-highlight-blue" />
            </div>
            <div>
              <h3 className="font-medium">Templates</h3>
              <p className="text-sm text-muted-foreground">Start from a pre-approved template</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {file && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-10 flex justify-end"
        >
          <Button
            className="bg-highlight-blue px-8 py-6 text-lg font-medium hover:bg-highlight-blue-dark"
            onClick={handleAnalyze}
          >
            Analyze Contract
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
