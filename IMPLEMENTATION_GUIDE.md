# Implementation Guide - OneTime Survey

This guide provides standardized patterns for implementing the remaining critical tasks across the codebase.

---

## 1. HIGH: Add Loading States to All Critical Pages

### Pattern: Using React Query Loading States

**File Location**: `hooks/use-surveys.ts`, `hooks/use-creator.ts`, etc. (already exist)

**Key Pattern**:
```typescript
// In your custom hook
export function useCreatorDashboard() {
  const { isLoading, error, data } = useQuery({
    queryKey: ['creator', 'dashboard'],
    queryFn: () => api.get<DashboardData>('/v1/creator/dashboard')
  })

  return { data, isLoading, error }
}

// In your component
export default function DashboardPage() {
  const { data, isLoading, error } = useCreatorDashboard()

  // LOADING STATE
  if (isLoading) {
    return <DashboardSkeleton />
  }

  // ERROR STATE
  if (error) {
    return <ErrorAlert message={error.message} />
  }

  // SUCCESS STATE
  return <DashboardContent data={data} />
}
```

### Creating Skeleton Loaders

**Pattern**: Copy this skeleton loader component and customize for each page:

```typescript
// components/ui/skeleton-loader.tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/3"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
        ))}
      </div>
      <div className="h-64 bg-slate-200 rounded-xl"></div>
    </div>
  )
}

export function SurveyListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 bg-slate-200 rounded-lg"></div>
      ))}
    </div>
  )
}
```

### Critical Pages to Update (Priority Order)

1. **Creator Dashboard** - `app/creator/dashboard/page.tsx`
   - Already has `dashboardLoading` state, ensure all sections use skeleton

2. **Filler Onboarding** - `app/filler/onboarding/page.tsx`
   - Add loading spinner while fetching eligibility data

3. **Admin Dashboard** - `app/admin/dashboard/page.tsx`
   - Add skeleton for stats cards and user list

4. **Super Admin Dashboard** - `app/super-admin/dashboard/page.tsx`
   - Add skeleton for all analytics

5. **Survey Create/Edit** - `app/creator/surveys/create/page.tsx`
   - Add loading state for template fetching

6. **Settings Pages** - `app/*/settings/page.tsx`
   - Add loading state while fetching current settings

---

## 2. HIGH: Fix React Query Error Handling Config

### Pattern: Global Error Handler

**Location**: `app/layout.tsx` or create `lib/react-query-config.ts`

```typescript
// lib/react-query-config.ts
import { DefaultError, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'

interface AppError {
  status: number
  message: string
  data?: any
}

// Global error handler for queries
export const createQueryOptions = <T,>(
  options: UseQueryOptions<T, AppError>
): UseQueryOptions<T, AppError> => ({
  ...options,
  retry: (failureCount, error) => {
    // Don't retry on 401/403/404
    if ([401, 403, 404].includes(error.status)) {
      return false
    }
    // Retry max 3 times for other errors
    return failureCount < 3
  },
  throwOnError: true,
})

// Global error handler for mutations
export const createMutationOptions = <TData, TError, TVariables>(
  options: UseMutationOptions<TData, AppError, TVariables>
): UseMutationOptions<TData, AppError, TVariables> => ({
  ...options,
  onError: (error) => {
    // Handle specific error codes
    switch (error.status) {
      case 401:
        toast.error('Your session has expired. Please log in again.')
        window.location.href = '/login'
        break
      case 403:
        toast.error('You do not have permission to perform this action.')
        break
      case 404:
        toast.error('The requested resource was not found.')
        break
      case 422:
        toast.error('Please check your input and try again.')
        break
      case 500:
        toast.error('Server error. Please try again later.')
        break
      default:
        toast.error(error.message || 'An error occurred')
    }

    // Call original error handler
    options.onError?.(error)
  },
})
```

### Usage in Hooks

```typescript
// hooks/use-surveys.ts
import { createQueryOptions } from '@/lib/react-query-config'

export function useSurveys() {
  return useQuery(
    createQueryOptions({
      queryKey: ['surveys'],
      queryFn: () => api.get('/v1/survey'),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  )
}

export function useCreateSurvey() {
  return useMutation(
    createMutationOptions({
      mutationFn: (data: SurveyData) => api.post('/v1/survey', data),
      onSuccess: () => {
        toast.success('Survey created successfully')
        queryClient.invalidateQueries({ queryKey: ['surveys'] })
      },
    })
  )
}
```

---

## 3. MEDIUM: Replace All `any` Types with Proper Types

### Pattern: Define Type Interfaces

**Location**: `types/` directory

