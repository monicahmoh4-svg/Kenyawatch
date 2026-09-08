"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, AlertCircle, MessageSquare, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { type ChatMessage } from "@/types"

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastUserMessage, setLastUserMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (messageOverride?: string) => {
    const text = messageOverride || input.trim()
    if (!text || loading) return
    const userMessage: ChatMessage = { role: "user", content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLastUserMessage(text)
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await api.post("/api/ai/chat", { message: text, history })
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply, timestamp: new Date() }])
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || "Sorry, the AI service is temporarily unavailable. This might be due to high demand or a temporary network issue."
      setMessages(prev => [...prev, { role: "assistant", content: errorMsg, timestamp: new Date(), isError: true }])
    } finally {
      setLoading(false)
    }
  }

  const suggestedQuestions = [
    "Which counties have the most high-risk contracts?",
    "Show me documented corruption cases",
    "What is the total value of contracts in Nairobi?",
    "Explain how risk scoring works",
    "What are the signs of bid rigging?",
    "Which sectors have the most corruption?",
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white py-12 md:py-16 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <Bot className="h-6 w-6 text-teal-400" />
            <h1 className="text-3xl md:text-4xl font-bold">AI Investigator</h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Ask natural language questions about procurement data and corruption patterns.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl pb-12">
        <div className="border border-slate-200 bg-white rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-600">
              I have access to the live procurement database with contracts across all 47 counties. Ask about specific counties, sectors, risk patterns, or corruption indicators.
            </div>
          </div>
        </div>

        <div className="border border-slate-200 bg-white rounded-xl overflow-hidden">
          <div className="h-[500px] md:h-[600px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Start a Conversation</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                  Ask anything about procurement data in Kenya. I can find high-risk contracts, analyze patterns, and explore documented cases.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="text-left px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5 inline mr-2 text-slate-400" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-slate-500" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white"
                      : "bg-white border border-slate-200"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.isError && i === messages.length - 1 && (
                      <button
                        onClick={() => handleSend(lastUserMessage)}
                        disabled={loading}
                        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Try again
                      </button>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-slate-500" />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t p-4 bg-white">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Ask about procurement data, corruption patterns, specific contracts..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="bg-teal-600 hover:bg-teal-700"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
