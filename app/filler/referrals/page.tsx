"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { fetchJSON } from "@/hooks/use-api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type RefUser = { id: string; name: string; joinedAt: string; points: number }

export default function ReferralsPage() {
  const [link, setLink] = useState("")
  const [users, setUsers] = useState<RefUser[]>([])

  useEffect(() => {
    fetchJSON<{ link: string }>("/api/referrals").then((r) => setLink(r.link))
    fetchJSON<{ users: RefUser[] }>("/api/referrals?list=1").then((r) => setUsers(r.users))
  }, [])

  const generate = async () => {
    const r = await fetchJSON<{ link: string }>("/api/referrals/generate", { method: "POST" })
    setLink(r.link)
  }

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Input value={link} readOnly className="flex-1" />
          <Button onClick={() => navigator.clipboard.writeText(link)}>Copy</Button>
          <Button variant="outline" onClick={generate}>
            Regenerate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referred Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{new Date(u.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{u.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
