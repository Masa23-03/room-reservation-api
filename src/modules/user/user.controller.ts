import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/decorators/role.decorator';
import type {
  CreateUserDTO,
  UpdateUserRoleDto,
  UserResponseDTO,
} from './dto/user.dto';
import {
  updateUserRoleSchema,
  userValidationSchema,
} from './schema/user.schema';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { AuthedUser } from 'src/decorators/user.decorator';
import { paginationSchema } from 'src/utils/pagination-schema.util';
import type { PaginationQueryType } from 'src/types/unifiedType';
import { Role } from 'generated/prisma';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body(new ZodValidationPipe(userValidationSchema))
    createdUserPayload: CreateUserDTO,
  ): Promise<UserResponseDTO> {
    return this.userService.create(createdUserPayload);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(
    @Req() request: Express.Request,
    @Query(new ZodValidationPipe(paginationSchema)) query: PaginationQueryType,
  ) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(
    @Param('id')
    id: string,
  ): Promise<UserResponseDTO> {
    return this.userService.findOne(BigInt(id));
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserRoleSchema))
    userRole: UpdateUserRoleDto,
  ): Promise<UserResponseDTO> {
    return this.userService.updateUserRole(BigInt(id), userRole);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string): Promise<Boolean> {
    return this.userService.remove(BigInt(id));
  }
}
