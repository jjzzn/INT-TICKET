import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Please set them in .env.local'
  );
  console.error('Current env values:', { supabaseUrl, supabaseKey: supabaseKey ? 'SET' : 'MISSING' });
} else {
  console.log('[Supabase] Configuration loaded successfully');
}

export const supabase = createClient<Database>(supabaseUrl || '', supabaseKey || '');