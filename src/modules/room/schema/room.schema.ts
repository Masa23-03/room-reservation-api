import { z, ZodType } from 'zod';
import {
  CreateRoomDto,
  UpdateRoomDto,
  UpdateRoomStatusDto,
} from '../dto/room.dto';
import { RoomStatus } from 'generated/prisma';
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
  })
  //make sure min is less than max
  .superRefine((val, ctx) => {
    if (
      val.minCapacity &&
      val.maxCapacity &&
      val.maxCapacity < val.minCapacity
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxCapacity'],
        message: 'max capacity should be >= min capacity',
      });
    }
    if (val.minPrice && val.maxPrice && val.maxPrice < val.minPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxPrice'],
        message: 'max price should be >= min price!',
      });
    }
  }) satisfies ZodType<RoomQuery>;
