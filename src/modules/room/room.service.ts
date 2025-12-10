import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateRoomDto,
  RoomOverviewResponseDto,
  RoomResponseDto,
  UpdateRoomDto,
  UpdateRoomStatusDto,
} from './dto/room.dto';
import { DatabaseService } from '../database/database.service';
import { RoomQuery } from './types/room.query';
import { ApiPaginationResponse } from 'src/types/unifiedType';
import { BookingStatus, Prisma, Role, Room, RoomStatus } from '@prisma/client';
import { removeFields } from 'src/utils/object.util';
import { UserResponseDTO } from '../user/dto/user.dto';

@Injectable()
export class RoomService {
  constructor(private readonly prismaService: DatabaseService) {}
  // - `create`
  //owner
  async create(
    createRoomDto: CreateRoomDto,
    ownerId: bigint,
  ): Promise<RoomResponseDto> {
    const room = await this.prismaService.room.create({
      data: {
        ...createRoomDto,
        ownerId,
      },
    });
    return this.mapRoom(room);
  }
  // - `update`
  //owner
  async update(
    id: bigint,
    updateRoomDto: UpdateRoomDto,
    userId: bigint,
  ): Promise<RoomResponseDto> {
    const room = await this.prismaService.room.findUnique({
      where: { id },
    });
    if (!room) throw new NotFoundException();
    if (room.ownerId !== userId) throw new ForbiddenException();

    const updatedRoom = await this.prismaService.room.update({
      where: { id: id },
      data: updateRoomDto,
    });
    return this.mapRoom(updatedRoom);
  }
  // - `update Status`
  //admin
  async updateStatus(
    id: bigint,
    payload: UpdateRoomStatusDto,
  ): Promise<RoomResponseDto> {
    const room = await this.prismaService.room.update({
      where: { id },
      data: { status: payload.status },
    });
    return this.mapRoom(room);
  }

  // - `FindAll`
  //all
  async findAll(
    query: RoomQuery,
    user: UserResponseDTO,
  ): Promise<ApiPaginationResponse<RoomOverviewResponseDto>> {
    return this.prismaService.$transaction(async (prisma) => {
      const pagination = this.prismaService.handleQueryPagination(query);

      const whereStatement = this.whereForFindAll(query, user);
      const rooms = await prisma.room.findMany({
        ...removeFields(pagination, ['page']),
        where: whereStatement,
        select: {
          name: true,
          id: true,
          price: true,
          status: true,
        },
      });

      const count = await prisma.room.count({
        where: whereStatement,
      });

      return {
        success: true,
        data: rooms.map((room) => ({
          id: String(room.id),
          name: room.name,
          price: Number(room.price),
          status: room.status,
        })),
        meta: this.prismaService.formatPaginationResponse({
          page: pagination.page,
          count: count,
          limit: pagination.take,
        }),
      };
    });
  }

  // - `FindOne`
  //for all
  async findOne(id: bigint): Promise<RoomResponseDto> {
    const foundedRoom = await this.prismaService.room.findUnique({
      where: { id },
    });
    if (!foundedRoom) throw new NotFoundException();
    return this.mapRoom(foundedRoom);
  }

  //mapping
  private mapRoom(room: Room): RoomResponseDto {
    const pRoom = {
      ...room,
      id: room.id.toString(),
      ownerId: room.ownerId.toString(),
      price: room.price.toNumber(),
    };
    return {
      ...removeFields(pRoom, ['id', 'ownerId', 'price']),
      id: pRoom.id,

      ownerId: pRoom.ownerId,
      price: pRoom.price,
    };
  }

  //build where statement based on the role and the filtering
  private whereForFindAll(
    query: RoomQuery,
    user: UserResponseDTO,
  ): Prisma.RoomWhereInput {
    const whereClause: Prisma.RoomWhereInput = {};
    //where: roles
    if (user.role === 'OWNER') whereClause.ownerId = BigInt(user.id);
    else if (user.role === 'GUEST') whereClause.status = 'AVAILABLE';
    //where: filters
    if (query.minCapacity !== undefined || query.maxCapacity !== undefined) {
      whereClause.capacity = {};

      if (query.minCapacity !== undefined)
        whereClause.capacity.gte = query.minCapacity;

      if (query.maxCapacity !== undefined)
        whereClause.capacity.lte = query.maxCapacity;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      whereClause.price = {};

      if (query.minPrice !== undefined) whereClause.price.gte = query.minPrice;

      if (query.maxPrice !== undefined) whereClause.price.lte = query.maxPrice;
    }
    if (query.startDate && query.endDate) {
      whereClause.bookings = {
        none: {
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
          checkIn: { lt: query.endDate },
          checkOut: { gt: query.startDate },
        },
      };
    }

    return whereClause;
  }
}
