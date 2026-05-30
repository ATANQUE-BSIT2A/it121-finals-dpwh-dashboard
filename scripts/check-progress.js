require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkProgress() {
  // First, let's get a count (using a trick since Supabase free tier might have count limits)
  let totalInDb = 0;
  let start = 0;
  const batchSize = 1000;
  
  console.log('Counting rows in database...');
  
  while (true) {
    const { data, error } = await supabase
      .from('dpwh_projects')
      .select('contract_id')
      .range(start, start + batchSize - 1);

    if (error) {
      console.error('Error fetching count:', error);
      break;
    }
    
    if (!data || data.length === 0) {
      break;
    }
    
    totalInDb += data.length;
    start += batchSize;
    
    if (totalInDb % 10000 === 0) {
      console.log(`Counted ${totalInDb} rows so far...`);
    }
  }

  console.log(`\n✅ Total rows in database: ${totalInDb}`);
  console.log(`📊 Total rows in CSV: 248,220`);
  console.log(`🔄 Rows remaining: ${248220 - totalInDb}`);
  console.log(`\nPercentage complete: ${((totalInDb / 248220) * 100).toFixed(1)}%`);
}

checkProgress().catch(console.error);
