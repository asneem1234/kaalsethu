import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase credentials missing in .env file');
    console.error('Required: SUPABASE_URL and SUPABASE_ANON_KEY');
    console.log('Current SUPABASE_URL:', supabaseUrl);
    console.log('Current SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set (length: ' + supabaseAnonKey.length + ')' : 'Not set');
    process.exit(1);
}

// For publishable keys (sb_publishable_*), we need to use it directly
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});

// Test connection
export async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('users').select('count');
        if (error) {
            console.log('⚠️ Supabase connected but tables may not exist yet');
        } else {
            console.log('✅ Supabase connection successful');
        }
        return true;
    } catch (err) {
        console.error('❌ Supabase connection failed:', err.message);
        return false;
    }
}

export default supabase;
