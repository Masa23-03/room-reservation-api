import { faker } from '@faker-js/faker';
import { Booking, BookingStatus } from '@prisma/client';

export const generateBookingSeed = (roomId: bigint, guestId: bigint) => {
  const checkIn = faker.date.soon({ days: 50 });
  const stayPeriod = faker.number.int({ min: 1, max: 10 });
  const checkOut = new Date(
    checkIn.getTime() + stayPeriod * 24 * 60 * 60 * 1000,
  );
  const booking: Omit<
    Booking,
    'id' | 'updatedAt' | 'createdAt' | 'room' | 'guest'
  > = {
    roomId: roomId,
    guestId: guestId,
    status: BookingStatus.PENDING,
    checkIn: checkIn,
    checkOut: checkOut,
  };
  return booking;
};
