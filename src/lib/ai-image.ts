/**
 * AI Image Generation using Google Genai (unified SDK).
 *
 * Pattern reference: elix platform gemini_adapter.py → generate_image()
 * Uses @google/genai with response_modalities=["IMAGE"] + ImageConfig.
 */
import { GoogleGenAI, type GenerateContentConfig } from '@google/genai'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

function getClient() {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not set')
  return new GoogleGenAI({ apiKey: key })
}

// ─── Theme rules (shared across all generation prompts) ──────────────────────

const STYLE_RULES = `
STYLE RULES — Digital Society Simulator (Vietnamese socialist-themed edu-game):
- Dark background: pure near-black (#0d0d0d to #141414)
- Primary accent: revolutionary red (#dc2626, hsl 0 85% 50%)
- Secondary accent: golden yellow (#eab308, hsl 45 100% 55%)
- Role colors: Worker=blue(#60a5fa), Farmer=emerald(#34d399), Intellectual=violet(#a78bfa), Startup=amber(#fbbf24)
- Art style: Flat vector / geometric minimalism, clean edges, no gradients
- Mood: Futuristic, serious, slightly cyberpunk — like a 2030 policy infographic
- NO text/words/letters in the image
- NO photorealistic rendering — keep it illustrative
- Aspect ratio: square (1:1) unless specified
- Color palette is limited: dark bg + 1-2 accent colors per image
`.trim()

// ─── Image generation ────────────────────────────────────────────────────────

interface ImageGenResult {
  filename: string
  prompt: string
  sizeBytes: number
}

export async function generateAndSaveImage(
  prompt: string,
  filename: string,
): Promise<ImageGenResult> {
  const client = getClient()
  const outDir = join(process.cwd(), 'public', 'images')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const fullPrompt = `${STYLE_RULES}\n\nGENERATE THIS IMAGE:\n${prompt}`

  const config: GenerateContentConfig = {
    responseModalities: ['IMAGE'],
  }

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [fullPrompt],
    config,
  })

  // Extract image data from response (same logic as platform adapter)
  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('Empty response from Gemini image generation')
  }

  const parts = response.candidates[0].content?.parts ?? []

  for (const part of parts) {
    if (part.inlineData) {
      let imageData: Buffer

      const raw = part.inlineData.data
      if (!raw) throw new Error('inlineData.data is empty')

      // The SDK typically returns base64-encoded string
      imageData = Buffer.from(raw as string, 'base64')

      // Check if it's base64-encoded bytes (platform double-decode pattern)
      const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47])
      const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff])
      const isRaw = imageData.subarray(0, 4).equals(PNG_MAGIC)
        || imageData.subarray(0, 3).equals(JPEG_MAGIC)

      if (!isRaw) {
        try {
          const decoded = Buffer.from(imageData.toString('ascii'), 'base64')
          if (decoded.subarray(0, 4).equals(PNG_MAGIC) || decoded.subarray(0, 3).equals(JPEG_MAGIC)) {
            imageData = decoded
          }
        } catch { /* keep original */ }
      }

      const outPath = join(outDir, filename)
      writeFileSync(outPath, imageData)
      return { filename, prompt, sizeBytes: imageData.length }
    }
  }

  // If no image but text was returned, include in error
  const textParts = parts.filter(p => p.text).map(p => p.text).join(' ')
  throw new Error(`No image data in response.${textParts ? ` Model said: ${textParts.slice(0, 200)}` : ''}`)
}

// ─── Pre-defined image prompts ───────────────────────────────────────────────

