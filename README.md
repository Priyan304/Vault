# Vault

> **A little digital space for everything worth keeping. 🔐**

Vault is a personal digital space for saving, organizing, searching, and revisiting resources, notes, code snippets, bookmarks, and diary entries.

This started as a personal learning project and is currently evolving from a local-first prototype into a full-stack application.

##  Features

- **Resource Management** — Save bookmarks, articles, documentation, videos, repositories, and more.
- **Personal Notes** — Write and organize notes with Markdown support.
- **Code Snippets** — Keep reusable code snippets organized by language.
- **Digital Diary** — A private space for daily thoughts, reflections, and moods.
- **Tags & Filtering** — Organize content and quickly find what you're looking for.
- **Command Palette** — Quickly navigate around the application with `⌘K` / `Ctrl+K`.
- **Local Persistence** — Data currently persists locally in the browser using `localStorage`.
- **Mock Authentication** — Separate local data between different accounts during development.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- localStorage *(current prototype)*

### Planned

- Supabase PostgreSQL
- Supabase Authentication
- Row Level Security (RLS)
- Vercel deployment

##  Project Status

**Under Development**

Vault is currently a functional local-first prototype.

The current version stores authentication state and application data in the browser using `localStorage`. A database-backed version is planned as the next major stage of development.

The project is being built incrementally to explore:

- Authentication
- PostgreSQL databases
- Data relationships
- Authorization
- Row Level Security
- Secure application architecture
- Production deployment

##  Getting Started

### Prerequisites

- Node.js v18+
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/Priyan304/Vault.git
cd Vault
Reset Local Data

Vault currently stores authentication and application data in your browser's `localStorage`.

To completely reset the local application:

1. Open the app at `http://localhost:3000`
2. Open Developer Tools with `F12`
3. Go to **Console**
4. Run:

```javascript
localStorage.clear();
location.reload();
