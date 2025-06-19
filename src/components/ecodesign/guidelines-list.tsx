"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { guidelinesService, type Guideline, type CreateGuidelineData } from "@/lib/services/guidelines-service"
import { authService } from "@/lib/auth"

export default function GuidelinesList() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([])
  const [loading, setLoading] = useState(true)

  const [newGuideline, setNewGuideline] = useState<CreateGuidelineData>({
    substrategy_id: "",
    title: "",
    description: "",
    priority: "Medium",
    implementation_group_id: "",
  })

  const isAdmin = authService.isAdmin()

  useEffect(() => {
    fetchGuidelines()
  }, [])

  const fetchGuidelines = async () => {
    try {
      const data = await guidelinesService.getGuidelines()
      setGuidelines(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newGuideline.title || !newGuideline.substrategy_id) return
    try {
      await guidelinesService.createGuideline(newGuideline)
      setNewGuideline({
        substrategy_id: "",
        title: "",
        description: "",
        priority: "Medium",
        implementation_group_id: "",
      })
      fetchGuidelines()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>EcoDesign Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p>Loading guidelines...</p>
          ) : (
            <ul className="space-y-3">
              {guidelines.map((g) => (
                <li key={g.id} className="border p-3 rounded-md">
                  <h3 className="font-medium">{g.title}</h3>
                  {g.description && <p className="text-sm text-slate-600">{g.description}</p>}
                </li>
              ))}
              {guidelines.length === 0 && <p>No guidelines found.</p>}
            </ul>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Add Guideline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Substrategy ID"
              value={newGuideline.substrategy_id}
              onChange={(e) => setNewGuideline({ ...newGuideline, substrategy_id: e.target.value })}
            />
            <Input
              placeholder="Title"
              value={newGuideline.title}
              onChange={(e) => setNewGuideline({ ...newGuideline, title: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={newGuideline.description}
              onChange={(e) => setNewGuideline({ ...newGuideline, description: e.target.value })}
            />
            <Input
              placeholder="Implementation group ID"
              value={newGuideline.implementation_group_id}
              onChange={(e) =>
                setNewGuideline({ ...newGuideline, implementation_group_id: e.target.value })
              }
            />
            <Button onClick={handleCreate}>Save Guideline</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
