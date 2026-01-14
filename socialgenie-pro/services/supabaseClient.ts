
import { createClient } from '@supabase/supabase-js';

// app_id for the IOS APP Factory strategy
export const APP_ID = 'socialgenie-pro';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing credentials in .env.local. History sync will be disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
