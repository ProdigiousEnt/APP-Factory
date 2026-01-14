/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Supabase URL or Anon Key is missing. Check your .env file.');
        }

        supabaseInstance = createClient(
            supabaseUrl || 'https://placeholder.supabase.co',
            supabaseAnonKey || 'placeholder'
        );
    }
    return supabaseInstance;
}

export const supabase = getSupabaseClient();
