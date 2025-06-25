import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://rizqwxcmpzhdmqjjqgyw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpenF3eGNtcHpoZG1xampxZ3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDM3MTIsImV4cCI6MjA2NjI3OTcxMn0.dlNpxINvs2yzlFQndTZIrfQTBgWpQ5Ee0aPGVwRPHo0'
)

export { supabase }

export const getActiveTours = async () => {
  return [] // Return empty array for now
}