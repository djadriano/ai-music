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

## Tech Stack & Styling

### 1. Tailwind CSS & CVA (Class Variance Authority)

Use **Tailwind CSS** for all styling. Do not use CSS modules or styled-components.
Use **CVA** to manage component variants and `cn` (from `lib/utils`) to merge classes.

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
```

### 2. Radix UI Primitives

Use **Radix UI** primitives for all interactive components (Dialogs, Popovers, Accordions, Tabs, etc.) to ensure accessibility and keyboard navigation.

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName
```

### 3. Icons

Use **Lucide React** for all icons.

```tsx
import { ArrowRight, Check } from 'lucide-react';

<ArrowRight className="ml-2 h-4 w-4" />
```

## Component Architecture

### 1. Server vs Client Components

- **Default to Server Components**: By default, all components in Next.js App Router are Server Components.
- **Use 'use client' only when needed**: Add `'use client'` at the top of the file ONLY if the component:
    - Uses React hooks (`useState`, `useEffect`, `useRef`, etc.)
    - Uses event listeners (`onClick`, `onChange`, etc.)
    - Uses browser-only APIs (`window`, `document`, etc.)
- **Split Components**: If a small part of a large component needs interactivity, extract that part into its own Client Component and keep the rest as a Server Component.

### 2. Component Structure

Every component must have this file structure:

```
ComponentName/
├── ComponentName.tsx          # Main component(s)
├── ComponentName.types.ts     # TypeScript interfaces/types (optional, can be in main file if small)
├── hooks/                     # Custom hooks (if needed)
└── index.ts                   # Public exports
```

### 3. Composable Component Pattern

When building complex components, break them into sub-components:

#### Root Component

The Root component manages shared state and context for all child components.

```tsx
// ComponentName.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const ComponentContext = React.createContext<ComponentContextValue | undefined>(undefined)

export const Root = ({ children, className, ...props }: RootProps) => {
  return (
    <ComponentContext.Provider value={{ ... }}>
      <div className={cn("relative", className)} {...props}>
        {children}
      </div>
    </ComponentContext.Provider>
  );
};
```

#### Sub-Components

Create focused sub-components for different parts:

```tsx
// Trigger component
export const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button 
        ref={ref}
        className={cn("flex items-center", className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Trigger.displayName = "ComponentName.Trigger"
```

#### Exports

Export all sub-components as named exports:

```tsx
// index.ts
export { Root } from './ComponentName';
export { Trigger } from './ComponentName';
export { Content } from './ComponentName';
```

## State Management & Hooks

### Extract Logic to Custom Hooks

**Rule**: Components should primarily handle UI rendering. Complex logic goes in custom hooks.

#### ✅ Do This

```tsx
// hooks/useComponentLogic.ts
export const useComponentLogic = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  return {
    isOpen,
    handleToggle
  };
};
```

### Hook Guidelines

1. **Max 3-4 `useState` per component** - If you need more, extract to a hook
2. **No complex `useEffect` in components** - Move to hooks
3. **Group related state** - Use objects or custom hooks

## Accessibility Requirements

### Always Include ARIA Attributes

Every interactive component must have proper ARIA attributes. Radix UI handles most of this automatically, which is why it is preferred.

```tsx
// If building custom without Radix (avoid if possible):
<button
  aria-label={isOpen ? 'Close menu' : 'Open menu'}
  aria-expanded={isOpen}
  aria-controls="menu-content"
  onClick={handleToggle}
>
  {isOpen ? 'Close' : 'Open'}
</button>
```

### Semantic HTML

Use proper semantic HTML elements:

- `<button>` for clickable actions (not `<div onClick>`)
- `<nav>` for navigation
- `<main>` for main content
- `<article>`, `<section>`, `<aside>` for content structure
- `<h1>` - `<h6>` for headings in proper hierarchy

## Performance Optimization

### Use React.memo for Stable Props

```tsx
const Component = React.memo(({ title, content }: Props) => {
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
  const filteredItems = useMemo(() => {
    return items.filter(item => item.active);
  }, [items]);
  
  const handleSelect = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);
  
  return (
    <List items={filteredItems} onItemClick={handleSelect} />
  );
};
```
