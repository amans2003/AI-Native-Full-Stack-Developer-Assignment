# Submission - Mini Google Docs

Below is the summary of features, working details, limitations, and future improvements for this project submission.

---

## Included Features

1. **Lightweight Document Editor UI**: A sleek React-based layout styled with Tailwind CSS, supporting dark page backdrops and a clean paper canvas.
2. **Simple Authentication system**: Persistent sessions via local storage token cache, logout routing, and route protection.
3. **Dashboard Page**:
   - Lists owned documents under "My Documents".
   - Lists shared documents under "Shared With Me".
   - Search filter mapping.
4. **Rich Text Formatting Toolbar**: Supported bold, italic, underline, headers, and bullet/numbered lists formatting powered by TipTap.
5. **Autosave Engine**: Auto-saves document edits (title and content updates) every 3 seconds of typing with indicator notifications.
6. **File Imports**: File input reading `.txt` and `.md` documents, mapping names as document titles and converting content.
7. **Collaborative Sharing**: Document owner sharing modal listing current participants and available users, preventing duplicate shares.

---

## Working Features

- **Seeding Service**: Runs on database boot, ensuring test users (`user1@example.com` and `user2@example.com`) are present with hashed passwords.
- **REST CRUD Controller**: Endpoints handling user logins, fetches, updates, and deletes with route guards.
- **Memory Buffer Parsing**: Multer middleware captures uploaded file buffers directly without local drive caching, ensuring rapid, secure parsing.
- **Security Checkpoints**: Backend verifies ownership/sharing arrays before servicing fetch, rename, save, and delete requests.
- **Vite Reverse Proxy**: Set up local server proxy forwarding `/api` paths to `http://localhost:5000` to bypass CORS issues on dev.
- **Automated Integration Tests**: Full endpoint test suite simulating login, creation, sharing, duplicates, and security locks using Jest and Supertest.

---

## Known Limitations

- **No Real-Time Cursor tracking**: Does not sync simultaneous keystrokes or cursor locations (Google Docs-like real-time editing) as this was deprioritized under assignment requirements.
- **No Concurrent Conflict Resolution**: If two users modify the same document at the same time, the last save operation over REST overwrites the previous one.
- **Single Owner Constraint**: Documents are tied to a single owner creator; ownership transfer is not supported.

---

## Future Improvements

- **CRDT / Operational Transformation Integration**: Use Yjs to bind the TipTap ProseMirror state over a WebSocket channel for real-time concurrent collaborations.
- **Granular Permissions**: Introduce read-only, comment-only, and editing permission roles for shared targets.
- **Incremental Deltas**: Implement a version history log mapping edits back to specific user updates.

---

## Deployment Links Placeholder
- **Frontend App (Vercel)**: `https://mini-google-docs-frontend.vercel.app` (Placeholder)
- **Backend API (Render)**: `https://mini-google-docs-backend.onrender.com` (Placeholder)

---

## Walkthrough Demo Video Placeholder
- **Loom/YouTube Link**: `https://www.youtube.com/watch?v=dQw4w9WgXcQ` (Placeholder)
