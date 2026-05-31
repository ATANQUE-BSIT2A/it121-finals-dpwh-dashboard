import { supabase } from './supabase'
import type { Project } from '@/types'
import { REGIONS } from './regions'

/**
 * Robust fetcher that handles large datasets by chunking requests.
 * Uses controlled concurrency and range queries to avoid timeouts.
 */
export async function fetchAllRows(selectQuery: any, maxRows: number = 300000) {
  const pageSize = 10000;
  
  // 1. Get total count first to plan chunks
  const { count, error: countError } = await selectQuery.select('*', { count: 'exact', head: true });
  if (countError) return [];
  
  const total = Math.min(count || 0, maxRows);
  const numPages = Math.ceil(total / pageSize);
  const allData: any[] = [];
  
  // 2. Fetch in batches with controlled concurrency (e.g., 3 parallel requests at a time)
  const concurrency = 3; 
  for (let i = 0; i < numPages; i += concurrency) {
    const batch = Array.from({ length: Math.min(concurrency, numPages - i) }, (_, j) => i + j);
    const results = await Promise.all(
      batch.map(page => 
        selectQuery
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .then((res: any) => res.data || [])
      )
    );
    allData.push(...results.flat());
  }
  
  return allData;
}

export async function getTotalBudget() {
  const data = await fetchAllRows(supabase.from('dpwh_projects').select('budget'));
  return data.reduce((sum, r) => sum + (r.budget || 0), 0);
}

export async function getYearStats() {
  const data = await fetchAllRows(supabase.from('dpwh_projects').select('infra_year, budget'));
  const stats: Record<string, { count: number, totalBudget: number }> = {};
  
  data.forEach(p => {
    const year = p.infra_year || 'Unknown';
    if (!stats[year]) stats[year] = { count: 0, totalBudget: 0 };
    stats[year].count++;
    stats[year].totalBudget += (p.budget || 0);
  });
  
  return Object.entries(stats)
    .map(([year, s]) => ({ year, count: s.count, totalBudget: s.totalBudget }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

export async function getStatusCounts() {
  const data = await fetchAllRows(supabase.from('dpwh_projects').select('status'));
  const counts: Record<string, number> = {};
  
  data.forEach(p => {
    const status = p.status || 'Unknown';
    counts[status] = (counts[status] || 0) + 1;
  });
  
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export async function getBudgetByRegion() {
  const data = await fetchAllRows(supabase.from('dpwh_projects').select('region, budget'));
  const stats: Record<string, number> = {};
  
  data.forEach(p => {
    const region = p.region || 'Unknown';
    stats[region] = (stats[region] || 0) + (p.budget || 0);
  });
  
  return Object.entries(stats)
    .map(([region, totalBudget]) => ({ region, totalBudget }))
    .sort((a, b) => b.totalBudget - a.totalBudget);
}

export async function getProjectsByCategory() {
  const data = await fetchAllRows(supabase.from('dpwh_projects').select('category, budget'));
  const stats: Record<string, { count: number, totalBudget: number }> = {};
  
  data.forEach(p => {
    const cat = p.category || 'Unknown';
    if (!stats[cat]) stats[cat] = { count: 0, totalBudget: 0 };
    stats[cat].count++;
    stats[cat].totalBudget += (p.budget || 0);
  });
  
  return Object.entries(stats)
    .map(([category, s]) => ({ category, count: s.count, totalBudget: s.totalBudget }))
    .sort((a, b) => b.count - a.count);
}

export async function getDashboardStats() {
  const allData = await fetchAllRows(supabase.from('dpwh_projects').select('budget, status, progress'));
  
  let totalBudget = 0;
  let completed = 0;
  let ongoing = 0;
  let progressSum = 0;
  let progressCount = 0;

  allData.forEach(p => {
    totalBudget += (p.budget || 0);
    if (p.status === 'Completed') completed++;
    if (p.status === 'On-Going') ongoing++;
    if (p.progress !== null) {
      progressSum += p.progress;
      progressCount++;
    }
  });

  return {
    total: allData.length,
    totalBudget,
    completed,
    ongoing,
    avgProgress: progressCount > 0 ? progressSum / progressCount : 0,
  };
}

export async function getProjects({
  search = '',
  region,
  province,
  category,
  status,
  year,
  budgetMin,
  budgetMax,
  sortBy = 'start_date',
  sortDir = 'desc',
  page = 1,
  perPage = 50,
}: {
  search?: string;
  region?: string;
  province?: string;
  category?: string[];
  status?: string[];
  year?: string;
  budgetMin?: number;
  budgetMax?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}) {
  let query = supabase.from('dpwh_projects').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`description.ilike.%${search}%,contract_id.ilike.%${search}%,contractor.ilike.%${search}%`);
  }
  if (region && region !== 'all') {
    query = query.eq('region', region);
  }
  if (province && province !== 'all') {
    query = query.eq('province', province);
  }
  if (category && category.length > 0) {
    query = query.in('category', category);
  }
  if (status && status.length > 0) {
    query = query.in('status', status);
  }
  if (year && year !== 'all') {
    query = query.eq('infra_year', year);
  }
  if (budgetMin !== undefined) {
    query = query.gte('budget', budgetMin);
  }
  if (budgetMax !== undefined) {
    query = query.lte('budget', budgetMax);
  }

  query = query.order(sortBy, { ascending: sortDir === 'asc' });
  query = query.range((page - 1) * perPage, page * perPage - 1);

  const { data, count, error } = await query.returns<Project[]>();
  return { data: data || [], count: count || 0, error };
}

export async function getProjectById(contractId: string) {
  const { data, error } = await supabase
    .from('dpwh_projects')
    .select('*')
    .eq('contract_id', contractId)
    .single<Project>();
  return { data, error };
}

export async function getProjectsByStatus() {
  return getStatusCounts();
}

export async function getProjectsByYear() {
  return getYearStats();
}

export function getRegions() {
  return REGIONS.map(r => r.value);
}

export async function getProvincesByRegion(region: string) {
  const data = await fetchAllRows(supabase.from('dpwh_projects').select('province').eq('region', region));
  if (!data) return [];

  const provinces = new Set<string>();
  data.forEach(item => {
    if (item.province) provinces.add(item.province);
  });
  return Array.from(provinces);
}

export async function getCategories() {
  const data = await fetchAllRows(supabase.from('dpwh_projects').select('category'));
  if (!data) return [];

  const categories = new Set<string>();
  data.forEach(item => {
    if (item.category) categories.add(item.category);
  });
  return Array.from(categories);
}

export async function getTopContractors(limit: number = 20) {
  const data = await fetchAllRows(supabase.from('dpwh_projects').select('contractor, budget, progress'));
  if (!data) return [];

  const contractorData: Record<string, { count: number; totalBudget: number; totalProgress: number; progressCount: number }> = {};
  data.forEach(item => {
    if (item.contractor) {
      if (!contractorData[item.contractor]) {
        contractorData[item.contractor] = { count: 0, totalBudget: 0, totalProgress: 0, progressCount: 0 };
      }
      contractorData[item.contractor].count += 1;
      contractorData[item.contractor].totalBudget += item.budget || 0;
      if (item.progress !== null) {
        contractorData[item.contractor].totalProgress += item.progress;
        contractorData[item.contractor].progressCount += 1;
      }
    }
  });

  return Object.entries(contractorData)
    .map(([contractor, data]) => ({
      contractor,
      count: data.count,
      totalBudget: data.totalBudget,
      avgProgress: data.progressCount > 0 ? data.totalProgress / data.progressCount : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
