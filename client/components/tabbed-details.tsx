"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { ContractData, Clause } from "@/lib/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface TabbedDetailsProps {
  data: ContractData
}

export function TabbedDetails({ data }: TabbedDetailsProps) {
  const [activeTab, setActiveTab] = useState("summary")

  return (
      <Card className="h-full shadow-lg bg-white border-0">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <TabButton isActive={activeTab === "summary"} onClick={() => setActiveTab("summary")}>
              Risk Summary
            </TabButton>
            <TabButton isActive={activeTab === "clauses"} onClick={() => setActiveTab("clauses")}>
              Clause Analysis
            </TabButton>
            <TabButton isActive={activeTab === "tips"} onClick={() => setActiveTab("tips")}>
              Negotiation Tips
            </TabButton>
          </div>
        </div>

        <CardContent className="p-6">
          {activeTab === "summary" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Top Risk Findings</h3>
                <ul className="space-y-4">
                  {data.riskSummary.map((risk, index) => (
                      <li key={index} className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 mr-4 text-sm font-medium">
                    {index + 1}
                  </span>
                        <span className="text-gray-800 pt-1 leading-relaxed">{risk}</span>
                      </li>
                  ))}
                </ul>
              </div>
          )}

          {activeTab === "clauses" && (
              <div>
                <h3 className="text-lg font-semibold mb-6 text-gray-900">Contract Clauses</h3>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {data.clauses.map((clause, index) => (
                      <ClauseItem key={index} clause={clause} index={index} />
                  ))}
                </Accordion>
              </div>
          )}

          {activeTab === "tips" && (
              <div>
                <h3 className="text-lg font-semibold mb-6 text-gray-900">Negotiation Tips</h3>
                <ul className="space-y-4">
                  {data.negotiationTips.map((tip, index) => (
                      <li key={index} className="flex items-start p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 mr-4 text-sm font-medium">
                    {index + 1}
                  </span>
                        <span className="text-gray-800 pt-1 leading-relaxed">{tip}</span>
                      </li>
                  ))}
                </ul>
              </div>
          )}
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

function ClauseItem({ clause, index }: { clause: Clause; index: number }) {
  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text

    const parts = text.split(new RegExp(`(${highlight})`, "gi"))
    return (
        <>
          {parts.map((part, i) =>
              part.toLowerCase() === highlight.toLowerCase() ? (
                  <span key={i} className="bg-yellow-200 px-1 rounded font-medium">
              {part}
            </span>
              ) : (
                  part
              ),
          )}
        </>
    )
  }

  return (
      <AccordionItem value={`clause-${index}`} className="border rounded-lg bg-gray-50 border-gray-200">
        <AccordionTrigger className="hover:no-underline py-4 px-4 min-h-[44px]">
          <div className="flex items-center justify-between w-full pr-4">
            <span className="font-medium text-gray-800">{clause.title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="px-4 pb-4">
            <p className="text-gray-700 leading-relaxed">{highlightText(clause.content, clause.highlight)}</p>
          </div>
        </AccordionContent>
      </AccordionItem>
  )
}