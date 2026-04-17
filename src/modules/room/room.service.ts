import { roomRepository } from './room.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import DepartmentModel from '~/modules/department/department.model';
import OrderRoomModel from '~/modules/order/order.model';
import { IRoom } from './room.model';

export const roomService = {
  getRoomsByDepartment: async (departmentId: string) => {
    return await roomRepository.findByDepartmentId(departmentId);
  },

  createRoom: async (data: Partial<IRoom>, ownerId: string) => {
    const department = await DepartmentModel.findById(data.departmentId);
    if (!department) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Department not found");
    }

    const existingRoom = await roomRepository.findOneByRoomId(data.roomId as string, data.departmentId as any);
    if (existingRoom) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Phòng đã tồn tại trong phòng trọ này");
    }

    const newRoom = await roomRepository.create({
      ...data,
      _destroy: false
    });

    // Create default OrderRoom
    await OrderRoomModel.create({
      roomId: newRoom._id,
      ownerId: ownerId,
      tenantId: [],
      contract: null,
      startAt: null,
      endAt: null,
      oldElectricNumber: 0,
      oldWaterNumber: 0,
      history: [],
      _destroy: false
    });

    return newRoom;
  },

  deleteRoom: async (id: string) => {
    const deleted = await roomRepository.updateById(id, { _destroy: true } as any);
    if (!deleted) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy phòng');
    return { message: 'Xoá phòng thành công' };
  },

  updateRoom: async (id: string, data: Partial<IRoom>) => {
    const updatedRoom = await roomRepository.updateById(id, data);
    if (!updatedRoom) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy phòng để cập nhật');
    return updatedRoom;
  },

  getRoomById: async (id: string) => {
    const room = await roomRepository.findByIdActive(id);
    if (!room) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy phòng');
    return room;
  },

  getAllOwnerRooms: async (userId: string) => {
    const rooms = await roomRepository.findAllActiveWithDepartment();
    return rooms.filter((room: any) => 
      room.departmentId && room.departmentId.ownerId && room.departmentId.ownerId.toString() === userId.toString()
    );
  }
};
