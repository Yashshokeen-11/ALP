/**
 * Supabase database types
 * Run: npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Supabase auth tables are handled separately
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

