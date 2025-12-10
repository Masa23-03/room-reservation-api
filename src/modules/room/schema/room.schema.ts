import { z, ZodType } from 'zod';
import {
  CreateRoomDto,
  UpdateRoomDto,
  UpdateRoomStatusDto,
} from '../dto/room.dto';
import { RoomStatus } from '@prisma/client';
import { paginationSchema } from 'src/utils/pagination-schema.util';
import { RoomQuery } from '../types/room.query';

// - `create`
export const roomVallationSchema = z.object({
  name: z.string().min(1),
  capacity: z.coerce.number().int().min(1),
  price: z.coerce.number().min(0),
}) satisfies ZodType<CreateRoomDto>;
// - `update`
export const updateRoomValidationSchema = z.object({
  name: z.string().optional(),
  capacity: z.coerce.number().int().min(1).optional(),
  price: z.coerce.number().min(0).optional(),
  status: z.nativeEnum(RoomStatus).optional(),
}) satisfies ZodType<UpdateRoomDto>;
// - `updateStatus`
export const updateStatusValidationSchema = z.object({
  status: z.nativeEnum(RoomStatus),
}) satisfies ZodType<UpdateRoomStatusDto>;

export const roomQueryValidationSchema = paginationSchema
  .extend({
    minCapacity: z.coerce.number().int().min(1).optional(),
    maxCapacity: z.coerce.number().int().min(1).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  //make sure min is less than max
  .superRefine((val, ctx) => {
    if (
      val.minCapacity !== undefined &&
      val.maxCapacity !== undefined &&
      val.maxCapacity < val.minCapacity
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['capacity'],
        message: 'max capacity should be >= min capacity',
      });
    }
    if (
      val.minPrice !== undefined &&
      val.maxPrice !== undefined &&
      val.maxPrice < val.minPrice
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'max price should be >= min price!',
      });
    }
    if (val.endDate && !val.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['checkIn'],
        message: 'start date is required with end date',
      });
    }
    if (val.startDate && !val.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['checkOut'],
        message: 'end date is required with start date',
      });
    }
    if (val.startDate && val.endDate && val.endDate <= val.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['checkOut'],
        message: 'end date should be after start date',
      });
    }
  }) satisfies ZodType<RoomQuery>;
