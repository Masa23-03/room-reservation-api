import { HttpStatus } from '@nestjs/common';

export type PaginationQueryType = {
  page?: number;
  limit?: number;
};

export type PaginationResponseType = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiPaginationResponse<T> = {
  success: true;
  data: T[];
  meta: PaginationResponseType;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};
export type ApiErrorResponse = {
  success: false;
  message: string;
  statusCode: HttpStatus;
  timestamp: string;
  path: string;
  field?: { field: string; message: string }[];
};

export type UnifiedApiResponse<T> =
  | ApiSuccessResponse<T>
  | ApiPaginationResponse<T>
  | ApiErrorResponse;
