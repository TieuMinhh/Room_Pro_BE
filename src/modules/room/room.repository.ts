import RoomModel, { IRoom } from './room.model';

export const roomRepository = {
  findByDepartmentId: async (departmentId: string): Promise<IRoom[]> => {
    return await RoomModel.find({ departmentId, _destroy: false });
  },

  findOneByRoomId: async (roomId: string, departmentId: string): Promise<IRoom | null> => {
    return await RoomModel.findOne({ roomId, departmentId, _destroy: false });
  },

  findById: async (id: string): Promise<IRoom | null> => {
    return await RoomModel.findById(id);
  },

  findByIdPopulated: async (id: string): Promise<IRoom | null> => {
    return await RoomModel.findById(id).populate('departmentId');
  },

  findByIdActive: async (id: string): Promise<IRoom | null> => {
    const room = await RoomModel.findById(id);
    if (!room || room._destroy) return null;
    return room;
  },

  findAllActiveWithDepartment: async (): Promise<IRoom[]> => {
    return await RoomModel.find({ _destroy: false })
      .populate('departmentId', 'name ownerId');
  },

  create: async (data: Partial<IRoom>): Promise<IRoom> => {
    return await RoomModel.create(data);
  },

  updateById: async (id: string, data: Partial<IRoom>): Promise<IRoom | null> => {
    return await RoomModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
};
