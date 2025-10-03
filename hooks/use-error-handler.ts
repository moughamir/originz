/**
 * React Hook for Standardized Client-Side Error Handling
 * Enforces DRY principles across React components
 */

import { useCallback } from "react";
import { clientErrorHandler } from "@/lib/error-handler";

export interface ErrorHandlerOptions {
  component?: string;
  action?: string;
  userId?: string;
  showToast?: boolean;
  logError?: boolean;
}

/**
 * Hook for standardized error handling in React components
 */
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const handleError = useCallback(
    (error: unknown, context?: Partial<ErrorHandlerOptions>) => {
      const finalOptions = { ...options, ...context };
      
      clientErrorHandler.handleClientError(error, {
        component: finalOptions.component,
        action: finalOptions.action,
        userId: finalOptions.userId,
      });
    },
    [options]
  );

  const handleAsyncError = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      context?: Partial<ErrorHandlerOptions>
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error, context);
        return null;
      }
    },
    [handleError]
  );

  const handleFormError = useCallback(
    (error: unknown, formName?: string) => {
      handleError(error, {
        component: formName || "Form",
        action: "form_submission",
      });
    },
    [handleError]
  );

  const handleApiError = useCallback(
    (error: unknown, endpoint?: string) => {
      handleError(error, {
        component: "API",
        action: endpoint ? `api_call_${endpoint}` : "api_call",
      });
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
    handleFormError,
    handleApiError,
  };
}

/**
 * Hook for handling errors in specific components
 */
export function useComponentErrorHandler(componentName: string) {
  return useErrorHandler({ component: componentName });
}

/**
 * Hook for handling form errors
 */
export function useFormErrorHandler(formName?: string) {
  return useErrorHandler({ 
    component: formName || "Form",
    action: "form_submission",
  });
}

/**
 * Hook for handling API errors
 */
export function useApiErrorHandler() {
  return useErrorHandler({ 
    component: "API",
    action: "api_call",
  });
}
