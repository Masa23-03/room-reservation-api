import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { Role, RoomStatus } from 'generated/prisma';
import { generateUserSeed, getAdminUser, getOwnerUser } from './user.seed';
import { generateRoomSeed } from './room.seed';
import { generateBookingSeed } from './booking.seed';

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? 'MySQL@123456',
  database: process.env.DB_NAME ?? 'room_reservation_system',
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // delete all records
  await prisma.booking.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.user.deleteMany({});
  //seed admin
  const admin = await prisma.user.create({
    data: await getAdminUser(),
  });
  //seed owner
  const owner = await prisma.user.create({
    data: await getOwnerUser(),
  });
  //seed random guests
  const userSeeds = await Promise.all(
    faker.helpers.multiple(() => generateUserSeed(Role.GUEST), {
      count: 5,
    }),
  );
  await prisma.user.createMany({
    data: userSeeds,
  });

  //fetch guests , cause we need them to create the bookings
  const guests = await prisma.user.findMany({
    where: { role: Role.GUEST },
  });
  //seed rooms and create them
  const roomsSeeds = faker.helpers.multiple(() => generateRoomSeed(owner.id), {
    count: 5,
  });
  await prisma.room.createMany({
    data: roomsSeeds,
  });
  const rooms = await prisma.room.findMany({
    where: { status: RoomStatus.AVAILABLE },
  });
  for (const g of guests) {
    const randomRoom = faker.helpers.arrayElement(
      rooms,
    ) as (typeof rooms)[number];
    const bookingSeedsData = generateBookingSeed(randomRoom.id, g.id);
    await prisma.booking.create({
      data: bookingSeedsData,
    });
  }

  //seeding is done4
  console.log('✅ Database seeded successfully');
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
