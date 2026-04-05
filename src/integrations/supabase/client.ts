import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bexzdveiveyxzvxtwmvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJleHpkdmVpdmV5eHp2eHR3bXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTEyNTEsImV4cCI6MjA5MDg2NzI1MX0.SBhvytDa7PfNmqawCviqb7GO8olRDqC12BLPuB0-Eog';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
