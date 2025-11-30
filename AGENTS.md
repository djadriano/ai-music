# AGENTS.md

## Dev Environment Tips

- Use `npm run dev` or `pnpm dev` to start the Next.js development server on [http://localhost:3000](http://localhost:3000).
- The project uses **Next.js 16** with the App Router—pages live in the `app/` directory.
- Components are in the `components/` directory with **shadcn/ui** configuration in `components.json`.
- Use `npm install <package>` or `pnpm add <package>` to add dependencies.
- TypeScript configuration is in `tsconfig.json`—ensure your editor's TypeScript server is running for type checking.
- Environment variables go in `.env.local` (already gitignored)—never commit API keys.
- The project uses **Tailwind CSS v4** with PostCSS—check `postcss.config.mjs` for configuration.

## Key Technologies

- **Next.js 16** (App Router, React 19, Server Components)
- **AI SDK 5.x** (`ai` package + `@ai-sdk/openai` + `@ai-sdk/react`)
- **TypeScript 5**
- **Tailwind CSS 4** with custom animations
- **Radix UI** components (Dialog, Dropdown, Progress, Slider, etc.)
- **music-metadata** for MP3 file parsing
- **Fuse.js** for fuzzy search
- **Zod** for schema validation

## Project Structure

```
/app              → Next.js App Router pages and API routes
/components       → React components (UI + feature components)
/lib              → Utility functions and shared logic
/hooks            → Custom React hooks
/types            → TypeScript type definitions
/public           → Static assets
```

## React Standards

### Component Guidelines

- Use **functional components** with hooks—no class components.
- Prefer **Server Components** by default; use `"use client"` only when needed (hooks, event handlers, browser APIs).
- Keep components **small and focused**—extract logic into custom hooks when appropriate.
- Use **TypeScript strictly**—no `any` types without explicit justification.
- Props should be typed with **interfaces**, not inline types.
- Use **named exports** for components, not default exports.
- Follow the pattern: imports → types → component → exports.

### Component File Structure

```typescript
// 1. React and external imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Internal imports
import { useMusicPlayer } from '@/hooks/use-music-player'
import { formatDuration } from '@/lib/utils'

// 3. Type definitions
interface MyComponentProps {
  title: string
  onAction: () => void
}

// 4. Component definition
export function MyComponent({ title, onAction }: MyComponentProps) {
  const [isActive, setIsActive] = useState(false)
  
  return (
    <div>
      <h2>{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  )
}
```

### State Management

- Use `useState` for local component state.
- Use `useContext` for shared state across components.
- Avoid prop drilling—lift state only when necessary.
- For complex state, consider `useReducer`.
- Keep state as close to where it's used as possible.

### TypeScript Patterns

```typescript
// ✅ Good: Named interface with clear prop types
interface MusicPlayerProps {
  trackId: string
  autoPlay?: boolean
  onEnded?: () => void
}

export function MusicPlayer({ trackId, autoPlay = false, onEnded }: MusicPlayerProps) {
  // Component logic
}

// ❌ Bad: Inline types, default export
export default function MusicPlayer({ trackId, autoPlay, onEnded }: {
  trackId: string
  autoPlay?: boolean
  onEnded?: () => void
}) {
  // Component logic
}
```

## AI SDK Patterns

### Tool Definitions

- Always use **Zod schemas** for tool parameters.
- Keep tool names descriptive and action-oriented (e.g., `searchMusic`, not `search`).
- Include clear descriptions for both tools and parameters.
- Return structured data that the UI can easily consume.
- Handle errors gracefully and return meaningful error messages.

### Example Tool Pattern

```typescript
import { z } from 'zod'

export const searchMusicTool = {
  description: 'Search for music tracks by name, artist, or album',
  parameters: z.object({
    query: z.string().describe('Search query for track, artist, or album'),
    limit: z.number().optional().describe('Maximum number of results to return (default: 10)')
  }),
  execute: async ({ query, limit = 10 }) => {
    try {
      const results = await searchTracks(query, limit)
      return {
        success: true,
        tracks: results,
        count: results.length
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }
    }
  }
}
```

### Chat UI Patterns

- Use `useChat` hook from `@ai-sdk/react` for chat interfaces.
- Handle loading states with AI SDK Elements (`<Loader />`, `<Reasoning />`, `<Task />`).
- Display tool invocations and results clearly in the UI.
- Implement error boundaries for AI interactions.
- Show user feedback for long-running operations.
- Use `isLoading` state to disable input during AI responses.

### AI SDK 5.x Requirements

- Tool schemas must use `z.object()` at the top level.
- All parameters must have `.describe()` for better AI understanding.
- Return values should be JSON-serializable objects.
- Avoid nested functions or closures in tool definitions.

## Styling Standards

### Tailwind CSS Guidelines

- Use **Tailwind CSS** utility classes—avoid custom CSS unless necessary.
- Follow **mobile-first** responsive design (use `sm:`, `md:`, `lg:` breakpoints).
- Use **CSS variables** from Tailwind config for colors and spacing.
- Keep className strings readable—use `cn()` helper from `lib/utils.ts` for conditional classes.
- Use **Radix UI** primitives for complex components (dialogs, dropdowns, etc.).
- Animations should use `motion` library or Tailwind's `animate-*` classes.

### Conditional Styling Pattern

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  "flex items-center gap-2 p-4 rounded-lg transition-colors",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 pointer-events-none",
  className
)}>
  {children}
