export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  errors?: string[] | Record<string, string[]>;
}

export type ApiResult<T = unknown> = ApiResponse<T> | ApiErrorResponse;

export const res = {
  ok<T>(data: T, message = 'Success'): ApiResponse<T> {
    return { success: true, message, data };
  },

  created<T>(data: T, message = 'Created'): ApiResponse<T> {
    return { success: true, message, data };
  },

  fail(
    message: string,
    errors?: ApiErrorResponse['errors'],
  ): ApiErrorResponse {
    return {
      success: false,
      message,
      data: null,
      ...(errors ? { errors } : {}),
    };
  },
};
