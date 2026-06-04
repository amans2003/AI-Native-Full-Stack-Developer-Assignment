# Architecture & Design Decisions - Mini Google Docs

This document explains the technical architecture, data model, trade-offs, and future improvements for the Mini Google Docs application.

---

## 1. Tech Stack & Rationale

### Frontend: React + Vite + Tailwind CSS
- **React**: Clean declarative rendering model, making it perfect for dynamic and stateful interfaces like an editor dashboard.
- **Vite**: Provides lightning-fast HMR (Hot Module Replacement) and optimized production bundles, replacing slower alternatives like Create React App.
- **Tailwind CSS**: Utility-first CSS framework enabling rich, custom, responsive dark/light interfaces without the weight of large components libraries.
- **TipTap Editor**: Extensible headless rich text editor framework built on ProseMirror. It is highly preferred because it abstracts document states, supports clean HTML parsing, and offers a customizable toolbar.

### Backend: Node.js + Express.js
- **Express**: Lightweight framework for RESTful APIs.
- **Multer**: Configured with memory-based buffering to read text and markdown file uploads directly in memory, avoiding disk I/O bottleneck and keeping files secure.
- **JSON Web Tokens (JWT)**: Used for session-based authorization in standard REST endpoints, preserving performance and scalability.

### Database: MongoDB + Mongoose
- **MongoDB**: Document-oriented database storing documents as flexible JSON, matching the unstructured rich-text HTML string.
- **Mongoose**: Provides schema modeling, data validations, query hooks, and relationship population (`populate()`).

---

## 2. Database Schema Design

We model our data using two collections: **Users** and **Documents**.

### Users Collection (`User` Model)
```json
{
  "_id": "ObjectId",
  "email": "String (required, unique, lowercase, trimmed)",
  "password": "String (hashed using bcryptjs)",
  "name": "String (optional)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Documents Collection (`Document` Model)
```json
{
  "_id": "ObjectId",
  "title": "String (required, default: 'Untitled Document')",
  "content": "String (HTML content representation)",
  "owner": "ObjectId (ref: User, indexed)",
  "sharedWith": ["ObjectId (ref: User)"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 3. Security & Validation Controls

- **Access Protection**: Private routes on the frontend shield unauthorized routes. On the server, jwt authorization middleware (`protect`) validates headers, blocklisting unauthorized read/edit requests.
- **Document Access Logic**:
  - **Read/Edit**: Allowed if the user is the `owner` OR in the `sharedWith` array.
  - **Delete/Share**: Restricted strictly to the `owner`. Attempted access by other users yields a `403 Forbidden` response.
- **Duplicate Sharing Prevention**: The database lookup checks if the user's ObjectId is already in the `sharedWith` array before pushing, returning a `400 Bad Request` if duplicate.
- **Self-Sharing Prevention**: Validation blocks owners from sharing documents with their own emails.

---

## 4. Key Architectural Trade-offs

1. **REST Pull/Autosave vs. WebSockets**:
   - *Decision*: We implemented auto-saving every 3 seconds of text change over REST.
   - *Rationale*: Real-time collaboration, comments, and change tracking were intentionally deprioritized due to project scope. A standard REST autosave strategy maintains high reliability, simpler backend logic, and reduces socket connection overhead.
2. **Memory Buffer Uploads vs. Cloud Storage**:
   - *Decision*: File uploads (.txt, .md) are parsed in the server's memory buffer using Multer.
   - *Rationale*: For text-based imports, parsing content directly on the backend and storing it as HTML in the database avoids third-party bucket integrations (AWS S3) and keeps the workspace light.

---

## 5. Future Improvements
- **Real-Time Collaboration**: Transition to WebSockets (Socket.io) integrated with Yjs or ShareDB CRDTs (Conflict-free Replicated Data Types) for Google Docs-like simultaneous editing.
- **Version History**: Record incremental text diffs (deltas) in a nested schema to allow rollback capabilities.
- **Inline Comments & Mentions**: Support highlighting text fragments and linking thread-like comment structures.
- **Granular Permissions**: Read-only vs. Read/Write permission flags for shared users.
