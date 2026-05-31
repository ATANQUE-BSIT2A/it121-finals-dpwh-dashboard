
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function analyzeBudget() {
  console.log('Analyzing budget data...');
  
  let totalBudget = 0;
  let countWithBudget = 0;
  let countWithZeroBudget = 0;
  let countWithNullBudget = 0;
  let maxBudget = 0;
  let minBudget = Infinity;
  let sampleProjects = [];

  let start = 0;
  const batchSize = 10000;

  while (start < 50000) { // Sample first 50k to save time
    const { data, error } = await supabase
      .from('dpwh_projects')
      .select('contract_id, budget, description')
      .range(start, start + batchSize - 1);

    if (error) break;
    if (!data || data.length === 0) break;

    data.forEach(p => {
      const b = p.budget;
      if (b === null) {
        countWithNullBudget++;
      } else if (b === 0) {
        countWithZeroBudget++;
      } else {
        countWithBudget++;
        totalBudget += b;
        if (b > maxBudget) maxBudget = b;
        if (b < minBudget) minBudget = b;
        if (sampleProjects.length < 5) sampleProjects.push(p);
      }
    });

    start += batchSize;
    console.log(`Processed ${start} rows...`);
  }

  console.log('\n--- Budget Analysis (First 50k rows) ---');
  console.log('Count with budget > 0:', countWithBudget);
  console.log('Count with zero budget:', countWithZeroBudget);
  console.log('Count with null budget:', countWithNullBudget);
  console.log('Total Budget (Sample):', (totalBudget / 1e9).toFixed(2) + ' Billion');
  console.log('Max Budget:', maxBudget.toLocaleString());
  console.log('Min Budget:', minBudget.toLocaleString());
  console.log('\nSamples:');
  sampleProjects.forEach(p => {
    console.log(`- ${p.contract_id}: ${p.budget?.toLocaleString()} | ${p.description.substring(0, 50)}...`);
  });
}

analyzeBudget();
