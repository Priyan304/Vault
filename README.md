# Vault

**Vault** is a local-first personal knowledge and resource management platform. Save, organize, search, and manage resources, code snippets, personal notes, digital diary entries, and bookmarks in a clean, distraction-free interface.

## Features

- **Resource Management**: Bookmarks, articles, documentation, videos, and repositories with rich metadata.
- **Personal Notes**: Markdown-supported note-taking with instant preview and syntax styling.
- **Code Snippets**: Multi-language snippet library with syntax highlighting and one-click copy.
- **Digital Diary**: Daily reflections, mood tracking, and thoughts catalog.
- **Tagging & Filtering**: Categorize entries with customizable tags and instant full-text search.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Quick jump to resources, views, or creation modals.
- **Local Persistence**: Zero backend configuration required; all data stays private and persists locally.
- **Schema & RLS Educational Blueprint**: Interactive PostgreSQL schema reference with Row Level Security policies.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm

### Installation & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm run preview
```
