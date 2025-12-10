import z, { email, ZodType } from 'zod';
import { LoginDTO, RegisterDto } from '../dto/auth.dto';

//register
export const registerValidationSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().toLowerCase(),
  password: z.string().min(6).max(100),
  role: z.enum(['GUEST', 'OWNER']).default('GUEST').optional(),
}) satisfies ZodType<RegisterDto>;
//login
export const loginValidationSchema = registerValidationSchema.pick({
  email: true,
  password: true,
}) satisfies ZodType<LoginDTO>;
