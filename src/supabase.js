import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = '
https://sgfmrhpwocpkkjhnygwn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZm1yaHB3b2Nwa2tqaG55Z3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTQ3MDAsImV4cCI6MjA5MjAzMDcwMH0.0rBfjdnZGzjQeWAaZy2TumLgkd-1o4Hihvlbw-M6nzI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);