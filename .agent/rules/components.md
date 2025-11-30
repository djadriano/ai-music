---
trigger: glob
globs: components/**/*.{ts,tsx}
---

# React Component Building Guidelines

These instructions define how to build React components in the ComGenius project. All components must follow these patterns for consistency, maintainability, and composability.

## Core Philosophy: Composition Over Configuration

Build components using **composition** rather than complex prop configurations. Break down components into smaller, focused sub-components that work together instead of creating monolithic components with dozens of props.

### ❌ Avoid: Monolithic Components

```tsx
// Don't do this - too many responsibilities
<Accordion 
  data={items}
  showIcons={true}
  iconType="chevron"
  headerColor="primary"
  contentPadding="large"
  animated={true}
  onToggle={handleToggle}
/>
```

### ✅ Prefer: Composable Components

```tsx
// Do this - composable and flexible
<Accordion.Root open={isOpen} onOpenChange={setIsOpen}>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>
      <Accordion.Title>Section 1</Accordion.Title>
    </Accordion.Trigger>
    <Accordion.Content>
      <p>Content goes here</p>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

## Component Architecture

### 1. Component Structure

Every component must have this file structure:

```
ComponentName/
├── ComponentName.tsx          # Main component(s)
├── ComponentName.types.ts     # TypeScript interfaces/types
├── hooks/                     # Custom hooks (if needed)
│   ├── useComponentLogic.ts
│   └── index.ts
└── index.ts                   # Public exports
```

### 2. Composable Component Pattern

When building complex components, break them into sub-components:

#### Root Component

The Root component manages shared state and context for all child components.

```tsx
// ComponentName.tsx
import { createContext, useContext } from 'react';
import { RootProps, ComponentContextValue } from './ComponentName.types';

const ComponentContext = createContext<ComponentContextValue>({
  // Default values
  isOpen: false,
  setIsOpen: () => {},
});

export const useComponentContext = () => {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error('Component parts must be used within Component.Root');
  }
  return context;
};

export const Root = ({ children, open, onOpenChange, ...props }: RootProps) => {
  return (
    <ComponentContext.Provider value={{ isOpen: open, setIsOpen: onOpenChange }}>
      {children}
    </ComponentContext.Provider>
  );
};
```

#### Sub-Components

Create focused sub-components for different parts:

```tsx
// Trigger component
export const Trigger = ({ children, asChild, ...props }: TriggerProps) => {
  const { isOpen, setIsOpen } = useComponentContext();
  
  return (
    <div 
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      {...props}
    >
      {children}
    </div>
  );
};

// Content component
export const Content = ({ children, ...props }: ContentProps) => {
  const { isOpen } = useComponentContext();
  
  if (!isOpen) return null;
  
  return <div {...props}>{children}</div>;
};

// Title component
export const Title = ({ children, ...props }: TitleProps) => {
  return <div {...props}>{children}</div>;
};
```

#### Exports

Export all sub-components as named exports:

```tsx
// index.ts
export { Root } from './ComponentName';
export { Trigger } from './ComponentName';
export { Content } from './ComponentName';
export { Title } from './ComponentName';
export { Description } from './ComponentName';

// Also export types
export type { RootProps, TriggerProps, ContentProps } from './ComponentName.types';
```

Usage:

```tsx
import * as Component from '@client/components/Component';

<Component.Root open={isOpen} onOpenChange={setIsOpen}>
  <Component.Trigger>
    <Component.Title>Click me</Component.Title>
  </Component.Trigger>
  <Component.Content>
    Content here
  </Component.Content>
</Component.Root>
```

### 3. Naming Conventions for Sub-Components

Follow these standard naming patterns:

| Component Type | Name | Purpose | Example |
|---------------|------|---------|---------|
| Container | `Root` | Main wrapper, manages context | `<Accordion.Root>` |
| Interactive | `Trigger` | Element that initiates action | `<Dialog.Trigger>` |
| Content | `Content` | Main content area | `<Accordion.Content>` |
| Structure | `Header` | Top section | `<Card.Header>` |
| Structure | `Body` | Main section | `<Card.Body>` |
| Structure | `Footer` | Bottom section | `<Card.Footer>` |
| Informational | `Title` | Primary heading | `<Dialog.Title>` |
| Informational | `Description` | Supporting text | `<Dialog.Description>` |
| Structural | `Item` | Individual item in a list | `<Accordion.Item>` |


## State Management & Hooks

### Extract Logic to Custom Hooks

**Rule**: Components should only handle UI rendering. All logic goes in custom hooks.

#### ❌ Don't Do This

```tsx
const Component = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  // ... 50 more lines of logic
  
  return <div>...</div>;
};
```

#### ✅ Do This

```tsx
// hooks/useComponentLogic.ts
export const useComponentLogic = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, loading } = useData();
  
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  return {
    state: { isOpen, data, loading },
    actions: { handleToggle, setIsOpen },
  };
};

