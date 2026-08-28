import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useLearnerStore } from '../../store/learnerStore'
import { MessageSquare, X, Send, Sparkles, AlertCircle } from 'lucide-react'

function AIMentorFAB() {
  const location = useLocation()
  const { learnerId } = useLearnerStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatError, setChatError] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hi! I'm your context-aware study mentor. Ask me any question about your curriculum, specific modules, or request a refresher on difficult concepts."
    }
  ])

  const messagesEndRef = useRef(null)

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isTyping, isOpen])

  // Context-aware prompt labels based on current URL path
  const getContextHeader = () => {
    if (location.pathname === '/path') return "Ask about: Subway timeline roadmap"
    if (location.pathname === '/skills') return "Ask about: Skill gaps & priorities"
    if (location.pathname === '/dashboard') return "Ask about: Next Best Action guidance"
    return "Study Assistant"
  }

  const getQuickReplies = () => {
    if (location.pathname === '/path') {
      return ["Why was Pandas recommended?", "Prerequisite for Deep Learning?", "What is topological sorting?"]
    }
    if (location.pathname === '/skills') {
      return ["How is priority calculated?", "What does high-gap mean?", "Show ML role required levels"]
    }
    return ["Why am I learning this?", "I need a coding refresher", "What should I do next?"]
  }

  const handleSend = async (messageText) => {
    if (!messageText.trim()) return

    const userMsg = { id: Date.now(), sender: 'user', text: messageText }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setChatError('')
    setIsTyping(true)

    try {
      const response = await fetch('http://localhost:8000/api/v1/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learner_id: learnerId || 'demo-user',
          message: messageText
        })
      })

      if (!response.ok) throw new Error('API server offline')
      const data = await response.json()
      
      setIsTyping(false)
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.response }])
    } catch (err) {
      console.warn("AI Mentor endpoint offline, generating local response context.")
      await new Promise(r => setTimeout(r, 1200))
      
      let replyText = "I'm currently running in offline mock mode, but I can help explain: "
      if (messageText.toLowerCase().includes('why') || messageText.toLowerCase().includes('pandas')) {
        replyText = "Pandas is critical because model training requires clean matrix inputs. The AI recommended this first so you can clean tabular CSV data files before starting model modeling."
      } else if (messageText.toLowerCase().includes('refresher') || messageText.toLowerCase().includes('math')) {
        replyText = "If you need a refresher, I recommend going to the Timeline and selecting 'I'm struggling'. The recalculation engine will automatically inject helper prerequisite modules into your schedule!"
      } else {
        replyText = `Understood. In a live environment, I would consult our LangGraph knowledge retrieval corpus to explain '${messageText}' in depth.`
      }

      setIsTyping(false)
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: replyText }])
    }
  }

  // Render FAB + Popover
  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Popover Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[480px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden text-left"
          >
            {/* Popover Header */}
            <div className="bg-slate-950 px-4 py-3.5 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-sm text-slate-200">AI Study Mentor</span>
              </div>
              <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 border border-indigo-500/20 rounded">
                Context Active
              </span>
            </div>

            {/* Context Sub-header Banner */}
            <div className="bg-slate-950/40 border-b border-slate-850/50 px-4 py-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span>{getContextHeader()}</span>
            </div>

            {/* Popover Message log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.sender === 'ai'
                      ? 'bg-slate-950 text-slate-350 border border-slate-850 rounded-tl-none'
                      : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-850 rounded-xl rounded-tl-none px-4 py-2.5 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-550 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-550 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-slate-550 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies & Inputs */}
            <div className="bg-slate-950/60 border-t border-slate-850 p-3 space-y-3">
              {/* Suggested reply chips */}
              <div className="flex flex-wrap gap-1.5">
                {getQuickReplies().map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="text-[10px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 hover:text-indigo-300 rounded px-2.5 py-1 transition-all text-left truncate max-w-full"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend(inputText)
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-600 px-3 py-2 text-white flex items-center justify-center shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIMentorFAB
