import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, UploadCloud, File, AlertCircle, Loader2, CheckCircle, Info } from 'lucide-react'
import { authenticatedFetch } from '../../lib/api'
import { useLearnerStore } from '../../store/learnerStore'

function OnboardingUploadPage() {
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const setUploadData = useLearnerStore((state) => state.setUploadData)

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
    'Searching Coursera for live courses...',
    'Finding best YouTube tutorials...',
    'Ranking top educational resources...',
    'Building personalized learning path...',
    'Finalizing Directed Acyclic Graph...'
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
        setError('Please upload a PDF file.')
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  async function handleExtract() {
    if (!selectedFile && !jdText.trim()) {
      setError('Please provide either a Resume or a Job Description.')
      return
    }

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    if (selectedFile) formData.append('resume', selectedFile)
    if (jdText) formData.append('jd_text', jdText)

    try {
      // Stage 1: Extract only
      const data = await authenticatedFetch('/onboarding/upload', {
        method: 'POST',
        body: formData,
      })
      
      setExtractedProfile(data.extracted_profile)
      setExtractionMetadata(data.extraction)
      setIsUploading(false)
    } catch (err) {
      console.error(err)
      setError(err.message || 'An error occurred during extraction.')
      setIsUploading(false)
    }
  }

  async function handleConfirm() {
    if (!extractedProfile.full_name) {
      setError('Please enter your full name.')
      return
    }

    setIsConfirming(true)
    setError(null)

    try {
      // Stage 2: Confirm and Generate
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
      console.error(err)
      setError(err.message || 'An error occurred during generation.')
      setIsConfirming(false)
    }
  }

  if (isUploading || isConfirming) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-white text-center">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-500 mb-6" />
        <h2 className="text-2xl font-semibold mb-2">
          {isConfirming ? 'Building Your Path' : 'Extracting Profile'}
        </h2>
        <p className="text-slate-400 text-lg transition-opacity duration-500 ease-in-out">{loadingMessage}</p>
        {isConfirming && (
          <p className="text-slate-600 mt-8 max-w-sm text-sm">
            Please wait. PathFinder AI is currently acquiring live educational resources from YouTube and Coursera specifically tailored to your gaps. This usually takes 15-30 seconds.
          </p>
        )}
      </div>
    )
  }

  if (extractedProfile) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-white font-sans">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight">Confirm Your Profile</h1>
            <p className="mt-4 text-lg text-slate-400">Review and edit the extracted information before we generate your roadmap.</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-500/10 p-4 text-red-500 border border-red-500/20">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {/* Extraction Metadata */}
          {extractionMetadata && (
            <div className={`mb-8 p-4 rounded-xl border ${extractionMetadata.ocr_used ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'} flex flex-col gap-2`}>
              <div className="flex items-center gap-2 font-semibold">
                {extractionMetadata.ocr_used ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                {extractionMetadata.ocr_used ? 'Resume was scanned (OCR used)' : 'Resume processed successfully'}
              </div>
              {extractionMetadata.warnings?.length > 0 && (
                <div className="text-sm opacity-80 mt-1">
                  <strong>Warnings:</strong> {extractionMetadata.warnings.join(', ')}
                </div>
              )}
            </div>
          )}

          <div className="space-y-8">
            {/* Basic Information */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <h2 className="mb-6 text-xl font-semibold border-b border-slate-800 pb-2">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                  {!extractedProfile.full_name && (
                    <p className="text-xs text-amber-500 mb-1 flex items-center gap-1"><AlertCircle size={12}/> Could not confidently identify your name.</p>
                  )}
                  <input 
                    type="text" 
                    value={extractedProfile.full_name || ''} 
                    onChange={e => setExtractedProfile({...extractedProfile, full_name: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 focus:border-indigo-500 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Current Role / Status</label>
                  <input 
                    type="text" 
                    value={extractedProfile.current_role || ''} 
                    onChange={e => setExtractedProfile({...extractedProfile, current_role: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Career Goal */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <h2 className="mb-6 text-xl font-semibold border-b border-slate-800 pb-2">Career Goal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Target Role</label>
                  <input 
                    type="text" 
                    value={extractedProfile.target_role || ''} 
                    onChange={e => setExtractedProfile({...extractedProfile, target_role: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Target Industry</label>
                  <input 
                    type="text" 
                    value={extractedProfile.target_industry || ''} 
                    onChange={e => setExtractedProfile({...extractedProfile, target_industry: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Detected Skills */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <h2 className="mb-6 text-xl font-semibold border-b border-slate-800 pb-2">Detected Skills (From Resume)</h2>
              <div className="space-y-4">
                {extractedProfile.current_skills?.map((skill, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex-1">
                      <span className="font-medium text-indigo-300">{skill.skill}</span>
                      {skill.evidence && (
                        <p className="text-xs text-slate-500 mt-1 italic flex items-center gap-1">
                          <Info size={12} /> {skill.evidence}
                        </p>
                      )}
                    </div>
                    <select 
                      value={skill.proficiency}
                      onChange={(e) => {
                        const newSkills = [...extractedProfile.current_skills];
                        newSkills[idx].proficiency = e.target.value;
                        setExtractedProfile({...extractedProfile, current_skills: newSkills})
                      }}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Advanced">Advanced</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Skills */}
            {(extractedProfile.required_skills?.length > 0 || extractedProfile.preferred_skills?.length > 0) && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
                <h2 className="mb-6 text-xl font-semibold border-b border-slate-800 pb-2">Target Skills (From JD)</h2>
                <div className="flex flex-wrap gap-2">
                  {extractedProfile.required_skills?.map((skill, idx) => (
                    <span key={`req-${idx}`} className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-sm">
                      {skill} (Required)
                    </span>
                  ))}
                  {extractedProfile.preferred_skills?.map((skill, idx) => (
                    <span key={`pref-${idx}`} className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                      {skill} (Preferred)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Preferences */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
              <h2 className="mb-6 text-xl font-semibold border-b border-slate-800 pb-2">Learning Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Weekly Hours</label>
                  <input 
                    type="number" 
                    value={extractedProfile.learning_preferences?.weekly_hours || 10} 
                    onChange={e => setExtractedProfile({
                      ...extractedProfile, 
                      learning_preferences: {...extractedProfile.learning_preferences, weekly_hours: parseInt(e.target.value)}
                    })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Difficulty Tolerance</label>
                  <select 
                    value={extractedProfile.learning_preferences?.difficulty || 'normal'}
                    onChange={e => setExtractedProfile({
                      ...extractedProfile, 
                      learning_preferences: {...extractedProfile.learning_preferences, difficulty: e.target.value}
                    })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="low">Low (Beginner Friendly)</option>
                    <option value="normal">Normal</option>
                    <option value="high">High (Challenging)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 pb-20">
              <button
                onClick={handleConfirm}
                className="w-full rounded-xl bg-indigo-600 py-4 text-lg font-bold shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500"
              >
                Generate Personalized Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-white font-sans">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Target Your Dream Role
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Upload your resume and the job description you are aiming for. Our AI will compute your skill gaps and generate a personalized curriculum from live web resources.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-500/10 p-4 text-red-500 border border-red-500/20">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Resume Upload Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition-colors hover:bg-slate-900/80">
            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
              <UploadCloud className="text-indigo-400" /> 1. Upload Resume (PDF)
            </h2>
            
            <div 
              className={`mt-4 rounded-xl border-2 border-dashed ${selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 bg-slate-800/30'} p-10 text-center transition-all cursor-pointer`}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="flex flex-col items-center gap-3 text-emerald-400">
                  <File size={40} />
                  <p className="font-medium text-lg">{selectedFile.name}</p>
                  <p className="text-sm text-emerald-500/70">Click to change file</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-400 hover:text-slate-300">
                  <UploadCloud size={40} className="text-slate-500" />
                  <p className="text-lg">Drag and drop your PDF here</p>
                  <p className="text-sm text-slate-500">or click to browse</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Description Section */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition-colors hover:bg-slate-900/80">
            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
              <FileText className="text-indigo-400" /> 2. Target Job Description
            </h2>
            <p className="text-sm text-slate-400 mb-4">Paste the responsibilities and requirements of the role you want.</p>
            
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="e.g. We are looking for a Software Engineer with experience in Python, PyTorch, and deploying models to AWS..."
              className="h-48 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 pb-20">
            <button
              onClick={handleExtract}
              disabled={!selectedFile && !jdText.trim()}
              className="w-full rounded-xl bg-indigo-600 py-4 text-lg font-bold shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            >
              Extract Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingUploadPage