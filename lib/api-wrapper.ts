/**
 * API Route Wrapper for Standardized Error Handling
 * Enforces DRY principles across all API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { apiErrorHandler, createSuccessResponse, HTTP_STATUS } from "./error-handler";
import { createClient } from "@/utils/supabase/server";

// Authentication context
export interface AuthContext {
  user: { id: string; email?: string };
  supabase: any;
}

// API route handler function type
export type ApiHandler<T = any> = (
  request: NextRequest,
  context: AuthContext
) => Promise<T>;

// API route handler with authentication
export type AuthenticatedApiHandler<T = any> = (
  request: NextRequest,
  context: AuthContext
) => Promise<T>;

// API route handler without authentication
export type PublicApiHandler<T = any> = (
  request: NextRequest
) => Promise<T>;

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth<T>(
  handler: AuthenticatedApiHandler<T>,
  options?: {
    requireAuth?: boolean;
    allowedMethods?: string[];
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Check HTTP method
      const method = request.method;
      const allowedMethods = options?.allowedMethods || ["GET", "POST", "PUT", "DELETE"];
      
      if (!allowedMethods.includes(method)) {
        return apiErrorHandler.handleApiError(
          new Error(`Method ${method} not allowed`),
          {
            endpoint: request.url,
            method,
            operation: "method_validation",
          }
        );
      }

      // Get Supabase client
      const supabase = await createClient();

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return apiErrorHandler.handleApiError(
          authError || new Error("User not authenticated"),
          {
            endpoint: request.url,
            method,
            operation: "authentication",
          }
        );
      }

      // Create authenticated context
      const context: AuthContext = {
        user: {
          id: user.id,
          email: user.email,
        },
        supabase,
      };

      // Execute handler
      const result = await handler(request, context);

      // Return success response
      return createSuccessResponse(result);

    } catch (error) {
      return apiErrorHandler.handleApiError(error, {
        endpoint: request.url,
        method: request.method,
        operation: "api_handler",
      });
    }
  };
}

/**
 * Wrapper for public API routes (no authentication required)
 */
export function withPublic<T>(
  handler: PublicApiHandler<T>,
  options?: {
    allowedMethods?: string[];
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Check HTTP method
      const method = request.method;
      const allowedMethods = options?.allowedMethods || ["GET", "POST", "PUT", "DELETE"];
      
      if (!allowedMethods.includes(method)) {
        return apiErrorHandler.handleApiError(
          new Error(`Method ${method} not allowed`),
          {
            endpoint: request.url,
            method,
            operation: "method_validation",
          }
        );
      }

      // Execute handler
      const result = await handler(request);

      // Return success response
      return createSuccessResponse(result);

    } catch (error) {
      return apiErrorHandler.handleApiError(error, {
        endpoint: request.url,
        method: request.method,
        operation: "public_api_handler",
      });
    }
  };
}

/**
 * Utility function to validate request body
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  validator?: (data: any) => T
): Promise<T> {
  try {
    const body = await request.json();
    
    if (validator) {
      return validator(body);
    }
    
    return body as T;
  } catch (error) {
    throw new Error("Invalid request body");
  }
}

/**
 * Utility function to get query parameters
 */
export function getQueryParams(request: NextRequest): URLSearchParams {
  return new URL(request.url).searchParams;
}

/**
 * Utility function to validate required fields
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
}