</div>
```

### Color Usage

- Use semantic color tokens: `primary`, `secondary`, `muted`, `accent`, `destructive`.
- Avoid hardcoded colors like `bg-blue-500`—use theme variables.
- For text, use `text-foreground`, `text-muted-foreground`, etc.
- Dark mode is handled automatically via CSS variables.

## File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `music-player.tsx`, `chat-interface.tsx`)
- **Hooks**: `use-*.ts` (e.g., `use-music-player.ts`, `use-chat.ts`)
- **Utilities**: `kebab-case.ts` (e.g., `format-duration.ts`, `parse-metadata.ts`)
- **Types**: `kebab-case.ts` or `types.ts` (e.g., `music-types.ts`)
- **API Routes**: `route.ts` in App Router directories (e.g., `app/api/chat/route.ts`)
- **Pages**: `page.tsx` in App Router directories (e.g., `app/dashboard/page.tsx`)

## Import Organization

Organize imports in this order:

```typescript
// 1. React and Next.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { motion } from 'motion/react'
import Fuse from 'fuse.js'

// 3. AI SDK
import { useChat } from '@ai-sdk/react'

// 4. UI components (shadcn/ui)
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

// 5. Custom components
import { MusicPlayer } from '@/components/music-player'
import { ChatInterface } from '@/components/chat-interface'

// 6. Hooks
import { useMusicPlayer } from '@/hooks/use-music-player'

// 7. Utils and lib
import { cn, formatDuration } from '@/lib/utils'

// 8. Types
import type { Track, Setlist } from '@/types/music'
```

## Error Handling Patterns

### API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input
    if (!body.query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }
    
    // Process request
    const result = await processQuery(body.query)
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Client Components

```typescript
'use client'

import { useState } from 'react'

export function MyComponent() {
  const [error, setError] = useState<string | null>(null)
  
  const handleAction = async () => {
    try {
      setError(null)
      await performAction()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      console.error('Action failed:', err)
    }
  }
  
  return (
    <div>
      {error && (
        <div className="text-destructive text-sm">{error}</div>
      )}
      <Button onClick={handleAction}>Perform Action</Button>
    </div>
  )
}
```

## API Route Standards

### Route Structure

- Use `route.ts` files in `app/api/` directories.
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`.
- Always return `NextResponse` objects.
- Use proper HTTP status codes (200, 201, 400, 404, 500, etc.).
- Validate request bodies with Zod schemas.

