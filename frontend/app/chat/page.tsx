"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, AlertCircle, Sparkles, Shield, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { chatApi } from "@/lib/api"
import { type ChatMessage } from "@/types"

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMessage: ChatMessage = { role: "user", content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)
    try {
      const res = await chatApi.send(input)
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply, timestamp: new Date() }])
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || "Sorry, I encountered an error. Please try again."
      setMessages(prev => [...prev, { role: "assistant", content: errorMsg, timestamp: new Date() }])
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
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 text-white py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="h-8 w-8 text-purple-300" />
              <h1 className="text-4xl font-bold">AI Investigator</h1>
            </div>
            <p className="text-lg text-white/90">
              Ask natural language questions about procurement data and corruption patterns
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl pb-12">
        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">How it works:</p>
                <p>I have access to the live procurement database with {">"}140 contracts across all 47 counties. I always cite data sources and never present synthetic data as fact. Ask me about specific counties, sectors, risk patterns, or corruption indicators.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="mb-6 shadow-lg border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[600px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Start a Conversation</h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    Ask me anything about procurement data in Kenya. I can help you find high-risk contracts, analyze corruption patterns, and explore documented cases.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(q)}
                        className="text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all shadow-sm"
                      >
                        <MessageSquare className="h-4 w-4 inline mr-2 text-slate-400" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-purple-600" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
                      : "bg-white border border-slate-200 shadow-sm"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
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
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
