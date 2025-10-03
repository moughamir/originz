# Standardized Error Handling Guide

This guide explains the comprehensive error handling system implemented across the Originz e-commerce platform, designed to enforce DRY (Don't Repeat Yourself) principles and provide consistent error management.

## 🎯 Overview

The error handling system provides:
- **Centralized error processing** across API routes and React components
- **Standardized error messages** and user-friendly notifications
- **Automatic error logging** with context and categorization
- **Consistent error responses** for API endpoints
- **Graceful error recovery** with fallback mechanisms

## 📁 File Structure

```
lib/
├── error-handler.ts      # Core error handling system
├── api-wrapper.ts         # API route wrappers
└── errors.ts             # Error types and utilities

hooks/
└── use-error-handler.ts  # React hooks for error handling

components/common/
└── error-boundary.tsx   # Error boundary components
```

## 🚀 Quick Start

### API Routes

**Before (Manual Error Handling):**
```typescript
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // ... business logic
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Failed to process request" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
```

**After (Standardized Error Handling):**
```typescript
import { withAuth, validateRequestBody, validateRequiredFields } from "@/lib/api-wrapper";

async function addCartItem(request: NextRequest, { user, supabase }: any) {
  const body = await validateRequestBody<CartItemInput>(request);
  validateRequiredFields(body, ["product_id", "quantity"]);
  
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }
  
  // ... business logic
  return result;
}

export const POST = withAuth(addCartItem);
```

### React Components

**Before (Manual Error Handling):**
```typescript
const handleSubmit = async () => {
  try {
    const response = await fetch("/api/cart/items", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error("Failed to add item");
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to add item. Please try again.");
  }
};
```

**After (Standardized Error Handling):**
```typescript
import { useErrorHandler } from "@/hooks/use-error-handler";

const { handleAsyncError } = useErrorHandler({ component: "CartForm" });

const handleSubmit = async () => {
  const result = await handleAsyncError(async () => {
    const response = await fetch("/api/cart/items", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error("Failed to add item");
    }
    
    return response.json();
  });
  
  if (result) {
    // Success - handle result
  }
  // Error was automatically handled with toast notification
};
```

## 🔧 Core Components

### 1. Error Handler (`lib/error-handler.ts`)

The central error handling system that processes all errors consistently.

**Key Features:**
- **Error Categorization**: Automatically categorizes errors (authentication, validation, server, etc.)
- **Severity Levels**: Assigns severity levels (low, medium, high, critical)
- **Message Sanitization**: Removes sensitive information in production
- **Toast Notifications**: Shows user-friendly error messages
- **Logging**: Comprehensive error logging with context

### 2. API Wrapper (`lib/api-wrapper.ts`)

Higher-order functions that wrap API route handlers with standardized error handling.

**Available Wrappers:**
- `withAuth()`: Requires authentication
- `withPublic()`: No authentication required
- `withOptionalAuth()`: Optional authentication

### 3. React Hook (`hooks/use-error-handler.ts`)

Custom React hooks for standardized error handling in components.

**Available Hooks:**
- `useErrorHandler()`: General error handling
- `useComponentErrorHandler()`: Component-specific error handling
- `useFormErrorHandler()`: Form error handling
- `useApiErrorHandler()`: API call error handling

### 4. Error Boundary (`components/common/error-boundary.tsx`)

React error boundary component for catching and handling component errors.

## 📋 Error Categories

The system automatically categorizes errors into the following types:

| Category | Description | Examples |
|----------|-------------|----------|
| `AUTHENTICATION` | Authentication failures | Invalid credentials, expired sessions |
| `VALIDATION` | Input validation errors | Missing required fields, invalid formats |
| `PERMISSION` | Authorization failures | Insufficient permissions, forbidden access |
| `NOT_FOUND` | Resource not found | Missing products, users, carts |
| `CONFLICT` | Resource conflicts | Duplicate entries, conflicting states |
| `SERVER` | Server-side errors | Database errors, internal failures |
| `EXTERNAL_API` | External service errors | Shopify API failures, third-party issues |
| `NETWORK` | Network-related errors | Connection timeouts, network failures |
| `UNKNOWN` | Unclassified errors | Unexpected error types |

## 🎨 Error Severity Levels

Errors are assigned severity levels for appropriate handling:

| Severity | Description | Toast Duration | Examples |
|----------|-------------|----------------|----------|
| `LOW` | Minor issues | 4 seconds | Validation errors, minor warnings |
| `MEDIUM` | Moderate issues | 4 seconds | Not found errors, conflicts |
| `HIGH` | Significant issues | 4 seconds | Authentication failures, permission errors |
| `CRITICAL` | Critical failures | 8 seconds | Server errors, external API failures |

## 🔍 Error Messages

Standardized error messages are defined in `ERROR_MESSAGES` constant:

```typescript
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You need to sign in to access this resource",
  INVALID_INPUT: "Please check your input and try again",
  FORBIDDEN: "You don't have permission to access this resource",
  RESOURCE_NOT_FOUND: "The requested resource was not found",
  INTERNAL_ERROR: "An internal server error occurred",
  // ... more messages
};
```

## 🚀 Migration Guide

### Step 1: Update API Routes

Replace manual error handling with wrapper functions:

```typescript
// Before
export async function POST(request: NextRequest) {
  try {
    // ... authentication logic
    // ... business logic
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// After
async function handler(request: NextRequest, { user, supabase }: AuthContext) {
  // ... business logic only
  return result;
}

export const POST = withAuth(handler);
```

### Step 2: Update React Components

Replace manual error handling with hooks:

```typescript
// Before
const handleSubmit = async () => {
  try {
    await submitData();
  } catch (error) {
    toast.error("Error occurred");
  }
};

// After
const { handleAsyncError } = useErrorHandler({ component: "MyComponent" });

const handleSubmit = async () => {
  await handleAsyncError(async () => {
    await submitData();
  });
};
```

### Step 3: Add Error Boundaries

Wrap critical components with error boundaries:

```typescript
import ErrorBoundary from "@/components/common/error-boundary";

<ErrorBoundary component="ProductPage">
  <ProductComponent />
</ErrorBoundary>
```

## 📈 Benefits

### DRY Principle Enforcement
- **Eliminates code duplication** across error handling
- **Centralizes error logic** in reusable utilities
- **Standardizes error responses** across the application

### Improved Developer Experience
- **Consistent error handling patterns** across the codebase
- **Automatic error logging** with context
- **Type-safe error handling** with TypeScript

### Better User Experience
- **User-friendly error messages** instead of technical errors
- **Consistent error notifications** across the application
- **Graceful error recovery** with fallback mechanisms

### Enhanced Debugging
- **Comprehensive error logging** with context and categorization
- **Error tracking** across different parts of the application
- **Development-friendly error details** in non-production environments

## 🎯 Best Practices

1. **Use appropriate wrappers** for API routes (`withAuth`, `withPublic`)
2. **Leverage error hooks** in React components for consistent handling
3. **Wrap critical components** with error boundaries
4. **Provide meaningful error messages** for better user experience
5. **Log errors with context** for easier debugging
6. **Handle errors gracefully** with fallback mechanisms
7. **Test error scenarios** to ensure proper error handling

This comprehensive error handling system ensures consistent, maintainable, and user-friendly error management across the entire Originz e-commerce platform while enforcing DRY principles and providing excellent developer and user experiences.
