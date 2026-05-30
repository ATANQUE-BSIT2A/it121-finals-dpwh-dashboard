import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { contractId, description, region, contractor } = await req.json()

    const msg = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a research assistant for Philippine government infrastructure transparency.

Find related news, government reports, or public announcements about this DPWH project:
- Contract ID: ${contractId}
- Project: ${description}
- Region: ${region}
- Contractor: ${contractor}

Provide 3-4 relevant results. If no exact project results exist, provide related DPWH or regional infrastructure news.

Respond ONLY in valid JSON — no extra text, no markdown fences:
{"results":[{"title":"...","summary":"one sentence","url":"https://...","source":"source name"}]}`
      }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ results: [] })
  }
}