```typescript
// types/user.ts
export interface User {
  id: string
  email: string
  name: string
  role: 'filler' | 'creator' | 'admin' | 'super_admin'
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Creator extends User {
  organizationType: 'business' | 'research' | 'education' | 'individual'
  organizationName?: string
  credits: number
  totalSurveys: number
}

export interface Admin extends User {
  department?: string
  permissions: string[]
}

// types/survey.ts
export interface Survey {
  id: string
  title: string
  description: string
  creatorId: string
  status: 'draft' | 'pending' | 'active' | 'completed' | 'archived'
  targetAudience: string
  rewardAmount: number
  totalResponses: number
  targetResponses: number
  questions: Question[]
  createdAt: string
  updatedAt: string
}

export interface Question {
  id: string
  type: 'multiple_choice' | 'rating' | 'open_ended' | 'matrix'
  title: string
  description?: string
  required: boolean
  options?: string[]
  minValue?: number
  maxValue?: number
}

export interface SurveyResponse {
  id: string
  surveyId: string
  respondentId: string
  answers: Record<string, any>
  progress: number
  startedAt: string
  completedAt?: string
  status: 'in_progress' | 'completed' | 'abandoned'
}
```

### Replacement Strategy

**Before**:
```typescript
export function useCreatorDashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['creator', 'dashboard'],
    queryFn: () => api.get('/v1/creator/dashboard')
  })

  return { data: dashboard as any, isLoading }
}
```

**After**:
```typescript
export interface DashboardData {
  totalSurveys: number
  activeSurveys: number
  totalResponses: number
  creditsBalance: number
  recentSurveys: Survey[]
}

export function useCreatorDashboard() {
  const { data: dashboard, isLoading } = useQuery<DashboardData>({
    queryKey: ['creator', 'dashboard'],
    queryFn: () => api.get<DashboardData>('/v1/creator/dashboard')
  })

  return { data: dashboard, isLoading }
}
```

### Files to Update (in order of priority)

1. `hooks/use-surveys.ts` - Replace `any` with `Survey`, `SurveyResponse`
2. `hooks/use-creator.ts` - Replace with `Creator`, `DashboardData`
3. `hooks/use-earnings.ts` - Define `Earning`, `Withdrawal` types
4. `hooks/use-referrals.ts` - Define `Referral`, `ReferralStats` types
5. `components/creator/survey-builder.tsx` - Use `Question`, `Survey` types
6. All API response types in hooks

---

## 4. MEDIUM: Add Error Boundaries at Route Level

### Pattern: Error Boundary Wrapper

**File**: `components/error/error-boundary.tsx` (already exists, enhance it)

```typescript
"use client"

import { Component, ReactNode, ErrorInfo } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  routeName?: string // For logging
}

interface State {
  hasError: boolean
  error?: Error
  errorId: string // For support tickets
}

function ErrorFallback({ error, errorId, onReset }: any) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-600 mb-4">
          {error?.message || "We encountered an unexpected error."}
        </p>
        <p className="text-xs text-slate-500 mb-6">
          Error ID: <code className="bg-slate-100 px-2 py-1">{errorId}</code>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onReset} className="bg-[#013F5C] hover:bg-[#0b577a]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      errorId: this.generateErrorId(),
    }
  }

  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error tracking service (Sentry, LogRocket, etc.)
    console.error('[ErrorBoundary]', {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      routeName: this.props.routeName,
      timestamp: new Date().toISOString(),
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}
```

### Usage in Layouts

**Pattern**: Wrap entire route with error boundary

```typescript
// app/creator/layout.tsx
import { ErrorBoundary } from '@/components/error/error-boundary'

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary routeName="creator">
      {children}
    </ErrorBoundary>
  )
}

// app/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary routeName="admin">
      {children}
    </ErrorBoundary>
  )
}

// app/super-admin/layout.tsx
export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary routeName="super-admin">
      {children}
    </ErrorBoundary>
  )
}
```

---

## 5. MEDIUM: Implement Structured Logging

### Pattern: Centralized Logger

**File**: `lib/logger.ts`

```typescript
/**
 * Structured Logging System
 * All logs follow a consistent JSON format for easy parsing and analysis
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  timestamp: string
  [key: string]: any
}

interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    message: string
    stack?: string
    code?: string
  }
}

class Logger {
  private isDevelopment = typeof window === 'undefined'
    ? process.env.NODE_ENV === 'development'
    : false

  private log(entry: LogEntry) {
    const formatted = JSON.stringify(entry)

    // In development, log to console with color
    if (this.isDevelopment) {
      const colors: Record<LogLevel, string> = {
        [LogLevel.DEBUG]: 'color: gray',
        [LogLevel.INFO]: 'color: blue',
        [LogLevel.WARN]: 'color: orange',
        [LogLevel.ERROR]: 'color: red',
      }
      console.log(`%c[${entry.level}]`, colors[entry.level], entry.message, entry.context)
    }

    // In production, send to logging service (Sentry, LogRocket, etc.)
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Example: send to monitoring service
      this.sendToMonitoringService(entry)
    }

    // Always log errors
    if (entry.level === LogLevel.ERROR) {
      console.error(formatted)
    }
  }

  debug(message: string, context?: LogContext) {
    this.log({
      level: LogLevel.DEBUG,
      message,
      context: { ...context, timestamp: new Date().toISOString() },
    })
  }

  info(message: string, context?: LogContext) {
    this.log({
      level: LogLevel.INFO,
      message,
      context: { ...context, timestamp: new Date().toISOString() },
    })
  }

  warn(message: string, context?: LogContext) {
    this.log({
      level: LogLevel.WARN,
      message,
      context: { ...context, timestamp: new Date().toISOString() },
    })
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log({
      level: LogLevel.ERROR,
      message,
      error: error ? {
        message: error.message,
        stack: error.stack,
      } : undefined,
      context: { ...context, timestamp: new Date().toISOString() },
    })
  }

  // Log API calls
  logApiCall(method: string, endpoint: string, status: number, duration: number) {
    this.info('API Call', {
      method,
      endpoint,
      status,
      duration: `${duration}ms`,
    })
  }

  // Log user actions
  logUserAction(action: string, details?: Record<string, any>) {
    this.info('User Action', {
      action,
      ...details,
    })
  }

  private sendToMonitoringService(entry: LogEntry) {
    // TODO: Integrate with Sentry, LogRocket, or similar service
    // Example:
    // fetch('/api/v1/logs', {
    //   method: 'POST',
    //   body: JSON.stringify(entry),
    //   credentials: 'include'
    // })
  }
}

export const logger = new Logger()
```

