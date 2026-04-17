import { incidentalCostRepository } from './incidental-cost.repository';
import { roomRepository } from '~/modules/room/room.repository';
import { departmentRepository } from '~/modules/department/department.repository';
import { orderRepository } from '~/modules/order/order.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { IIncidentalCosts } from './incidental-cost.model';

export const incidentalCostService = {
  getIncidentalCostsForOwner: async (ownerId: string) => {
    return await incidentalCostRepository.findByOwnerId(ownerId);
  },

  createIncidentalCost: async (ownerId: string, body: any) => {
    const { roomId, description, whoPaid, amount } = body;

    const room = await roomRepository.findById(roomId);
    if (!room) throw new ApiError(StatusCodes.NOT_FOUND, "Room not found");

    const department = await departmentRepository.findById(room.departmentId.toString());
    if (!department) throw new ApiError(StatusCodes.NOT_FOUND, "Department not found");

    if (department.ownerId.toString() !== ownerId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "You do not have permission to create incidental costs for this department");
    }

    const order = await orderRepository.findByIdActive(roomId); // roomId used as identifier
    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, "Order room not found");

    return await incidentalCostRepository.create({
      roomId: roomId as any,
      tenantId: order.tenantId[0],
      whoPaid,
      amount,
      ownerId: ownerId as any,
      description: description || "No description provided",
      isPaid: whoPaid === "Landlord"
    });
  },

  deleteIncidentalCost: async (id: string, ownerId: string) => {
    const cost = await incidentalCostRepository.findById(id);
    if (!cost) throw new ApiError(StatusCodes.NOT_FOUND, "Incidental cost not found");

    return await incidentalCostRepository.deleteByIdAndOwnerId(id, ownerId);
  },

  updateIncidentalCost: async (id: string, ownerId: string, body: any) => {
    const cost = await incidentalCostRepository.findById(id);
    if (!cost) throw new ApiError(StatusCodes.NOT_FOUND, "Incidental cost not found");

    if (cost.ownerId.toString() !== ownerId) {
      throw new ApiError(StatusCodes.FORBIDDEN, "You do not have permission to update this incidental cost");
    }

    return await incidentalCostRepository.updateById(id, body);
  },

  getIncidentalCostsForTenant: async (tenantId: string) => {
    return await incidentalCostRepository.findByTenantId(tenantId);
  }
};
