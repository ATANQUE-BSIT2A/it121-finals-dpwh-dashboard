import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_ANON_KEY: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Load the CSV
print("Loading CSV...")
df = pd.read_csv("data/dpwh_transparency_data.csv")

# Rename columns to match the database schema (camelCase to snake_case)
column_mapping = {
    'contractId': 'contract_id',
    'componentCategories': 'component_categories',
    'amountPaid': 'amount_paid',
    'startDate': 'start_date',
    'completionDate': 'completion_date',
    'infraYear': 'infra_year',
    'programName': 'program_name',
    'sourceOfFunds': 'source_of_funds',
    'isLive': 'is_live',
    'livestreamUrl': 'livestream_url',
    'livestreamVideoId': 'livestream_video_id',
    'livestreamDetectedAt': 'livestream_detected_at',
    'reportCount': 'report_count',
    'hasSatelliteImage': 'has_satellite_image'
}

df = df.rename(columns=column_mapping)

# Convert NaN to None
df = df.where(pd.notnull(df), None)

# Convert boolean columns
df['is_live'] = df['is_live'].astype(bool)
df['has_satellite_image'] = df['has_satellite_image'].astype(bool)

# Convert date columns
df['start_date'] = pd.to_datetime(df['start_date'], errors='coerce').dt.date
df['completion_date'] = pd.to_datetime(df['completion_date'], errors='coerce').dt.date

# Convert NaT to None
df['start_date'] = df['start_date'].where(pd.notnull(df['start_date']), None)
df['completion_date'] = df['completion_date'].where(pd.notnull(df['completion_date']), None)

# Import in batches of 1000 rows (Supabase has a limit)
batch_size = 1000
total_rows = len(df)
print(f"Total rows to import: {total_rows}")

for i in range(0, total_rows, batch_size):
    batch = df.iloc[i:i + batch_size]
    batch_dict = batch.to_dict('records')
    
    try:
        # Use upsert to avoid duplicate contract_id errors
        response = supabase.table('dpwh_projects').upsert(batch_dict, on_conflict='contract_id').execute()
        print(f"Imported rows {i + 1} - {min(i + batch_size, total_rows)} of {total_rows}")
    except Exception as e:
        print(f"Error importing batch {i}: {e}")
        # Let's try one row at a time for this batch to find the problematic row
        print("Trying one row at a time...")
        for j, row in enumerate(batch_dict):
            try:
                supabase.table('dpwh_projects').upsert(row, on_conflict='contract_id').execute()
                print(f"Successfully imported row {i + j + 1}")
            except Exception as e2:
                print(f"Error with row {i + j + 1}: {e2}")
                print(f"Row data: {row}")

print("Import complete!")
