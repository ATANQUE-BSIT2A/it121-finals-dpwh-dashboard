export interface Project {
  id: number;
  contract_id: string;
  description: string | null;
  category: string | null;
  component_categories: string | null;
  status: string | null;
  budget: number | null;
  amount_paid: number | null;
  progress: number | null;
  contractor: string | null;
  start_date: string | null;
  completion_date: string | null;
  infra_year: string | null;
  program_name: string | null;
  source_of_funds: string | null;
  is_live: boolean | null;
  livestream_url: string | null;
  livestream_video_id: string | null;
  livestream_detected_at: string | null;
  latitude: number | null;
  longitude: number | null;
  report_count: number | null;
  has_satellite_image: boolean | null;
  province: string | null;
  region: string | null;
  created_at: string;
  updated_at: string;
}
