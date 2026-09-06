"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, AlertCircle } from "lucide-react"
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
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again.", timestamp: new Date() }])
    } finally { 
      setLoading(false) 
    }
  }

  const suggestedQuestions = [
    "Which counties have the most high-risk contracts?", 
    "Show me documented corruption cases", 
    "What is the total value of contracts in Nairobi?", 
    "Explain how risk scoring works"
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="relative bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-16 mb-8">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=80')" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="h-8 w-8 text-purple-400" />
              <h1 className="text-4xl font-bold">AI Investigator</h1>
            </div>
            <p className="text-lg text-white/90">Ask natural language questions about procurement data and corruption patterns</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">How it works:</p>
                <p>I have access to the live procurement database. I always cite data sources and never present synthetic data as fact.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="h-[600px] overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Start a conversation</h3>
                  <p className="text-slate-500 mb-6">Ask me anything about procurement data in Kenya</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedQuestions.map((q, i) => (
                      <button key={i} onClick={() => setInput(q)} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-kenya-teal hover:text-kenya-teal transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-purple-600" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-kenya-teal text-white" : "bg-white border border-slate-200"}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
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
                  placeholder="Ask about procurement data..." 
                  disabled={loading} 
                  className="flex-1" 
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()} className="bg-kenya-teal hover:bg-kenya-teal/90">
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
