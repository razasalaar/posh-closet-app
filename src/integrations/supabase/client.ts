import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uvmtzunnkpvghmrwiqmk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bXR6dW5ua3B2Z2htcndpcW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTYzMDIsImV4cCI6MjA5MDk3MjMwMn0.Is4QtWeaw22-Q2YoMtn-rTjA-XmwxjuN58fSUew9zPA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
