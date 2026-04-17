import { departmentRepository } from './department.repository';
import { roomRepository } from '~/modules/room/room.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { IDepartment } from './department.model';
import RoomModel from '~/modules/room/room.model';

export const departmentService = {
  createDepartment: async (data: Partial<IDepartment>, ownerId: string) => {
    return await departmentRepository.create({
      ...data,
      ownerId: ownerId as any
    });
  },

  getDepartmentsByOwner: async (ownerId: string) => {
    return await departmentRepository.findByOwnerId(ownerId);
  },

  updateDepartment: async (id: string, data: Partial<IDepartment>) => {
    const updated = await departmentRepository.updateById(id, data);
    if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Department not found');
    return updated;
  },

  deleteDepartment: async (id: string) => {
    const department = await departmentRepository.findByIdActive(id);
    if (!department) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy tòa nhà');

    // Check if any rooms are occupied
    const rooms = await roomRepository.findByDepartmentId(id);
    const hasOccupiedRoom = rooms.some((room: any) => room.status === true);
    if (hasOccupiedRoom) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không thể xoá tòa nhà vì có phòng đang được thuê');
    }

    // Soft delete all rooms in this department
    await RoomModel.updateMany({ departmentId: id }, { _destroy: true });

    // Soft delete department
    await departmentRepository.softDelete(id);

    return { message: 'Xoá tòa nhà thành công (đã xoá mềm)' };
  },

  getDepartmentById: async (id: string) => {
    const department = await departmentRepository.findByIdActive(id);
    if (!department) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy toà nhà');
    return department;
  }
};
