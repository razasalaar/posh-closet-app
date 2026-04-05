import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bexzdveiveyxzvxtwmvg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Ywl4jpklznoXC7GwEiiw5w_pbfO9-VS";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
