import OrderRoomModel, { IOrderRoom } from './order.model';

export const orderRepository = {
  findByOwnerId: async (ownerId: string): Promise<IOrderRoom[]> => {
    return await OrderRoomModel.find({ ownerId })
      .populate('roomId')
      .populate({
        path: 'tenantId',
        populate: { path: 'profile' }
      })
      .populate({
        path: 'ownerId',
        populate: { path: 'profile' }
      })
      .populate('contract');
  },

  findByIdActive: async (id: string): Promise<IOrderRoom | null> => {
    return await OrderRoomModel.findOne({ _id: id, _destroy: false });
  },

  findByIdActivePopulated: async (id: string): Promise<IOrderRoom | null> => {
    return await OrderRoomModel.findOne({ _id: id, _destroy: false })
      .populate({
        path: 'roomId',
        populate: {
          path: 'departmentId',
          model: 'Department'
        }
      })
      .populate({
        path: 'tenantId',
        populate: { path: 'profile' }
      })
      .populate({
        path: 'ownerId',
        populate: { path: 'profile' }
      })
      .populate('contract');
  },

  findByContractIdPopulated: async (contractId: string): Promise<IOrderRoom | null> => {
    return await OrderRoomModel.findOne({ contract: contractId, _destroy: false })
      .populate('roomId')
      .populate({
        path: 'tenantId',
        populate: { path: 'profile' }
      })
      .populate({
        path: 'ownerId',
        populate: { path: 'profile' }
      })
      .populate('contract');
  },

  findActiveByOwnerIdPopulated: async (ownerId: string): Promise<IOrderRoom[]> => {
    return await OrderRoomModel.find({ ownerId, _destroy: false })
      .populate('roomId')
      .populate({
        path: 'tenantId',
        populate: { path: 'profile' }
      });
  },

  findActiveByTenantIdPopulated: async (tenantId: string): Promise<IOrderRoom[]> => {
    return await OrderRoomModel.find({
      tenantId: { $in: [tenantId] },
      _destroy: false
    })
      .populate("roomId")
      .populate("contract");
  },

  findByHistoryTenantId: async (tenantId: string): Promise<IOrderRoom[]> => {
    return await OrderRoomModel.find({
      "history.tenantId": tenantId
    })
      .populate({
        path: "roomId",
        populate: {
          path: "departmentId",
          model: "Department"
        }
      })
      .populate("history.contract");
  },

  findOneByRoomIdActive: async (roomId: string): Promise<IOrderRoom | null> => {
    return await OrderRoomModel.findOne({ roomId, _destroy: false });
  },

  updateById: async (id: string, data: Partial<IOrderRoom>): Promise<IOrderRoom | null> => {
    return await OrderRoomModel.findOneAndUpdate({ _id: id }, data, { new: true });
  },

  create: async (data: Partial<IOrderRoom>): Promise<IOrderRoom> => {
    return await OrderRoomModel.create(data);
  }
};
