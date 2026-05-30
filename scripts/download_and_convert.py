import pandas as pd
import requests
import os

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

# Download the main dataset
parquet_url = "https://huggingface.co/datasets/bettergovph/dpwh-transparency-data/resolve/main/dpwh_transparency_data.parquet?download=true"
parquet_path = "data/dpwh_transparency_data.parquet"
csv_path = "data/dpwh_transparency_data.csv"

print("Downloading dataset...")
response = requests.get(parquet_url, stream=True)
response.raise_for_status()

with open(parquet_path, 'wb') as f:
    for chunk in response.iter_content(chunk_size=8192):
        f.write(chunk)

print("Converting parquet to CSV...")
df = pd.read_parquet(parquet_path)

# Let's flatten the location struct
if 'location' in df.columns:
    df['province'] = df['location'].apply(lambda x: x.get('province') if isinstance(x, dict) else None)
    df['region'] = df['location'].apply(lambda x: x.get('region') if isinstance(x, dict) else None)
    df = df.drop(columns=['location'])

# Save to CSV
df.to_csv(csv_path, index=False)
print(f"CSV saved to {csv_path}")
print(f"Number of rows: {len(df)}")
print("\nColumns:")
print(df.columns.tolist())
