import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import {
  PaginationQueryType,
  PaginationResponseType,
} from 'src/types/unifiedType';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const url = new URL(process.env.DATABASE_URL!);
    const adapter = new PrismaMariaDb({
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? 'MySQL@123456',
      database: process.env.DB_NAME ?? 'room_reservation_system',
      connectionLimit: 5,
    });
    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
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
