"use client"

import {useEffect, useState} from "react"
import {UploadCard} from "./upload-card"
import {TabbedDetails} from "./tabbed-details"
import {ProjectHeader} from "./project-header"
import {ApiConfigComponent} from "./api-config"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Textarea} from "@/components/ui/textarea"
import {Label} from "@/components/ui/label"
import type {AnalysisType, ApiConfig, ContractData} from "@/lib/types"
import {apiService} from "@/lib/api-service"
import { toast } from "@/hooks/use-toast"

// Helper function to safely use localStorage
const safeLocalStorage = {
    getItem: (key: string): string | null => {
        if (typeof window !== 'undefined') {
            try {
                return localStorage.getItem(key)
            } catch (error) {
                console.warn('localStorage not available:', error)
                return null
            }
        }
        return null
    },
    setItem: (key: string, value: string): void => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(key, value)
            } catch (error) {
                console.warn('localStorage not available:', error)
            }
        }
    },
    removeItem: (key: string): void => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(key)
            } catch (error) {
                console.warn('localStorage not available:', error)
            }
        }
    }
}

// Helper functions for type-specific storage
const getStorageKeyForAnalysisType = (analysisType: string, customQuery?: string): string => {
    if (analysisType === "Custom Query" && customQuery) {
        // Create a hash of the custom query to make it unique
        const queryHash = btoa(customQuery).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)
        return `contract-data-custom-${queryHash}`
    }
    return `contract-data-${analysisType.toLowerCase().replace(/\s+/g, '-')}`
}

const getStoredContractData = (analysisType: string, customQuery?: string): ContractData | null => {
    const storageKey = getStorageKeyForAnalysisType(analysisType, customQuery)
    const storedData = safeLocalStorage.getItem(storageKey)
    if (storedData) {
        try {
            return JSON.parse(storedData)
        } catch (error) {
            console.warn('Error parsing stored contract data:', error)
            return null
        }
    }
    return null
}

const storeContractData = (data: ContractData, analysisType: string, customQuery?: string): void => {
    const storageKey = getStorageKeyForAnalysisType(analysisType, customQuery)
    safeLocalStorage.setItem(storageKey, JSON.stringify(data))
}

const removeContractData = (analysisType: string, customQuery?: string): void => {
    const storageKey = getStorageKeyForAnalysisType(analysisType, customQuery)
    safeLocalStorage.removeItem(storageKey)
}

