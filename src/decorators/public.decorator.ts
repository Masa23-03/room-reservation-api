import { Reflector } from '@nestjs/core';

export const isPublic = Reflector.createDecorator<boolean>();
//to skip auth on public endpoints
