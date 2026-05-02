# Rawdat — Islamic Stories Platform

## Overview

A full-stack web platform for discovering Islamic stories, biographies of Prophets, Companions (Sahaba), and Scholars. Targeting Gen Z and young adults with gamification, spiritual engagement, and clean reading experiences.

**App name:** Rawdat (meaning "Garden" of knowledge)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/crm-app), Tailwind CSS, shadcn/ui, Framer Motion, Wouter routing
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## App Pages

- `/` — Home: hero, daily quote, featured story, categories, community stats
- `/library` — Stories Library: filterable by category, difficulty, sortBy (newest/popular/shortest/longest/xp); debounced search with ⌘K, clear button, result highlights
- `/story/:id` — Story Viewer: reading mode overlay (Esc to close), scroll progress bar, back-to-top button, share/clipboard, audio narration, XP tracking, bookmark, reflections
- `/dashboard` — User Dashboard: XP, level, streak, badges, reading history, bookmarks, reflections (with delete)
- `/leaderboard` — Top users ranked by XP with level and streak
- `/ramadan` — Ramadan special: iftar countdown, 30-day challenge tracker (localStorage), curated stories

## Data Models (DB Tables)

- `categories` — Prophets, Companions, Scholars, Inspirational
- `stories` — title, titleAr, slug, excerpt, content, difficulty, theme, readingTimeMinutes, isFeatured, coverImageUrl, lessons, xpReward, viewCount
- `users` — name, email, avatarUrl, preferredLanguage
- `user_stats` — xp, level, streak, totalStoriesRead, totalMinutesRead
- `user_progress` — per-story tracking (completed, minutesSpent, xpEarned)
- `bookmarks` — userId + storyId
- `reflections` — userId, storyId, content (personal notes)
- `daily_quotes` — rotating Quran/Hadith quotes

## API Routes

All routes served under `/api`:
- `GET /stories` — list with filters (categoryId, difficulty, theme, search, limit, offset)
- `GET /stories/featured` — featured stories for home page
- `GET /stories/:id` — story detail (increments viewCount)
- `POST /stories` — create story
- `GET /categories` — all categories
- `POST /categories` — create category
- `GET /users/:id` — user profile
- `GET /users/:id/progress` — XP, level, streak, badges, recent activity
- `POST /users/:id/progress/story` — record reading progress, award XP
- `GET /users/:id/bookmarks` — user bookmarks
- `POST /users/:id/bookmarks` — add bookmark
- `DELETE /users/:id/bookmarks/:storyId` — remove bookmark
- `GET /users/:id/reflections` — user reflections
- `POST /users/:id/reflections` — create reflection note
- `GET /dashboard/summary` — platform stats + featured story
- `GET /dashboard/daily-quote` — rotating daily quote
- `GET /dashboard/leaderboard` — top users by XP

## Gamification

- XP awarded per story completed (configurable per story)
- Levels: Seeker → Student → Learner → Scholar → Hafiz → Imam → Sage (every 200 XP)
- Badges: First Step, 3-Day Seeker, Week of Light, Avid Reader, Devoted Learner
- Reading streak tracked on completion

## Current User

- User ID 1 is hardcoded as the logged-in user (Ahmad Al-Rashid) — no auth yet
- All progress/bookmarks/reflections use userId=1

## UI Polish (Completed)

- **Scroll progress bar** — thin primary-colored bar at top of story pages
- **Back-to-top button** — appears after scrolling 400px, smooth scroll to top
- **Reading mode** — distraction-free full-screen overlay, Esc to exit, per-story button ("Read Mode")
- **Mobile nav** — hamburger sheet with all links, replaces desktop nav on small screens
- **Improved footer** — 3-column grid with Explore and Your Journey sections, Arabic tagline
- **Page titles** — `usePageTitle` hook sets `document.title` on every page
- **Share button** — uses Web Share API on mobile, falls back to clipboard copy
- **Sort dropdown** — 5 sort options (newest/popular/shortest/longest/xp) wired to server-side sortBy query param

## Notes

- `lib/api-zod/src/index.ts` is manually maintained (only `export * from "./generated/api"`) — orval indexFiles:false is set to prevent regeneration
- Mutation hooks (useRecordStoryProgress, useAddBookmark, etc.) take no constructor arg — pass userId inside `.mutate({ id, ... })`
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
