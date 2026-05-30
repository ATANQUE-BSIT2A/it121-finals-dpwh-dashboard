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

# Load the renamed CSV
print("Loading CSV...")
df = pd.read_csv("data/dpwh_transparency_data_renamed.csv")

print(f"Total rows in CSV: {len(df)}")

# Get all existing contract IDs from the database
print("Fetching existing contract IDs from database...")
existing_contract_ids = set()

# Fetch in batches of 1000
start = 0
batch_size = 1000

while True:
    response = supabase.table('dpwh_projects').select('contract_id').range(start, start + batch_size - 1).execute()
    if not response.data:
        break
    for row in response.data:
        existing_contract_ids.add(row['contract_id'])
    start += batch_size
    print(f"Fetched {len(existing_contract_ids)} existing contract IDs...")

print(f"Total existing contract IDs: {len(existing_contract_ids)}")

# Filter out rows that are already in the database
print("Filtering CSV...")
df_filtered = df[~df['contract_id'].isin(existing_contract_ids)]

print(f"Rows to import: {len(df_filtered)}")

if len(df_filtered) == 0:
    print("All rows are already imported!")
    exit()

# Convert NaN to None
df_filtered = df_filtered.where(pd.notnull(df_filtered), None)

# Convert boolean columns
df_filtered['is_live'] = df_filtered['is_live'].astype(bool)
df_filtered['has_satellite_image'] = df_filtered['has_satellite_image'].astype(bool)

# Convert date columns
df_filtered['start_date'] = pd.to_datetime(df_filtered['start_date'], errors='coerce').dt.date
df_filtered['completion_date'] = pd.to_datetime(df_filtered['completion_date'], errors='coerce').dt.date

# Convert NaT to None
df_filtered['start_date'] = df_filtered['start_date'].where(pd.notnull(df_filtered['start_date']), None)
df_filtered['completion_date'] = df_filtered['completion_date'].where(pd.notnull(df_filtered['completion_date']), None)

# Import in batches of 1000 rows
batch_size = 1000
total_rows = len(df_filtered)
print(f"Importing {total_rows} rows...")

for i in range(0, total_rows, batch_size):
    batch = df_filtered.iloc[i:i + batch_size]
    batch_dict = batch.to_dict('records')
    
    try:
        response = supabase.table('dpwh_projects').upsert(batch_dict, on_conflict='contract_id').execute()
        print(f"Imported rows {i + 1} - {min(i + batch_size, total_rows)} of {total_rows}")
    except Exception as e:
        print(f"Error importing batch {i}: {e}")
        # Try one row at a time for this batch
        print("Trying one row at a time...")
        for j, row in enumerate(batch_dict):
            try:
                supabase.table('dpwh_projects').upsert(row, on_conflict='contract_id').execute()
                print(f"Successfully imported row {i + j + 1}")
            except Exception as e2:
                print(f"Error with row {i + j + 1}: {e2}")
                print(f"Row data: {row}")

print("Import complete!")
