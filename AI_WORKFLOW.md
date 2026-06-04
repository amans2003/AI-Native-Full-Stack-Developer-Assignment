# AI Workflow Note

This document tracks how AI assisted in the design, development, and testing of the Mini Google Docs application.

---

## 1. AI Tools Used
- **Antigravity (Gemini 3.5 Flash)**: Used for plan orchestration, code generation, testing, and workspace automation.

---

## 2. Where AI Accelerated Development

- **Dual-Mode Backend/Frontend Setup**: Promptly scaffolded matching React pages and Express models, ensuring API routes (`/api/documents/:id/share`) align perfectly.
- **Robust JWT & Middleware Rules**: Generating auth validations on the fly (e.g. self-share checks, duplicate list filters, and owner delete controls) saved substantial manual setup time.
- **TipTap Styling Integrations**: Standardized Markdown-like styling rules for headless ProseMirror editor outputs inside the `@layer components` of `index.css`.
- **E2E Automated Test Case**: Set up complete request verification (creation, token injection, sharing, duplicate re-sharing checks, and 403 authorization guard testing) using Jest + Supertest.

---

## 3. Rejected Suggestions

- **Automatic MongoDB In-Memory Server**: Some AI agents suggest embedding `mongodb-memory-server` in the server app. This was rejected because downloading binary dependencies on Windows machines during installation is notoriously fragile and slow. We opted to use standard Mongoose connected to a configurable local/cloud URI, which is more reliable.
- **Local File Writes for Imports**: A backend suggestion was to write uploaded files to a `/uploads` folder before reading them. This was rejected in favor of memory-buffering (`multer.memoryStorage()`) to keep the filesystem stateless and avoid cleanup scripts.

---

## 4. Correctness Verification
- **Build Compilations**: Checked that Vite successfully compiled assets (`npm run build`) in client packages, verifying TypeScript types and React ESM imports.
- **Automated Tests**: Configured isolated test assertions inside `server/tests/sharing.test.js` checking auth tokens, database writes, and sharing tables.
- **E2E Manual Testing**: Deployed backend and frontend servers, simulating user flows in the Chromium browser window, verifying session persistence, and testing cross-user sharing.
