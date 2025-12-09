import { Booking } from 'generated/prisma';
// - CreateBookingDto:
//     - `checkIn`
//     - `checkOut`
//     - `room`
export type CreateBookingDto = Pick<Booking, 'checkIn' | 'checkOut'> & {
  roomId: string;
};

// - UpdateBookingStatusDto:
//     - admin (to confirm)
//     - guest (to cancel)
export type UpdateBookingStatusDto = Pick<Booking, 'status'>;

// - BookingResponseDto:
//     - `id`
//     - `checkIn`
//     - `checkOut`
//     - `status`
//     - `createdAt`
//     - `roomId`
//     - `guestId`
export type BookingResponseDto = Omit<
  Booking,
  'updatedAt' | 'id' | 'roomId' | 'guestId'
> & { id: string; guestId: string; roomId: string };

// - BookingOverviewResponseDto (for admin):
//     - `id`
//     - `roomId`
//     - `checkIn`
//     - `checkOut`
//     - `status`
export type BookingOverviewResponseDto = Pick<
  BookingResponseDto,
  'id' | 'roomId' | 'checkIn' | 'checkOut' | 'status'
>;
