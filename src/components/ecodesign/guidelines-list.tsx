"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  guidelinesService,
  LIFE_CYCLE_PHASES,
  type Guideline,
  type CreateGuidelineData,
  type TargetGroup,
  type ImplementationGroup,
} from "@/lib/services/guidelines-service";
import { authService } from "@/lib/auth";

export default function GuidelinesList() {
  const [guidelines, setGuidelines] = useState<
    (Guideline & {
      life_cycle_phases: { phase: string }[];
      target_groups: { target_group_id: string }[];
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>([]);
  const [implementationGroups, setImplementationGroups] = useState<
    ImplementationGroup[]
  >([]);

  const [phaseFilter, setPhaseFilter] = useState("");
  const [targetGroupFilter, setTargetGroupFilter] = useState("");

  const [newGuideline, setNewGuideline] = useState<CreateGuidelineData>({
    substrategy_id: "",
    title: "",
    description: "",
    priority: "Medium",
    implementation_group_id: "",
    target_group_ids: [],
    life_cycle_phases: [],
  });

  const isAdmin = authService.isAdmin();

  useEffect(() => {
    fetchGuidelines();
    fetchTargetGroups();
    fetchImplementationGroups();
  }, []);

  const fetchGuidelines = async () => {
    try {
      const data = await guidelinesService.getGuidelines();
      setGuidelines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTargetGroups = async () => {
    try {
      const data = await guidelinesService.getTargetGroups();
      setTargetGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchImplementationGroups = async () => {
    try {
      const data = await guidelinesService.getImplementationGroups();
      setImplementationGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!newGuideline.title || !newGuideline.substrategy_id) return;
    try {
      await guidelinesService.createGuideline(newGuideline);
      setNewGuideline({
        substrategy_id: "",
        title: "",
        description: "",
        priority: "Medium",
        implementation_group_id: "",
        target_group_ids: [],
        life_cycle_phases: [],
      });
      fetchGuidelines();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = guidelines.filter((g) => {
    const matchesPhase = phaseFilter
      ? g.life_cycle_phases.some((p) => p.phase === phaseFilter)
      : true;
    const matchesTarget = targetGroupFilter
      ? g.target_groups.some((tg) => tg.target_group_id === targetGroupFilter)
      : true;
    return matchesPhase && matchesTarget;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>EcoDesign Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Phase" />
              </SelectTrigger>
              <SelectContent>
                {LIFE_CYCLE_PHASES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={targetGroupFilter}
              onValueChange={setTargetGroupFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Target group" />
              </SelectTrigger>
              <SelectContent>
                {targetGroups.map((tg) => (
                  <SelectItem key={tg.id} value={tg.id}>
                    {tg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <p>Loading guidelines...</p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((g) => (
                <li key={g.id} className="border p-3 rounded-md">
                  <h3 className="font-medium">{g.title}</h3>
                  {g.description && (
                    <p className="text-sm text-slate-600">{g.description}</p>
                  )}
                </li>
              ))}
              {filtered.length === 0 && <p>No guidelines found.</p>}
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
              onChange={(e) =>
                setNewGuideline({
                  ...newGuideline,
                  substrategy_id: e.target.value,
                })
              }
            />
            <Input
              placeholder="Title"
              value={newGuideline.title}
              onChange={(e) =>
                setNewGuideline({ ...newGuideline, title: e.target.value })
              }
            />
            <Textarea
              placeholder="Description"
              value={newGuideline.description}
              onChange={(e) =>
                setNewGuideline({
                  ...newGuideline,
                  description: e.target.value,
                })
              }
            />
            <Select
              value={newGuideline.implementation_group_id}
              onValueChange={(v) =>
                setNewGuideline({ ...newGuideline, implementation_group_id: v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Implementation group" />
              </SelectTrigger>
              <SelectContent>
                {implementationGroups.map((ig) => (
                  <SelectItem key={ig.id} value={ig.id}>
                    {ig.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <p className="text-sm font-medium">Target Groups</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {targetGroups.map((tg) => (
                  <label
                    key={tg.id}
                    className="flex items-center gap-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-600"
                      checked={newGuideline.target_group_ids.includes(tg.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewGuideline({
                            ...newGuideline,
                            target_group_ids: [
                              ...newGuideline.target_group_ids,
                              tg.id,
                            ],
                          });
                        } else {
                          setNewGuideline({
                            ...newGuideline,
                            target_group_ids:
                              newGuideline.target_group_ids.filter(
                                (id) => id !== tg.id,
                              ),
                          });
                        }
                      }}
                    />
                    {tg.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Life Cycle Phases</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {LIFE_CYCLE_PHASES.map((phase) => (
                  <label
                    key={phase}
                    className="flex items-center gap-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-600"
                      checked={newGuideline.life_cycle_phases.includes(phase)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewGuideline({
                            ...newGuideline,
                            life_cycle_phases: [
                              ...newGuideline.life_cycle_phases,
                              phase,
                            ],
                          });
                        } else {
                          setNewGuideline({
                            ...newGuideline,
                            life_cycle_phases:
                              newGuideline.life_cycle_phases.filter(
                                (p) => p !== phase,
                              ),
                          });
                        }
                      }}
                    />
                    {phase}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={handleCreate}>Save Guideline</Button>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Lookups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Add Target Group</h4>
              <Input placeholder="Code" id="tg-code" className="mb-2" />
              <Input placeholder="Label" id="tg-label" className="mb-2" />
              <Button
                onClick={async () => {
                  const code = (
                    document.getElementById("tg-code") as HTMLInputElement
                  ).value;
                  const label = (
                    document.getElementById("tg-label") as HTMLInputElement
                  ).value;
                  if (code && label) {
                    await guidelinesService.createTargetGroup({ code, label });
                    fetchTargetGroups();
                    (
                      document.getElementById("tg-code") as HTMLInputElement
                    ).value = "";
                    (
                      document.getElementById("tg-label") as HTMLInputElement
                    ).value = "";
                  }
                }}
              >
                Save Target Group
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-2">Add Implementation Group</h4>
              <Input placeholder="Code" id="ig-code" className="mb-2" />
              <Input placeholder="Label" id="ig-label" className="mb-2" />
              <Button
                onClick={async () => {
                  const code = (
                    document.getElementById("ig-code") as HTMLInputElement
                  ).value;
                  const label = (
                    document.getElementById("ig-label") as HTMLInputElement
                  ).value;
                  if (code && label) {
                    await guidelinesService.createImplementationGroup({
                      code,
                      label,
                    });
                    fetchImplementationGroups();
                    (
                      document.getElementById("ig-code") as HTMLInputElement
                    ).value = "";
                    (
                      document.getElementById("ig-label") as HTMLInputElement
                    ).value = "";
                  }
                }}
              >
                Save Implementation Group
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