export function ContractDashboard() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [contractData, setContractData] = useState<ContractData | null>(null)
    const [isUploadMinimized, setIsUploadMinimized] = useState(false)
    const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null)
    const [analysisType, setAnalysisType] = useState<AnalysisType>({type: "Contract Review"})
    const [customQuery, setCustomQuery] = useState("")
    const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(true)

    // Load persisted data on component mount
    useEffect(() => {
        const loadPersistedData = () => {
            try {
                // Load API config (only OpenAI key now)
                const storedApiConfig = safeLocalStorage.getItem('api-config')
                if (storedApiConfig) {
                    const parsedConfig = JSON.parse(storedApiConfig)
                    // Ensure we only use the OpenAI key
                    const cleanConfig = {
                        openaiApiKey: parsedConfig.openaiApiKey || ""
                    }
                    setApiConfig(cleanConfig)
                    apiService.setConfig(cleanConfig)
                }

                // Load analysis type
                const storedAnalysisType = safeLocalStorage.getItem('analysis-type')
                if (storedAnalysisType) {
                    const parsedAnalysisType = JSON.parse(storedAnalysisType)
                    setAnalysisType(parsedAnalysisType)

                    // Load custom query if it's a custom query type
                    if (parsedAnalysisType.type === "Custom Query") {
                        const storedCustomQuery = safeLocalStorage.getItem('custom-query')
                        if (storedCustomQuery) {
                            setCustomQuery(storedCustomQuery)
                            // Load contract data for this specific custom query
                            const storedData = getStoredContractData(parsedAnalysisType.type, storedCustomQuery)
                            if (storedData) {
                                setContractData(storedData)
                                setIsUploadMinimized(true)
                            }
                        }
                    } else {
                        // Load contract data for the analysis type
                        const storedData = getStoredContractData(parsedAnalysisType.type)
                        if (storedData) {
                            setContractData(storedData)
                            setIsUploadMinimized(true)
                        }
                    }
                } else {
                    // Load contract data for default analysis type
                    const storedData = getStoredContractData("Contract Review")
                    if (storedData) {
                        setContractData(storedData)
                        setIsUploadMinimized(true)
                    }
                }
                // Load custom query separately in case analysis type is not custom query
                const storedCustomQuery = safeLocalStorage.getItem('custom-query')
                if (storedCustomQuery) {
                    setCustomQuery(storedCustomQuery)
                }
            } catch (error) {
                console.warn('Error loading persisted data:', error)
            } finally {
                setIsLoadingFromStorage(false)
            }
        }

        loadPersistedData()
    }, [])

    // Load contract data when analysis type changes
    useEffect(() => {
        if (!isLoadingFromStorage) {
            const queryForStorage = analysisType.type === "Custom Query" ? customQuery : undefined
            const storedData = getStoredContractData(analysisType.type, queryForStorage)
            setContractData(storedData)
            setIsUploadMinimized(!!storedData)
        }
    }, [analysisType.type, customQuery, isLoadingFromStorage])

    // Persist API config when it changes
    useEffect(() => {
        if (apiConfig) {
            safeLocalStorage.setItem('api-config', JSON.stringify(apiConfig))
        }
    }, [apiConfig])

    // Persist analysis type when it changes
    useEffect(() => {
        safeLocalStorage.setItem('analysis-type', JSON.stringify(analysisType))
    }, [analysisType])

    // Persist custom query when it changes
    useEffect(() => {
        if (customQuery) {
            safeLocalStorage.setItem('custom-query', customQuery)
        } else {
            safeLocalStorage.removeItem('custom-query')
        }
    }, [customQuery])

    const handleApiConfigChange = (config: ApiConfig) => {
        setApiConfig(config)
        apiService.setConfig(config)
    }

    const handleFileUpload = async (file: File) => {
        if (!apiConfig?.openaiApiKey) {
            toast({
                title: "API Key Required",
                description: "Please configure your OpenAI API key first.",
                variant: "destructive"
            })
            return
        }

        setIsAnalyzing(true)

        try {
            const analysis: AnalysisType = analysisType.type === "Custom Query"
                ? {...analysisType, customQuery}
                : analysisType

            const data = await apiService.uploadAndAnalyze(file, analysis)
            setContractData(data)

            toast({
                title: "Analysis Complete",
                description: "Your contract has been successfully analyzed.",
                variant: "default"
            })

            // Store data with analysis type-specific key
            const queryForStorage = analysisType.type === "Custom Query" ? customQuery : undefined
            storeContractData(data, analysisType.type, queryForStorage)

            setIsUploadMinimized(true)
        } catch (error) {
            console.error("Analysis failed:", error)
            toast({
                title: "Analysis Failed",
                description: "Please check your API configuration and try again.",
                variant: "destructive"
            })
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleNewUpload = () => {
        setContractData(null)
        setIsUploadMinimized(false)
        setIsAnalyzing(false)

        // Remove contract data for current analysis type
        const queryForStorage = analysisType.type === "Custom Query" ? customQuery : undefined
        removeContractData(analysisType.type, queryForStorage)

        safeLocalStorage.removeItem('contract-active-tab')
    }

    const handleClearAllData = () => {
        setContractData(null)
        setApiConfig(null)
        setAnalysisType({type: "Contract Review"})
        setCustomQuery("")
        setIsUploadMinimized(false)

        // Clear all analysis type data
        const analysisTypes = ["Contract Review", "Risk Assessment", "Legal Research", "Compliance Check"]
        analysisTypes.forEach(type => {
            removeContractData(type)
        })

        safeLocalStorage.removeItem('api-config')
        safeLocalStorage.removeItem('analysis-type')
        safeLocalStorage.removeItem('custom-query')
        safeLocalStorage.removeItem('contract-active-tab')
    }


    const hasStoredData = () => {
        const queryForStorage = analysisType.type === "Custom Query" ? customQuery : undefined
        return !!getStoredContractData(analysisType.type, queryForStorage)
    }

    if (isLoadingFromStorage) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <ProjectHeader/>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Show data persistence indicator if we have stored data */}
                {contractData && hasStoredData() && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                          clipRule="evenodd"/>
                                </svg>
                                <span className="text-blue-800 font-medium">
                                 Analysis for "{analysisType.type}" is stored locally
                                </span>
                            </div>
                            <button
                                onClick={handleClearAllData}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Clear All Data
                            </button>
                        </div>
                    </div>
                )}

                {/* Always show API config - it will show compact view if configured */}
                <ApiConfigComponent
                    onConfigChange={handleApiConfigChange}
                    existingConfig={apiConfig}
                />

                <div className="mb-6 space-y-4">
                    <div>
                        <Label htmlFor="analysis-type">Select Analysis Type</Label>
                        <Select
                            value={analysisType.type}
                            onValueChange={(value) => setAnalysisType({type: value as AnalysisType["type"]})}
                        >
                            <SelectTrigger id="analysis-type">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Contract Review">Contract Review</SelectItem>
                                <SelectItem value="Risk Assessment">Risk Assessment</SelectItem>
                                <SelectItem value="Legal Research">Legal Research</SelectItem>
                                <SelectItem value="Custom Query">Custom Query</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {analysisType.type === "Custom Query" && (
                        <div>
                            <Label htmlFor="custom-query">Custom Query *</Label>
                            <Textarea
                                id="custom-query"
                                value={customQuery}
                                onChange={(e) => setCustomQuery(e.target.value)}
                                placeholder="Enter your specific legal analysis query..."
                                rows={3}
                                required
                                className={customQuery.trim() ? '' : 'border-red-300 focus:border-red-500'}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                    Each unique custom query will have its own stored analysis
                                </p>
                                {!customQuery.trim() && (
                                    <p className="text-xs text-red-500">
                                        Custom query is required
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`transition-all duration-300 ${isUploadMinimized ? "mb-4" : "mb-8"}`}>
                    <UploadCard
                        onFileUpload={handleFileUpload}
                        isAnalyzing={isAnalyzing}
                        isMinimized={isUploadMinimized}
                        onNewUpload={handleNewUpload}
                        hasContract={!!contractData}
                        disabled={analysisType.type === "Custom Query" && !customQuery.trim()}
                    />
                </div>

                {contractData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-3">
                            <TabbedDetails
                                data={contractData}
                                analysisType={analysisType}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}