import BillModel, { IBill } from './bill.model';

export const billRepository = {
  findByOwnerId: async (ownerId: string): Promise<IBill[]> => {
    return await BillModel.find({ ownerId })
      .populate('ownerId', 'displayName email phone')
      .populate('tenantId', 'displayName email phone')
      .populate({
        path: 'roomId',
        select: 'roomId departmentId price',
        populate: {
          path: 'departmentId',
          select: 'electricPrice waterPrice '
        }
      })
      .sort({ createdAt: -1 });
  },

  findByIdPopulated: async (id: string): Promise<IBill | null> => {
    return await BillModel.findById(id)
      .populate('ownerId', 'displayName email')
      .populate('tenantId', 'displayName email phone')
      .populate('roomId', 'roomId departmentId price');
  },

  findById: async (id: string): Promise<IBill | null> => {
    return await BillModel.findById(id);
  },

  findByTenantId: async (tenantId: string): Promise<IBill[]> => {
    return await BillModel.find({ tenantId })
      .populate('ownerId', 'displayName email phone')
      .populate('tenantId', 'displayName email phone')
      .populate({
        path: 'roomId',
        select: 'roomId departmentId price',
        populate: {
          path: 'departmentId',
          select: 'electricPrice waterPrice '
        }
      })
      .sort({ createdAt: -1 });
  },

  create: async (data: Partial<IBill>): Promise<IBill> => {
    return await BillModel.create(data);
  },

  updateById: async (id: string, data: Partial<IBill>): Promise<IBill | null> => {
    return await BillModel.findByIdAndUpdate(id, data, { new: true });
  },

  deleteById: async (id: string): Promise<IBill | null> => {
    return await BillModel.findByIdAndDelete(id);
  }
};
