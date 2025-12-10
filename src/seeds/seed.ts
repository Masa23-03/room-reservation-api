import { PrismaClient } from 'generated/prisma';

const prisma = new PrismaClient();
async function main() {
  // delete all records
  await prisma.booking.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.user.deleteMany({});
}
main();
