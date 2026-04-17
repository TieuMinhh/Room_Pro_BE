import PackageModel, { IPackage } from './package.model';

export const packageRepository = {
  create: async (data: Partial<IPackage>): Promise<IPackage> => {
    return await PackageModel.create(data);
  },

  findAllActive: async (): Promise<IPackage[]> => {
    return await PackageModel.find({ _destroy: false }).sort({ availableTime: 1 as any });
  },

  findById: async (id: string): Promise<IPackage | null> => {
    return await PackageModel.findById(id);
  },

  updateById: async (id: string, data: Partial<IPackage>): Promise<IPackage | null> => {
    return await PackageModel.findByIdAndUpdate(id, data, { new: true });
  },

  softDelete: async (id: string): Promise<IPackage | null> => {
    return await PackageModel.findByIdAndUpdate(id, { _destroy: true }, { new: true });
  }
};
