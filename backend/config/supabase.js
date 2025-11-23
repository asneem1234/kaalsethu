import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase credentials missing in .env file');
    console.error('Required: SUPABASE_URL and SUPABASE_ANON_KEY');
    process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
