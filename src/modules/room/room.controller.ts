import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Query,
} from '@nestjs/common';
import { RoomService } from './room.service';
import type {
  CreateRoomDto,
  UpdateRoomDto,
  UpdateRoomStatusDto,
} from './dto/room.dto';
import { Roles } from 'src/decorators/role.decorator';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  roomQueryValidationSchema,
  roomVallationSchema,
  updateRoomValidationSchema,
  updateStatusValidationSchema,
} from './schema/room.schema';
import { AuthedUser } from 'src/decorators/user.decorator';
import type { Request } from 'express';
import type { UserResponseDTO } from '../user/dto/user.dto';
import { Role } from '@prisma/client';
import type { RoomQuery } from './types/room.query';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @Roles(Role.OWNER)
  create(
    @AuthedUser() user: UserResponseDTO,
    @Body(new ZodValidationPipe(roomVallationSchema))
    createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.create(createRoomDto, BigInt(user.id));
  }

  @Get()
  findAll(
    @AuthedUser() user: UserResponseDTO,
    @Query(new ZodValidationPipe(roomQueryValidationSchema)) query: RoomQuery,
  ) {
    return this.roomService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(BigInt(id));
  }

  @Patch(':id')
  @Roles(Role.OWNER)
  update(
    @AuthedUser() user: UserResponseDTO,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateRoomValidationSchema))
    updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.update(BigInt(id), updateRoomDto, BigInt(user.id));
  }

  // - `updateStatus`
  // admin
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStatusValidationSchema))
    payLoad: UpdateRoomStatusDto,
  ) {
    return this.roomService.updateStatus(BigInt(id), payLoad);
  }
}
