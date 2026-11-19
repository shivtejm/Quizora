const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://unkcmtcqyqdtrsqrabpp.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_l4Q0M937eVmOmcdWwHfZWQ_3eSi1qzK';

let supabase = null;

try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (error) {
    console.warn('[Supabase Config] Supabase client initialization error, will use file storage:', error.message);
}

module.exports = {
    supabase,
    isConfigured: () => Boolean(supabase)
};
