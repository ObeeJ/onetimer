"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function ProfileForm() {
  const [name, setName] = useState("")
  const [dob, setDob] = useState("")

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name" className="font-semibold">Full name</Label>
        <Input id="name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dob" className="font-semibold">Date of birth</Label>
        <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
      </div>
    </div>
  )
}
