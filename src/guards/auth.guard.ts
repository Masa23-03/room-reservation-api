import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { IsPublic } from 'src/decorators/public.decorator';
import { DatabaseService } from 'src/modules/database/database.service';
import { Request } from 'express';
import { JSON_Web_Token_Payload } from 'src/modules/auth/types/auth.type';
import { removeFields } from 'src/utils/object.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private prisma: DatabaseService,
  ) {}
  async canActivate(context: ExecutionContext) {
    //public case
    const isPublic = this.reflector.getAllAndOverride<boolean>(IsPublic, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const authHeader = req.headers.authorization;

    const jwt = authHeader?.split(' ')[1];
    if (!jwt) throw new UnauthorizedException();
    try {
      const payLoad = this.jwtService.verify<JSON_Web_Token_Payload>(jwt);
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: BigInt(payLoad.sub) },
      });
      req.user = {
        ...removeFields(user, ['isDeleted', 'password']),
        id: String(user.id),
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
