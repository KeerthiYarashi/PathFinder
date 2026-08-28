import { useRef, useState } from 'react'

function OnboardingUploadPage() {
  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)

  function handleFileChange(event) {
    const selectedFile = event.target.files[0]

    if (selectedFile) {
      setSelectedFile(selectedFile)
    }
  }


  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">
          Upload your documents
        </h1>

        <p className="mt-2 text-slate-400">
          Upload your resume or job description to help us understand your
          skills and goals.
        </p>

        <div className="mt-8 rounded-lg border-2 border-dashed border-slate-700 p-10 text-center">
          <p className="text-slate-300">
            Drag and drop your file here
          </p>

          <p className="mt-2 text-sm text-slate-500">
            or
          </p>

          <input
  type="file"
  ref={fileInputRef}
  onChange={handleFileChange}
  className="hidden"
/>

<button
  onClick={() => fileInputRef.current.click()}
  className="mt-4 rounded-lg bg-indigo-500 px-5 py-3 font-medium hover:bg-indigo-600"
>
  Choose File
</button>
{selectedFile && (
  <p className="mt-4 text-sm text-slate-300">
    Selected: {selectedFile.name}
  </p>
)}
        </div>
      </div>
    </div>
  )
}

export default OnboardingUploadPage