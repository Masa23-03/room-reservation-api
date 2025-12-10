import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  BookingOverviewResponseDto,
  BookingResponseDto,
  CreateBookingDto,
  UpdateBookingStatusDto,
} from './dto/booking.dto';
import { DatabaseService } from '../database/database.service';
import { Booking, BookingStatus, Prisma, Role } from '@prisma/client';
import { removeFields } from 'src/utils/object.util';
import { UserResponseDTO } from '../user/dto/user.dto';
import {
  ApiPaginationResponse,
  PaginationQueryType,
} from 'src/types/unifiedType';

@Injectable()
export class BookingService {
  constructor(private readonly prismaService: DatabaseService) {}

  //create , guest
  async create(
    createBookingDto: CreateBookingDto,
    guestId: bigint,
  ): Promise<BookingResponseDto> {
    const roomIdi = BigInt(createBookingDto.roomId);
    //check if there is overlap
    const overlap = await this.hasOverlap(
      roomIdi,
      createBookingDto.checkIn,
      createBookingDto.checkOut,
    );
    if (overlap)
      throw new BadRequestException('Room is already booked in this period');
    const newBooking = await this.prismaService.booking.create({
      data: {
        roomId: roomIdi,
        checkIn: createBookingDto.checkIn,
        checkOut: createBookingDto.checkOut,
        guestId,
      },
    });
    return this.mapBooking(newBooking);
  }

  async findAll(
    query: PaginationQueryType,
    user: UserResponseDTO,
  ): Promise<ApiPaginationResponse<BookingOverviewResponseDto>> {
    return this.prismaService.$transaction(async (prisma) => {
      const pagination = this.prismaService.handleQueryPagination(query);
      const whereStatement = this.buildWhere(user);
      const bookings = await prisma.booking.findMany({
        ...removeFields(pagination, ['page']),
        where: whereStatement,
        select: {
          id: true,
          status: true,
          checkIn: true,
          checkOut: true,
          roomId: true,
        },
      });
      const count = await prisma.booking.count({
        where: whereStatement,
      });
      return {
        success: true,
        data: bookings.map((booking) => ({
          id: String(booking.id),
          status: booking.status,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          roomId: String(booking.roomId),
        })),
        meta: this.prismaService.formatPaginationResponse({
          count: count,
          page: pagination.page,
          limit: pagination.take,
        }),
      };
    });
  }
  //Find one , all
  async findOne(
    id: bigint,
    user: UserResponseDTO,
  ): Promise<BookingResponseDto> {
    const userId = BigInt(user.id);
    const foundedBooking = await this.prismaService.booking.findUnique({
      where: { id },
      include: {
        room: {
          select: {
            ownerId: true,
          },
        },
      },
    });
    if (!foundedBooking) throw new NotFoundException();
    if (user.role === Role.GUEST && foundedBooking.guestId !== userId)
      throw new ForbiddenException(' user can only access their own bookings');
    if (user.role === Role.OWNER && foundedBooking.room.ownerId !== userId)
      throw new ForbiddenException(
        ' owner can only access their rooms bookings',
      );
    const { room, ...booking } = foundedBooking;
    return this.mapBooking(booking as Booking);
  }
  //Update status , admin
  async updateStatus(
    id: bigint,
    updateBookingDto: UpdateBookingStatusDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
    });
    if (!booking) throw new NotFoundException();
    if (
      booking.status === 'CANCELLED' &&
      (updateBookingDto.status === 'CONFIRMED' ||
        updateBookingDto.status === 'PENDING')
    )
      throw new BadRequestException();
    if (booking.status === 'CONFIRMED' && updateBookingDto.status === 'PENDING')
      throw new BadRequestException();

    const updatedBooking = await this.prismaService.booking.update({
      where: { id },
      data: { status: updateBookingDto.status },
    });

    return this.mapBooking(updatedBooking);
  }

  //Cancel , guest
  async cancel(id: bigint, user: UserResponseDTO): Promise<boolean> {
    //guest can cancel their own booking
    const booking = await this.prismaService.booking.findUnique({
      where: { id },
    });
    if (!booking) throw new NotFoundException();
    if (BigInt(user.id) !== booking.guestId) throw new ForbiddenException();
    await this.prismaService.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });
    return true;
  }
  //Map Booking , private
  private mapBooking(booking: Booking): BookingResponseDto {
    return {
      ...removeFields(booking, ['id', 'guestId', 'roomId', 'updatedAt']),
      id: String(booking.id),
      guestId: String(booking.guestId),
      roomId: String(booking.roomId),
    };
  }

  //hasOverlap method
  async hasOverlap(roomId: bigint, newCheckIn: Date, newCheckOut: Date) {
    const overLappedBooking = await this.prismaService.booking.findFirst({
      where: {
        roomId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        checkIn: { lt: newCheckOut },
        checkOut: { gt: newCheckIn },
      },
    });
    return !!overLappedBooking;
  }

  //build where statement based on user role;
  private buildWhere(user: UserResponseDTO): Prisma.BookingWhereInput {
    const whereClause: Prisma.BookingWhereInput = {};
    const userId = BigInt(user.id);

    if (user.role === Role.OWNER) {
      whereClause.room = { ownerId: userId };
    }
    if (user.role === Role.GUEST) {
      whereClause.guestId = userId;
    }
    return whereClause;
  }
}