### Example API Route

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().optional().default(10)
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, limit } = searchSchema.parse(body)
    
    const results = await searchMusic(query, limit)
    
    return NextResponse.json({
      success: true,
      results,
      count: results.length
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Music Metadata Handling

### Reading MP3 Files

- Use `music-metadata` library for parsing MP3 files.
- Extract BPM from **Serato ID3 tags** (`GEOB` frames).
- Cache metadata to avoid repeated file reads.
- Handle missing or malformed metadata gracefully.

### BPM Extraction Pattern

```typescript
import { parseFile } from 'music-metadata'

async function extractBPM(filePath: string): Promise<number | null> {
  try {
    const metadata = await parseFile(filePath)
    
    // Check Serato tags first
    const seratoBpm = metadata.native?.['ID3v2.4']?.find(
      tag => tag.id === 'GEOB' && tag.value?.description === 'Serato BeatGrid'
    )
    
    if (seratoBpm) {
      return parseSeratoBPM(seratoBpm.value)
    }
    
    // Fallback to standard BPM tag
    return metadata.common.bpm ?? null
  } catch (error) {
    console.error('Failed to extract BPM:', error)
    return null
  }
}
```

## Performance Best Practices

### Server Components

- Use Server Components by default for better performance.
- Fetch data directly in Server Components—no need for `useEffect`.
- Keep client-side JavaScript minimal.

### Client Components

- Use `"use client"` only when necessary (hooks, event handlers, browser APIs).
- Memoize expensive calculations with `useMemo`.
- Memoize callbacks with `useCallback` when passing to child components.
- Use `React.memo()` for components that render frequently with the same props.

### Music File Scanning

- Scan directories in the background—don't block the UI.
- Use streaming or pagination for large music libraries.
- Cache metadata in memory or a database.
- Debounce search queries to reduce unnecessary processing.

### Code Splitting

- Use dynamic imports for heavy components: `const HeavyComponent = dynamic(() => import('./heavy-component'))`
- Lazy load music player controls until needed.
- Split AI tools into separate modules.

## Testing Instructions

- **Linting**: Run `npm run lint` or `pnpm lint` to check for ESLint errors.
- **Type Checking**: Run `npx tsc --noEmit` to verify TypeScript types without emitting files.
- **Build Verification**: Run `npm run build` or `pnpm build` to ensure the production build succeeds.
- Fix all linting and type errors before committing—the build must be green.
- After moving files or changing imports, always run `pnpm lint` to verify ESLint and TypeScript rules still pass.
- Test AI chat functionality manually by running the dev server and interacting with the chat interface.
- Verify music player controls, BPM filtering, and setlist management work as expected.

## Development Workflow

1. **Start Development**: `pnpm dev` to run the Next.js dev server.
2. **Make Changes**: Edit files in `app/`, `components/`, or `lib/`.
3. **Check Types**: Run `npx tsc --noEmit` to catch type errors early.
4. **Lint Code**: Run `pnpm lint` before committing.
5. **Test Manually**: Interact with the UI to verify changes work correctly.
6. **Build**: Run `pnpm build` to ensure production build passes.

## AI SDK Integration

- AI chat routes are in `app/api/chat/route.ts` (or similar API routes).
- Use `useChat` hook from `@ai-sdk/react` for chat UI components.
- Tool definitions use **Zod schemas** for parameter validation.
- The AI can invoke tools like `searchMusic`, `filterByBpm`, `addToSetlist`, and `playMusic`.
- Ensure tool schemas match the AI SDK 5.x format—invalid schemas will cause OpenAI API errors.

## Music Management

- Music files are scanned from a directory (configured in the app).
- **BPM data** is read from Serato ID3 tags using `music-metadata`.
- **Search** uses Fuse.js for fuzzy matching on track names, artists, and albums.
- **Setlist** management allows adding/removing tracks for DJ sets.
- The music player component (`components/music-player.tsx`) handles playback controls.

## Common Issues

- **"Invalid schema for function" error**: Check that Zod schemas in tool definitions match AI SDK 5.x requirements.
- **Music player progress bar not updating**: Ensure `currentTime` and `duration` states are updated from audio element events.
- **BPM filtering not working**: Verify Serato tags are being read correctly from MP3 files.
- **Chat not responding**: Check API route logs and ensure OpenAI API key is set in `.env.local`.

## PR Instructions

- **Title format**: `[Component/Feature] Brief description`
  - Examples: `[Chat] Add reset functionality`, `[Music Player] Fix progress bar`
- Always run `pnpm lint` and `pnpm build` before committing.
- Ensure all TypeScript errors are resolved (`npx tsc --noEmit`).
- Test changes manually in the browser before pushing.
- Keep commits focused—one logical change per commit.

## Environment Variables

Required in `.env.local`:
- `OPENAI_API_KEY` - Your OpenAI API key for AI SDK integration

## Useful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint

# Type Checking
npx tsc --noEmit           # Check TypeScript types

# Package Management
pnpm add <package>         # Add dependency
pnpm add -D <package>      # Add dev dependency
pnpm remove <package>      # Remove dependency
```

## Notes for AI Agents

- This is a **single Next.js application**, not a monorepo—no need for workspace filters.
- Focus on maintaining type safety—use TypeScript strictly.
- Follow the existing component patterns in `components/` when adding new UI.
- Keep AI tool definitions in sync with the actual implementation.
- Test chat interactions thoroughly after modifying AI tools or schemas.
- Respect the existing file structure—don't create new top-level directories without reason.
