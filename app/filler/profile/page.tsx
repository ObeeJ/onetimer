"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { fetchJSON } from "@/hooks/use-api"
import { useAuth } from "@/hooks/use-auth"
import { Copy, User2, Loader2, Check } from "lucide-react"
import OTPModal from "@/components/ui/otp-modal"

const NIGERIAN_BANKS = [
  "Access Bank",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "FCMB",
  "GTBank",
  "Heritage Bank",
  "Keystone Bank",
  "Polaris Bank",
  "Stanbic IBTC",
  "Standard Chartered",
  "Sterling Bank",
  "UBA",
  "Union Bank",
  "Wema Bank",
  "Zenith Bank",
]

type ProfileStore = {
  avatar?: string | null // data url
  nin?: string
  bvn?: string
  bankName?: string
  accountNumber?: string
}

const PROFILE_KEY = "sf:profile"

export default function ProfilePage() {
  const { user, loaded, isAuthenticated, signIn } = useAuth()
  const [link, setLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    nin: "",
    bvn: "",
    bankName: "",
    accountNumber: "",
    avatar: "",
  })

  // track whether phone/nin/bvn have been locked (editable only once). default: load from store
  const [locked, setLocked] = useState({ phone: false, nin: false, bvn: false })
  const [otpOpen, setOtpOpen] = useState(false)
  const [pendingField, setPendingField] = useState<string | null>(null)

  // password change
  const [showPassword, setShowPassword] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // load referral link
    fetchJSON<{ link: string }>("/api/referrals").then((r) => setLink(r.link)).catch(() => {})

    // load profile from localStorage
    try {
      const raw = localStorage.getItem(PROFILE_KEY)
      if (raw) {
        const parsed: ProfileStore = JSON.parse(raw)
  setForm((f) => ({ ...f, nin: parsed.nin ?? "", bvn: parsed.bvn ?? "", bankName: parsed.bankName ?? "", accountNumber: parsed.accountNumber ?? "", avatar: parsed.avatar ?? "" }))
        // when fields exist in stored profile, lock NIN/BVN (phone lock is derived from auth user)
        setLocked((l) => ({ ...l, nin: !!parsed.nin, bvn: !!parsed.bvn }))
      }
    } catch {}
  }, [])

  // try load profile from server if available (UI-ready; server implementation optional)
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetchJSON<ProfileStore>("/api/profile")
        if (mounted && res) {
          setForm((f) => ({ ...f, nin: res.nin ?? f.nin, bvn: res.bvn ?? f.bvn, bankName: res.bankName ?? f.bankName, accountNumber: res.accountNumber ?? f.accountNumber, avatar: res.avatar ?? f.avatar }))
          setLocked((l) => ({ ...l, nin: !!res.nin, bvn: !!res.bvn }))
          setLastSave("server")
        }
      } catch (err) {
        // server not available — keep local data
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const [lastSave, setLastSave] = useState<string | null>(null)

  // lock phone if auth user already has a phone
  useEffect(() => {
    if (loaded && user) {
      setForm((f) => ({ ...f, email: user.email ?? f.email, phone: user.phone ?? f.phone }))
      setLocked((l) => ({ ...l, phone: !!user.phone }))
    }
  }, [loaded, user])

  useEffect(() => {
    // seed from auth user when available
    if (user) {
      setForm((f) => ({ ...f, name: user.name ?? "", email: user.email ?? "", phone: user.phone ?? "" }))
    }
  }, [user])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Full name is required"
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Email is invalid"
    if (form.phone && !/^\+?\d{7,15}$/.test(form.phone)) e.phone = "Phone number looks invalid"
    if (form.bvn && !/^\d{11}$/.test(form.bvn)) e.bvn = "BVN must be 11 digits"
    if (form.accountNumber && !/^\d{10}$/.test(form.accountNumber)) e.accountNumber = "Account number must be 10 digits"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || "")
      setForm((f) => ({ ...f, avatar: result }))
    }
    reader.readAsDataURL(file)
  }

  const pickAvatar = () => {
    fileRef.current?.click()
  }

  const copy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const save = () => {
    if (!validate()) return
    setSaving(true)
    try {
      // persist basic auth user info via useAuth.signIn
      const id = user?.id ?? Date.now().toString()
      signIn({ id, name: form.name.trim(), email: form.email.trim() || undefined, phone: form.phone.trim() || undefined })

      // prefer server persistence (UI-only wiring) and fall back to localStorage
      const store: ProfileStore = { avatar: form.avatar || null, nin: form.nin || "", bvn: form.bvn || "", bankName: form.bankName || "", accountNumber: form.accountNumber || "" }
      fetchJSON("/api/profile", { method: "POST", body: JSON.stringify(store) })
        .then(() => {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(store))
          setLastSave("server")
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        })
        .catch(() => {
          // server not available; persist locally
          localStorage.setItem(PROFILE_KEY, JSON.stringify(store))
          setLastSave("local")
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        })
    } catch (err) {
      // ignore for now
    } finally {
      setSaving(false)
    }
  }

  const onOtpVerified = () => {
    if (!pendingField) return
    // apply the pending field change and lock it if it's phone/nin/bvn
    if (pendingField === "phone") {
  // phone already in form; lock it and persist to auth
  setLocked((l) => ({ ...l, phone: true }))
  const id = user?.id ?? Date.now().toString()
  signIn({ id, name: form.name.trim() || user?.name || "", email: user?.email || form.email.trim() || undefined, phone: form.phone.trim() || undefined })
    } else if (pendingField === "nin") {
      setLocked((l) => ({ ...l, nin: true }))
    } else if (pendingField === "bvn") {
      setLocked((l) => ({ ...l, bvn: true }))
    } else if (pendingField === "password") {
      // for demo purposes, store password locally (DO NOT DO THIS IN PRODUCTION)
      const pwdStore = { password: newPassword }
      localStorage.setItem("sf:password", JSON.stringify(pwdStore))
      setShowPassword(false)
      setOldPassword("")
      setNewPassword("")
    }

    // persist profile when field change is verified
    const store: ProfileStore = { avatar: form.avatar || null, nin: form.nin || "", bvn: form.bvn || "", bankName: form.bankName || "", accountNumber: form.accountNumber || "" }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(store))
    setPendingField(null)
  }

  const [passwordError, setPasswordError] = useState<string | null>(null)

  const requestPasswordOtp = () => {
    // verify old password if stored
    try {
      const raw = localStorage.getItem("sf:password")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (!oldPassword || parsed.password !== oldPassword) {
          setPasswordError("Old password is incorrect")
          return
        }
      }
    } catch {}
    setPasswordError(null)
    setPendingField("password")
    setOtpOpen(true)
  }

  if (!loaded) return null

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="rounded-full border bg-white p-1">
              <Avatar className="h-16 w-16">
                {form.avatar ? (
                  <AvatarImage src={form.avatar} alt={form.name || "avatar"} />
                ) : (
                  <AvatarFallback>
                    <User2 className="h-6 w-6 text-slate-700" />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div className="absolute right-0 bottom-0">
              <button type="button" onClick={pickAvatar} className="text-xs underline text-slate-600">
                Change
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-semibold">{form.name || "Your profile"}</h1>
            <p className="text-sm text-slate-600">{form.email || form.phone || "No contact on file"}</p>
          </div>
        </div>

        {!isAuthenticated ? (
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <p className="mb-4">You need to sign in to save profile details and access your referral data.</p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/filler/auth/sign-in">Sign in</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/filler/auth/sign-up">Create account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="rounded-2xl">
              <CardHeader className="p-6">
                <CardTitle className="text-lg">Profile</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Edit your details. These are stored locally in your browser for now.</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={form.email} readOnly className="mt-1 bg-slate-50" />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed. OTPs are delivered to this address.</p>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex gap-2">
                      <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^+\d]/g, "") })} className="mt-1" readOnly={locked.phone} />
                      {!locked.phone && (
                        <Button onClick={() => { setPendingField("phone"); setOtpOpen(true) }} className="mt-1">Save</Button>
                      )}
                      {locked.phone && <div className="mt-2 text-xs text-slate-500">(Locked)</div>}
                    </div>
                    {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="nin">NIN</Label>
                    <div className="flex gap-2">
                      <Input id="nin" value={form.nin} onChange={(e) => setForm({ ...form, nin: e.target.value.replace(/\D/g, "") })} className="mt-1" readOnly={locked.nin} />
                      {!locked.nin && (
                        <Button onClick={() => { setPendingField("nin"); setOtpOpen(true) }} className="mt-1">Save</Button>
                      )}
                      {locked.nin && <div className="mt-2 text-xs text-slate-500">(Locked)</div>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bvn">BVN</Label>
                    <div className="flex gap-2">
                      <Input id="bvn" value={form.bvn} onChange={(e) => setForm({ ...form, bvn: e.target.value.replace(/\D/g, "") })} className="mt-1" readOnly={locked.bvn} />
                      {!locked.bvn && (
                        <Button onClick={() => { setPendingField("bvn"); setOtpOpen(true) }} className="mt-1">Save</Button>
                      )}
                      {locked.bvn && <div className="mt-2 text-xs text-slate-500">(Locked)</div>}
                    </div>
                    {errors.bvn && <p className="text-sm text-red-600 mt-1">{errors.bvn}</p>}
                  </div>

                  <div>
                    <Label htmlFor="bankName">Bank</Label>
                    <select id="bankName" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 text-sm border-slate-200">
                      <option value="">Select bank</option>
                      {NIGERIAN_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="accountNumber">Account number</Label>
                    <Input id="accountNumber" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, "") })} maxLength={10} className="mt-1" />
                    {errors.accountNumber && <p className="text-sm text-red-600 mt-1">{errors.accountNumber}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={save} disabled={saving} className="rounded-xl">
                    {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <>Save</>}
                  </Button>
                  <Button variant="outline" onClick={() => setShowPassword(true)} className="rounded-xl">Change password</Button>
                  {saved && (
                    <div className="flex items-center text-sm text-green-600 gap-1"><Check className="h-4 w-4"/>Saved</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {showPassword && (
              <Card className="rounded-2xl">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg">Change password</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Enter your old password, set a new password, then confirm with an OTP sent to your email.</p>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="old">Old password</Label>
                    <Input id="old" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="new">New password</Label>
                    <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => { setPendingField("password"); setOtpOpen(true) }}>Request OTP & Confirm</Button>
                    <Button variant="outline" onClick={() => setShowPassword(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-2xl">
              <CardHeader className="p-6">
                <CardTitle className="text-lg">Referral link</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Share this link with friends — it is persistent until rotated by an admin.</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input value={link} readOnly className="font-mono" />
                  <div className="flex gap-2">
                    <Button onClick={copy} disabled={!link} className="rounded-xl">
                      <Copy className="h-4 w-4 mr-2" /> {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <OTPModal open={otpOpen} email={form.email} onClose={() => setOtpOpen(false)} onVerified={onOtpVerified} />
          </>
        )}
      </div>
    </div>
  )
}
