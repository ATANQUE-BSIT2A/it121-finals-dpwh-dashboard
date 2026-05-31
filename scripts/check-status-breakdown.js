
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkStatus() {
  console.log('Fetching status counts...');
  
  const statusCounts = {};
  let totalRows = 0;
  let start = 0;
  const batchSize = 10000;

  while (true) {
    const { data, error } = await supabase
      .from('dpwh_projects')
      .select('status')
      .range(start, start + batchSize - 1);

    if (error) {
      console.error('Error:', error);
      break;
    }
    if (!data || data.length === 0) break;

    data.forEach(p => {
      totalRows++;
      const s = p.status || 'NULL/Empty';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    start += batchSize;
    if (totalRows % 50000 === 0) console.log(`Processed ${totalRows} rows...`);
  }

  console.log('\n--- Status Breakdown ---');
  console.log('Total Rows:', totalRows);
  console.log(statusCounts);
}

checkStatus();
