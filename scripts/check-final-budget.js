
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTotalBudget() {
  console.log('Calculating total budget for ALL rows...');
  
  let totalBudget = 0;
  let totalRows = 0;
  let start = 0;
  const batchSize = 1000; // Safe batch size for Supabase

  while (true) {
    const { data, error } = await supabase
      .from('dpwh_projects')
      .select('budget')
      .range(start, start + batchSize - 1);

    if (error) {
      console.error('Error at start', start, ':', error);
      break;
    }
    
    if (!data || data.length === 0) {
      break;
    }

    data.forEach(p => {
      totalBudget += (p.budget || 0);
      totalRows++;
    });

    start += batchSize;
    if (totalRows % 10000 === 0) {
      console.log(`Processed ${totalRows} rows... Current Total: ${(totalBudget / 1e12).toFixed(4)}T`);
    }
  }

  console.log('\n--- Final Database Stats ---');
  console.log('Total Rows Processed:', totalRows);
  console.log('Total Budget:', totalBudget.toLocaleString(), 'PHP');
  console.log('Total Budget (Trillion):', (totalBudget / 1e12).toFixed(4) + 'T');
  console.log('Total Budget (Billion):', (totalBudget / 1e9).toFixed(2) + 'B');
  console.log('Average per project:', (totalBudget / totalRows).toLocaleString(), 'PHP');
}

checkTotalBudget();
