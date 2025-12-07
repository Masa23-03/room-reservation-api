import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateUserDTO,
  UpdateUserRoleDto,
  UserOverviewResponseDto,
  UserResponseDTO,
} from './dto/user.dto';
import { DatabaseService } from '../database/database.service';
import { User } from 'generated/prisma';
import { removeFields } from 'src/utils/object.util';
import {
  ApiPaginationResponse,
  PaginationQueryType,
} from 'src/types/unifiedType';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: DatabaseService) {}
  //   - createUser :service only
  async create(createUserDto: CreateUserDTO): Promise<UserResponseDTO> {
    const user = await this.prismaService.user.create({
      data: createUserDto,
    });
    return this.mapUserWithoutPasswordAndCastBigInt(user);
  }
  // - updateUserRole (Admin)
  async updateUserRole(
    id: bigint,
    updateRoleDto: UpdateUserRoleDto,
  ): Promise<UserResponseDTO> {
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: { role: updateRoleDto.role },
    });
    return this.mapUserWithoutPasswordAndCastBigInt(updatedUser);
  }
  // - delete (soft) (Admin)
  async remove(id: bigint): Promise<Boolean> {
    const user = await this.prismaService.user.update({
      where: { id },
      data: { isDeleted: true },
    });
    return !!user;
  }
  // - FindAll (Admin)
  findAll(
    query: PaginationQueryType,
  ): Promise<ApiPaginationResponse<UserOverviewResponseDto>> {
    return this.prismaService.$transaction(async (tx) => {
      const pagination = this.prismaService.handleQueryPagination(query);
      const count = await tx.user.count({
        where: { isDeleted: false },
      });
      const users = await tx.user.findMany({
        where: { isDeleted: false },

        ...removeFields(pagination, ['page']),

        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      return {
        success: true,
        data: users.map((u) => ({
          ...u,
          id: u.id.toString(),
        })),
        meta: this.prismaService.formatPaginationResponse({
          count: count,
          page: pagination.page,
          limit: pagination.take,
        }),
      };
    });
  }
  // - FindOne (Admin)

  async findOne(id: bigint): Promise<UserResponseDTO> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException();
    return this.mapUserWithoutPasswordAndCastBigInt(user);
  }

  // -  findByEmail
  findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email: email },
    });
  }

  //mapping user without password and cast bigint into string
  private mapUserWithoutPasswordAndCastBigInt(user: User): UserResponseDTO {
    const userWithoutPassword = removeFields(user, ['password', 'isDeleted']);

    return {
      ...userWithoutPassword,
      id: String(userWithoutPassword.id),
    };
  }
}
