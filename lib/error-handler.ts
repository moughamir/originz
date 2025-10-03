/**
 * Centralized Error Handling System
 * Enforces DRY principles across the entire application
 */

import { NextResponse } from "next/server";
import { toast } from "sonner";
import { ApiClientError, ValidationError, ShopifyApiError, HTTP_STATUS, logError } from "./errors";
import type { ApiError, ApiResponse } from "./errors";

// Error categories for consistent handling
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  VALIDATION = "validation",
  PERMISSION = "permission",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  SERVER = "server",
  EXTERNAL_API = "external_api",
  NETWORK = "network",
  UNKNOWN = "unknown",
}

// Error severity levels
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Standardized error messages
export const ERROR_MESSAGES = {
  // Authentication errors
  UNAUTHORIZED: "You need to sign in to access this resource",
  INVALID_CREDENTIALS: "Invalid email or password",
  SESSION_EXPIRED: "Your session has expired. Please sign in again",
  
  // Validation errors
  INVALID_INPUT: "Please check your input and try again",
  MISSING_REQUIRED_FIELD: "This field is required",
  INVALID_FORMAT: "Invalid format provided",
  
  // Permission errors
  FORBIDDEN: "You don't have permission to access this resource",
  INSUFFICIENT_PERMISSIONS: "You don't have sufficient permissions",
  
  // Not found errors
  RESOURCE_NOT_FOUND: "The requested resource was not found",
  USER_NOT_FOUND: "User not found",
  PRODUCT_NOT_FOUND: "Product not found",
  CART_NOT_FOUND: "Cart not found",
  
  // Conflict errors
  RESOURCE_EXISTS: "This resource already exists",
  DUPLICATE_ENTRY: "Duplicate entry detected",
  
  // Server errors
  INTERNAL_ERROR: "An internal server error occurred",
  DATABASE_ERROR: "Database operation failed",
  EXTERNAL_SERVICE_ERROR: "External service is temporarily unavailable",
  
  // Network errors
  NETWORK_ERROR: "Network connection failed",
  TIMEOUT_ERROR: "Request timed out",
  
  // Generic errors
  UNEXPECTED_ERROR: "An unexpected error occurred",
  OPERATION_FAILED: "Operation failed. Please try again",
} as const;

// Error handler configuration
export interface ErrorHandlerConfig {
  logError?: boolean;
  showToast?: boolean;
  includeStack?: boolean;
  sanitizeMessage?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  logError: true,
  showToast: true,
  includeStack: process.env.NODE_ENV === "development",
  sanitizeMessage: process.env.NODE_ENV === "production",
};

/**
 * Centralized error handler for API routes
 */
