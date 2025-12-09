import z, { ZodType } from 'zod';
import { CreateBookingDto, UpdateBookingStatusDto } from '../dto/booking.dto';
import { BookingStatus } from 'generated/prisma';

//     - `create`
export const bookingValidationSchema = z
  .object({
    roomId: z.string().min(1),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
  })
  .superRefine((val, ctx) => {
    if (val.checkOut <= val.checkIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['checkOut'],
        message: 'check out must be after check in!',
      });
    }
  }) satisfies ZodType<CreateBookingDto>;

//     - `updateStatus`
//     - `cancel`
export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
}) satisfies ZodType<UpdateBookingStatusDto>;
