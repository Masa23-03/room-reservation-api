import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsPublic } from 'src/decorators/public.decorator';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  loginValidationSchema,
  registerValidationSchema,
} from './schema/auth.schema';
import type { AuthResponseDto, LoginDTO, RegisterDto } from './dto/auth.dto';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @IsPublic()
  async create(
    @Body(new ZodValidationPipe(registerValidationSchema)) payload: RegisterDto,
  ): Promise<AuthResponseDto> {
    return await this.authService.register(payload);
  }

  @Post('login')
  @IsPublic()
  async login(
    @Body(new ZodValidationPipe(loginValidationSchema)) payload: LoginDTO,
  ): Promise<AuthResponseDto> {
    return await this.authService.login(payload);
  }

  @Get('validate')
  async validate(@Req() request: Request): Promise<AuthResponseDto> {
    return await this.authService.validate(request.user!);
  }
}
