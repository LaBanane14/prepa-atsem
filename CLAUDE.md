# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prépa FPC is a French-language exam preparation platform for the FPC (Formation Professionnelle Continue) nursing school entrance exam (concours IFSI). It helps healthcare workers (aides-soignants, auxiliaires de puériculture) prepare for both the written and oral exams.

## Tech Stack

- **Framework**: Next.js 16 with App Router (JavaScript, not TypeScript despite tsconfig)
- **Styling**: Tailwind CSS v4 (via PostCSS plugin)
- **Backend/Auth**: Supabase (auth + database + storage)
- **AI**: Gemini API (for oral exam CV analysis)
- **Deployment**: Vercel

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Architecture

All pages are client components (`'use client'`) using plain `.js` files in the App Router (`app/` directory). There is no component library or shared component extraction — navigation bars, auth logic, and SVG icons are duplicated inline across pages.

### Key files

- `lib/supabase.js` — Single Supabase client instance (uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `app/page.js` — Landing page with inline interactive QCM demo, FAQ, eligibility section
- `app/qcm/page.js` — Main quiz engine with hardcoded question bank (20 questions covering dose calculations, percentages, cross-products, mental math, equations, conversions)
- `app/dashboard/page.js` — Authenticated user dashboard with sidebar navigation (stats, history, profile, subscription tabs all in one file)
- `app/oral/page.js` — Oral exam prep: uploads CV PDF, sends to Gemini API, generates personalized interview questions
- `app/api/oral/route.js` — API route that receives PDF, sends to Gemini 2.5 Flash, returns JSON array of 10 interview questions
- `app/admin/page.js` — Admin panel for blog article CRUD (restricted to a hardcoded admin email)
- `app/blog/page.js` and `app/blog/[slug]/page.js` — Blog with articles stored in Supabase `articles` table
- `app/auth/page.js` — Auth page (login/signup)
- `app/login/page.js` and `app/signup/page.js` — Redirect to `/auth`
- `app/tarifs/page.js` — Pricing page

### Auth pattern

Every authenticated page follows the same pattern: check `supabase.auth.getSession()` on mount, redirect to `/auth` if no session, listen to `onAuthStateChange`. This logic is repeated in each page file.

### Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `GEMINI_API_KEY` — Server-side only, used in `app/api/oral/route.js`

## Language

All user-facing content is in French. Maintain French for UI text, error messages, and comments when they exist.
