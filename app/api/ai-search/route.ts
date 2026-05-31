import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { contractId, description, region, contractor } = await req.json()

    const fallback = [
      {
        title: `DPWH Official — ${(description || '').slice(0, 45)}`,
        summary: 'Search the official DPWH website for announcements and project records.',
        url: `https://www.dpwh.gov.ph/dpwh/search?q=${encodeURIComponent(contractId || description || '')}`,
        source: 'dpwh.gov.ph',
      },
      {
        title: `PhilGEPS — Contract ${contractId || 'lookup'}`,
        summary: 'Search the Philippine Government Electronic Procurement System for bid and contract details.',
        url: `https://www.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashOpenOpportunitiesUI.aspx?searchKeyword=${encodeURIComponent(contractId || description || '')}`,
        source: 'philgeps.gov.ph',
      },
      {
        title: `Google News — DPWH ${region || ''} infrastructure`,
        summary: 'Search Google News for recent coverage of DPWH projects in this region.',
        url: `https://news.google.com/search?q=${encodeURIComponent(`DPWH ${region || ''} infrastructure project Philippines`)}`,
        source: 'Google News',
      },
      {
        title: `Inquirer — ${(description || 'DPWH project').slice(0, 40)}`,
        summary: 'Search Philippine Daily Inquirer for news coverage of this project.',
        url: `https://newsinfo.inquirer.net/?s=${encodeURIComponent(`DPWH ${(description || '').slice(0, 40)}`)}`,
        source: 'inquirer.net',
      },
      {
        title: `PNA — DPWH ${region || 'Philippines'} news`,
        summary: 'Search the Philippine News Agency for official government project updates.',
        url: `https://www.pna.gov.ph/search?q=${encodeURIComponent(`DPWH ${region || ''} ${(description || '').slice(0, 30)}`)}`,
        source: 'pna.gov.ph',
      },
    ]

    try {
      const q = encodeURIComponent(
        `DPWH "${(description || '').slice(0, 55)}" ${region || ''} Philippines infrastructure`
      )
      const ddgRes = await fetch(
        `https://api.duckduckgo.com/?q=${q}&format=json&no_html=1&skip_disambig=1`,
        { signal: AbortSignal.timeout(4000) }
      )
      const ddg = await ddgRes.json()

      const real: any[] = []
      for (const t of (ddg.RelatedTopics || []).slice(0, 3)) {
        if (t.Text && t.FirstURL) {
          real.push({
            title: t.Text.slice(0, 80),
            summary: t.Text.slice(0, 180),
            url: t.FirstURL,
            source: new URL(t.FirstURL).hostname.replace('www.', ''),
          })
        }
      }

      const combined = [...real, ...fallback].slice(0, 5)
      return NextResponse.json({ results: combined })
    } catch {
      return NextResponse.json({ results: fallback })
    }
  } catch {
    return NextResponse.json({ results: [] })
  }
}