export const IMAGE_PROMPTS: Record<string, string> = {
  // ── Role illustrations (square, single subject, role-specific color) ──
  'role-worker.png':
    'A geometric silhouette of a modern factory worker operating a robotic arm. Circuit board patterns trace along the arm. Dominant color: blue (#60a5fa) on dark background. Include subtle gear icons.',

  'role-farmer.png':
    'A geometric silhouette of a farmer holding a tablet, with a drone hovering above a rice field. Data streams flow from the crops. Dominant color: emerald green (#34d399) on dark background.',

  'role-intellectual.png':
    'A geometric silhouette of a programmer/researcher with floating neural network nodes around their head. Code fragments and brain synapse patterns. Dominant color: violet (#a78bfa) on dark background.',

  'role-startup.png':
    'A geometric silhouette of an entrepreneur with a rocket launching behind them and rising chart lines. Innovation and growth motifs. Dominant color: amber/yellow (#fbbf24) on dark background.',

  // ── Scenario illustrations (square, abstract/symbolic) ──
  'scenario-automation.png':
    'Abstract composition: a human hand and a robotic hand reaching toward each other, with gears and binary code flowing between them. Red and blue tones on dark background. Symbolizes automation vs. human labor.',

  'scenario-data.png':
    'Abstract composition: a glowing database vault being pulled apart by two forces — a corporate building on one side and a cooperative of farmers on the other. Gold/yellow and emerald tones on dark background.',

  'scenario-opensource.png':
    'Abstract composition: a padlock being opened to release streams of light/code that branch into multiple directions. Violet and gold tones on dark background. Symbolizes open-source vs. patent.',

  'scenario-strike.png':
    'Abstract composition: raised fists holding smartphones, forming a connected chain/ring. Red and blue tones on dark background. Symbolizes digital labor organizing.',

  'scenario-acquisition.png':
    'Abstract composition: a small rocket/startup being drawn into a massive corporate monolith. Red warning accent vs amber hope accent on dark background. Symbolizes corporate acquisition.',

  'scenario-rural.png':
    'Abstract composition: digital signal waves extending from a city skyline toward rural buildings and fields. Emerald and blue tones on dark background. Symbolizes digital divide.',

  'scenario-platform.png':
    'Abstract composition: a marketplace platform with farmer figures connected via glowing threads to a central hub that changes color from red to green. Symbolizes platform economy.',

  'scenario-housing.png':
    'Abstract composition: stacked geometric buildings with price arrows going up, and small human figures at the bottom. Red and amber tones on dark background. Symbolizes housing crisis.',

  'scenario-education.png':
    'Abstract composition: an open book transforming into a digital screen, with student silhouettes around it. Violet and blue tones on dark background. Symbolizes online education.',

  'scenario-hiring.png':
    'Abstract composition: a magnifying glass/AI eye scanning rows of human silhouettes, some highlighted, some dimmed. Blue and amber tones on dark background. Symbolizes AI hiring bias.',

  'scenario-blockchain.png':
    'Abstract composition: interconnected hexagonal nodes forming a decentralized network around a government building. Violet and emerald tones on dark background. Symbolizes DAO governance.',

  'scenario-ubi.png':
    'Abstract composition: coins/currency flowing evenly from a central source to diverse human silhouettes below. Gold/yellow and red tones on dark background. Symbolizes Universal Basic Income.',

  // ── Hero/decorative images ──
  'hero-network.png':
    'Wide illustration (16:9 feel but in square): an abstract network of 4 large colored nodes (blue, green, violet, amber) connected by glowing red/yellow lines to a bright central alliance node. Grid pattern fades into dark background. Represents social class interconnection.',

  // ── Outcome images ──
  'outcome-sustainable.png':
    'Abstract celebration: interconnected nodes forming a stable structure, with emerald and gold tones radiating outward. Plant/leaf motif emerging from the network. Symbolizes sustainable digital society.',

  'outcome-collapse.png':
    'Abstract fracture: network nodes breaking apart, connections shattering into fragments. Red warning tones dominating, dark smoke. Symbolizes social structure collapse.',

  'outcome-unstable.png':
    'Abstract tension: network nodes flickering between connected and disconnected states, amber/yellow caution tones. Symbolizes an unstable, uncertain society.',

  // ── Transition images (new) ──
  'transition-analyzing.png':
    'Abstract composition: data streams from multiple colored sources (blue, green, violet, amber, pink, cyan) converging into a central glowing brain-shaped processing node. Six orbiting indicator spheres in distinctive colors. Dark background. Symbolizes AI analysis.',

  'transition-waiting.png':
    'Abstract composition: interconnected human silhouettes standing on a large circular platform, looking toward a glowing horizon with anticipation. Calming blue and cyan tones with subtle red accents. Dark background. Symbolizes collective waiting.',

  // ── Indicator-specific images (new) ──
  'indicator-innovation.png':
    'Abstract composition: a lightbulb made of intricate circuit board patterns radiating violet light (#8b5cf6), surrounded by floating geometric shapes and data points. Violet dominant on dark background.',

  'indicator-welfare.png':
    'Abstract composition: interlinked human hands forming a safety net beneath a community of diverse silhouette figures. Warm pink (#f472b6) dominant tones on dark background. Symbolizes social welfare.',

  'indicator-democracy.png':
    'Abstract composition: transparent ballot boxes and raised hands with holographic digital voting interfaces. Multiple screens showing approval icons. Cyan (#06b6d4) dominant on dark background.',

  // ── Scenario illustrations for scenarios 13-20 ──
  'scenario-algorithm.png':
    'Abstract composition: a maze-like algorithm flowchart where human figures are being sorted — some illuminated, some cast in shadow. Red warning lines separate "favored" from "excluded" paths. Blue and amber tones on dark background. Symbolizes algorithmic bias in job distribution.',

  'scenario-green.png':
    'Abstract composition: a factory transitioning from dark smoky silhouette on one side to clean bright geometric shapes with solar panels and wind turbines on the other. Emerald and amber tones on dark background. Symbolizes green energy transition.',

  'scenario-dao-governance.png':
    'Abstract composition: a circular council table made of interconnected blockchain nodes, with diverse human figures seated around it — some transparent/faded, some bright. Violet and cyan tones on dark background. Symbolizes DAO governance participation gap.',

  'scenario-digital-union.png':
    'Abstract composition: a chain of smartphone-connected worker silhouettes forming a unified line, facing a massive corporate platform wall. Red solidarity accent and blue worker tones on dark background. Symbolizes digital labor union.',

  'scenario-data-leak.png':
    'Abstract composition: a cracked digital vault with streams of personal data (represented as colored dots) escaping into dark space. An eye watches from above. Red warning and cyan data tones on dark background. Symbolizes data breach.',

  'scenario-generation-gap.png':
    'Abstract composition: elderly figures with walking sticks on one side of a digital divide — a glowing smartphone barrier — with young figures on the other side. Warm amber and cool blue contrast on dark background. Symbolizes generational digital gap.',

  'scenario-metaverse.png':
    'Abstract composition: floating virtual land plots with price tags hovering above, while below real-world figures look up from basic infrastructure. Gold/amber virtual tones vs blue reality tones on dark background. Symbolizes metaverse real estate bubble.',

  'scenario-deepfake.png':
    'Abstract composition: a fractured face half-human half-AI-generated, with social media share icons multiplying around it. Distorted network lines radiating outward. Red and violet tones on dark background. Symbolizes AI misinformation.',

  // ── Thematic images for landing page & decorations ──
  'theme-youth-vietnam.png':
    'Abstract composition: young Vietnamese silhouettes in ao dai and modern clothing walking together on a path that transforms from traditional village road to futuristic digital highway. Strong blue (#1e3a8a) dominant with accents of red and gold. Stars and network lines above. Dark background. Symbolizes Vietnamese youth in transition.',

  'theme-alliance.png':
    'Abstract composition: four distinct colored groups — blue, green, violet, amber — converging into one unified circular formation, their colors blending at intersection points. Red golden connection threads. Dark background. Symbolizes class alliance (liên minh giai cấp).',

  'theme-chapter5.png':
    'Abstract composition: a layered pyramid/structure with different colored sections (blue workers at base, green farmers, violet intellectuals, amber entrepreneurs) — arrows showing both cooperation and tension between layers. Red and gold accent lines. Dark background. Symbolizes social class structure from Chapter 5.',

  'theme-digital-society.png':
    'Abstract composition: a cityscape merging with a circuit board pattern, with human figures connected by glowing network lines. Binary streams and data flowing between buildings. Blue and cyan tones on dark background. Symbolizes digital society transformation.',

  'theme-collective-choice.png':
    'Abstract composition: many hands pressing different colored buttons (red A, green B, blue C) on a shared control panel, with indicator gauges reacting above. Warm and cool tones balanced on dark background. Symbolizes collective decision-making.',

  'theme-fpt-university.png':
    'Abstract composition: a modern university building silhouette with digital wave emanating from it, student figures walking with laptops and books, connected by network lines. Strong blue (#1e3a8a) dominant with orange accent. Dark background. Symbolizes FPT University digital education.',
  'lobby-gathering.png':
    'Wide abstract illustration: figures approaching from four different directions toward a central glowing hub platform. Each group has a different color aura — blue workers, green farmers, violet intellectuals, amber startup founders. Red and gold accent connection lines. Dark background.',

  // ── Award anime portrait images (Makoto Shinkai style, half-body, no frame) ──
  'award-ngon-co.png':
    'Anime half-body portrait: noble young man with golden hair and golden eyes, dark military coat, holding a radiant golden banner. Four colored energy streams merge behind into a starburst. Golden particles float around. Golden yellow (#eab308) glow on dark background. NO text, NO frame.',
  'award-ke-sinh-ton.png':
    'Anime half-body portrait: serene young woman with emerald-silver hair and green eyes, dark robe, cupping a glowing crystal balance scale. Emerald aurora and crystalline shards behind. Emerald green (#34d399) glow on dark background. NO text, NO frame.',
  'award-mat-xich.png':
    'Anime half-body portrait: intense young man with dark red hair and orange eyes, torn jacket, one hand clenching flames, broken chains and embers swirl behind. Fiery orange (#f97316) glow on dark smoky background. NO text, NO frame.',
  'award-nha-cach-tan.png':
    'Anime half-body portrait: mysterious young man with long silver hair and glowing violet eyes, dark coat, orbiting violet runes, gears, books around him. Cosmic nebula behind. Deep violet (#8b5cf6) glow on dark background. NO text, NO frame.',
  'award-la-chan-xa-hoi.png':
    'Anime half-body portrait: resolute young woman with ice-blue hair and cyan eyes, dark armor, arms crossed projecting cyan hexagonal shield. Storm above, calm light below. Cyan (#06b6d4) glow on dark stormy background. NO text, NO frame.',
}

// Re-export client-safe image maps
export { SCENARIO_IMAGE_MAP, ROLE_IMAGE_MAP, OUTCOME_IMAGE_MAP } from './image-maps'
