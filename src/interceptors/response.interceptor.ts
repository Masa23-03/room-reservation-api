import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import {
  ApiPaginationResponse,
  ApiSuccessResponse,
  objectType,
  UnifiedApiResponse,
} from 'src/types/unifiedType';

@Injectable()
export class ResponseInterceptor<
  T extends objectType,
> implements NestInterceptor<T, UnifiedApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ):
    | Observable<UnifiedApiResponse<T>>
    | Promise<Observable<UnifiedApiResponse<T>>> {
    return next.handle().pipe(
      map((data: ApiPaginationResponse<T> | T) => {
        if (isPaginationResponse<T>(data as objectType)) {
          return data as ApiPaginationResponse<T>;
        }

        return {
          success: true,
          data: data as T,
        };
      }),
    );
  }
}

const isPaginationResponse = <T>(
  data: objectType,
): data is ApiPaginationResponse<T> => {
  return data && typeof data === 'object' && 'data' in data && 'meta' in data;
};
