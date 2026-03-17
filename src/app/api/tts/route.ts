import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'
import path from 'path'
import fs from 'fs'

const KEY_FILE = path.join(process.cwd(), 'gcp-github-key.json')
const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize'

// Cache access token to avoid re-fetching on every request
let cachedToken: string | null = null
let tokenExpiry = 0

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  // Use key file if present (local dev), otherwise use ADC (Cloud Run metadata server)
  const authOptions = fs.existsSync(KEY_FILE)
    ? { keyFile: KEY_FILE, scopes: ['https://www.googleapis.com/auth/cloud-platform'] }
    : { scopes: ['https://www.googleapis.com/auth/cloud-platform'] }

  const auth = new GoogleAuth(authOptions)
  const client = await auth.getClient()
  const tokenResponse = await client.getAccessToken()
  const token = tokenResponse.token
  if (!token) throw new Error('Failed to get access token')

  cachedToken = token
  tokenExpiry = Date.now() + 55 * 60 * 1000 // refresh 5 min before 1-hour expiry
  return token
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text required' }, { status: 400 })
    }

    const accessToken = await getAccessToken()

    // Primary: Chirp3-HD Neural female — highest quality
    const voices = [
      { name: 'vi-VN-Chirp3-HD-Aoede', ssmlGender: 'FEMALE' },
      { name: 'vi-VN-Neural2-A', ssmlGender: 'FEMALE' },
      { name: 'vi-VN-Wavenet-A', ssmlGender: 'FEMALE' },
      { name: 'vi-VN-Standard-A', ssmlGender: 'FEMALE' },
    ]

    let lastError = ''
    for (const voice of voices) {
      const body = {
        input: { text: text.slice(0, 5000) },
        voice: { languageCode: 'vi-VN', ...voice },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.25,
          pitch: 0,
        },
      }

      const res = await fetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({ audioContent: data.audioContent })
      }
      lastError = await res.text()
    }

    return NextResponse.json({ error: lastError }, { status: 502 })
  } catch (e) {
    console.error('[TTS] error', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
