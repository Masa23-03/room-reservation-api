import { Reflector } from '@nestjs/core';

export const IsPublic = Reflector.createDecorator<boolean>();
//to skip auth on public endpoints
