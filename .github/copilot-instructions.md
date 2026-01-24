AI Coding Agent Instructions
Project Overview

hot-takes is a mobile-first React + TypeScript + Vite application with an Express backend.
Users submit short opinions (“takes”) and vote on them; the app tracks votes and displays leaderboards.

Key Stack:

Frontend: React 19.2 + TypeScript 5.9 + Vite 7.2 + Tailwind CSS

Backend: Express.js 4.x with TypeScript, serving a RESTful API

Database: Firebase Firestore (or MongoDB) for users, opinions, and votes

Authentication: Firebase Auth or backend JWT-based login

State management: React hooks (useState, useEffect, optional useContext)

High-level architecture:

Frontend handles UI, navigation tabs, and swipe interactions

Backend API provides endpoints for login, registration, opinion retrieval, voting, and leaderboard queries

Database stores users, opinions, and votes with relations (user → votes, user → submitted opinions)

Critical Workflows
Development
npm run dev          # Start Vite dev server for frontend
npm run build        # TypeScript check + Vite production build
npm run lint         # Run ESLint on all files
cd server && npm run dev  # Start Express backend with ts-node-dev


Important:

Always run npm run build before deploying to check TypeScript errors

Backend should be running for API calls to work in the frontend

Project Structure

Frontend

src/main.tsx – Entry point rendering <App />

src/App.tsx – Root component, sets up navigation tabs

src/components/ – Individual components (VoteTab, SubmitTab, LeaderboardTab, Header, OpinionCard)

src/api/ – Functions for API calls (login, register, get opinions, submit opinion, vote, leaderboard)

src/styles/ – Tailwind or CSS modules

Backend

server/index.ts – Express server entry

server/routes/ – API endpoints: auth.ts, opinions.ts, votes.ts, leaderboard.ts

server/models/ – Database models / Firestore schemas: User.ts, Opinion.ts, Vote.ts

server/middleware/ – Auth middleware for protected routes

Code Patterns & Conventions
React Components

Functional components only, using hooks (useState, useEffect)

Tab navigation: three main tabs – Vote, Submit, Leaderboard

Swipe gestures handled in VoteTab using onClick or drag logic

TypeScript

Strict mode enabled

All props and state typed explicitly

Interfaces used for User, Opinion, Vote

Example Opinion interface:

interface Opinion {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  locationRegion?: string;
  voteCount: number;
}

Styling

Tailwind CSS for mobile-first layout

Each component imports its own styles or uses global styles via index.css

Linting

ESLint with React hooks plugin, enforcing dependency arrays and hooks rules

TypeScript errors treated as critical

Key Integration Points
Frontend ↔ Backend

Login/Register: POST /api/auth/login, /api/auth/register

Get opinion: GET /api/opinions/next?exclude=[id1,id2,...]

Submit opinion: POST /api/opinions

Vote: POST /api/votes

Leaderboard: GET /api/leaderboard?type=hot|controversial&region=...

Vote logic:

One vote per user per opinion

Frontend tracks seen opinion IDs per session to avoid repeats

Database

users collection/table: id, username, email, passwordHash, createdAt

opinions collection/table: id, content, authorId, createdAt, locationRegion, voteCount

votes collection/table: id, userId, opinionId, value (+1/-1), createdAt

Common Tasks for AI Agents

Add new component: Create .tsx in src/components, use hooks, import Tailwind classes

Add API endpoint: Add route in server/routes/*.ts, update model in server/models/*.ts

Vote handling: Ensure one vote per user; update opinion voteCount atomically

Leaderboard updates: Compute top opinions by vote count; optionally include “controversial” leaderboard

State handling: Keep per-session seenOpinionIds in VoteTab to prevent duplicates

Notes for Modifications

React hooks are the standard (no class components)

Always maintain TypeScript strictness

Tailwind for layout and mobile-first styling

Frontend/backend communication uses RESTful API only

Avoid exposing sensitive data (passwords, exact geolocation)