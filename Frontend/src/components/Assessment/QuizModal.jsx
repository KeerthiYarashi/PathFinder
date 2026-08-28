import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Award, HelpCircle, Loader2 } from 'lucide-react'

// Hardcoded questions by skill ID for high-fidelity interactive quiz demo
const MOCK_QUESTIONS = {
  python_pandas: [
    {
      q: "Which Pandas function is used to parse and load structured tabular files into a DataFrame?",
      options: [".read_csv()", ".load_csv()", ".from_csv()", ".open_csv()"],
      correct: 0
    },
    {
      q: "How do you drop non-essential feature columns from a DataFrame?",
      options: [".remove(columns)", ".drop(columns=...)", ".delete(columns)", ".exclude(columns)"],
      correct: 1
    },
    {
      q: "What is the primary function of the Pandas .groupby() aggregation?",
      options: ["Sort rows alphabetically", "Remove duplicate matrix values", "Split data into groups based on criteria", "Transform numerical values to scales"],
      correct: 2
    }
  ],
  math_probability: [
    {
      q: "What is the value range of a standard probability distribution function?",
      options: ["-1 to 1", "0 to 1", "0 to infinity", "-infinity to infinity"],
      correct: 1
    },
    {
      q: "Which theorem represents the conditional probability P(A|B) using prior statistics?",
      options: ["Bayes' Theorem", "Central Limit Theorem", "Pythagorean Theorem", "Markov Inequality"],
      correct: 0
    }
  ]
}

const DEFAULT_QUESTIONS = [
  {
    q: "What is the primary goal of supervised machine learning algorithms?",
    options: ["Cluster unlabelled items", "Map labeled outputs from inputs", "Compress matrix dimensions", "Perform random walking"],
    correct: 1
  },
  {
    q: "Which activation function is widely used to prevent vanishing gradient problems in deep nets?",
    options: ["Sigmoid", "Tanh", "ReLU (Rectified Linear Unit)", "Softmax"],
    correct: 2
  }
]

function QuizModal({ skillId, skillName, onClose, onComplete }) {
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [answers, setAnswers] = useState([])
  const [quizFinished, setQuizFinished] = useState(false)

  const questions = MOCK_QUESTIONS[skillId] || DEFAULT_QUESTIONS
  const totalQuestions = questions.length

  // Simulate LLM question generation loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = () => {
    if (selectedOption === null) return

    const newAnswers = [...answers, selectedOption]
    setAnswers(newAnswers)
    setSelectedOption(null)

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setQuizFinished(true)
    }
  }

  const handleFinish = () => {
    // Calculate final score
    const correctCount = answers.filter((ans, idx) => ans === questions[idx].correct).length
    const scorePct = (correctCount / totalQuestions) * 100
    
    // Call complete trigger
    onComplete(scorePct >= 70) // Pass true if they scored at least 70%
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-left"
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-850 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-indigo-400" />
            <span className="font-extrabold text-sm text-slate-200">Skill Assessment: {skillName}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* LOADING STATE - SIMULATES DYNAMIC LLM ASSESSOR GENERATION */}
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-350">LLM Assessor Booting...</p>
              <p className="text-xs text-slate-500 max-w-xs">Analyzing targets to generate personalized multiple choice concepts.</p>
            </div>
            
            {/* Loading Skeleton */}
            <div className="w-full space-y-3 mt-4 animate-pulse">
              <div className="h-4 bg-slate-950 rounded w-3/4" />
              <div className="h-10 bg-slate-950 rounded w-full" />
              <div className="h-10 bg-slate-950 rounded w-full" />
            </div>
          </div>
        ) : !quizFinished ? (
          /* ACTIVE QUESTIONS */
          <div className="p-6 space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Question {currentStep + 1} of {totalQuestions}</span>
                <span className="text-indigo-400">{Math.round(((currentStep) / totalQuestions) * 100)}% Complete</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentStep) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 leading-relaxed">
                {questions[currentStep].q}
              </h3>
              
              {/* Option List */}
              <div className="space-y-2">
                {questions[currentStep].options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => setSelectedOption(oIdx)}
                    className={`w-full flex items-center gap-3 rounded-xl border p-4 text-xs font-bold text-left transition-all ${
                      selectedOption === oIdx
                        ? 'border-indigo-500/50 bg-indigo-650/10 text-indigo-400'
                        : 'border-slate-850 bg-slate-950 text-slate-350 hover:bg-slate-850'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                      selectedOption === oIdx
                        ? 'bg-indigo-600 border-indigo-400 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="pt-2 flex justify-end gap-3 border-t border-slate-850">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-800 hover:bg-slate-850 px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-550 disabled:cursor-not-allowed px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-650/10"
              >
                {currentStep === totalQuestions - 1 ? "Submit Quiz" : "Next Question"}
              </button>
            </div>
          </div>
        ) : (
          /* QUIZ FINISHED - SUCCESS SUMMARY STATE */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-450">
              <Award className="h-8 w-8 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-100">Assessment Complete!</h2>
              <p className="text-xs text-slate-450 max-w-sm mx-auto">
                Your performance has been evaluated by our LLM assessor model to update your mastery metrics.
              </p>
            </div>

            {/* Scorecard */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 max-w-xs mx-auto grid grid-cols-2 gap-4">
              <div className="border-r border-slate-850 text-center">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Correct</span>
                <span className="text-lg font-black text-slate-200">
                  {answers.filter((ans, idx) => ans === questions[idx].correct).length} <span className="text-xs text-slate-500">/ {totalQuestions}</span>
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Result</span>
                <span className={`text-sm font-black capitalize ${
                  answers.filter((ans, idx) => ans === questions[idx].correct).length / totalQuestions >= 0.7
                    ? 'text-emerald-450'
                    : 'text-amber-500'
                }`}>
                  {answers.filter((ans, idx) => ans === questions[idx].correct).length / totalQuestions >= 0.7
                    ? 'Mastery Level Up!'
                    : 'Keep Practicing'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleFinish}
                className="rounded-xl bg-indigo-650 hover:bg-indigo-600 px-8 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-650/15"
              >
                Update Skill Mastery
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default QuizModal
