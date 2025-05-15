"use client"

import { useState } from "react"
import { AlertTriangle, ArrowLeft, CheckCircle, Copy, Send, ThumbsDown, ThumbsUp, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export function NegotiationTips() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("tips")

  const negotiationPoints = [
    {
      id: 1,
      category: "Payment Terms",
      title: "Payment Withholding",
      level: "high",
      whatToSay:
        "I'm concerned about the 60-day payment withholding period. This creates significant cash flow challenges for me as a freelancer. Could we reduce this to a 14-day review period with clear quality criteria?",
      fallback:
        "If a longer review period is necessary, could we structure the payment differently? Perhaps 50% upfront and 50% after the review period?",
    },
    {
      id: 2,
      category: "Intellectual Property",
      title: "Rights Assignment",
      level: "medium",
      whatToSay:
        "I understand you need comprehensive rights for the audiobook, but I'd like to retain the ability to use short samples in my portfolio. Could we modify the clause to grant me limited rights for promotional purposes only?",
      fallback:
        "If full rights transfer is required, would you consider a slight increase in compensation to account for the additional value of these rights?",
    },
    {
      id: 3,
      category: "Liability",
      title: "Unlimited Indemnification",
      level: "high",
      whatToSay:
        "The unlimited indemnification clause creates an open-ended financial risk that exceeds the project's value. Could we cap my liability at the total compensation for this project?",
      fallback:
        "If a liability cap isn't possible, could we narrow the scope of indemnification to cover only claims directly resulting from my performance?",
    },
  ]

  const emailTemplates = [
    {
      id: 1,
      title: "Professional Concerns",
      content: `Dear [Client Name],

Thank you for the opportunity to work on the audiobook narration project. I've reviewed the contract and am excited to get started, but I have a few concerns I'd like to discuss before proceeding.

Specifically, I noticed the following points that I believe we should address:

1. The 60-day payment withholding period is longer than industry standard and creates cash flow challenges. Could we reduce this to 14 days?

2. I'd like to retain limited rights to use short samples in my portfolio for promotional purposes only.

3. The unlimited indemnification clause creates financial risk beyond the project's value. Could we cap liability at the total project compensation?

I'm confident we can find a solution that works for both of us. Please let me know when you're available to discuss these points.

Best regards,
[Your Name]`,
    },
    {
      id: 2,
      title: "Direct Amendments",
      content: `Dear [Client Name],

I'm looking forward to narrating your audiobook. After reviewing the contract, I'd like to propose the following amendments:

PAYMENT TERMS (Section 2):
- Change "Payment may be withheld for up to 60 days" to "Payment may be withheld for up to 14 days"

INTELLECTUAL PROPERTY (Section 3):
- Add: "Narrator retains the right to use short samples of the work in their portfolio for promotional purposes only."

LIABILITY (Section 4):
- Add: "Narrator's liability shall be capped at the total compensation for this project."

Please let me know if these changes are acceptable. I'm happy to discuss further if needed.

Thank you,
[Your Name]`,
    },
  ]

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
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Negotiation Tips</h1>
          <p className="text-muted-foreground">Audiobook Narration Contract</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/clause-details")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Clauses
          </Button>
          <Button className="gap-2 bg-highlight-blue hover:bg-highlight-blue-dark">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="tips" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            What to Say
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="assistant" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            AI Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tips" className="mt-6">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item}>
              <Card className="mb-8 overflow-hidden shadow-soft">
                <CardHeader className="border-b bg-gray-50 pb-4">
                  <CardTitle>Negotiation Points</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {negotiationPoints.map((point) => (
                      <div key={point.id} className="rounded-lg border p-0 shadow-soft">
                        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
                          <div className="flex items-center gap-2">
                            {point.level === "high" ? (
                              <AlertTriangle className="h-5 w-5 text-risk-high" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-risk-medium" />
                            )}
                            <h3 className="font-medium">{point.title}</h3>
                          </div>
                          <Badge
                            variant={point.level === "high" ? "destructive" : "outline"}
                            className={
                              point.level === "high" ? "risk-badge-high" : "border-risk-medium text-risk-medium"
                            }
                          >
                            {point.level.charAt(0).toUpperCase() + point.level.slice(1)} Priority
                          </Badge>
                        </div>

                        <div className="p-4">
                          <div className="mb-4 rounded-lg bg-highlight-blue-light p-4">
                            <h4 className="mb-2 text-sm font-medium text-highlight-blue">What to Say</h4>
                            <p className="text-sm leading-relaxed">{point.whatToSay}</p>
                            <Button variant="ghost" size="sm" className="mt-2 h-7 gap-1 text-xs text-highlight-blue">
                              <Copy className="h-3 w-3" />
                              Copy to clipboard
                            </Button>
                          </div>

                          <div>
                            <h4 className="mb-2 text-sm font-medium">Fallback Position</h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">{point.fallback}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="overflow-hidden shadow-soft">
                <CardHeader className="border-b bg-gray-50 pb-4">
                  <CardTitle>General Negotiation Tips</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight-blue-light text-highlight-blue">
                        1
                      </div>
                      <div>
                        <h3 className="mb-1 font-medium">Be Collaborative, Not Confrontational</h3>
                        <p className="text-sm text-muted-foreground">
                          Frame your concerns as collaborative problem-solving rather than demands. Use phrases like
                          "I'd like to find a solution that works for both of us."
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight-blue-light text-highlight-blue">
                        2
                      </div>
                      <div>
                        <h3 className="mb-1 font-medium">Prioritize Your Concerns</h3>
                        <p className="text-sm text-muted-foreground">
                          Focus on the high-risk issues first. Be willing to compromise on lower-priority items if
                          necessary.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight-blue-light text-highlight-blue">
                        3
                      </div>
                      <div>
                        <h3 className="mb-1 font-medium">Provide Alternatives</h3>
                        <p className="text-sm text-muted-foreground">
                          Always offer specific alternative language for problematic clauses. This makes it easier for
                          the client to say yes.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight-blue-light text-highlight-blue">
                        4
                      </div>
                      <div>
                        <h3 className="mb-1 font-medium">Know Your Walk-Away Point</h3>
                        <p className="text-sm text-muted-foreground">
                          Decide in advance which issues are deal-breakers for you. Be prepared to decline the project
                          if these can't be resolved.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item}>
              <Card className="mb-8 overflow-hidden shadow-soft">
                <CardHeader className="border-b bg-gray-50 pb-4">
                  <CardTitle>Email Templates</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {emailTemplates.map((template) => (
                      <div key={template.id} className="rounded-lg border shadow-soft">
                        <div className="border-b bg-gray-50 p-4">
                          <h3 className="font-medium">{template.title}</h3>
                        </div>
                        <div className="p-4">
                          <div className="rounded-lg bg-gray-50 p-4">
                            <pre className="whitespace-pre-wrap text-sm font-normal leading-relaxed">
                              {template.content}
                            </pre>
                          </div>
                          <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <Copy className="h-4 w-4" />
                              Copy
                            </Button>
                            <Button size="sm" className="gap-1 bg-highlight-blue hover:bg-highlight-blue-dark">
                              Customize
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="overflow-hidden shadow-soft">
                <CardHeader className="border-b bg-gray-50 pb-4">
                  <CardTitle>Tips for Email Communication</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-risk-low" />
                      <div>
                        <h3 className="mb-1 font-medium">Be Clear and Concise</h3>
                        <p className="text-sm text-muted-foreground">
                          State your concerns clearly without unnecessary explanation. Use bullet points for clarity.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-risk-low" />
                      <div>
                        <h3 className="mb-1 font-medium">Maintain a Professional Tone</h3>
                        <p className="text-sm text-muted-foreground">
                          Keep your communication professional and positive, even when discussing concerns.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-risk-low" />
                      <div>
                        <h3 className="mb-1 font-medium">Suggest a Follow-up Call</h3>
                        <p className="text-sm text-muted-foreground">
                          Offer to discuss the contract changes on a call if that would be more convenient for the
                          client.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-risk-low" />
                      <div>
                        <h3 className="mb-1 font-medium">Express Enthusiasm</h3>
                        <p className="text-sm text-muted-foreground">
                          Begin and end your email by expressing enthusiasm for the project to maintain a positive
                          relationship.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="assistant" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="overflow-hidden shadow-soft">
              <CardHeader className="border-b bg-gray-50 pb-4">
                <CardTitle>Negotiation Assistant</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6 rounded-lg border bg-gray-50 p-4">
                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight-blue text-white">
                      AI
                    </div>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">
                        Hello! I'm your negotiation assistant. I can help you craft responses to the client, suggest
                        alternative contract language, or answer questions about negotiation strategy. What would you
                        like help with?
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
                      You
                    </div>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">
                        How should I approach the payment withholding issue if they say it's their standard policy?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight-blue text-white">
                      AI
                    </div>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">
                        If they say the 60-day withholding period is standard policy, you could try these approaches:
                      </p>
                      <ol className="mt-3 space-y-3 text-sm leading-relaxed">
                        <li>
                          <span className="font-medium">Acknowledge their policy but request an exception:</span> "I
                          understand this is your standard policy, but for freelancers like me, a 60-day withholding
                          creates significant cash flow challenges. Would you consider making an exception in this
                          case?"
                        </li>
                        <li>
                          <span className="font-medium">Suggest a compromise:</span> "If the 60-day period is necessary
                          for your internal processes, could we restructure the payment schedule? Perhaps 50% upon
                          project start, 25% at midpoint delivery, and 25% after the quality control period?"
                        </li>
                        <li>
                          <span className="font-medium">Provide industry context:</span> "The industry standard for
                          audiobook narration is typically a 7-14 day review period. A 60-day hold is unusual and makes
                          it difficult for me to manage my business finances."
                        </li>
                      </ol>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                          <ThumbsDown className="h-3 w-3" />
                          Not helpful
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                          <ThumbsUp className="h-3 w-3" />
                          Helpful
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Textarea
                    placeholder="Ask a question about negotiating this contract..."
                    className="min-h-[100px] resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button className="h-auto bg-highlight-blue hover:bg-highlight-blue-dark">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    How do I respond if they refuse all changes?
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Draft a follow-up email
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    What's a fair rights buyout rate?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8 flex justify-between"
      >
        <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push("/clause-details")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Clause Details
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          <Button className="bg-highlight-blue hover:bg-highlight-blue-dark">Accept Contract</Button>
        </div>
      </motion.div>
    </div>
  )
}
