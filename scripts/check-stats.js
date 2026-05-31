
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkStatus() {
  console.log('Fetching status counts...');
  
  const statusCounts = {};
  let totalBudget = 0;
  let start = 0;
  const batchSize = 10000;

  while (true) {
    const { data, error } = await supabase
      .from('dpwh_projects')
      .select('status, budget')
      .range(start, start + batchSize - 1);

    if (error) {
      console.error('Error:', error);
      break;
    }
    if (!data || data.length === 0) break;

    data.forEach(p => {
      const s = p.status || 'Unknown';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
      totalBudget += p.budget || 0;
    });

    start += batchSize;
    console.log(`Processed ${start} rows...`);
  }

  console.log('\n--- Database Stats ---');
  console.log('Total Budget:', (totalBudget / 1e12).toFixed(2) + 'T');
  console.log('Status Counts:', statusCounts);
}

checkStatus();
