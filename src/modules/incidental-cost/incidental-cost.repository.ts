import IncidentalCostsModel, { IIncidentalCosts } from './incidental-cost.model';

export const incidentalCostRepository = {
  findByOwnerId: async (ownerId: string): Promise<IIncidentalCosts[]> => {
    return await IncidentalCostsModel.find({ ownerId })
      .populate('roomId', 'roomId departmentId price')
      .populate('tenantId', 'displayName email phone')
      .populate('ownerId', 'displayName email phone')
      .sort({ createdAt: -1 });
  },

  findById: async (id: string): Promise<IIncidentalCosts | null> => {
    return await IncidentalCostsModel.findById(id);
  },

  findByTenantId: async (tenantId: string): Promise<IIncidentalCosts[]> => {
    return await IncidentalCostsModel.find({ tenantId, whoPaid: "Tenant" })
      .populate('roomId', 'roomId departmentId price')
      .populate('tenantId', 'displayName email phone')
      .populate('ownerId', 'displayName email phone')
      .sort({ createdAt: -1 });
  },

  create: async (data: Partial<IIncidentalCosts>): Promise<IIncidentalCosts> => {
    return await IncidentalCostsModel.create(data);
  },

  deleteByIdAndOwnerId: async (id: string, ownerId: string): Promise<any> => {
    return await IncidentalCostsModel.deleteOne({ _id: id, ownerId });
  },

  updateById: async (id: string, data: Partial<IIncidentalCosts>): Promise<IIncidentalCosts | null> => {
    return await IncidentalCostsModel.findByIdAndUpdate(id, data, { new: true });
  }
};
