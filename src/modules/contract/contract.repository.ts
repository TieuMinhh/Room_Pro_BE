import ContractModel, { IContract } from './contract.model';

export const contractRepository = {
  create: async (data: Partial<IContract>): Promise<IContract> => {
    return await ContractModel.create(data);
  },

  findByTenantId: async (tenantId: string): Promise<IContract[]> => {
    return await ContractModel.find({ tenantId: { $in: [tenantId as any] } })
      .populate({
        path: 'tenantId',
        populate: { path: 'profile' }
      })
      .populate({
        path: 'ownerId',
        populate: { path: 'profile' }
      })
      .populate('roomId')
      .sort({ createdAt: -1 });
  },

  updateById: async (id: string, data: Partial<IContract>): Promise<IContract | null> => {
    return await ContractModel.findByIdAndUpdate(id, data, { new: true });
  },

  findById: async (id: string): Promise<IContract | null> => {
    return await ContractModel.findById(id);
  }
};
