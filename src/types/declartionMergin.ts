import { AuthResponseDto } from 'src/modules/auth/dto/auth.dto';
import { UserResponseDTO } from 'src/modules/user/dto/user.dto';

export type EnvVariable = {
  PORT: string;
  JWT_SECRET: string;
  NODE_ENV: 'development' | 'production';
  DATABASE_URL: string;
};
declare global {
  namespace Express {
    interface Request {
      user?: UserResponseDTO;
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends EnvVariable {}
  }
  interface BigInt {
    toJSON(): string;
  }
}
