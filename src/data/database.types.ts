/** Generated from the Supabase project "Study Buddy" (edznmkujqdahyszyiica, London). Regenerate after schema changes. */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      answers: {
        Row: { answered_at: string; child_id: string; curriculum_id: string; hints: number; id: number; outcome: string; quest_id: string; subject: string; world: string }
        Insert: { answered_at?: string; child_id: string; curriculum_id: string; hints?: number; id?: never; outcome: string; quest_id: string; subject: string; world: string }
        Update: { answered_at?: string; child_id?: string; curriculum_id?: string; hints?: number; id?: never; outcome?: string; quest_id?: string; subject?: string; world?: string }
        Relationships: [{ foreignKeyName: 'answers_child_id_fkey'; columns: ['child_id']; isOneToOne: false; referencedRelation: 'children'; referencedColumns: ['id'] }]
      }
      children: {
        Row: { avatar: Json | null; created_at: string; id: string; name: string; parent_id: string; team: string | null; updated_at: string; worlds: string[]; year: number }
        Insert: { avatar?: Json | null; created_at?: string; id?: string; name: string; parent_id: string; team?: string | null; updated_at?: string; worlds?: string[]; year: number }
        Update: { avatar?: Json | null; created_at?: string; id?: string; name?: string; parent_id?: string; team?: string | null; updated_at?: string; worlds?: string[]; year?: number }
        Relationships: []
      }
      consents: {
        Row: { granted_at: string; kind: string; parent_id: string }
        Insert: { granted_at?: string; kind: string; parent_id: string }
        Update: { granted_at?: string; kind?: string; parent_id?: string }
        Relationships: []
      }
      quest_progress: {
        Row: { answered: number; child_id: string; first_try: number; helped: number; quest_id: string; total: number; updated_at: string; world: string }
        Insert: { answered?: number; child_id: string; first_try?: number; helped?: number; quest_id: string; total: number; updated_at?: string; world: string }
        Update: { answered?: number; child_id?: string; first_try?: number; helped?: number; quest_id?: string; total?: number; updated_at?: string; world?: string }
        Relationships: [{ foreignKeyName: 'quest_progress_child_id_fkey'; columns: ['child_id']; isOneToOne: false; referencedRelation: 'children'; referencedColumns: ['id'] }]
      }
      scans: {
        Row: { child_id: string; created_at: string; id: string; result: Json; score: number | null; subject: string; total: number | null; year: number }
        Insert: { child_id: string; created_at?: string; id?: string; result: Json; score?: number | null; subject: string; total?: number | null; year: number }
        Update: { child_id?: string; created_at?: string; id?: string; result?: Json; score?: number | null; subject?: string; total?: number | null; year?: number }
        Relationships: [{ foreignKeyName: 'scans_child_id_fkey'; columns: ['child_id']; isOneToOne: false; referencedRelation: 'children'; referencedColumns: ['id'] }]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
