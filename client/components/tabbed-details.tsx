"use client"

import React, {useEffect} from "react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { ContractData } from "@/lib/types"
import { FileText, Target, Lightbulb } from "lucide-react"

interface TabbedDetailsProps {
    data: ContractData
}

const tabConfig = [
    {
        id: "analysis",
        label: "Analysis",
        icon: FileText,
        description: "Detailed contract analysis"
    },
    {
        id: "keyPoints",
        label: "Key Points",
        icon: Target,
        description: "Important contract highlights"
    },
    {
        id: "recommendations",
        label: "Recommendations",
        icon: Lightbulb,
        description: "Strategic recommendations"
    }
]

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

export function TabbedDetails({ data }: TabbedDetailsProps) {
    const [activeTab, setActiveTab] = useState(() => {
        return safeLocalStorage.getItem('contract-active-tab') || "analysis"
    })

    const [persistedData, setPersistedData] = useState<ContractData>(() => {
        const stored = safeLocalStorage.getItem('contract-data')
        return stored ? JSON.parse(stored) : data
    })

    // Track if data has been loaded from localStorage
    const [isDataFromStorage, setIsDataFromStorage] = useState(false)

    // Check if there's stored data on mount
    useEffect(() => {
        const storedData = safeLocalStorage.getItem('contract-data')
        if (storedData) {
            setIsDataFromStorage(true)
        }
    }, [])

    // Persist active tab when it changes
    useEffect(() => {
        safeLocalStorage.setItem('contract-active-tab', activeTab)
    }, [activeTab])

    // Persist contract data when it changes (but only if it's new data)
    useEffect(() => {
        if (data && JSON.stringify(data) !== JSON.stringify(persistedData)) {
            safeLocalStorage.setItem('contract-data', JSON.stringify(data))
            setPersistedData(data)
            setIsDataFromStorage(false)
        }
    }, [data, persistedData])

    const getTabContent = (tabId: string) => {
        switch (tabId) {
            case "analysis":
                return data.analysis
            case "keyPoints":
                return data.keyPoints
            case "recommendations":
                return data.recommendations
            default:
                return ""
        }
    }

    const activeTabConfig = tabConfig.find(tab => tab.id === activeTab)

    const handleClearStorage = () => {
        safeLocalStorage.removeItem('contract-active-tab')
        safeLocalStorage.removeItem('contract-data')
        setActiveTab("analysis")
        setPersistedData(data)
        setIsDataFromStorage(false)
    }

    return (
        <Card className="h-full shadow-lg bg-white border-0 overflow-hidden">
            <CardHeader className="pb-0">
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        {tabConfig.map((tab) => (
                            <TabButton
                                key={tab.id}
                                isActive={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                icon={tab.icon}
                                label={tab.label}
                                description={tab.description}
                            />
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 h-full">
                <div className="h-full overflow-y-auto">
                    <div className="p-6">
                        {/* Tab Header with Icon and Description */}
                        <div className="mb-6 pb-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    {activeTabConfig?.icon && (
                                        <activeTabConfig.icon className="h-5 w-5 text-indigo-600" />
                                    )}
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {activeTabConfig?.label}
                                    </h2>
                                </div>
                                <button
                                    onClick={handleClearStorage}
                                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                                    title="Clear stored data"
                                >
                                    Reset
                                </button>
                            </div>
                            <p className="text-sm text-gray-600">
                                {activeTabConfig?.description}
                            </p>
                        </div>

                        {/* Markdown Content */}
                        <div className="markdown-content">
                            <ReactMarkdown
                                components={{
                                    // Custom component overrides for better styling
                                    h1: ({ children }) => (
                                        <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0 pb-2 border-b border-gray-200">
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-5 first:mt-0">
                                            {children}
                                        </h2>
                                    ),
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-indigo-300 bg-indigo-50 pl-4 py-3 my-4 text-gray-700 italic rounded-r-md">
                                            {children}
                                        </blockquote>
                                    ),
                                    ul: ({ children }) => (
                                        <ul className="space-y-2 mb-4">
                                            {children}
                                        </ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="space-y-2 mb-4">
                                            {children}
                                        </ol>
                                    ),
                                    li: ({ children }) => (
                                        <li className="flex items-start gap-2 text-gray-700">
                                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></span>
                                            <span className="flex-1">{children}</span>
                                        </li>
                                    ),
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto mb-6">
                                            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    thead: ({ children }) => (
                                        <thead className="bg-gray-50">
                                        {children}
                                        </thead>
                                    ),
                                    tbody: ({ children }) => (
                                        <tbody className="divide-y divide-gray-100">
                                        {children}
                                        </tbody>
                                    ),
                                    th: ({ children }) => (
                                        <th className="px-4 py-3 text-left font-semibold text-gray-900 text-sm border-r border-gray-200 last:border-r-0">
                                            {children}
                                        </th>
                                    ),
                                    td: ({ children }) => (
                                        <td className="px-4 py-3 text-gray-700 text-sm border-r border-gray-200 last:border-r-0">
                                            {children}
                                        </td>
                                    ),
                                    tr: ({ children }) => (
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            {children}
                                        </tr>
                                    ),
                                    pre: ({ children }) => (
                                        <pre className="bg-gray-100 text-gray-800 p-4 rounded-md text-sm font-mono overflow-x-auto border mb-4">
                                            {children}
                                        </pre>
                                    ),
                                    code: ({ children }) => (
                                        <code className="bg-gray-100 text-indigo-700 px-1.5 py-0.5 rounded text-sm font-mono border">
                                            {children}
                                        </code>
                                    )
                                }}
                            >
                                {getTabContent(activeTab)}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

interface TabButtonProps {
    isActive: boolean
    onClick: () => void
    icon: React.ElementType
    label: string
    description: string
}

function TabButton({ isActive, onClick, icon: Icon, label, description }: TabButtonProps) {
    return (
        <button
            className={`group relative px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 min-w-[140px] whitespace-nowrap ${
                isActive
                    ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50/50"
            }`}
            onClick={onClick}
            title={description}
        >
            <div className="flex items-center gap-2 justify-center">
                <Icon
                    className={`h-4 w-4 transition-colors ${
                        isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                />
                <span>{label}</span>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-10">
                {description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
        </button>
    )
}