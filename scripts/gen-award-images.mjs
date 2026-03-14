/**
 * Generate 5 award tarot card images using @google/genai SDK.
 * Run: node scripts/gen-award-images.mjs
 */
import { GoogleGenAI } from '@google/genai'
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

// Read .env manually
const envPath = join(projectRoot, '.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
}

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('GEMINI_API_KEY not set in .env')
  process.exit(1)
}

const client = new GoogleGenAI({ apiKey })
const outDir = join(projectRoot, 'public', 'images')
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const STYLE_RULES = `
STYLE RULES — Anime portrait illustrations for award cards:
- Art style: Anime digital art, Makoto Shinkai inspired — vivid glowing colors, atmospheric particle effects, light rays
- Composition: Half-body portrait (bust/chest up), character facing forward or slightly angled, centered in frame
- Character: Anime male/female with striking features, flowing hair, dark clothing, intense/noble expression
- Background: Dark base with radiant glowing effects — particles, light streaks, bokeh, floating symbolic objects orbiting around the character
- Lighting: Strong rim lighting and glow effects from the dominant accent color
- NO text/words/letters/numbers in the image
- NO decorative borders or frames
- Square aspect ratio (1:1)
`.trim()

const AWARD_IMAGES = {
  'award-ngon-co.png':
    'Anime half-body portrait of a noble young man with short golden hair and determined golden eyes, wearing a dark military coat with gold trim. He holds a radiant golden banner staff against his shoulder. Behind him, four streams of colored energy (blue, green, violet, amber) spiral and merge into a brilliant golden starburst. Golden particles, light rays, and small glowing orbs float around him. Dominant color: golden yellow (#eab308) glow on dark background.',
  'award-ke-sinh-ton.png':
    'Anime half-body portrait of a serene young woman with long flowing emerald-tinted silver hair and calm green eyes, wearing a dark elegant robe. Her hands gently cup a small glowing crystal balance scale floating before her chest. Behind her, emerald aurora lights ripple across a dark sky with floating crystalline shards and soft green particles. Dominant color: emerald green (#34d399) glow on dark background.',
  'award-mat-xich.png':
    'Anime half-body portrait of a intense young man with messy dark red-tinted hair and sharp orange eyes, wearing a dark torn jacket. One hand clenches bright orange flames, the other reaches outward with dissolving sparks trailing from fingertips. Behind him, broken chain links and glowing embers swirl in a fiery vortex. Dominant color: fiery orange (#f97316) glow on dark smoky background.',
  'award-nha-cach-tan.png':
    'Anime half-body portrait of a mysterious young man with long flowing silver hair and glowing violet eyes, wearing a dark high-collar coat. Around him orbits a spiral of glowing violet runes, floating gears, holographic symbols, crystal shards, and open books. Neural network patterns pulse behind him in a cosmic nebula. Dominant color: deep violet (#8b5cf6) glow on dark cosmic background.',
  'award-la-chan-xa-hoi.png':
    'Anime half-body portrait of a resolute young woman with short ice-blue hair and steady cyan eyes, wearing dark armor with glowing cyan accents. Her arms are crossed before her chest, projecting a large translucent hexagonal cyan energy shield. Above the shield, a data storm rages with dark fragments, while below it calm cyan light radiates downward. Dominant color: cyan (#06b6d4) glow on dark stormy background.',
}

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff])

async function generateImage(filename, prompt) {
  const outPath = join(outDir, filename)
  if (existsSync(outPath)) {
    console.log(`⏭  ${filename} already exists, skipping`)
    return
  }

  console.log(`Generating ${filename}...`)
  const fullPrompt = `${STYLE_RULES}\n\nGENERATE THIS IMAGE:\n${prompt}`

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [fullPrompt],
    config: { responseModalities: ['IMAGE'] },
  })

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error(`Empty response for ${filename}`)
  }

  const parts = response.candidates[0].content?.parts ?? []
  for (const part of parts) {
    if (part.inlineData?.data) {
      let imageData = Buffer.from(part.inlineData.data, 'base64')

      const isRaw = imageData.subarray(0, 4).equals(PNG_MAGIC) || imageData.subarray(0, 3).equals(JPEG_MAGIC)
      if (!isRaw) {
        try {
          const decoded = Buffer.from(imageData.toString('ascii'), 'base64')
          if (decoded.subarray(0, 4).equals(PNG_MAGIC) || decoded.subarray(0, 3).equals(JPEG_MAGIC)) {
            imageData = decoded
          }
        } catch { /* keep original */ }
      }

      writeFileSync(outPath, imageData)
      console.log(`${filename} saved (${(imageData.length / 1024).toFixed(1)} KB)`)
      return
    }
  }

  const textParts = parts.filter(p => p.text).map(p => p.text).join(' ')
  throw new Error(`No image data for ${filename}. ${textParts ? `Model said: ${textParts.slice(0, 200)}` : ''}`)
}

async function main() {
  console.log('Generating 5 award tarot card images...\n')
  for (const [filename, prompt] of Object.entries(AWARD_IMAGES)) {
    try {
      await generateImage(filename, prompt)
    } catch (err) {
      console.error(`Failed: ${filename} — ${err.message}`)
    }
    // Rate limit pause
    await new Promise(r => setTimeout(r, 2000))
  }
  console.log('\nDone!')
}

main()
