
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  const { count: totalCount, error: totalError } = await supabase
    .from('dpwh_projects')
    .select('*', { count: 'exact', head: true })

  if (totalError) {
    console.error('Error fetching total count:', totalError)
    return
  }

  const { data: statusCounts, error: statusError } = await supabase
    .from('dpwh_projects')
    .select('status')

  if (statusError) {
    console.error('Error fetching status counts:', statusError)
    return
  }

  const counts: Record<string, number> = {}
  let totalBudget = 0

  const { data: budgetData, error: budgetError } = await supabase
    .from('dpwh_projects')
    .select('budget')

  if (budgetError) {
    console.error('Error fetching budget data:', budgetError)
    return
  }

  budgetData.forEach(p => {
    totalBudget += p.budget || 0
  })

  statusCounts.forEach(p => {
    const s = p.status || 'Unknown'
    counts[s] = (counts[s] || 0) + 1
  })

  console.log('--- Database Stats ---')
  console.log('Total Projects:', totalCount)
  console.log('Total Budget:', (totalBudget / 1e12).toFixed(2) + 'T')
  console.log('Status Counts:', counts)
}

checkData()
