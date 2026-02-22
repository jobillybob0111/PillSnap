# PillSnap

Identify pills using front and back images plus user-entered metadata (imprint, color, shape). Data is cross-referenced against a local pill imprint database.

**Disclaimer:** This tool is for informational purposes only and does not replace medical advice. Always consult a pharmacist or physician.

## Quick Demo

[Watch a quick demo on YouTube](https://www.youtube.com/watch?v=iUcK5S8r9qk)

## Features

- **Image-based matching**: Perceptual hashing compares your upload against reference images and boosts confidence for visual matches
- Image upload for front and back of pill
- Optional OCR to extract imprint text from images (Tesseract)
- Manual input: imprint, color, shape
- Weighted matching: 60% imprint, 20% color, 20% shape
- Top 3 ranked results with confidence scores
- Side-by-side display: your upload next to reference image
- Medical disclaimer on all results

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Prerequisites

- Node.js 18+
- **OCR (optional):** Tesseract installed locally for image-based imprint extraction

### Installing Tesseract for OCR

**macOS (Homebrew):**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**Windows:**
Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki) and add to PATH.

Without Tesseract, you can still use the app by entering the imprint text manually.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_PATH` | `./data/pills.json` | Pill database file path (JSON) |

## How It Works

PillSnap searches **reference** live for any pill imprint. When the live search works, it returns results from their database (thousands of pills). If reference is unreachable (e.g. network restrictions), the app falls back to a local database.

## Database

The app seeds a JSON database with ~25 common pills on first run. To expand the local fallback database:

### Option 1: Scrape (respectful, with delays)

```bash
npm run scrape
```

Scrapes imprint detail pages from reference, with 1.5s delay between requests.

### Option 2: Seed script (predefined data)

```bash
npm run seed
```

Resets the database with the built-in seed dataset.

**Note:** The primary source is live search against reference. The local database is a fallback when the external site is unreachable. No hardcoded limit—any pill in reference database can be found when the live search succeeds.

## API

### POST `/api/identify`

Accepts `multipart/form-data`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `front` | File | No | Front image of pill |
| `back` | File | No | Back image of pill |
| `imprint` | string | Yes* | Letters/numbers on pill (*or from OCR) |
| `color` | string | No | Pill color |
| `shape` | string | No | Pill shape |

**Success (200):**
```json
{
  "imprint": "L484",
  "results": [
    {
      "drug_name": "Acetaminophen",
      "generic_name": "Acetaminophen",
      "strength": "500 mg",
      "drug_class": "Miscellaneous analgesics",
      "uses": "Pain, Fever, ...",
      "image_url": "...",
      "confidence": 92
    }
  ],
  "disclaimer": "This tool is for informational purposes only..."
}
```

**Errors:**
- `400 NO_IMPRINT` - No imprint from OCR or user input
- `404 NO_MATCHES` - No pills match the criteria
- `500 SERVER_ERROR` - Internal error

## Docker

```bash
docker build -t pill-snap .
docker run -p 3000:3000 pill-snap
```

## Project Structure

```
pill-snap/
├── src/
│   ├── app/
│   │   ├── api/identify/route.ts   # Identify endpoint
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── lib/
│       ├── db.ts           # SQLite + schema
│       ├── matching.ts     # Weighted search logic
│       ├── ocr.ts          # Tesseract OCR
│       └── seed-data.ts    # Built-in pill data
├── scripts/
│   ├── scrape-imprints.ts  # scraper
│   └── seed-db.ts          # Manual seed
├── Dockerfile
└── package.json
```

## Safety

- Medical disclaimer on all result pages
- No dosage advice
- No suggestions to take or stop medication
- Identification only; no treatment recommendations
