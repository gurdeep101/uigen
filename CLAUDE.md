# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run lint         # Run ESLint

# Testing
npm test             # Run all tests (Vitest)
npx vitest run src/lib/file-system.test.ts   # Run a single test file
npx vitest run -t "test name"                # Run tests matching a name

# Database
npm run setup        # Install deps, generate Prisma client, run migrations
npm run db:reset     # Force reset the database
```

## Architecture Overview

UIGen is an AI-powered React component builder. Users chat with Claude to generate React components, which are displayed in a live preview pane alongside a Monaco-based code editor.

### Request Flow

1. User sends a message → `ChatContext` (via Vercel AI SDK's `useChat`) POSTs to `/api/chat` with the serialized virtual file system
2. `/api/chat/route.ts` deserializes the file system, calls `streamText()` with two AI tools (`str_replace_editor`, `file_manager`), and streams back tool calls + text
3. `FileSystemContext.handleToolCall()` applies file operations to the in-memory `VirtualFileSystem` as tool calls arrive
4. `PreviewFrame` transforms JSX files to blob URLs and builds an import map for live preview using `esm.sh` CDN for third-party packages and Tailwind CSS CDN for styles
5. On stream finish, if authenticated, the project (messages + file data) is saved to SQLite via Prisma

### Virtual File System (`src/lib/file-system.ts`)

All files live in memory as `FileNode` objects in a `Map<path, FileNode>`. The VFS is serialized to/from JSON for storage in the `Project.data` DB column and for passing in chat API requests. Parent directories are auto-created on file creation. Key methods: `createFile`, `readFile`, `updateFile`, `deleteFile`, `rename`, `serialize`/`deserialize`, `viewFile` (returns content with line numbers), `replaceInFile`, `insertInFile`.

### AI Tools

- **`str_replace_editor`** (`src/lib/tools/str-replace.ts`): `view`, `create`, `str_replace`, `insert` operations on the VFS
- **`file_manager`** (`src/lib/tools/file-manager.ts`): `rename`, `delete` operations

The system prompt (`src/lib/prompts/generation.tsx`) instructs the AI to use `/App.jsx` as the entry point, Tailwind for styling, and `@/` as the import alias.

### Language Model Provider (`src/lib/provider.ts`)

`getLanguageModel()` returns `claude-haiku-4-5` if `ANTHROPIC_API_KEY` is set, otherwise falls back to a `MockLanguageModel` that simulates multi-step component generation without an API key.

### Auth

JWT-based session auth (`src/lib/auth.ts`). Sessions stored in an httpOnly cookie (`auth-token`), 7-day expiry. Passwords hashed with bcrypt. Server actions in `src/actions/index.ts` handle sign-up, sign-in, and sign-out. Middleware (`src/middleware.ts`) protects `/api/projects` and `/api/filesystem` routes.

### JSX Transform & Preview (`src/lib/transform/jsx-transformer.ts`)

Transforms JSX/TSX files using Babel standalone into ES modules (blob URLs). Builds an `<script type="importmap">` for local `@/` aliases and third-party packages via `esm.sh`. The preview HTML includes an error boundary and renders the app to `#root`.

### Database

SQLite via Prisma. Two models: `User` (email, hashed password) and `Project` (name, userId, `messages` as JSON string, `data` as JSON string). Schema at `prisma/schema.prisma`.

### Testing

Vitest with jsdom. Tests cover `VirtualFileSystem` operations (`src/lib/__tests__/file-system.test.ts`), the JSX transformer pipeline (`src/lib/transform/__tests__/jsx-transformer.test.ts`), and React contexts with Testing Library. Babel is mocked in transformer tests to avoid browser-only compilation.
