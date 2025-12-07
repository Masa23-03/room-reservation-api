import { Role, User } from 'generated/prisma';

export type UserResponseDTO = Omit<User, 'password' | 'id' | 'isDeleted'> & {
  id: string;
};

// - UpdateUserRoleDto (admin) :
//     - `role` (GUEST or OWNER or ADMIN)
export type UpdateUserRoleDto = {
  role: Role;
};

// - UserOverviewResponseDto (admin):
//     - `id`
//     - `email`
//     - `name`
//     - `role`
export type UserOverviewResponseDto = Pick<
  UserResponseDTO,
  'id' | 'email' | 'name' | 'role'
>;

//CreateUserDTO
export type CreateUserDTO = {
  name: string;
  email: string;
  password: string;
  role: Role;
};
