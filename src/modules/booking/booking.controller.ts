import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';

import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  bookingValidationSchema,
  updateBookingStatusSchema,
} from './schema/booking.schema';
import { AuthedUser } from 'src/decorators/user.decorator';
import type { UserResponseDTO } from '../user/dto/user.dto';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'generated/prisma';
import type {
  CreateBookingDto,
  UpdateBookingStatusDto,
} from './dto/booking.dto';
import { paginationSchema } from 'src/utils/pagination-schema.util';
import type { PaginationQueryType } from 'src/types/unifiedType';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles(Role.GUEST)
  create(
    @AuthedUser() user: UserResponseDTO,
    @Body(new ZodValidationPipe(bookingValidationSchema))
    createBookingDto: CreateBookingDto,
  ) {
    return this.bookingService.create(createBookingDto, BigInt(user.id));
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  findAllBookings(
    @AuthedUser() user: UserResponseDTO,
    @Query(new ZodValidationPipe(paginationSchema)) query: PaginationQueryType,
  ) {
    return this.bookingService.findAll(query, user);
  }
  //     - `findAllBookingsForMyRooms` ..for owner
  //     - `findMyBookings` ..for guest
  @Get('owner')
  @Roles(Role.OWNER)
  findAllBookingsForMyRooms(
    @AuthedUser() user: UserResponseDTO,
    @Query(new ZodValidationPipe(paginationSchema)) query: PaginationQueryType,
  ) {
    return this.bookingService.findAll(query, user);
  }

  @Get('me')
  @Roles(Role.GUEST)
  findMyBookings(
    @AuthedUser() user: UserResponseDTO,
    @Query(new ZodValidationPipe(paginationSchema)) query: PaginationQueryType,
  ) {
    return this.bookingService.findAll(query, user);
  }
  @Get(':id')
  findOne(@AuthedUser() user: UserResponseDTO, @Param('id') id: string) {
    return this.bookingService.findOne(BigInt(id), user);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateBookingStatusSchema))
    updateBookingDto: UpdateBookingStatusDto,
  ) {
    return this.bookingService.updateStatus(BigInt(id), updateBookingDto);
  }

  @Post(':id/cancel')
  @Roles(Role.GUEST)
  cancel(@AuthedUser() user: UserResponseDTO, @Param('id') id: string) {
    return this.bookingService.cancel(BigInt(id), user);
  }
}
