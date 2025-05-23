"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, User, Bot, Loader2 } from "lucide-react"
import type { ContractData } from "@/lib/types"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatWithAIProps {
  contractData: ContractData
}

export function ChatWithAI({ contractData }: ChatWithAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI assistant. Ask me any questions about your contract and I'll help you understand it better.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      // Generate a response based on the user's question and contract data
      let response = ""

      const lowercaseInput = input.toLowerCase()

      if (lowercaseInput.includes("revision") || lowercaseInput.includes("revisions")) {
        response = `Based on your contract, there's a high-risk clause about revisions: "${contractData.clauses[0].content}" I recommend negotiating a cap on revision rounds (2-3) to protect your time and effort.`
      } else if (lowercaseInput.includes("ai") || lowercaseInput.includes("voice model")) {
        response = `Your contract includes rights for the client to use your recordings for AI voice model training without explicit compensation. This is a high-risk clause that could impact your future work opportunities. Consider excluding these rights or requesting additional compensation.`
      } else if (lowercaseInput.includes("non-compete") || lowercaseInput.includes("compete")) {
        response = `The non-compete clause in your contract is quite restrictive (3 years, worldwide). This could severely limit your ability to work with other clients. I suggest negotiating this down to 6 months and limiting it to a specific geographic region.`
      } else if (lowercaseInput.includes("payment") || lowercaseInput.includes("pay")) {
        response = `The payment terms in your contract specify payment within 60 days of project completion. This is longer than industry standard. Consider requesting net-30 payment terms instead.`
      } else {
        response = `I've analyzed your contract and found several concerning clauses. The most significant risks include unlimited revisions without additional compensation, AI voice training rights without explicit compensation, and an overly restrictive non-compete clause. Would you like more specific information about any of these issues?`
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[500px]">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Chat with AI Assistant</h3>

      <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
        {messages.map((message, index) => (
          <div key={index} className={`flex mb-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex max-w-[80%] ${
                message.role === "user"
                  ? "bg-indigo-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg shadow-md"
                  : "bg-white border border-gray-200 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg shadow-sm"
              } p-4`}
            >
              <div className="min-w-[32px] flex items-start mr-3">
                {message.role === "user" ? (
                  <User className="h-5 w-5 text-indigo-100 mt-1" />
                ) : (
                  <Bot className="h-5 w-5 text-indigo-600 mt-1" />
                )}
              </div>
              <div className="leading-relaxed">{message.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex mb-4 justify-start">
            <div className="flex max-w-[80%] bg-white border border-gray-200 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg shadow-sm p-4">
              <div className="min-w-[32px] flex items-start mr-3">
                <Bot className="h-5 w-5 text-indigo-600 mt-1" />
              </div>
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 text-indigo-600 animate-spin mr-2" />
                <span className="text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your contract..."
          className="resize-none bg-white border-gray-300 focus-visible:ring-indigo-500 text-gray-800 min-h-[44px]"
          rows={2}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[44px] min-h-[44px] self-end"
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}
