# Mini Google Docs

A lightweight, collaborative rich-text document editor inspired by Google Docs, built as a full-stack production-ready MVP.

---

## Features

- **User Authentication**: Secure JWT-based session authentication with seeded login accounts for instant evaluation.
- **Personal Dashboard**: 
  - **My Documents**: View, open, delete, and search documents created by you.
  - **Shared With Me**: Access documents shared by other users with clear owner attribution.
- **Rich Text Editor (TipTap)**:
  - Clean editing canvas.
  - Formatting toolbar supporting: **Bold**, *Italic*, <u>Underline</u>, Headings, Bullet Lists, and Numbered Lists.
  - Auto-saving every 3 seconds of text change with saving status indicators ("Saving...", "Saved").
  - Manual save trigger.
- **File Uploads**: Supports importing `.txt` and `.md` files. Filename becomes document title, content is loaded into the editor. Includes format validation.
- **Document Sharing**: Share documents with other registered users via email dropdown. Prevents self-sharing and duplicate sharing.

---

## Seeded User Credentials

The database automatically seeds these accounts on startup for testing:

| User | Email | Password |
| :--- | :--- | :--- |
| **User 1** | `user1@example.com` | `123456` |
| **User 2** | `user2@example.com` | `123456` |

---

## Prerequisites

- **Node.js**: v18 or later (Tested on `v24.11.1`)
- **npm**: v9 or later (Tested on `11.6.2`)
- **MongoDB**: A running MongoDB instance locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI.

---

## Installation & Setup

1. **Clone/Download the repository** into your local directory.
2. **Install Root and Package dependencies**:
   ```bash
   npm run install:all
   ```
   This will install top-level orchestrator packages, backend dependencies, and frontend dependencies.

3. **Configure Environment Variables**:
   Create a `.env` file inside the `server/` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/mini-google-docs
   JWT_SECRET=super_secret_jwt_passphrase_key
   ```
   *Note: If no env is configured, the server defaults to connecting to a local MongoDB instance at `mongodb://127.0.0.1:27017/mini-google-docs`.*

---

## Running the Application Locally

Start both the backend server and the React frontend concurrently using the root shortcut:
```bash
npm run dev
```

- **Frontend**: Running on [http://localhost:5173](http://localhost:5173)
- **Backend API**: Running on [http://localhost:5000](http://localhost:5000)

---

## Testing

Run the backend unit and integration test suite:
```bash
npm test
```
The tests are written using **Jest** and **Supertest** and connect to an isolated, automated test database (`mongodb://127.0.0.1:27017/mini-google-docs-test`) to verify document creation, sharing logic, duplicate share prevention, and authentication middleware.

---

## Project Structure

```
├── server/               # Backend Express Server
│   ├── config/           # Database configurations
│   ├── controllers/      # Route controllers (Auth, Document)
│   ├── middleware/       # JWT Token validator middleware
│   ├── models/           # Mongoose schemas (User, Document)
│   ├── routes/           # Routing definitions
│   ├── services/         # Business logic layer
│   └── tests/            # Jest test suite (sharing.test.js)
│
├── client/               # Frontend React Application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable UI components (ShareModal, ProtectedRoute)
│   │   ├── context/      # AuthContext for session management
│   │   ├── pages/        # Main pages (Login, Dashboard, Editor)
│   │   ├── routes/       # React Router setup
│   │   ├── services/     # api.js fetch communications wrapper
│   │   ├── index.css     # Tailwind v4 import & custom styles
│   │   └── main.jsx      # Entry point
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
```
