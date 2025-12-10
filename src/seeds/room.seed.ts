import { faker } from '@faker-js/faker';
import { Room, RoomStatus } from 'generated/prisma';

export const generateRoomSeed = (ownerId: bigint) => {
  const room: Omit<
    Room,
    'id' | 'createdAt' | 'updatedAt' | 'bookings' | 'price'
  > & { price: number } = {
    name: faker.commerce.productName(),
    capacity: faker.number.int({ min: 1, max: 5 }),
    price: faker.number.float({ min: 50, max: 500 }),
    status: RoomStatus.AVAILABLE,
    ownerId: ownerId,
  };
  return room;
};
