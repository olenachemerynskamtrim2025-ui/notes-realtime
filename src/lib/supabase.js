import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jrwygafczoxvqfqhfmlx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd3lnYWZjem94dnFmcWhmbWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MzgzNTUsImV4cCI6MjA5NTQxNDM1NX0.esmywfw6B81EMHW8jIO0nR7YgEcoFq6PI5QpqSdpRxo'

export const supabase = createClient(supabaseUrl, supabaseKey)
