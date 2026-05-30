-- Create DPWH projects table
CREATE TABLE IF NOT EXISTS dpwh_projects (
    id SERIAL PRIMARY KEY,
    contract_id VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(255),
    component_categories TEXT,
    status VARCHAR(100),
    budget NUMERIC,
    amount_paid BIGINT,
    progress NUMERIC,
    province VARCHAR(255),
    region VARCHAR(255),
    contractor VARCHAR(255),
    start_date DATE,
    completion_date DATE,
    infra_year VARCHAR(50),
    program_name VARCHAR(255),
    source_of_funds TEXT,
    is_live BOOLEAN DEFAULT FALSE,
    livestream_url TEXT,
    livestream_video_id VARCHAR(255),
    livestream_detected_at VARCHAR(255),
    latitude NUMERIC,
    longitude NUMERIC,
    report_count INTEGER,
    has_satellite_image BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE dpwh_projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for free plan, this is fine for a school project)
CREATE POLICY "Allow public read access"
    ON dpwh_projects
    FOR SELECT
    USING (true);

-- Create indexes for faster queries
CREATE INDEX idx_dpwh_projects_region ON dpwh_projects(region);
CREATE INDEX idx_dpwh_projects_province ON dpwh_projects(province);
CREATE INDEX idx_dpwh_projects_status ON dpwh_projects(status);