export class ApiErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Handle errors in API routes and return standardized NextResponse
   */
  handleApiError(
    error: unknown,
    context?: {
      endpoint?: string;
      method?: string;
      userId?: string;
      operation?: string;
    }
  ): NextResponse {
    const apiError = this.normalizeError(error, context);
    
    if (this.config.logError) {
      logError(apiError instanceof Error ? apiError : new Error(String(apiError)), {
        category: this.getErrorCategory(apiError),
        severity: this.getErrorSeverity(apiError),
        ...context,
      });
    }

    return this.createErrorResponse(apiError);
  }

  /**
   * Handle errors in client-side code
   */
  handleClientError(
    error: unknown,
    context?: {
      component?: string;
      action?: string;
      userId?: string;
    }
  ): void {
    const apiError = this.normalizeError(error, context);
    
    if (this.config.logError) {
      logError(apiError instanceof Error ? apiError : new Error(String(apiError)), {
        category: this.getErrorCategory(apiError),
        severity: this.getErrorSeverity(apiError),
        ...context,
      });
    }

    if (this.config.showToast) {
      this.showErrorToast(apiError);
    }
  }

  /**
   * Normalize different error types into ApiError format
   */
  private normalizeError(error: unknown, context?: Record<string, unknown>): ApiError {
    // Handle ApiClientError
    if (error instanceof ApiClientError) {
      return error.toJSON();
    }

    // Handle ValidationError
    if (error instanceof ValidationError) {
      return {
        message: error.message,
        status: HTTP_STATUS.BAD_REQUEST,
        code: "validation_error",
        endpoint: context?.endpoint as string,
        timestamp: new Date().toISOString(),
      };
    }

    // Handle ShopifyApiError
    if (error instanceof ShopifyApiError) {
      return {
        message: error.message,
        status: error.status || HTTP_STATUS.BAD_GATEWAY,
        code: "shopify_api_error",
        endpoint: context?.endpoint as string,
        timestamp: new Date().toISOString(),
      };
    }

    // Handle standard Error
    if (error instanceof Error) {
      return {
        message: this.sanitizeMessage(error.message),
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        code: "internal_error",
        endpoint: context?.endpoint as string,
        timestamp: new Date().toISOString(),
      };
    }

    // Handle unknown error types
    return {
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      code: "unknown_error",
      endpoint: context?.endpoint as string,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create standardized NextResponse for errors
   */
  private createErrorResponse(apiError: ApiError): NextResponse {
    const status = apiError.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const responseBody = {
      success: false,
      error: {
        message: this.sanitizeMessage(apiError.message),
        code: apiError.code,
        timestamp: apiError.timestamp,
      },
    };

    return NextResponse.json(responseBody, {
      status,
      headers: {
        "Content-Type": "application/json",
        "X-Error-Code": apiError.code || "unknown",
      },
    });
  }

  /**
   * Show appropriate toast notification for error
   */
  private showErrorToast(apiError: ApiError): void {
    const message = this.getUserFriendlyMessage(apiError);
    const severity = this.getErrorSeverity(apiError);

    const toastOptions = {
      duration: severity === ErrorSeverity.CRITICAL ? 8000 : 4000,
    };

    if (severity === ErrorSeverity.CRITICAL) {
      toast.error(message, toastOptions);
    } else if (severity === ErrorSeverity.HIGH) {
      toast.error(message, toastOptions);
    } else {
      toast.error(message, toastOptions);
    }
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(apiError: ApiError): string {
    const category = this.getErrorCategory(apiError);

    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case ErrorCategory.VALIDATION:
        return ERROR_MESSAGES.INVALID_INPUT;
      case ErrorCategory.PERMISSION:
        return ERROR_MESSAGES.FORBIDDEN;
      case ErrorCategory.NOT_FOUND:
        return ERROR_MESSAGES.RESOURCE_NOT_FOUND;
      case ErrorCategory.CONFLICT:
        return ERROR_MESSAGES.RESOURCE_EXISTS;
      case ErrorCategory.SERVER:
        return ERROR_MESSAGES.INTERNAL_ERROR;
      case ErrorCategory.EXTERNAL_API:
        return ERROR_MESSAGES.EXTERNAL_SERVICE_ERROR;
      case ErrorCategory.NETWORK:
        return ERROR_MESSAGES.NETWORK_ERROR;
      default:
        return ERROR_MESSAGES.UNEXPECTED_ERROR;
    }
  }

  /**
   * Determine error category based on error properties
   */
  private getErrorCategory(apiError: ApiError): ErrorCategory {
    const status = apiError.status;
    const code = apiError.code;

    if (status === HTTP_STATUS.UNAUTHORIZED || code === "unauthorized") {
      return ErrorCategory.AUTHENTICATION;
    }
    if (status === HTTP_STATUS.BAD_REQUEST || code === "validation_error") {
      return ErrorCategory.VALIDATION;
    }
    if (status === HTTP_STATUS.FORBIDDEN || code === "forbidden") {
      return ErrorCategory.PERMISSION;
    }
    if (status === HTTP_STATUS.NOT_FOUND || code === "not_found") {
      return ErrorCategory.NOT_FOUND;
    }
    if (status === HTTP_STATUS.CONFLICT || code === "conflict") {
      return ErrorCategory.CONFLICT;
    }
    if (status && status >= 500) {
      return ErrorCategory.SERVER;
    }
    if (code === "shopify_api_error" || code === "external_api_error") {
      return ErrorCategory.EXTERNAL_API;
    }
    if (code === "network_error" || code === "timeout_error") {
      return ErrorCategory.NETWORK;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity based on error properties
   */
  private getErrorSeverity(apiError: ApiError): ErrorSeverity {
    const status = apiError.status;
    const code = apiError.code;

    if (status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN) {
      return ErrorSeverity.HIGH;
    }
    if (status && status >= 500) {
      return ErrorSeverity.CRITICAL;
    }
    if (status === HTTP_STATUS.NOT_FOUND) {
      return ErrorSeverity.MEDIUM;
    }
    if (status === HTTP_STATUS.BAD_REQUEST) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  /**
   * Sanitize error messages for production
   */
  private sanitizeMessage(message: string): string {
    if (!this.config.sanitizeMessage) {
      return message;
    }

    // Remove sensitive information and stack traces
    return message
      .replace(/at\s+.*\s+\(.*\)/g, "") // Remove stack trace
      .replace(/password|token|key|secret/gi, "[REDACTED]") // Remove sensitive data
      .trim();
  }
}

// Global error handler instances
export const apiErrorHandler = new ApiErrorHandler({
  logError: true,
  showToast: false, // API routes don't show toasts
});

export const clientErrorHandler = new ApiErrorHandler({
  logError: true,
  showToast: true, // Client-side shows toasts
});

// Utility functions for common error scenarios
export const createApiError = (
  message: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  code?: string
): ApiClientError => {
  return new ApiClientError(message, status, code);
};

export const createValidationError = (errors: Array<{ field: string; message: string; code: string }>): ValidationError => {
  return new ValidationError(errors);
};

export const createShopifyError = (
  message: string,
  status?: number,
  details?: Record<string, unknown>
): ShopifyApiError => {
  return new ShopifyApiError(message, status, details);
};

// Success response helper
export const createSuccessResponse = <T>(data: T, status: number = HTTP_STATUS.OK): NextResponse => {
  return NextResponse.json({
    success: true,
    data,
  }, { status });
};

// Standardized API response helper
export const createApiResponse = <T>(
  data?: T,
  error?: ApiError,
  status?: number
): NextResponse => {
  const responseStatus = error?.status || status || HTTP_STATUS.OK;
  
  return NextResponse.json({
    success: !error,
    data,
    error: error ? {
      message: error.message,
      code: error.code,
      timestamp: error.timestamp,
    } : undefined,
  }, { status: responseStatus });
};
