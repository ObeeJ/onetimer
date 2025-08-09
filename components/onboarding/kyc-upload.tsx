"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function KYCUpload() {
  const [nin, setNin] = useState("")
  const [bvn, setBvn] = useState("")
  const [fileName, setFileName] = useState("")

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="nin" className="font-semibold">
          NIN
        </Label>
        <Input id="nin" placeholder="12345678901" value={nin} onChange={(e) => setNin(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bvn" className="font-semibold">
          BVN
        </Label>
        <Input id="bvn" placeholder="12345678901" value={bvn} onChange={(e) => setBvn(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="doc" className="font-semibold">
          Upload ID document
        </Label>
        <Input
          id="doc"
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
        {/* S3 placeholder:
            When integrating, upload to S3 (or Blob storage) from the backend.
            Keep client uploads minimal for security; use signed URLs if needed. */}
        {fileName ? <p className="text-xs text-slate-500">Selected: {fileName}</p> : null}
      </div>
    </div>
  )
}
