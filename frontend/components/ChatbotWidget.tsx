"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const quickActions = [
  "How do I report?",
  "Show ghost projects",
  "High risk counties",
  "About KenyaWatch",
]

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm the KenyaWatch Assistant. I can help you navigate the platform, report concerns, or find information about government procurement. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: text.trim(), timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLastFailedMessage(null)
    setIsLoading(true)

    try {
      const { data } = await api.post("/api/chatbot", { message: text.trim() })
      const botMessage: Message = {
        role: "assistant",
        content: data.reply || data.response || data.message || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (err: any) {
      const apiMsg = err?.response?.data?.error
      const fallbackContent = apiMsg
        ? `${apiMsg} You can try rephrasing your question or ask something else.`
        : "I'm having trouble connecting to the server right now. This could be a temporary issue. Please try again in a moment."
      setLastFailedMessage(text.trim())
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fallbackContent, timestamp: new Date() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const retryLastMessage = () => {
    if (lastFailedMessage) {
      sendMessage(lastFailedMessage)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200",
            isOpen
              ? "bg-slate-700 hover:bg-slate-600"
              : "bg-teal-600 hover:bg-teal-500 hover:shadow-xl"
          )}
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <MessageCircle className="h-5 w-5 text-white" />
          )}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          )}
        </button>
      </div>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-200 ease-out",
          "bottom-20 right-5 w-[360px] h-[500px]",
          "max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:bottom-0 max-sm:right-0 max-sm:rounded-none",
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        )}
      >
        <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">KenyaWatch Assistant</h3>
                <p className="text-[10px] text-slate-400">AI-powered help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 mt-0.5">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-br-md"
                      : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md"
                  )}
                >
                  {msg.content}
                  {msg.role === "assistant" && lastFailedMessage && i === messages.length - 1 && !isLoading && (
                    <button
                      onClick={retryLastMessage}
                      className="mt-2 flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
                      aria-label="Retry last message"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Try again
                    </button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 mt-0.5">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2 bg-white border-t border-slate-100 pt-3">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  aria-label={`Quick action: ${action}`}
                  className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100 hover:border-teal-300"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-slate-100 bg-white px-4 py-3"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              aria-label="Type your message"
              className="flex-1 rounded-full border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-teal-500"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-600 to-emerald-600 text-white hover:from-teal-500 hover:to-emerald-500 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
