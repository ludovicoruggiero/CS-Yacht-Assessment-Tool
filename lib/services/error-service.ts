import type { AppError } from "@/lib/types"

class ErrorService {
  private static instance: ErrorService
  private errorHandlers: Map<string, (error: AppError) => void> = new Map()

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService()
    }
    return ErrorService.instance
  }

  handleError(error: AppError, context?: string): void {
    console.error(`Error${context ? ` in ${context}` : ""}:`, error)

    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      // Send to error tracking service like Sentry
    }

    // Execute registered handlers
    if (context && this.errorHandlers.has(context)) {
      this.errorHandlers.get(context)?.(error)
    }
  }

  registerErrorHandler(context: string, handler: (error: AppError) => void): void {
    this.errorHandlers.set(context, handler)
  }

  createError(message: string, code?: string, details?: any): AppError {
    return { message, code, details }
  }
}

export const errorService = ErrorService.getInstance()
