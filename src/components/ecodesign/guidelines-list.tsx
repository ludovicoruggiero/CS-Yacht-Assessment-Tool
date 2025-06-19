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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import {
  guidelinesService,
  LIFE_CYCLE_PHASES,
  type Guideline,
  type CreateGuidelineData,
  type TargetGroup,
  type ImplementationGroup,
  type HullType,
  type PropulsionType,
  type YachtSizeClass,
  type OperationalProfile,
  type TechnologyReadinessLevel,
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
  const [hullTypes, setHullTypes] = useState<HullType[]>([]);
  const [propulsionTypes, setPropulsionTypes] = useState<PropulsionType[]>([]);
  const [sizeClasses, setSizeClasses] = useState<YachtSizeClass[]>([]);
  const [operationalProfiles, setOperationalProfiles] = useState<
    OperationalProfile[]
  >([]);
  const [trls, setTrls] = useState<TechnologyReadinessLevel[]>([]);

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
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("create");

  useEffect(() => {
    fetchGuidelines();
    fetchTargetGroups();
    fetchImplementationGroups();
    fetchHullTypes();
    fetchPropulsionTypes();
    fetchSizeClasses();
    fetchOperationalProfiles();
    fetchTrls();
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

  const fetchHullTypes = async () => {
    try {
      const data = await guidelinesService.getHullTypes();
      setHullTypes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPropulsionTypes = async () => {
    try {
      const data = await guidelinesService.getPropulsionTypes();
      setPropulsionTypes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSizeClasses = async () => {
    try {
      const data = await guidelinesService.getYachtSizeClasses();
      setSizeClasses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOperationalProfiles = async () => {
    try {
      const data = await guidelinesService.getOperationalProfiles();
      setOperationalProfiles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTrls = async () => {
    try {
      const data = await guidelinesService.getTechnologyReadinessLevels();
      setTrls(data);
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
        <CardHeader className="flex items-center justify-between">
          <CardTitle>EcoDesign Guidelines</CardTitle>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAdmin(!showAdmin)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
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

      {isAdmin && showAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={adminTab} onValueChange={setAdminTab} className="w-full">
              <TabsList>
                <TabsTrigger value="create">Create Guideline</TabsTrigger>
                <TabsTrigger value="lookups">Manage Lookups</TabsTrigger>
              </TabsList>
              <TabsContent value="create" className="space-y-3">
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
                      <label key={tg.id} className="flex items-center gap-1 text-sm">
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
                                target_group_ids: newGuideline.target_group_ids.filter(
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
                      <label key={phase} className="flex items-center gap-1 text-sm">
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
                                life_cycle_phases: newGuideline.life_cycle_phases.filter(
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
              </TabsContent>
              <TabsContent value="lookups" className="space-y-6">
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
            <div>
              <h4 className="font-medium mb-2">Add Hull Type</h4>
              <Input placeholder="Code" id="ht-code" className="mb-2" />
              <Input placeholder="Label" id="ht-label" className="mb-2" />
              <Button
                onClick={async () => {
                  const code = (
                    document.getElementById("ht-code") as HTMLInputElement
                  ).value;
                  const label = (
                    document.getElementById("ht-label") as HTMLInputElement
                  ).value;
                  if (code && label) {
                    await guidelinesService.createHullType({ code, label });
                    fetchHullTypes();
                    (
                      document.getElementById("ht-code") as HTMLInputElement
                    ).value = "";
                    (
                      document.getElementById("ht-label") as HTMLInputElement
                    ).value = "";
                  }
                }}
              >
                Save Hull Type
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-2">Add Propulsion Type</h4>
              <Input placeholder="Code" id="pt-code" className="mb-2" />
              <Input placeholder="Label" id="pt-label" className="mb-2" />
              <Button
                onClick={async () => {
                  const code = (
                    document.getElementById("pt-code") as HTMLInputElement
                  ).value;
                  const label = (
                    document.getElementById("pt-label") as HTMLInputElement
                  ).value;
                  if (code && label) {
                    await guidelinesService.createPropulsionType({
                      code,
                      label,
                    });
                    fetchPropulsionTypes();
                    (
                      document.getElementById("pt-code") as HTMLInputElement
                    ).value = "";
                    (
                      document.getElementById("pt-label") as HTMLInputElement
                    ).value = "";
                  }
                }}
              >
                Save Propulsion Type
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-2">Add Size Class</h4>
              <Input placeholder="Code" id="sc-code" className="mb-2" />
              <Input placeholder="Label" id="sc-label" className="mb-2" />
              <Button
                onClick={async () => {
                  const code = (
                    document.getElementById("sc-code") as HTMLInputElement
                  ).value;
                  const label = (
                    document.getElementById("sc-label") as HTMLInputElement
                  ).value;
                  if (code && label) {
                    await guidelinesService.createYachtSizeClass({
                      code,
                      label,
                    });
                    fetchSizeClasses();
                    (
                      document.getElementById("sc-code") as HTMLInputElement
                    ).value = "";
                    (
                      document.getElementById("sc-label") as HTMLInputElement
                    ).value = "";
                  }
                }}
              >
                Save Size Class
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-2">Add Operational Profile</h4>
              <Input placeholder="Code" id="op-code" className="mb-2" />
              <Input placeholder="Label" id="op-label" className="mb-2" />
              <Button
                onClick={async () => {
                  const code = (
                    document.getElementById("op-code") as HTMLInputElement
                  ).value;
                  const label = (
                    document.getElementById("op-label") as HTMLInputElement
                  ).value;
                  if (code && label) {
                    await guidelinesService.createOperationalProfile({
                      code,
                      label,
                    });
                    fetchOperationalProfiles();
                    (
                      document.getElementById("op-code") as HTMLInputElement
                    ).value = "";
                    (
                      document.getElementById("op-label") as HTMLInputElement
                    ).value = "";
                  }
                }}
              >
                Save Operational Profile
              </Button>
            </div>
            <div>
              <h4 className="font-medium mb-2">Add TRL</h4>
              <Input placeholder="Code" id="trl-code" className="mb-2" />
              <Input placeholder="Label" id="trl-label" className="mb-2" />
              <Button
                onClick={async () => {
                  const code = (
                    document.getElementById("trl-code") as HTMLInputElement
                  ).value;
                  const label = (
                    document.getElementById("trl-label") as HTMLInputElement
                  ).value;
                  if (code && label) {
                    await guidelinesService.createTechnologyReadinessLevel({
                      code,
                      label,
                    });
                    fetchTrls();
                    (
                      document.getElementById("trl-code") as HTMLInputElement
                    ).value = "";
                    (
                      document.getElementById("trl-label") as HTMLInputElement
                    ).value = "";
                  }
                }}
              >
                Save TRL
              </Button>
            </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
