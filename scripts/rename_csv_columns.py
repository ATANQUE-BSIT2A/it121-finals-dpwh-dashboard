import pandas as pd

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

# Save the renamed CSV
output_path = "data/dpwh_transparency_data_renamed.csv"
df.to_csv(output_path, index=False)
print(f"CSV saved to {output_path}")
print("Columns:")
print(df.columns.tolist())
