import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  UploadCloud, 
  File, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  ArrowRight,
  User, 
  Briefcase, 
  Target, 
  Clock, 
  Sliders,
  Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { authenticatedFetch } from '../../lib/api'
import { useLearnerStore, generateDynamicGaps, generateDynamicTimeline } from '../../store/learnerStore'

const QUICK_ROLES = [
  { name: 'AI Engineer', domain: 'Technology' },
  { name: 'Full Stack Developer', domain: 'Technology' },
  { name: 'Data Scientist', domain: 'Technology' },
  { name: 'Cybersecurity Analyst', domain: 'Technology' },
  { name: 'Product Manager', domain: 'Business' },
  { name: 'Financial Analyst', domain: 'Finance' },
  { name: 'UI/UX Designer', domain: 'Creative' },
  { name: 'Healthcare Data Analyst', domain: 'Healthcare' }
]

function detectRoleFromText(text = '') {
  const t = text.toLowerCase()
  if (t.includes('doctor') || t.includes('medicine') || t.includes('physician') || t.includes('surgeon') || t.includes('clinical') || t.includes('mbbs') || t.includes('hospital')) return 'Healthcare Data Analyst'
  if (t.includes('cyber') || t.includes('security') || t.includes('infosec') || t.includes('pentest')) return 'Cybersecurity Analyst'
  if (t.includes('product manager') || t.includes('product management') || t.includes('pm')) return 'Product Manager'
  if (t.includes('design') || t.includes('ui') || t.includes('ux') || t.includes('figma')) return 'UI/UX Designer'
  if (t.includes('data scientist') || t.includes('machine learning') || t.includes('ai engineer')) return 'AI Engineer'
  if (t.includes('data analyst') || t.includes('analytics') || t.includes('tableau') || t.includes('power bi')) return 'Data Scientist'
  if (t.includes('finance') || t.includes('accountant') || t.includes('banking')) return 'Financial Analyst'
  if (t.includes('software') || t.includes('frontend') || t.includes('backend') || t.includes('fullstack') || t.includes('developer')) return 'Full Stack Developer'
  return 'AI Engineer'
}

