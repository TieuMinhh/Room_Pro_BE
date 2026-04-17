import BlogModel, { IBlog } from './blog.model';

export const blogRepository = {
  findOneSoftDeleted: async (roomId: string, ownerId: string): Promise<IBlog | null> => {
    return await BlogModel.findOne({ roomId, ownerId, _destroy: true });
  },

  findOneActiveByRoomId: async (roomId: string): Promise<IBlog | null> => {
    return await BlogModel.findOne({ roomId, _destroy: false });
  },

  create: async (data: Partial<IBlog>): Promise<IBlog> => {
    return await BlogModel.create(data);
  },

  updateByRoomAndOwner: async (roomId: string, ownerId: string, data: Partial<IBlog>): Promise<IBlog | null> => {
    return await BlogModel.findOneAndUpdate({ roomId, ownerId }, data, { new: true });
  },

  findByIdPopulated: async (id: string): Promise<IBlog | null> => {
    return await BlogModel.findById(id)
      .populate({
        path: 'roomId',
        populate: {
          path: 'departmentId',
          model: 'Department'
        }
      })
      .populate({
        path: 'ownerId',
        populate: {
          path: 'profile'
        }
      });
  },

  findAllActivePopulated: async (): Promise<IBlog[]> => {
    return await BlogModel.find({ _destroy: false })
      .populate({
        path: 'roomId',
        populate: {
          path: 'departmentId',
          model: 'Department'
        }
      })
      .populate({
        path: 'ownerId',
        populate: {
          path: 'profile'
        }
      });
  },

  updateById: async (id: string, data: Partial<IBlog>): Promise<IBlog | null> => {
    return await BlogModel.findByIdAndUpdate(id, data, { new: true });
  }
};