### Usage Throughout Codebase

```typescript
// hooks/use-surveys.ts
import { logger } from '@/lib/logger'

export function useSurveys() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const start = Date.now()
      try {
        const result = await api.get('/v1/survey')
        logger.logApiCall('GET', '/v1/survey', 200, Date.now() - start)
        return result
      } catch (err) {
        logger.error('Failed to fetch surveys', err as Error)
        throw err
      }
    }
  })

  return { data, isLoading, error }
}

// components/creator/survey-form.tsx
import { logger } from '@/lib/logger'

export function SurveyForm() {
  const createSurvey = useMutation({
    mutationFn: async (data: SurveyData) => {
      logger.logUserAction('survey_creation_started', { title: data.title })
      return api.post('/v1/survey', data)
    },
    onSuccess: (data) => {
      logger.logUserAction('survey_created', { surveyId: data.id })
    },
    onError: (error) => {
      logger.error('Survey creation failed', error as Error, {
        action: 'survey_creation',
      })
    }
  })

  return (...)
}
```

---

## 6. LOW: Improve Accessibility (aria-labels, focus management)

### Pattern: Accessible Components

```typescript
// Bad: No accessibility
<button onClick={onClose}>X</button>

// Good: With accessibility
<button
  onClick={onClose}
  aria-label="Close dialog"
  className="focus:outline-none focus:ring-2 focus:ring-[#013F5C]"
>
  X
</button>

// Better: Using semantic HTML
<button
  aria-label="Close dialog"
  type="button"
  className="group"
>
  <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
</button>
```

### Critical Elements to Add

1. **Buttons**: Add `aria-label` for icon-only buttons
2. **Links**: Add `aria-current="page"` for active nav items
3. **Forms**: Use `<label>` with `htmlFor`, add `aria-required`
4. **Modals**: Add `role="dialog"`, trap focus, close on Escape
5. **Loading States**: Add `aria-busy="true"`
6. **Error Messages**: Add `role="alert"`

**Files to Update**:
- `components/ui/button.tsx` - Add focus ring utilities
- `components/ui/input.tsx` - Add label and error accessibility
- `components/ui/sidebar.tsx` - Add navigation accessibility
- All nav components - Add `aria-current="page"`

---

## 7. LOW: Add TypeScript Strict Mode

### Pattern: Enable in tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

Then fix any type errors that appear.

---

## 8. LOW: Optimize Images with next/image

### Pattern: Replace img tags

**Before**:
```tsx
<img src="/Logo.png" alt="Logo" className="h-10" />
```

**After**:
```tsx
import Image from 'next/image'

<Image
  src="/Logo.png"
  alt="Logo"
  width={40}
  height={40}
  priority
  className="h-10 w-auto"
/>
```

**Files to Update**:
- `components/super-admin/super-admin-sidebar.tsx`
- `components/admin/admin-sidebar.tsx`
- `components/creator/creator-sidebar.tsx`
- `components/landing/hero.tsx`
- Any other image usage

---

## Implementation Order (Recommended)

### Phase 1 (High Impact, Quick Wins)
1. ✅ Implement httpOnly cookies (DONE)
2. ✅ Add loading states to critical pages (DONE)
3. ✅ Fix React Query error handling (DONE)

### Phase 2 (Code Quality)
4. Replace `any` types with proper interfaces
5. Add error boundaries to route layouts
6. Implement structured logging

### Phase 3 (Polish)
7. Improve accessibility
8. Add TypeScript strict mode
9. ✅ Optimize images (DONE)

---

## Testing Checklist

After implementing each pattern, verify:

- [x] No console errors or warnings
- [x] Loading states show correctly
- [x] Errors display proper messages
- [x] Types are correctly inferred
- [x] Error boundaries catch errors
- [x] Logs appear in console (dev) / monitoring service (prod)
- [x] Keyboard navigation works
- [x] Images load and display correctly

---

## Resources

- React Query Docs: https://tanstack.com/query/latest
- TypeScript: https://www.typescriptlang.org/docs/handbook/
- Accessibility (a11y): https://www.a11y-101.com/
- Next.js Image: https://nextjs.org/docs/api-reference/next/image

