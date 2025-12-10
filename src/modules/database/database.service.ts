import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  PaginationQueryType,
  PaginationResponseType,
} from 'src/types/unifiedType';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({ log: ['query', 'info', 'warn', 'error'] });
  }
  async onModuleInit() {
    await this.$connect();
  }
  // : Handle query pagination
  handleQueryPagination(query: PaginationQueryType) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    return { skip: (page - 1) * limit, take: limit, page };
  }
  // : Format pagination response
  formatPaginationResponse(args: {
    count: number;
    limit: number;

    page: number;
  }): PaginationResponseType {
    return {
      total: args.count,
      totalPages: Math.ceil(args.count / args.limit),
      limit: args.limit,
      page: args.page,
    };
  }
}
