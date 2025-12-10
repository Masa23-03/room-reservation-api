import { Prisma, Room } from '@prisma/client';
// - CreateRoomDto:
//     - `name`
//     - `capacity`
//     - `price`
export type CreateRoomDto = Pick<Room, 'name' | 'capacity'> & { price: number };

// - UpdateRoomDto:
//     - `name?`
//     - `capacity?`
//     - `price?`
//     - `status?` (AVAILABLE / UNAVAILABLE)
//     *(Owners can update their own rooms)*
export type UpdateRoomDto = Partial<
  Pick<Room, 'capacity' | 'name' | 'status'> & { price: number }
>;

// - UpdateRoomStatusDto
//     - `status`
export type UpdateRoomStatusDto = Pick<Room, 'status'>;

// - RoomResponseDto
//     Returned for findOne:
//     - `id`
//     - `name`
//     - `capacity`
//     - `price`
//     - `status`
//     - `owner`
//     - `createdAt`

export type RoomResponseDto = Omit<
  Room,
  'id' | 'ownerId' | 'updatedAt' | 'price'
> & {
  id: string;
  ownerId: string;
  price: number;
};

// - RoomOverviewResponseDto (admin or guest list):
//     - `id`
//     - `name`
//     - `price`
//     - `status`
//     - `capacity`
//     - `ownerId` *(or small owner object — your choice)*
export type RoomOverviewResponseDto = Pick<
  RoomResponseDto,
  'name' | 'id' | 'price' | 'status'
>;
