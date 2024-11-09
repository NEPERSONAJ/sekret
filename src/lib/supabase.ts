import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkrmgukflsvkajepajox.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrcm1ndWtmbHN2a2FqZXBham94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4ODk3MTYsImV4cCI6MjA0NjQ2NTcxNn0.MJbgWdkvpwRoe_8i71Q76P7py1DDzoDsq4Awo2h5V_E';

export const supabase = createClient(supabaseUrl, supabaseKey);