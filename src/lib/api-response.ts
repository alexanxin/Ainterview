// lib/api-response.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponseBuilder {
  static success<T>(data: T, meta?: ResponseMeta): ApiResponse<T> {
    return { success: true, data, meta };
  }

  static error(message: string, code: string = 'UNKNOWN_ERROR', details?: any): ApiResponse {
    return { 
      success: false, 
      error: { code, message, details } 
    };
  }
}