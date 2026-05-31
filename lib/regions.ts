// lib/regions.ts
// LEFT = display label shown to user
// RIGHT = exact string stored in Supabase (verify against SQL audit above)

export const REGIONS: { label: string; value: string }[] = [
  { label: 'National Capital Region (NCR)', value: 'National Capital Region' },
  { label: 'CAR — Cordillera Administrative Region', value: 'Cordillera Administrative Region' },
  { label: 'Region I — Ilocos Region',      value: 'Region I' },
  { label: 'Region II — Cagayan Valley',    value: 'Region II' },
  { label: 'Region III — Central Luzon',    value: 'Region III' },
  { label: 'Region IV-A — CALABARZON',      value: 'Region IV-A' },
  { label: 'Region IV-B — MIMAROPA',        value: 'Region IV-B' },
  { label: 'Region V — Bicol Region',       value: 'Region V' },
  { label: 'Region VI — Western Visayas',   value: 'Region VI' },
  { label: 'Region VII — Central Visayas',  value: 'Region VII' },
  { label: 'Region VIII — Eastern Visayas', value: 'Region VIII' },
  { label: 'Region IX — Zamboanga Peninsula', value: 'Region IX' },
  { label: 'Region X — Northern Mindanao',  value: 'Region X' },
  { label: 'Region XI — Davao Region',      value: 'Region XI' },
  { label: 'Region XII — SOCCSKSARGEN',     value: 'Region XII' },
  { label: 'Region XIII — CARAGA',          value: 'Region XIII' },
  { label: 'BARMM — Bangsamoro',            value: 'Bangsamoro Autonomous Region in Muslim Mindanao' },
  { label: 'NIR — Negros Island Region',    value: 'Negros Island Region' },
]

// IMPORTANT: After running the SQL audit, update each `value` field
// to match EXACTLY what Supabase returns for that region.
// The label can stay as-is — only the value matters for queries.
