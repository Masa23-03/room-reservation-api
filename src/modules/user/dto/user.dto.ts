import { User } from 'generated/prisma';

export type UserResponseDTO = Omit<User, 'password' | 'id' | 'isDeleted'> & {
  id: string;
};
