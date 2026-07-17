"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload } from "lucide-react"
import * as xlsx from "xlsx"
import { importStudentsBulk } from "@/app/dashboard/courses/actions"

export function ImportExcel({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<{ RRN: string; NAME: string }[] | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError(null)
    
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = xlsx.read(bstr, { type: "binary" })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = xlsx.utils.sheet_to_json<{ RRN?: string; NAME?: string; ['S. NO']?: number }>(ws)

        // Filter and format
        const formattedData = data
          .filter(row => row.RRN && row.NAME)
          .map(row => ({
            RRN: String(row.RRN).trim(),
            NAME: String(row.NAME).trim()
          }))

        if (formattedData.length === 0) {
          setError("No valid students found. Ensure headers are 'RRN' and 'NAME'.")
          return
        }

        setParsedData(formattedData)
      } catch (err) {
        setError("Failed to parse Excel file.")
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = async () => {
    if (!parsedData) return
    setLoading(true)
    setError(null)

    const result = await importStudentsBulk(parsedData, courseId)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setOpen(false)
      setLoading(false)
      setParsedData(null)
      setFileName(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) {
        setParsedData(null)
        setFileName(null)
        setError(null)
      }
    }}>
      {/* @ts-expect-error asChild is valid for DialogTrigger but missing in types */}
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 h-10">
          <Upload className="h-4 w-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-slate-500">
            Upload an Excel file (.xlsx) to bulk import students. The file must have columns named <strong className="font-semibold text-slate-900">RRN</strong> and <strong className="font-semibold text-slate-900">NAME</strong>.
          </p>
          
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-slate-500" />
                <p className="text-sm text-slate-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            </label>
          </div>

          {fileName && (
            <p className="text-sm text-center text-slate-700">
              Selected: <span className="font-medium">{fileName}</span>
              {parsedData && <span className="text-green-600 block mt-1">Found {parsedData.length} valid students.</span>}
            </p>
          )}

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          
          <Button 
            onClick={handleImport} 
            className="w-full bg-green-600 hover:bg-green-700 h-11" 
            disabled={!parsedData || loading}
          >
            {loading ? "Importing..." : "Confirm & Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
