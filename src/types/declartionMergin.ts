export type EnvVariable = {
  PORT: string;
  JWT_SECRET: string;
  NODE_ENV: 'development' | 'production';
  DATABASE_URL: string;
};
declare global {
  namespace Express {
    interface Request {
      //TODO: add request.user for auth
      //       user? : AuthResponseDto['user']
      //       or:
      // user?: {
      //     id: string;
      //     role: Role;
      //   };
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends EnvVariable {}
  }
  interface BigInt {
    toJSON(): string;
  }
}
