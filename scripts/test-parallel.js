
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testParallel() {
  console.log('Testing parallel budget fetch...');
  const start = Date.now();
  
  const { count, error: countError } = await supabase
    .from('dpwh_projects')
    .select('*', { count: 'exact', head: true });

  if (countError || !count) {
    console.error('Count error:', countError);
    return;
  }

  console.log(`Total rows: ${count}`);
  const pageSize = 1000;
  const numPages = Math.ceil(count / pageSize);
  const pages = Array.from({ length: numPages }, (_, i) => i);
  
  let total = 0;
  const concurrencyLimit = 20;
  
  for (let i = 0; i < pages.length; i += concurrencyLimit) {
    const chunk = pages.slice(i, i + concurrencyLimit);
    console.log(`Fetching pages ${chunk[0]} to ${chunk[chunk.length-1]}...`);
    const results = await Promise.all(
      chunk.map(page => 
        supabase
          .from('dpwh_projects')
          .select('budget')
          .order('contract_id', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .then(res => {
            if (res.error) throw res.error;
            return res.data || [];
          })
      )
    );
    results.flat().forEach(p => total += (p.budget || 0));
  }

  const duration = (Date.now() - start) / 1000;
  console.log(`\nSuccess!`);
  console.log(`Total Budget: ${(total / 1e12).toFixed(4)}T`);
  console.log(`Time taken: ${duration}s`);
}

testParallel();