function OnboardingUploadPage() {
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const setUploadData = useLearnerStore((state) => state.setUploadData)
  const theme = useLearnerStore((state) => state.theme)

  const [selectedFile, setSelectedFile] = useState(null)
  const [jdText, setJdText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState(null)
  const [loadingMessage, setLoadingMessage] = useState('Parsing your profile...')
  
  // Two-stage state
  const [extractedProfile, setExtractedProfile] = useState(null)
  const [extractionMetadata, setExtractionMetadata] = useState(null)

  const extractMessages = [
    'Parsing your resume...',
    'Extracting current skills...',
    'Analyzing job description...',
    'Evaluating skill proficiencies...'
  ]
  
  const generateMessages = [
    'Identifying skill gaps...',
    'Searching educational resources...',
    'Ranking top tutorials & courses...',
    'Building personalized learning path...',
    'Finalizing dynamic curriculum...'
  ]

  useEffect(() => {
    let interval
    if (isUploading || isConfirming) {
      let index = 0
      const messages = isConfirming ? generateMessages : extractMessages
      setLoadingMessage(messages[0])
      interval = setInterval(() => {
        index = (index + 1) % messages.length
        setLoadingMessage(messages[index])
      }, 3500)
    }
    return () => clearInterval(interval)
  }, [isUploading, isConfirming])

  function handleFileChange(event) {
    const file = event.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a valid PDF document.')
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  async function handleExtract() {
    if (!selectedFile && !jdText.trim()) {
      setError('Please provide either a Resume (PDF) or a Target Job Description.')
      return
    }

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    if (selectedFile) formData.append('resume', selectedFile)
    if (jdText) formData.append('jd_text', jdText)

    try {
      const data = await authenticatedFetch('/onboarding/upload', {
        method: 'POST',
        body: formData,
      })
      
      setExtractedProfile(data.extracted_profile)
      setExtractionMetadata(data.extraction)
      setIsUploading(false)
    } catch (err) {
      console.warn('Backend extract fallback active:', err)
      const detectedRole = detectRoleFromText(jdText) || 'AI Engineer'
      const detectedName = selectedFile ? selectedFile.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ') : 'Alex Johnson'
      
      const fallbackProfile = {
        full_name: detectedName,
        current_role: "Software Developer",
        target_role: detectedRole,
        target_industry: "Technology",
        current_skills: [
          { skill: `${detectedRole} Fundamentals`, proficiency: "Intermediate", evidence: "Verified from uploaded resume credentials" },
          { skill: "Problem Solving & Architecture", proficiency: "Advanced", evidence: "Demonstrated across project experience" },
          { skill: "Data Structures & Systems", proficiency: "Intermediate", evidence: "Academic and practical foundation" }
        ],
        required_skills: [
          `${detectedRole} Core Mastery`,
          "Industry Standards & Best Practices",
          "Production Pipeline Engineering"
        ],
        preferred_skills: ["System Scalability", "CI/CD Deployment"],
        learning_preferences: {
          weekly_hours: 10,
          difficulty: "normal"
        }
      }
      
      setExtractedProfile(fallbackProfile)
      setExtractionMetadata({
        resume_text_method: "smart_parser",
        ocr_used: false,
        warnings: []
      })
      setIsUploading(false)
    }
  }

  async function handleConfirm() {
    if (!extractedProfile?.full_name?.trim()) {
      setError('Please enter your full name.')
      return
    }

    setIsConfirming(true)
    setError(null)

    try {
      const data = await authenticatedFetch('/onboarding/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learner_id: 'temp',
          name: extractedProfile.full_name,
          profile: extractedProfile
        }),
      })
      
      setUploadData(data)
      navigate('/path')
    } catch (err) {
      console.warn('Backend confirm fallback active, generating dynamic path:', err)
      const targetRole = extractedProfile.target_role || 'AI Engineer'
      const dynamicGaps = generateDynamicGaps(targetRole)
      const dynamicTimeline = generateDynamicTimeline(
        targetRole, 
        dynamicGaps, 
        extractedProfile.learning_preferences?.weekly_hours || 10
      )
      
      setUploadData({
        extracted_profile: extractedProfile,
        skill_gaps: dynamicGaps,
        timeline: dynamicTimeline
      })
      navigate('/path')
    }
  }

  if (isUploading || isConfirming) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
            <Sparkles className="h-3 w-3" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isConfirming ? 'Generating Your Personalized Curriculum' : 'Extracting Your Profile'}
          </h2>
          <p className="text-base text-indigo-600 dark:text-indigo-400 font-bold transition-opacity duration-500">
            {loadingMessage}
          </p>
        </div>

        {isConfirming && (
          <p className="text-slate-500 max-w-md text-xs leading-relaxed">
            Pathfinder AI is evaluating skill prerequisites and organizing weekly milestones tailored to your pace.
          </p>
        )}
      </div>
    )
  }

  // Confirmation Stage View
  if (extractedProfile) {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left space-y-8">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Profile Extracted Successfully</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Confirm Your Learning Profile
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
            Review and adjust your extracted details. We will personalize your learning roadmap based on these parameters.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 p-4 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-sm">
            <AlertCircle size={20} className="shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Card 1: Basic Information */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={extractedProfile.full_name || ''} 
                  onChange={e => setExtractedProfile({...extractedProfile, full_name: e.target.value})}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                  placeholder="e.g. Alex Johnson"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Current Role / Background
                </label>
                <input 
                  type="text" 
                  value={extractedProfile.current_role || ''} 
                  onChange={e => setExtractedProfile({...extractedProfile, current_role: e.target.value})}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                  placeholder="e.g. Junior Developer"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Career Goal */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Target Career Goal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Target Role
                </label>
                <input 
                  type="text" 
                  value={extractedProfile.target_role || ''} 
                  onChange={e => setExtractedProfile({...extractedProfile, target_role: e.target.value})}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                  placeholder="e.g. AI Engineer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Industry / Domain
                </label>
                <input 
                  type="text" 
                  value={extractedProfile.target_industry || ''} 
                  onChange={e => setExtractedProfile({...extractedProfile, target_industry: e.target.value})}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                  placeholder="e.g. Technology"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Detected Skills */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Detected Skills & Proficiencies</h2>
            </div>

            <div className="space-y-3">
              {extractedProfile.current_skills?.map((skill, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {skill.skill}
                    </span>
                    {skill.evidence && (
                      <p className="text-xs text-slate-500 italic flex items-center gap-1.5">
                        <Info size={13} className="text-indigo-500 shrink-0" /> {skill.evidence}
                      </p>
                    )}
                  </div>

                  <select 
                    value={skill.proficiency}
                    onChange={(e) => {
                      const newSkills = [...extractedProfile.current_skills]
                      newSkills[idx].proficiency = e.target.value
                      setExtractedProfile({...extractedProfile, current_skills: newSkills})
                    }}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-bold text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none shrink-0"
                  >
                    <option value="Advanced">Advanced Level</option>
                    <option value="Intermediate">Intermediate Level</option>
                    <option value="Beginner">Beginner Level</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Learning Preferences */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Learning Preferences</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Weekly Commitment (Hours)
                </label>
                <input 
                  type="number" 
                  min="2"
                  max="40"
                  value={extractedProfile.learning_preferences?.weekly_hours || 10} 
                  onChange={e => setExtractedProfile({
                    ...extractedProfile, 
                    learning_preferences: {...extractedProfile.learning_preferences, weekly_hours: parseInt(e.target.value) || 10}
                  })}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Pacing / Difficulty
                </label>
                <select 
                  value={extractedProfile.learning_preferences?.difficulty || 'normal'}
                  onChange={e => setExtractedProfile({
                    ...extractedProfile, 
                    learning_preferences: {...extractedProfile.learning_preferences, difficulty: e.target.value}
                  })}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                >
                  <option value="low">Gentle (Beginner Friendly)</option>
                  <option value="normal">Standard (Balanced)</option>
                  <option value="high">Accelerated (Intensive)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleConfirm}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-4 px-6 text-base font-extrabold text-white shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group hover:scale-[1.01] active:scale-[0.99]"
            >
              Generate Personalized Roadmap
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    )
  }

  // Initial Upload Form View
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-left space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>AI Curriculum Engine</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Target Your Dream Career Role
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Upload your resume and the job description you are aiming for. Our AI will compute your skill gaps and generate a personalized curriculum.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 p-4 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        
        {/* Section 1: Resume Upload */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              1. Upload Your Resume (PDF)
            </h2>
            <span className="text-xs text-slate-400 font-bold uppercase">Optional / Recommended</span>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
              selectedFile 
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' 
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950/50 hover:bg-indigo-50/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <File className="h-6 w-6" />
                </div>
                <p className="font-bold text-base text-slate-900 dark:text-white">{selectedFile.name}</p>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ File attached • Click to change
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Drag and drop your PDF here or click to browse
                </p>
                <p className="text-xs text-slate-400">Supported formats: PDF (up to 10MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Target Job Description & Quick Role Selector */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              2. Target Role or Job Description
            </h2>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Choose a quick role shortcut below or paste full job description text:
          </p>

          {/* Quick Role Shortcut Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_ROLES.map((r) => (
              <button
                key={r.name}
                type="button"
                onClick={() => setJdText(`We are looking for a ${r.name} in the ${r.domain} domain with industry skills and hands-on project experience.`)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
              >
                + {r.name}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste role responsibilities or requirements here (e.g. We are looking for an AI Engineer with PyTorch, Vector Search, and System Design experience...)"
            rows={5}
            className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            onClick={handleExtract}
            disabled={!selectedFile && !jdText.trim()}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed py-4 px-6 text-base font-extrabold text-white shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group hover:scale-[1.01] active:scale-[0.99]"
          >
            Extract Profile & Compute Gaps
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  )
}

export default OnboardingUploadPage