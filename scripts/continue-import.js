require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function continueImport() {
  // Step 1: Read all rows from CSV
  console.log('Reading CSV...');
  const csvRows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream('data/dpwh_transparency_data_renamed.csv')
      .pipe(csv())
      .on('data', (row) => csvRows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Total rows in CSV: ${csvRows.length}`);

  // Step 2: Fetch all existing contract_ids from database
  console.log('Fetching existing contract IDs...');
  const existingContractIds = new Set();
  let start = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('dpwh_projects')
      .select('contract_id')
      .range(start, start + batchSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    data.forEach(row => existingContractIds.add(row.contract_id));
    start += batchSize;
    console.log(`Fetched ${existingContractIds.size} existing contract IDs...`);
  }

  console.log(`Total existing contract IDs: ${existingContractIds.size}`);

  // Step 3: Filter out rows that already exist
  const rowsToImport = csvRows.filter(row => !existingContractIds.has(row.contract_id));
  console.log(`Rows to import: ${rowsToImport.length}`);

  if (rowsToImport.length === 0) {
    console.log('All rows are already imported!');
    return;
  }

  // Step 4: Import remaining rows
  console.log('Starting import...');
  const importBatchSize = 500; // Smaller batches to avoid timeouts

  for (let i = 0; i < rowsToImport.length; i += importBatchSize) {
    const batch = rowsToImport.slice(i, i + importBatchSize);
    
    // Convert types
    const convertedBatch = batch.map(row => ({
      ...row,
      budget: row.budget ? parseFloat(row.budget) : null,
      amount_paid: row.amount_paid ? parseInt(row.amount_paid, 10) : null,
      progress: row.progress ? parseFloat(row.progress) : null,
      is_live: row.is_live === 'True' || row.is_live === 'true' || row.is_live === '1',
      has_satellite_image: row.has_satellite_image === 'True' || row.has_satellite_image === 'true' || row.has_satellite_image === '1',
      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null,
      report_count: row.report_count ? parseInt(row.report_count, 10) : null,
      start_date: row.start_date || null,
      completion_date: row.completion_date || null
    }));

    try {
      const { error } = await supabase
        .from('dpwh_projects')
        .upsert(convertedBatch, { onConflict: 'contract_id' });

      if (error) throw error;
      console.log(`Imported rows ${i + 1} - ${Math.min(i + importBatchSize, rowsToImport.length)} of ${rowsToImport.length}`);
    } catch (error) {
      console.error(`Error importing batch ${i}:`, error.message);
      // Try one by one
      console.log('Trying one row at a time...');
      for (let j = 0; j < convertedBatch.length; j++) {
        try {
          const { error: rowError } = await supabase
            .from('dpwh_projects')
            .upsert(convertedBatch[j], { onConflict: 'contract_id' });
          if (rowError) throw rowError;
          console.log(`Successfully imported row ${i + j + 1}`);
        } catch (rowError) {
          console.error(`Error with row ${i + j + 1}:`, rowError.message);
          console.error('Row data:', convertedBatch[j]);
        }
      }
    }
  }

  console.log('Import complete!');
}

continueImport().catch(console.error);
