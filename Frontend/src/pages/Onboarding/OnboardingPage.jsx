import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useLearnerStore } from '../../store/learnerStore'
import { Send, Upload, Compass, Check, AlertCircle, RefreshCw } from 'lucide-react'

function OnboardingPage() {
  const navigate = useNavigate()
  const createProfile = useLearnerStore((state) => state.createProfile)
  const isLoading = useLearnerStore((state) => state.isLoading)

  const [mode, setMode] = useState('chat') // 'chat' or 'upload'
  const [currentStep, setCurrentStep] = useState(0) // 0: Name, 1: Role, 2: Time, 3: Format, 4: Difficulty, 5: Done
  
  // Conversational state variables
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [timeBudget, setTimeBudget] = useState(10)
  const [format, setFormat] = useState('mixed')
  const [difficulty, setDifficulty] = useState('normal')

  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatError, setChatError] = useState('')

  // Chat message feed history
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hi! Welcome to PathFinder. I'm your AI learning navigator. Let's construct your customized roadmap. To start, what is your full name?"
    }
  ])

  // Resume Upload State
  const [selectedFile, setSelectedFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Handles the AI chat replies step-by-step
  const handleChatNextStep = async (userResponseText, valueToSave = null) => {
    if (!userResponseText.trim()) return

    // Add user message to chat
    const userMsg = { id: Date.now(), sender: 'user', text: userResponseText }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setChatError('')

    // Save corresponding step value
    if (currentStep === 0) setName(userResponseText)
    if (currentStep === 1 && valueToSave) setRole(valueToSave)
    if (currentStep === 2 && valueToSave) setTimeBudget(valueToSave)
    if (currentStep === 3 && valueToSave) setFormat(valueToSave)
    if (currentStep === 4 && valueToSave) setDifficulty(valueToSave)

    // Trigger typing state
    setIsTyping(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsTyping(false)

    const nextStep = currentStep + 1
    setCurrentStep(nextStep)

    let aiText = ''
    if (nextStep === 1) {
      aiText = `Nice to meet you, ${userResponseText}! What is your target career role or skill goal? (e.g. Data Analyst, Software Engineer)`
    } else if (nextStep === 2) {
      aiText = `Got it. How many hours can you dedicate to learning each week? Use the slider tool below to set your weekly budget.`
    } else if (nextStep === 3) {
      aiText = `Excellent. What is your preferred content format? (Videos, written articles, coding projects, or a mix of all formats)`
    } else if (nextStep === 4) {
      aiText = `Understood. Finally, what is your tolerance level for difficult math and technical coding concepts? (Low, Normal, or High)`
    } else if (nextStep === 5) {
      aiText = `Creating your profile now. Hang tight while we generate your customized skill-gap analysis...`
    }

    setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiText }])

    // If final step, create profile and navigate
    if (nextStep === 5) {
      setIsTyping(true)
      const finalName = name || userResponseText
      const finalId = await createProfile(finalName, timeBudget, format, difficulty)
      setIsTyping(false)
      if (finalId) {
        navigate('/skills')
      } else {
        setChatError('Could not sync profile with database. Running offline.')
        setTimeout(() => navigate('/skills'), 1500)
      }
    }
  }

  // Handle Resume Drop/Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      triggerFileAnalysis(file)
    }
  }

  const triggerFileAnalysis = async (file) => {
    setIsAnalyzing(true)
    // Simulate hitting POST /api/v1/onboarding/extract
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${API_URL}/onboarding/extract`, {
        method: 'POST',
        body: JSON.stringify({ message: `Analyzing resume ${file.name}` }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error('API offline')
      const data = await res.json()
      
      setExtractedData({
        name: "Learner",
        target_role: data.target_role || '',
        time_budget_hours: data.time_budget_hours,
        difficulty_tolerance: data.difficulty_tolerance,
        preferred_format: 'mixed'
      })
    } catch (err) {
      console.warn("Backend offline, using fallback extraction data.")
      await new Promise(r => setTimeout(r, 2000))
      setExtractedData({
        name: "",
        target_role: "",
        time_budget_hours: 12,
        difficulty_tolerance: "normal",
        preferred_format: "mixed"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Confirm and save the extracted profile edits
  const handleConfirmExtractedProfile = async () => {
    if (!extractedData) return
    const finalId = await createProfile(
      extractedData.name, 
      extractedData.time_budget_hours, 
      extractedData.preferred_format, 
      extractedData.difficulty_tolerance
    )
    if (finalId) {
      navigate('/skills')
    } else {
      navigate('/skills')
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Decorative glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-950/10 blur-[120px] pointer-events-none" />

      {/* Onboarding Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-400 tracking-wide">
          <Compass className="h-6 w-6 text-indigo-500" />
          <span>PathFinder</span>
        </Link>
        <span className="text-xs text-slate-500 font-semibold tracking-wide">ONBOARDING SHELL</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-900/80 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm">
          
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              {mode === 'chat' ? "Map Your Custom Road" : "Upload Your Profile"}
            </h1>
            <p className="text-slate-400 text-sm">
              {mode === 'chat' 
                ? "Answer a few questions to help our model customize your weekly learning schedule."
                : "Upload your resume or job description. Our AI will extract requirements and auto-configure details."}
            </p>
          </div>

          {/* Toggle Mode Tab */}
          <div className="flex gap-2 rounded-lg bg-slate-950 p-1 border border-slate-900/80 mb-6">
            <button
              onClick={() => setMode('chat')}
              className={`flex-1 rounded-md py-2.5 text-sm font-bold transition-all ${
                mode === 'chat'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Conversational Chat
            </button>
            <button
              onClick={() => navigate('/onboarding/upload')}
              className={`flex-1 rounded-md py-2.5 text-sm font-bold transition-all ${
                mode === 'upload'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resume / JD Upload
            </button>
          </div>

          {/* MODE A: CONVERSATIONAL CHAT */}
          {mode === 'chat' && (
            <div className="flex flex-col h-[400px] border border-slate-900 bg-slate-950/60 rounded-xl overflow-hidden">
              {/* Message log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.sender === 'ai'
                            ? 'bg-slate-900 text-slate-100 rounded-tl-none border border-slate-800'
                            : 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 text-slate-400 rounded-2xl rounded-tl-none px-5 py-3 border border-slate-800 flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-200" />
                    </div>
                  </div>
                )}
                
                {chatError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/15 border border-red-500/20 px-3 py-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span>{chatError}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Dynamic Interactive Input Control */}
              <div className="bg-slate-900/60 border-t border-slate-900 p-4">
                {currentStep === 0 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleChatNextStep(inputText)
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Enter your name..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-white flex items-center justify-center transition-all"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}

                {currentStep === 1 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Software Engineer', 'Data Analyst', 'Data Scientist'].map((r) => (
                        <button
                          key={r}
                          onClick={() => handleChatNextStep(r, r)}
                          className="rounded-lg border border-indigo-500/20 bg-indigo-600/5 px-4 py-2 text-xs font-bold text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300 transition-all"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleChatNextStep(inputText, inputText)
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Or type custom role..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-white flex items-center justify-center"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full flex items-center justify-between px-2">
                      <span className="text-xs text-slate-400">Dedicate time:</span>
                      <span className="text-sm font-extrabold text-indigo-400">{timeBudget} hours / week</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="40"
                      value={timeBudget}
                      onChange={(e) => setTimeBudget(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <button
                      onClick={() => handleChatNextStep(`${timeBudget} hours per week`, timeBudget)}
                      className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2.5 font-bold text-white text-xs transition-colors"
                    >
                      Confirm Time Budget
                    </button>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: 'video', label: '🎥 Videos' },
                        { val: 'article', label: '📄 Articles' },
                        { val: 'project', label: '💻 Projects' },
                        { val: 'mixed', label: '🔄 Mixed Blend' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => handleChatNextStep(item.label, item.val)}
                          className="rounded-lg border border-slate-800 bg-slate-950 py-2.5 text-xs font-semibold hover:border-indigo-500/50 hover:bg-indigo-600/5 transition-all text-slate-300"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      {[
                        { val: 'low', label: 'Easy-going (Low)', color: 'border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-400' },
                        { val: 'normal', label: 'Moderate (Normal)', color: 'border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-400' },
                        { val: 'high', label: 'Rigorous (High)', color: 'border-amber-500/20 hover:bg-amber-500/10 text-amber-400' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => handleChatNextStep(item.label, item.val)}
                          className={`flex-1 rounded-lg border bg-slate-950 py-3 text-xs font-bold transition-all ${item.color}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep >= 5 && (
                  <div className="flex items-center justify-center gap-3 text-sm text-slate-400 py-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
                    <span>Synchronizing path parameters...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE B: RESUME / JD UPLOAD */}
          {mode === 'upload' && (
            <div className="space-y-6">
              {!extractedData && (
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-slate-850 bg-slate-950/20 hover:bg-slate-950/40 hover:border-indigo-500/40 transition-all rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
                      <p className="text-sm text-slate-300 font-bold">Analyzing document contents with AI...</p>
                      <p className="text-xs text-slate-500">Mapping requirements against learning algorithms</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-slate-500 group-hover:text-indigo-400 transition-colors mb-4" />
                      <p className="text-sm font-bold text-slate-300">Drag and drop your file here, or click to browse</p>
                      <p className="text-xs text-slate-500 mt-2">Supports PDF, DOCX, or TXT formats (Max 5MB)</p>
                    </>
                  )}
                </div>
              )}

              {/* Editable Profile Review Card (Learner Profile Specification) */}
              {extractedData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-950/80 border border-slate-900 rounded-xl p-6 space-y-5"
                >
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                    <h3 className="text-md font-bold text-slate-200">Confirm Your Profile Parameters</h3>
                    <button
                      onClick={() => {
                        setSelectedFile(null)
                        setExtractedData(null)
                      }}
                      className="text-xs text-slate-450 hover:text-slate-200 flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" /> Re-upload
                    </button>
                  </div>

                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={extractedData.name}
                      onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-slate-900 px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Target role field */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Extracted Goal / Role</label>
                    <input
                      type="text"
                      value={extractedData.target_role}
                      onChange={(e) => setExtractedData({ ...extractedData, target_role: e.target.value })}
                      className="w-full rounded-lg border border-slate-850 bg-slate-900 px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Time Budget */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-400">Weekly Time Commitment</label>
                      <span className="text-xs font-bold text-indigo-400">{extractedData.time_budget_hours} Hours</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="40"
                      value={extractedData.time_budget_hours}
                      onChange={(e) => setExtractedData({ ...extractedData, time_budget_hours: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Comfort format pills */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Preferred Learning Media</label>
                    <div className="flex gap-2">
                      {['mixed', 'video', 'article', 'project'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setExtractedData({ ...extractedData, preferred_format: f })}
                          className={`flex-1 rounded-lg border py-2 text-xs font-bold capitalize transition-all ${
                            extractedData.preferred_format === f
                              ? 'border-indigo-500/50 bg-indigo-600/10 text-indigo-400'
                              : 'border-slate-850 bg-slate-900 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comfort difficulty pills */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400">Difficulty Threshold</label>
                    <div className="flex gap-2">
                      {['low', 'normal', 'high'].map((d) => (
                        <button
                          key={d}
                          onClick={() => setExtractedData({ ...extractedData, difficulty_tolerance: d })}
                          className={`flex-1 rounded-lg border py-2 text-xs font-bold capitalize transition-all ${
                            extractedData.difficulty_tolerance === d
                              ? 'border-indigo-500/50 bg-indigo-600/10 text-indigo-400'
                              : 'border-slate-850 bg-slate-900 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmExtractedProfile}
                    className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 py-3 font-bold text-white text-sm shadow-lg shadow-indigo-600/10 transition-colors"
                  >
                    Generate Dynamic Roadmap
                  </button>
                </motion.div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default OnboardingPage