"use client"

import { useState } from "react"
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle, Info, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"

export function ClauseDetails() {
  const router = useRouter()
  const [currentClause, setCurrentClause] = useState(0)

  const clauses = [
    {
      id: 1,
      category: "Payment Terms",
      title: "Payment Withholding",
      level: "high",
      original: "Payment may be withheld for up to 60 days after delivery for quality control purposes.",
      issue:
        "This allows the client to withhold payment for an extended period without clear criteria for quality control.",
      impact: "You may face significant delays in receiving final payment even after completing the work.",
      recommendation: "Request a shorter review period (7-14 days) and clear quality criteria that must be met.",
    },
    {
      id: 2,
      category: "Intellectual Property",
      title: "Rights Assignment",
      level: "medium",
      original:
        "Narrator hereby assigns all rights, title, and interest in and to the narration, including all copyright and other intellectual property rights, to the Company.",
      issue: "This clause transfers all your rights to the narration without any limitations on usage or territory.",
      impact: "You won't be able to use samples of this work in your portfolio without permission.",
      recommendation: "Request a non-exclusive license for portfolio use and consider negotiating usage limitations.",
    },
    {
      id: 3,
      category: "Liability",
      title: "Unlimited Indemnification",
      level: "high",
      original:
        "Narrator shall indemnify and hold harmless the Company from any and all claims, damages, liabilities, costs, and expenses arising from Narrator's performance.",
      issue: "This creates unlimited liability for any claims related to your performance.",
      impact: "You could be financially responsible for legal costs and damages without any cap.",
      recommendation: "Request a liability cap tied to the total compensation for the project.",
    },
  ]

  const handleNext = () => {
    if (currentClause < clauses.length - 1) {
      setCurrentClause(currentClause + 1)
    } else {
      router.push("/negotiation-tips")
    }
  }

  const handlePrevious = () => {
    if (currentClause > 0) {
      setCurrentClause(currentClause - 1)
    } else {
      router.push("/risk-summary")
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
      >
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-highlight-blue px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-white">
              Voices.com
            </Badge>
            <Badge variant="outline" className="px-2 py-0.5 text-xs font-medium uppercase tracking-wider">
              Audiobook
            </Badge>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Clause Details</h1>
          <p className="text-muted-foreground">Audiobook Narration Contract</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/risk-summary")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Summary
          </Button>
          <Button
            className="gap-2 bg-highlight-blue hover:bg-highlight-blue-dark"
            onClick={() => router.push("/negotiation-tips")}
          >
            <MessageSquare className="h-4 w-4" />
            Negotiation Tips
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-1"
        >
          <Card className="sticky top-20 overflow-hidden shadow-soft">
            <CardContent className="p-0">
              <div className="border-b bg-gray-50 p-4">
                <h3 className="font-medium">Flagged Clauses</h3>
              </div>
              <div className="p-2">
                {clauses.map((clause, index) => (
                  <button
                    key={clause.id}
                    className={`flex w-full items-start gap-3 rounded-md p-3 text-left transition-all ${
                      currentClause === index ? "bg-highlight-blue-light" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setCurrentClause(index)}
                  >
                    <div className="mt-0.5">
                      {clause.level === "high" && <AlertTriangle className="h-5 w-5 text-risk-high" />}
                      {clause.level === "medium" && <Info className="h-5 w-5 text-risk-medium" />}
                      {clause.level === "low" && <CheckCircle className="h-5 w-5 text-risk-low" />}
                    </div>
                    <div>
                      <div className="font-medium">{clause.title}</div>
                      <div className="text-xs text-muted-foreground">{clause.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-2"
        >
          <Card className="overflow-hidden shadow-soft">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  {clauses[currentClause].level === "high" && <AlertTriangle className="h-5 w-5 text-risk-high" />}
                  {clauses[currentClause].level === "medium" && <Info className="h-5 w-5 text-risk-medium" />}
                  {clauses[currentClause].level === "low" && <CheckCircle className="h-5 w-5 text-risk-low" />}
                  <h2 className="text-lg font-bold">{clauses[currentClause].title}</h2>
                </div>
                <Badge
                  variant={
                    clauses[currentClause].level === "high"
                      ? "destructive"
                      : clauses[currentClause].level === "medium"
                        ? "outline"
                        : "secondary"
                  }
                  className={
                    clauses[currentClause].level === "high"
                      ? "risk-badge-high"
                      : clauses[currentClause].level === "medium"
                        ? "border-risk-medium text-risk-medium"
                        : "risk-badge-low"
                  }
                >
                  {clauses[currentClause].level.charAt(0).toUpperCase() + clauses[currentClause].level.slice(1)} Risk
                </Badge>
              </div>

              <div className="p-6">
                <div className="mb-6 rounded-lg border bg-gray-50 p-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-500">Original Text</h3>
                  <p className="text-sm leading-relaxed">{clauses[currentClause].original}</p>
                </div>

                <Accordion type="single" collapsible defaultValue="issue" className="mb-6">
                  <AccordionItem value="issue" className="border-b border-t-0 border-x-0">
                    <AccordionTrigger className="py-4 text-base font-medium hover:no-underline">Issue</AccordionTrigger>
                    <AccordionContent className="pb-4 pt-0 text-sm leading-relaxed">
                      <p>{clauses[currentClause].issue}</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="impact" className="border-b border-t-0 border-x-0">
                    <AccordionTrigger className="py-4 text-base font-medium hover:no-underline">
                      Potential Impact
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-0 text-sm leading-relaxed">
                      <p>{clauses[currentClause].impact}</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="recommendation" className="border-b border-t-0 border-x-0">
                    <AccordionTrigger className="py-4 text-base font-medium hover:no-underline">
                      Recommendation
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-0 text-sm leading-relaxed">
                      <p>{clauses[currentClause].recommendation}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="highlight-clause">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-highlight-blue">
                    <Info className="h-4 w-4" />
                    AI Suggestion
                  </h3>
                  <p className="text-sm text-gray-500">Consider requesting the following alternative language:</p>
                  <p className="mt-3 text-sm font-medium">
                    {clauses[currentClause].level === "high" &&
                      "Payment shall be subject to a quality control review period not to exceed 14 days after delivery, with clear criteria provided in advance."}
                    {clauses[currentClause].level === "medium" &&
                      "Narrator grants Company a non-exclusive license to use the narration for the Project, while retaining the right to use portions of the work in Narrator's portfolio for promotional purposes."}
                    {clauses[currentClause].level === "high" &&
                      currentClause === 2 &&
                      "Narrator shall indemnify Company for claims arising directly from Narrator's performance, with liability capped at the total compensation for the Project."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={handlePrevious} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {currentClause === 0 ? "Back to Summary" : "Previous Clause"}
            </Button>
            <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
              <span className="font-medium text-highlight-blue">{currentClause + 1}</span> of {clauses.length}
            </div>
            <Button
              className="flex items-center gap-2 bg-highlight-blue hover:bg-highlight-blue-dark"
              onClick={handleNext}
            >
              {currentClause === clauses.length - 1 ? "Negotiation Tips" : "Next Clause"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
