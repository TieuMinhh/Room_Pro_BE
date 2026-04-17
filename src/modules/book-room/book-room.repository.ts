import BookRoomModel, { IBookRoom } from './book-room.model';

export const bookRoomRepository = {
  create: async (data: Partial<IBookRoom>): Promise<IBookRoom> => {
    return await BookRoomModel.create(data);
  },

  findByTenantId: async (tenantId: string): Promise<IBookRoom[]> => {
    return await BookRoomModel.find({ tenantId })
      .populate({
        path: 'tenantId',
        populate: { path: 'profile' }
      })
      .populate("roomId")
      .populate("blogId")
      .sort({ createdAt: -1 as any });
  },

  findAllPopulatedForOwner: async (ownerId: string): Promise<IBookRoom[]> => {
    const results = await BookRoomModel.find({})
      .populate({
        path: 'roomId',
        populate: {
          path: 'departmentId',
          match: { ownerId }
        }
      })
      .populate('blogId')
      .populate({
        path: 'tenantId',
        populate: { path: 'profile' }
      })
      .sort({ createdAt: -1 as any });

    return results.filter((br: any) => br.roomId && br.roomId.departmentId);
  },

  findById: async (id: string): Promise<IBookRoom | null> => {
    return await BookRoomModel.findById(id);
  },

  updateById: async (id: string, data: Partial<IBookRoom>): Promise<IBookRoom | null> => {
    return await BookRoomModel.findByIdAndUpdate(id, data, { new: true });
  }
};
