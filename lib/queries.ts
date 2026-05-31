import { supabase } from './supabase'
import type { Project } from '@/types'

export async function fetchAllRows(selectQuery: any, maxRows: number = 10000) {
  const pageSize = 1000;
  const totalToFetch = maxRows; 
  const numPages = Math.ceil(totalToFetch / pageSize);
  const pages = Array.from({ length: numPages }, (_, i) => i);
  
  const allData: any[] = [];
  const concurrencyLimit = 2; // Further reduced for high stability
  
  for (let i = 0; i < pages.length; i += concurrencyLimit) {
    const chunk = pages.slice(i, i + concurrencyLimit);
    try {
      const results = await Promise.all(
        chunk.map(page => 
          selectQuery
            .range(page * pageSize, (page + 1) * pageSize - 1)
            .then((res: any) => {
              if (res.error) throw res.error;
              return res.data || [];
            })
        )
      );
      const flattened = results.flat();
      if (flattened.length === 0) break; 
      allData.push(...flattened);
      if (flattened.length < chunk.length * pageSize) break; 
    } catch (e) {
      // Log more details but don't crash
      console.error('Fetch chunk failed, continuing with partial data:', e);
      continue; 
    }
  }
  
  return allData.slice(0, maxRows);
}

export async function getTotalBudget() {
  const regions = await getBudgetByRegion();
  return regions.reduce((sum, r) => sum + r.totalBudget, 0);
}

export async function getYearStats() {
  const years = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
  
  const results = await Promise.all(
    years.map(async (year) => {
      const { count, error } = await supabase
        .from('dpwh_projects')
        .select('*', { count: 'exact', head: true })
        .eq('infra_year', year);
        
      if (error) {
        console.error(`Error counting year ${year}:`, error);
        return { year, count: 0 };
      }
      return { year, count: count || 0 };
    })
  );

  return results.filter(r => r.count > 0);
}

export async function getStatusCounts() {
  const statuses = ['Completed', 'On-Going', 'For Procurement', 'Not Yet Started', 'Terminated', 'Suspended'];
  
  const results = await Promise.all(
    statuses.map(async (status) => {
      const { count, error } = await supabase
        .from('dpwh_projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      return { name: status, value: count || 0 };
    })
  );

  return results.filter(r => r.value > 0);
}

export async function getDashboardStats() {
  const [total, budgetData, completed, ongoing, progressData] = await Promise.all([
    supabase.from('dpwh_projects').select('*', { count: 'exact', head: true }),
    fetchAllRows(supabase.from('dpwh_projects').select('budget')),
    supabase.from('dpwh_projects').select('*', { count: 'exact', head: true }).eq('status', 'Completed'),
    supabase.from('dpwh_projects').select('*', { count: 'exact', head: true }).eq('status', 'On-Going'),
    fetchAllRows(supabase.from('dpwh_projects').select('progress')),
  ]);

  const budgetSum = budgetData.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
  const progressSum = progressData.filter(p => p.progress !== null).reduce((sum, p) => sum + (p.progress as number), 0) || 0;
  const progressCount = progressData.filter(p => p.progress !== null).length || 1;

  return {
    total: total.count || 0,
    totalBudget: budgetSum,
    completed: completed.count || 0,
    ongoing: ongoing.count || 0,
    avgProgress: progressSum / progressCount,
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

export async function getBudgetByRegion() {
  const regions = [
    'NCR', 'Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B', 
    'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 
    'Region X', 'Region XI', 'Region XII', 'Region XIII', 'CAR', 'BARMM'
  ];
  
  const results = await Promise.all(
    regions.map(async (region) => {
      let total = 0;
      let start = 0;
      const pageSize = 5000;
      
      while (true) {
        const { data, error } = await supabase
          .from('dpwh_projects')
          .select('budget')
          .eq('region', region)
          .range(start, start + pageSize - 1);
          
        if (error || !data || data.length === 0) break;
        data.forEach(p => total += (p.budget || 0));
        if (data.length < pageSize) break;
        start += pageSize;
      }
      
      return { region, totalBudget: total };
    })
  );

  return results
    .filter(r => r.totalBudget > 0)
    .sort((a, b) => b.totalBudget - a.totalBudget);
}

export async function getProjectsByStatus() {
  const data = await fetchAllRows(supabase.from('dpwh_projects').select('status'));
  if (!data) return [];

  const statusData: Record<string, number> = {};
  data.forEach(item => {
    if (item.status) {
      statusData[item.status] = (statusData[item.status] || 0) + 1;
    }
  });

  return Object.entries(statusData).map(([status, count]) => ({ status, count }));
}

export async function getProjectsByCategory() {
  const data = await fetchAllRows(supabase.from('dpwh_projects').select('category, budget'));
  if (!data) return [];

  const categoryData: Record<string, { count: number; totalBudget: number }> = {};
  data.forEach(item => {
    if (item.category) {
      if (!categoryData[item.category]) {
        categoryData[item.category] = { count: 0, totalBudget: 0 };
      }
      categoryData[item.category].count += 1;
      categoryData[item.category].totalBudget += item.budget || 0;
    }
  });

  return Object.entries(categoryData).map(([category, data]) => ({ category, count: data.count, totalBudget: data.totalBudget }));
}

export async function getProjectsByYear() {
  const data = await fetchAllRows(supabase.from('dpwh_projects').select('infra_year, budget'));
  if (!data) return [];

  const yearData: Record<string, { count: number; totalBudget: number }> = {};
  data.forEach(item => {
    if (item.infra_year) {
      if (!yearData[item.infra_year]) {
        yearData[item.infra_year] = { count: 0, totalBudget: 0 };
      }
      yearData[item.infra_year].count += 1;
      yearData[item.infra_year].totalBudget += item.budget || 0;
    }
  });

  return Object.entries(yearData)
    .map(([year, data]) => ({ year, count: data.count, totalBudget: data.totalBudget }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

export function getRegions() {
  return [
    'NCR',
    'CAR',
    'Region I',
    'Region II',
    'Region III',
    'Region IV-A',
    'Region IV-B',
    'Region V',
    'Region VI',
    'Region VII',
    'Region VIII',
    'Region IX',
    'Region X',
    'Region XI',
    'Region XII',
    'Region XIII',
    'NIR',
  ];
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