// ComponentName.tsx
const Component = ({ items }: Props) => {
  const { state, actions } = useComponentLogic();
  
  return (
    <div>
      <button onClick={actions.handleToggle}>
        {state.isOpen ? 'Close' : 'Open'}
      </button>
    </div>
  );
};
```

### Hook Guidelines

1. **Max 3-4 `useState` per component** - If you need more, extract to a hook
2. **No complex `useEffect` in components** - Move to hooks
3. **Group related state** - Use objects or custom hooks
4. **Return organized values** - Separate `state` and `actions`

### Common Hook Patterns

```tsx
// Media/Audio hooks
useAudioPlayer(tracks: Track[])
useVideoPlayer(src: string)

// Data fetching hooks
useData(endpoint: string)
useInfiniteScroll(fetchMore: () => void)

// Form hooks
useForm<T>(initialValues: T)
useFormValidation(schema: Schema)

// UI state hooks
useToggle(initialState: boolean)
useDisclosure() // for modals, drawers, etc.

// DOM hooks
useEventListener(event: string, handler: Function)
useClickOutside(ref: RefObject, handler: Function)
useMediaQuery(query: string)
```

## Accessibility Requirements

### Always Include ARIA Attributes

Every interactive component must have proper ARIA attributes.

```tsx
// Toggle button
<button
  aria-label={isOpen ? 'Close menu' : 'Open menu'}
  aria-expanded={isOpen}
  aria-controls="menu-content"
  onClick={handleToggle}
>
  {isOpen ? 'Close' : 'Open'}
</button>

// Content panel
<div
  id="menu-content"
  role="region"
  aria-labelledby="menu-trigger"
  hidden={!isOpen}
>
  Content
</div>

// Form input
<label htmlFor="email-input">Email Address</label>
<input
  id="email-input"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? 'email-error' : undefined}
/>
{hasError && <span id="email-error" role="alert">{errorMessage}</span>}
```

### Semantic HTML

Use proper semantic HTML elements:

- `<button>` for clickable actions (not `<div onClick>`)
- `<nav>` for navigation
- `<main>` for main content
- `<article>`, `<section>`, `<aside>` for content structure
- `<h1>` - `<h6>` for headings in proper hierarchy

### Keyboard Navigation

Support keyboard navigation for all interactive elements:

```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      handleToggle();
      break;
    case 'Escape':
      handleClose();
      break;
    case 'ArrowDown':
      handleNext();
      break;
    case 'ArrowUp':
      handlePrevious();
      break;
  }
};

<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleToggle}
>
  Interactive element
</div>
```

## Performance Optimization

### Use React.memo for Stable Props

```tsx
import { memo } from 'react';

const Component = memo(({ title, content }: Props) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
});

Component.displayName = 'Component';
```

### Use useMemo and useCallback

```tsx
const Component = ({ items, onSelect }: Props) => {
  // Memoize expensive computations
  const filteredItems = useMemo(() => {
    return items.filter(item => item.active);
  }, [items]);
  
  // Memoize callbacks passed to children
  const handleSelect = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);
  
  return (
    <List items={filteredItems} onItemClick={handleSelect} />
  );
};
```

### Proper Dependency Arrays

Always include complete dependency arrays in `useEffect`:

```tsx
// ✅ Correct
useEffect(() => {
  const handler = () => setTime(audio.currentTime);
  audio.addEventListener('timeupdate', handler);
  return () => audio.removeEventListener('timeupdate', handler);
}, [audio]); // Include audio in deps

// ❌ Wrong
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency
```

## Testing Requirements

### Unit Test Hooks Separately

```tsx
// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```