# Digital Society Simulator

Web game realtime cho ~35 sinh viên, dùng trong buổi thuyết trình MLN131 (FPT University).

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS (dark theme)
- SSE + REST polling cho realtime
- Anthropic claude-sonnet-4-6 cho AI summary
- Deploy: societysimulator.elixverse.com (GCP Cloud Run)

## Development

```bash
# Copy env template
cp .env.local.example .env.local
# Edit .env.local: add ANTHROPIC_API_KEY

# Install
npm install

# Dev server
npm run dev
```

## Routes

| Path | Description |
|---|---|
| `/host` | Host tạo phòng |
| `/host/[PIN]` | Host control panel |
| `/screen/[PIN]` | Màn hình chiếu (SSE) |
| `/join?pin=...` | Player join |
| `/play/[PIN]` | Player game view |

## Game Flow

1. Host → `/host` → tạo phòng → nhận PIN
2. Mở `/screen/[PIN]` trên màn chiếu
3. Sinh viên quét QR → `/join` → nhập tên → vào game
4. Host điều khiển 6 tình huống từ `/host/[PIN]`
5. Sau tình huống 6: host trigger AI → "Bản tin Xã hội 2030"

## Deploy (GCP Cloud Run)

```bash
# Build
docker build -t societysimulator .

# Tag + push
docker tag societysimulator gcr.io/[PROJECT]/societysimulator
docker push gcr.io/[PROJECT]/societysimulator

# Deploy
gcloud run deploy societysimulator \
  --image gcr.io/[PROJECT]/societysimulator \
  --region asia-southeast1 \
  --timeout 600 \
  --concurrency 1000 \
  --set-env-vars NEXT_PUBLIC_APP_URL=https://societysimulator.elixverse.com \
  --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest
```
