import { supabase } from "../supabase"

export interface Guideline {
  id: string
  substrategy_id: string
  title: string
  description?: string
  priority: 'Low' | 'Medium' | 'High'
  implementation_group_id: string
  created_at: string
}

export interface CreateGuidelineData {
  substrategy_id: string
  title: string
  description?: string
  priority: 'Low' | 'Medium' | 'High'
  implementation_group_id: string
}

export class GuidelinesService {
  async getGuidelines(): Promise<Guideline[]> {
    const { data, error } = await supabase
      .from('lcd_guidelines.guidelines')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch guidelines: ${error.message}`)
    }

    return data || []
  }

  async createGuideline(guideline: CreateGuidelineData): Promise<Guideline> {
    const { data, error } = await supabase
      .from('lcd_guidelines.guidelines')
      .insert(guideline)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to create guideline: ${error.message}`)
    }

    return data
  }
}

export const guidelinesService = new GuidelinesService()
