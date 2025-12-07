import z, { ZodType } from 'zod';
import { CreateUserDTO } from '../dto/user.dto';
import { Role } from 'generated/prisma';

// user schema
export const userValidationSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().toLowerCase(),
  password: z.string().min(6).max(100),
  role: z.nativeEnum(Role).default('GUEST'),
}) satisfies ZodType<CreateUserDTO>;
