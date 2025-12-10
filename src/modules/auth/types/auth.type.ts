import { Role } from '@prisma/client';

export type JSON_Web_Token_Payload = {
  sub: string;
  role: Role;
};
