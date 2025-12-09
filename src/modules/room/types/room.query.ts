// - RoomQuery (Filtering + Pagination):

import { PaginationQueryType } from 'src/types/unifiedType';

export type RoomQuery = PaginationQueryType & {
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  startDate?: Date;
  endDate?: Date;
};
