import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

async function getSurvey(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/surveys/${id}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

export default async function Page({ params }: { params: { id: string } }) {
  const data = await getSurvey(params.id)
  if (!data?.survey) notFound()
  const s = data.survey

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="rounded-2xl border border-border/40 bg-background/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>{s.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{s.description}</p>
          <div className="flex gap-2">
            <Button asChild size="lg" className="rounded-2xl h-11">
              <Link href={`/filler/surveys/${s.id}/take`}>Start Survey</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl h-11">
              <Link href="/filler/surveys">Back</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
