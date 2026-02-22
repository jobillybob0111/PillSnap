# PillSnap — Brief Project Write-Up

## Overview

**PillSnap** is a web application that helps users identify pills by the imprint (letters and numbers on the pill), optional color and shape, and optional photos of the pill. It is designed to feel like a trusted, approachable medical tool—clean, calm, and easy to use—so that anyone can quickly look up a medication and see what it is, its strength, drug class, and common uses.

---

## Ideation

The goal was to build a **pill identifier** that:

- Puts **safety and clarity first**: users enter the imprint (required) and can add color, shape, and photos to improve results. Results are split into “exact” matches and “potential” matches (same imprint, different color or shape) so users know when to double-check.
- Feels **trustworthy and medical**, not experimental: we chose a welcoming hospital-style UI (soft whites, medical red accents, clear typography) so it feels like something a pharmacist or parent would be comfortable using.
- Uses **authoritative drug data**: we connect to a verified pharmaceutical database so results and reference images are reliable and up to date.

We focused on clear, accurate results with a strong disclaimer that the tool is for informational use only and does not replace professional medical or pharmacy advice.

---

## Development Process

1. **Core flow**  
   We defined the flow: user enters imprint (required), optionally selects color and shape, and can optionally upload front/back photos of the pill. The “Identify Pill” action sends this information to our backend, which queries a verified drug database and returns exact matches and potential matches (same imprint, different appearance), with clear labels and reference images.

2. **Backend**  
   We built Next.js API routes:
   - **Identify** (`/api/identify`): accepts imprint, color, shape, and optional images; queries our drug data source and returns structured results (drug name, strength, class, uses, reference image). Results are split into exact matches (matching color/shape) and potential matches, with confidence-style scoring.
   - **Image proxy** (`/api/image`): serves reference images from our data source so they display reliably in the browser.
   - **Suggest** (`/api/suggest`): provides imprint suggestions as the user types, for better UX.

3. **Data**  
   Pill identification is powered by a verified pharmaceutical database. Our backend requests matching pill records and reference images and returns them in a consistent format. We do not maintain our own drug database; we rely on this external, authoritative source for accuracy and coverage.

4. **Frontend and design**  
   We implemented the UI in Next.js (App Router) with Tailwind CSS and Framer Motion:
   - **Layout**: Main identifier page plus About and Creators pages; consistent header and navigation.
   - **Visual design**: Soft white background, light pink accents, medical red for primary actions and branding (“PillSnap” with red accent on “Snap”). Cards use rounded corners, soft shadows, and clear hierarchy so the app feels like a hospital or pharmacy tool.
   - **Interactions**: Gentle animations (fade-in, staggered result cards), a brief visual effect on Identify click, and a loading state with a pill icon and progress indicator.
   - **Trust and clarity**: Trust badges (e.g. “Verified Drug Database”, “Informational Use Only”), a visible disclaimer, and clear labeling of “exact” vs “potential” matches.

5. **Deployment**  
   The app is built with `next build` and is deployable to Vercel (or any Node-compatible host). We use environment variables for configuration and do not commit secrets.

---

## Tech Stack & Credits

- **Framework**: [Next.js 14](https://nextjs.org/) (React, App Router) — frontend and API routes.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) — layout, theming, responsive design.
- **Animation**: [Framer Motion](https://www.framer.com/motion/) — page transitions, loading states, and micro-interactions.
- **Icons**: [Lucide React](https://lucide-react.github.io/lucide/) — UI icons (pill, shield, upload, etc.).
- **Font**: [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) — primary typeface for readability.
- **Data**: Pill identification results and reference images are provided by a verified pharmaceutical data source integrated via our backend.
- **Hosting**: Deployable to [Vercel](https://vercel.com/) (or any Node-compatible host) for serverless API routes and static assets.

---

## Creators

- **Shiv Patel** — Author  
- **Ryder Pongracic** — Co-Author  

---

## Disclaimer (as shown in the app)

PillSnap is for informational use only and does not replace professional medical or pharmacy advice. Users should consult a pharmacist or physician when in doubt.
