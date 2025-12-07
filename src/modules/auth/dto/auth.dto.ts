import { UserResponseDTO } from 'src/modules/user/dto/user.dto';

export type AuthResponseDto = {
  token: string;
  user: UserResponseDTO;
};
