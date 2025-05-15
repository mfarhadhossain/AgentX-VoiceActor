"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, ChevronRight, FileText, Info, Download, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export function RiskSummary() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("summary")

  const riskCategories = [
    {
      name: "Payment Terms",
      level: "high",
      count: 3,
      description: "Issues with payment schedule, late fees, and cancellation terms",
    },
    {
      name: "Intellectual Property",
      level: "medium",
      count: 2,
      description: "Concerns about rights ownership and usage limitations",
    },
    {
      name: "Liability",
      level: "high",
      count: 2,
      description: "Unlimited liability clauses and indemnification issues",
    },
    {
      name: "Termination",
      level: "low",
      count: 1,
      description: "Standard termination clause with reasonable notice period",
    },
    {
      name: "Exclusivity",
      level: "medium",
      count: 1,
      description: "Partial exclusivity requirements that may limit other work",
    },
  ]

  const handleViewDetails = () => {
    router.push("/clause-details")
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
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
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Risk Summary</h1>
          <p className="text-muted-foreground">Audiobook Narration Contract</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
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

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-3">
        <motion.div variants={item}>
          <Card className="overflow-hidden shadow-soft">
            <CardHeader className="bg-gray-50 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Risk Score</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">68/100</div>
                <Badge variant="destructive" className="bg-risk-high px-2 py-1">
                  High Risk
                </Badge>
              </div>
              <Progress value={68} className="mt-4 h-2" />
              <p className="mt-3 text-sm text-muted-foreground">
                This contract has several high-risk clauses that require attention
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden shadow-soft">
            <CardHeader className="bg-gray-50 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Issues Found</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-risk-high">5</div>
                    <div className="text-xs text-muted-foreground">High</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-risk-medium">3</div>
                    <div className="text-xs text-muted-foreground">Medium</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-risk-low">1</div>
                    <div className="text-xs text-muted-foreground">Low</div>
                  </div>
                </div>
              </div>
              <Button variant="link" className="mt-3 h-auto p-0 text-highlight-blue" onClick={handleViewDetails}>
                View all issues
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden shadow-soft">
            <CardHeader className="bg-gray-50 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Platform</span>
                  <span className="text-sm font-medium">Voices.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Project Type</span>
                  <span className="text-sm font-medium">Audiobook Narration</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Value</span>
                  <span className="text-sm font-medium">$2,500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">45 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="summary" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Summary
            </TabsTrigger>
            <TabsTrigger value="document" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Document
            </TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="mt-6">
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h3 className="mb-6 text-lg font-medium">Risk Categories</h3>
                <div className="space-y-4">
                  {riskCategories.map((category) => (
                    <div
                      key={category.name}
                      className="flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all duration-200 hover:border-highlight-blue hover:bg-highlight-blue-light hover:shadow-blue"
                      onClick={handleViewDetails}
                    >
                      <div className="mt-0.5">
                        {category.level === "high" && <AlertTriangle className="h-5 w-5 text-risk-high" />}
                        {category.level === "medium" && <Info className="h-5 w-5 text-risk-medium" />}
                        {category.level === "low" && <CheckCircle className="h-5 w-5 text-risk-low" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{category.name}</h4>
                          <Badge
                            variant={
                              category.level === "high"
                                ? "destructive"
                                : category.level === "medium"
                                  ? "outline"
                                  : "secondary"
                            }
                            className={
                              category.level === "high"
                                ? "risk-badge-high"
                                : category.level === "medium"
                                  ? "border-risk-medium text-risk-medium"
                                  : "risk-badge-low"
                            }
                          >
                            {category.count} {category.count === 1 ? "issue" : "issues"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="document" className="mt-6">
            <Card className="overflow-hidden shadow-soft">
              <div className="flex h-[600px] flex-col">
                <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-highlight-blue" />
                    <span className="font-medium">Voices.com - Audiobook Contract.pdf</span>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  <div className="mx-auto max-w-3xl">
                    <h2 className="mb-6 text-center text-xl font-bold">AUDIOBOOK NARRATION AGREEMENT</h2>
                    <p className="mb-6 text-sm leading-relaxed">
                      This Audiobook Narration Agreement (the "Agreement") is entered into as of [Date], by and between
                      Voices.com (the "Company") and [Voice Actor Name] (the "Narrator").
                    </p>

                    <p className="mb-2 font-bold">1. SERVICES</p>
                    <p className="mb-6 text-sm leading-relaxed">
                      Narrator agrees to provide professional narration services for the audiobook titled "[Book Title]"
                      (the "Project").
                    </p>

                    <p className="mb-2 font-bold">2. COMPENSATION</p>
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm leading-relaxed">
                      Company shall pay Narrator a flat fee of $2,500 for the Project. Payment shall be made as follows:
                      25% upon signing this Agreement, 25% upon completion of the first half of the Project, and the
                      remaining 50% upon final approval of the Project.{" "}
                      <span className="font-medium text-red-600">
                        Payment may be withheld for up to 60 days after delivery for quality control purposes.
                      </span>
                    </div>

                    <p className="mb-2 font-bold">3. INTELLECTUAL PROPERTY</p>
                    <div className="mb-6 rounded-lg bg-amber-50 p-4 text-sm leading-relaxed">
                      <span className="font-medium text-amber-600">
                        Narrator hereby assigns all rights, title, and interest in and to the narration, including all
                        copyright and other intellectual property rights, to the Company.
                      </span>{" "}
                      Narrator waives any and all moral rights in the narration.
                    </div>

                    <p className="mb-2 font-bold">4. TERM AND TERMINATION</p>
                    <p className="mb-6 text-sm leading-relaxed">
                      This Agreement shall commence on the date first written above and shall continue until completion
                      of the Project, unless earlier terminated as provided herein.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 flex justify-between"
      >
        <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
          <FileText className="h-4 w-4" />
          Back to Upload
        </Button>
        <Button className="gap-2 bg-highlight-blue hover:bg-highlight-blue-dark" onClick={handleViewDetails}>
          View Clause Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  )
}
