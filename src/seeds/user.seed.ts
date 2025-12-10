import { faker } from '@faker-js/faker';
import { Role, User } from 'generated/prisma';
import * as argon2 from 'argon2';

export const generateUserSeed = async (role: Role = Role.GUEST) => {
  const hashedPassword = await argon2.hash('password@123456');
  const seededUser: Omit<
    User,
    'updatedAt' | 'createdAt' | 'id' | 'isDeleted' | 'rooms' | 'bookings'
  > = {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: role,
    password: hashedPassword,
  };
  return seededUser;
};

export const getAdminUser = async () =>
  ({
    name: 'Admin',
    email: 'admin@gmail.com',
    password: await argon2.hash('admin@123456'),
    role: Role.ADMIN,
  }) as const;

export const getOwnerUser = async () =>
  ({
    name: 'Owner1',
    email: 'owner1@gmail.com',
    password: await argon2.hash('owner1@123456'),
    role: Role.OWNER,
  }) as const;
