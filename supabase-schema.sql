-- SQL Schema to initialize your Supabase tables and storage buckets.
-- Paste and execute this in the SQL Editor of your Supabase Dashboard.

-- 1. Create a table to store file metadata
CREATE TABLE IF NOT EXISTS portfolio_files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data_url TEXT NOT NULL,
    size INTEGER,
    type TEXT,
    category TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    user_id TEXT
);

-- Enable RLS (Row Level Security) and grant public policies
ALTER TABLE portfolio_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON portfolio_files;
CREATE POLICY "Allow public read access" ON portfolio_files FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON portfolio_files;
CREATE POLICY "Allow public insert access" ON portfolio_files FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON portfolio_files;
CREATE POLICY "Allow public update access" ON portfolio_files FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON portfolio_files;
CREATE POLICY "Allow public delete access" ON portfolio_files FOR DELETE USING (true);


-- 2. Create a table to store the general portfolio state JSON
CREATE TABLE IF NOT EXISTS portfolio_state (
    id INTEGER PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and grant public policies
ALTER TABLE portfolio_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON portfolio_state;
CREATE POLICY "Allow public read access" ON portfolio_state FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update access" ON portfolio_state;
CREATE POLICY "Allow public insert/update access" ON portfolio_state FOR ALL USING (true);


-- 3. Create a public storage bucket named "portfolio-assets"
-- Note: The application server will automatically attempt to create this bucket on startup if possible.
-- Make sure the bucket has Public access enabled under Supabase Storage -> portfolio-assets -> Policies.
