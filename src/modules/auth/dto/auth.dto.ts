import { UserResponseDTO } from 'src/modules/user/dto/user.dto';
import { Role, User } from '@prisma/client';

export type AuthResponseDto = {
  token: string;
  user: UserResponseDTO;
};

// - RegisterDto:
//     - email
//     - password
//     - name
//     - role ..only allowed values: GUEST or OWNER — ADMIN blocked
export type RegisterRole = Extract<Role, 'OWNER' | 'GUEST'>;
export type RegisterDto = {
  name: string;
  password: string;
  email: string;
  role: RegisterRole;
};

// - LoginDto:
//     - email
//     - password
export type LoginDTO = {
  email: string;
  password: string;
};
