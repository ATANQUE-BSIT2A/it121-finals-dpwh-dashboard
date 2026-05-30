export interface Project {
  contract_id: string;
  description: string;
  category: string | null;
  component_categories: string | null;
  status: string | null;
  budget: number | null;
  amount_paid: number | null;
  progress: number | null;
  region: string | null;
  province: string | null;
  contractor: string | null;
  start_date: string | null;
  completion_date: string | null;
  infra_year: string | null;
  program_name: string | null;
  source_of_funds: string | null;
  is_live: boolean | null;
  latitude: number | null;
  longitude: number | null;
  report_count: number | null;
  has_satellite_image: boolean | null;
}
