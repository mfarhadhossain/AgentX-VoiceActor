"use client"

import type React from "react"
import {useState} from "react"
import ReactMarkdown from "react-markdown"
import {Card, CardContent} from "@/components/ui/card"
import type {ContractData} from "@/lib/types"

interface TabbedDetailsProps {
    data: ContractData
}

export function TabbedDetails({data}: TabbedDetailsProps) {
    const [activeTab, setActiveTab] = useState("summary")

    return (
        <Card className="h-full shadow-lg bg-white border-0">
            <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                    <TabButton isActive={activeTab === "analysis"} onClick={() => setActiveTab("analysis")}>
                        Analysis
                    </TabButton>
                    <TabButton isActive={activeTab === "keyPoints"} onClick={() => setActiveTab("keyPoints")}>
                        Key Points
                    </TabButton>
                    <TabButton isActive={activeTab === "recommendations"}
                               onClick={() => setActiveTab("recommendations")}>
                        Recommendations
                    </TabButton>
                </div>
            </div>

            <CardContent className="p-6">
                <div className="prose prose-gray max-w-none">
                    {activeTab === "analysis" && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Detailed Analysis</h3>
                            <ReactMarkdown>{data.analysis}</ReactMarkdown>
                        </div>
                    )}

                    {activeTab === "keyPoints" && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Key Points</h3>
                            <ReactMarkdown>{data.keyPoints}</ReactMarkdown>
                        </div>
                    )}

                    {activeTab === "recommendations" && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Recommendations</h3>
                            <ReactMarkdown>{data.recommendations}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function TabButton({
                       children,
                       isActive,
                       onClick,
                   }: {
    children: React.ReactNode
    isActive: boolean
    onClick: () => void
}) {
    return (
        <button
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors min-w-[44px] min-h-[44px] whitespace-nowrap ${
                isActive
                    ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50"
            }`}
            onClick={onClick}
        >
            {children}
        </button>
    )
}