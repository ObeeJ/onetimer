// Lightweight frontend mock API used when the app should be frontend-only.
// Shapes match the original app/api route responses so UI doesn't need changes.

type Survey = {
  id: string
  title: string
  description?: string
  estimatedTime?: number
  reward?: number
  eligible?: boolean
}

export async function getSurveys() {
  const data: Survey[] = Array.from({ length: 12 }).map((_, i) => ({
    id: String(i + 1),
    title: `Consumer Preferences ${i + 1}`,
    description: "Help brands understand your habits and preferences.",
    estimatedTime: 5 + (i % 5),
    reward: 20 + (i % 10),
    eligible: i % 3 !== 0,
  }))
  return { data }
}

export async function getSurvey(id: string) {
  const data = [
    { id: "q1", type: "single", text: "How often do you shop online?", options: ["Daily", "Weekly", "Monthly", "Rarely"] },
    { id: "q2", type: "multi", text: "Which categories do you buy most?", options: ["Groceries", "Electronics", "Fashion", "Beauty", "Home"] },
    { id: "q3", type: "text", text: "What could improve your shopping experience?" },
    { id: "q4", type: "rating", text: "Rate your satisfaction with delivery speed", scale: 5 },
    { id: "q5", type: "matrix", text: "Please rate the following:", rows: ["Price", "Quality", "Customer Support"], cols: ["Very Poor", "Poor", "Average", "Good", "Excellent"] },
  ]

  return {
    data,
    survey: { id, title: `Survey ${id}`, description: "Help us understand your preferences." },
  }
}

export async function submitSurvey(id: string, body: any) {
  // pretend to award points
  return { ok: true, awarded: 50 }
}

export async function checkEligibility() {
  return { eligible: Math.random() > 0.2 }
}

export async function getEarnings() {
  const balance = 1230
  const history = [
    { id: "e1", points: 300, date: new Date().toISOString(), source: "Survey #12" },
    { id: "e2", points: 450, date: new Date(Date.now() - 864e5).toISOString(), source: "Survey #05" },
    { id: "e3", points: 480, date: new Date(Date.now() - 2 * 864e5).toISOString(), source: "Referral bonus" },
  ]
  return { balance, history }
}

export async function withdrawPayment(body: any) {
  return { ok: true, ref: `ps_${Math.random().toString(36).slice(2, 10)}` }
}

export async function sendOtp(body: any) {
  return { ok: true, channel: "email" }
}

export async function verifyOtp(body: any) {
  return { ok: true, verified: true }
}

export async function getReferrals(qs?: URLSearchParams) {
  if (qs?.get("list")) {
    const users = Array.from({ length: 6 }).map((_, i) => ({
      id: `r${i}`,
      name: `User ${i + 1}`,
      joinedAt: new Date(Date.now() - i * 864e5).toISOString(),
      points: 50 + i * 10,
    }))
    return { users }
  }
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/filler/auth/sign-up?ref=abc123`
  return { link }
}

export async function generateReferral() {
  const token = Math.random().toString(36).slice(2, 8)
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/filler/auth/sign-up?ref=${token}`
  return { link }
}

// Creator mocks
export async function creatorSignup(body: any) {
  // store in-memory using window for demo
  if (typeof window !== "undefined") {
    ;(window as any).__creator = { ...( (window as any).__creator || {} ), business: body }
  }
  return { ok: true }
}

export async function creatorSetupPayment(body: any) {
  if (typeof window !== "undefined") {
    ;(window as any).__creator = { ...( (window as any).__creator || {} ), payment: body }
  }
  return { ok: true }
}

export async function creatorSurveys(method: string = "GET", body?: any) {
  if (method === "POST") {
    // create a new survey in-memory
    const s = { id: Date.now().toString(), ...body }
    if (typeof window !== "undefined") {
      ;(window as any).__creator = (window as any).__creator || {}
  ;(window as any).__creator.surveys = [...((window as any).__creator.surveys || []), s]
    }
    return { ok: true, survey: s }
  }
  // GET - return stored surveys or seed
  const data = (typeof window !== "undefined" && (window as any).__creator?.surveys) || [
    { id: "100", title: "Product Feedback", status: "live" },
    { id: "101", title: "Brand Awareness", status: "pending" },
  ]
  return data
}

export async function creatorSurveyResponses(id: string) {
  // mock some responses
  const rows = Array.from({ length: Math.floor(Math.random() * 20) }).map((_, i) => ({ id: `r${i}`, answers: { q1: "A", q2: "B" }, submittedAt: new Date(Date.now() - i * 3600 * 1000).toISOString() }))
  return rows
}

export async function creatorSurveyExport(id: string) {
  // produce CSV header + rows
  const rows = await creatorSurveyResponses(id)
  const csv = ["id,submittedAt,answers"].concat(rows.map(r => `${r.id},${r.submittedAt},"${JSON.stringify(r.answers).replace(/"/g,'""')}"`)).join("\n")
  return csv
}
