import { supabase } from "../supabase";

export interface Guideline {
  id: string;
  substrategy_id: string;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  implementation_group_id: string;
  created_at: string;
}

export interface CreateGuidelineData {
  substrategy_id: string;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  implementation_group_id: string;
  target_group_ids: string[];
  life_cycle_phases: string[];
}

export interface TargetGroup {
  id: string;
  code: string;
  label: string;
}

export interface ImplementationGroup {
  id: string;
  code: string;
  label: string;
}

export const LIFE_CYCLE_PHASES = [
  "Upstream",
  "Design",
  "Production",
  "Operation",
  "Downstream",
  "End-of-Life",
] as const;

export class GuidelinesService {
  async getGuidelines(): Promise<
    (Guideline & {
      life_cycle_phases: { phase: string }[];
      target_groups: { target_group_id: string }[];
    })[]
  > {
    const { data, error } = await supabase
      .from("lcd_guidelines.guidelines")
      .select(
        "*, guideline_life_cycle_phases(phase), guideline_target_groups(target_group_id)",
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch guidelines: ${error.message}`);
    }

    return data || [];
  }

  async createGuideline(guideline: CreateGuidelineData): Promise<Guideline> {
    const { target_group_ids, life_cycle_phases, ...core } = guideline;

    const { data, error } = await supabase
      .from("lcd_guidelines.guidelines")
      .insert(core)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create guideline: ${error.message}`);
    }

    const inserted = data;

    if (target_group_ids.length) {
      await supabase
        .from("lcd_guidelines.guideline_target_groups")
        .insert(
          target_group_ids.map((id) => ({
            guideline_id: inserted.id,
            target_group_id: id,
          })),
        );
    }

    if (life_cycle_phases.length) {
      await supabase
        .from("lcd_guidelines.guideline_life_cycle_phases")
        .insert(
          life_cycle_phases.map((phase) => ({
            guideline_id: inserted.id,
            phase,
          })),
        );
    }

    return inserted;
  }

  async getTargetGroups(): Promise<TargetGroup[]> {
    const { data, error } = await supabase
      .from("lcd_guidelines.target_groups")
      .select("*")
      .order("label", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch target groups: ${error.message}`);
    }

    return data || [];
  }

  async createTargetGroup(data: {
    code: string;
    label: string;
  }): Promise<TargetGroup> {
    const { data: res, error } = await supabase
      .from("lcd_guidelines.target_groups")
      .insert(data)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create target group: ${error.message}`);
    }

    return res;
  }

  async getImplementationGroups(): Promise<ImplementationGroup[]> {
    const { data, error } = await supabase
      .from("lcd_guidelines.implementation_groups")
      .select("*")
      .order("label", { ascending: true });

    if (error) {
      throw new Error(
        `Failed to fetch implementation groups: ${error.message}`,
      );
    }

    return data || [];
  }

  async createImplementationGroup(data: {
    code: string;
    label: string;
  }): Promise<ImplementationGroup> {
    const { data: res, error } = await supabase
      .from("lcd_guidelines.implementation_groups")
      .insert(data)
      .select("*")
      .single();

    if (error) {
      throw new Error(
        `Failed to create implementation group: ${error.message}`,
      );
    }

    return res;
  }
}

export const guidelinesService = new GuidelinesService();