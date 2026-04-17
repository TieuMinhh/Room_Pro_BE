import { orderRepository } from './order.repository';
import { roomRepository } from '~/modules/room/room.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { IOrderRoom } from './order.model';
import { pickUser } from '~/utils/algorithms';
import ContractModel from '~/modules/contract/contract.model';
import AccountModel from '~/modules/account/account.model';
import BillModel from '~/modules/bill/bill.model';

const flattenUser = (account: any) => {
  if (!account) return null;
  const profile = account.profile || {};
  return {
    ...account.toObject(),
    ...profile.toObject ? profile.toObject() : profile,
    _id: account._id
  };
};

export const orderService = {
  getOrdersByOwnerId: async (ownerId: string) => {
    const orders = await orderRepository.findByOwnerId(ownerId);
    return orders.filter((order: any) => order.roomId && order.roomId._destroy === false).map((order: any) => {
      return {
        _id: order._id,
        room: order.roomId,
        tenants: order.tenantId && order.tenantId.length > 0 ? order.tenantId.map((t: any) => pickUser(flattenUser(t))) : null,
        contract: order.contract,
        startAt: order.startAt,
        endAt: order.endAt,
        createdAt: (order as any).createdAt,
        updatedAt: (order as any).updatedAt
      };
    });
  },

  updateOrder: async (id: string, data: Partial<IOrderRoom>) => {
    const order = await orderRepository.findByIdActive(id);
    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found!');
    return await orderRepository.updateById(id, data);
  },

  getUniqueTenantsByOwner: async (ownerId: string) => {
    const orders = await orderRepository.findActiveByOwnerIdPopulated(ownerId);
    const filterRs: any[] = orders.filter((order: any) => Array.isArray(order.tenantId) && order.tenantId.length > 0);
    
    // Get all unique tenants
    const tenantIds = [...new Set(filterRs.flatMap((item: any) => item.tenantId.map((t: any) => t._id.toString())))];
    
    // For each tenant, find their active info from the orders
    const result: any[] = [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const tenantId of tenantIds) {
      // Find the first order involving this tenant for this owner
      const order = filterRs.find((o: any) => o.tenantId.some((t: any) => t._id.toString() === tenantId));
      if (!order) continue;

      const tenantObj = order.tenantId.find((t: any) => t._id.toString() === tenantId);
      const flattened = pickUser(flattenUser(tenantObj));

      // Fetch contract info for deposit status
      let depositPaid = false;
      if (order.contract) {
        // The contract is already populated in some repository methods, but here it's from findActiveByOwnerIdPopulated 
        // which only populates roomId and tenantId. 
        // We need the full contract for the 'paid' status.
        const fullOrder = await orderRepository.findByIdActivePopulated(order._id.toString());
        depositPaid = fullOrder?.contract ? (fullOrder.contract as any).paid : false;
      }

      // Check current month bill status
      const latestBill = await BillModel.findOne({
        tenantId: tenantId,
        ownerId: ownerId,
        time: { $gte: startOfMonth }
      }).sort({ createdAt: -1 });

      result.push({
        ...flattened,
        rentalInfo: {
          roomId: (order.roomId as any)?.roomId || "N/A",
          roomName: (order.roomId as any)?.name || "",
          startAt: order.startAt,
          endAt: order.endAt,
          depositPaid: depositPaid,
          billStatus: latestBill ? (latestBill.isPaid ? 'paid' : 'unpaid') : 'no_bill'
        }
      });
    }

    return result;
  },

  getOrderById: async (id: string, ownerId: string, findBy?: string) => {
    let order: any;
    const contractList = await ContractModel.find({});
    const tenantList = await AccountModel.find({ role: 'tenant' }).populate('profile');

    if (!findBy) {
      order = await orderRepository.findByIdActivePopulated(id);
      if (!order || (order.ownerId && (order.ownerId as any)._id.toString() !== ownerId)) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found!');
      }
    } else if (findBy === 'contract') {
      order = await orderRepository.findByContractIdPopulated(id);
    }

    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found!');

    return {
      _id: order._id,
      room: order.roomId,
      owner: pickUser(flattenUser(order.ownerId)),
      tenants: order.tenantId && order.tenantId?.length > 0 ? order.tenantId.map((t: any) => pickUser(flattenUser(t))) : null,
      contract: order.contract,
      history: order.history.map((h: any) => ({
        tenant: pickUser(flattenUser(tenantList.find((t: any) => t._id.toString() === h.tenantId.toString()))),
        contract: h.contract ? contractList.find((c: any) => c._id.toString() === h.contract.toString()) : null,
        startAt: h.startAt,
        endAt: h.endAt,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt
      })),
      startAt: order.startAt,
      endAt: order.endAt,
      createdAt: (order as any).createdAt,
      updatedAt: (order as any).updatedAt
    };
  },

  getTenantRooms: async (tenantId: string) => {
    const orders = await orderRepository.findActiveByTenantIdPopulated(tenantId);
    const paidOrders = orders.filter((order: any) => {
      return order.contract && order.contract.paid === true && order.roomId;
    });

    return paidOrders.map((order: any) => {
      const room: any = order.roomId;
      return {
        _id: room._id,
        roomId: room.roomId,
        image: room.image,
        price: room.price,
        area: room.area,
        utilities: room.utilities,
        serviceFee: room.serviceFee,
        startAt: order.startAt,
        endAt: order.endAt
      };
    });
  },

  deleteOrder: async (id: string, ownerId: string, isSave?: boolean) => {
    const order = await orderRepository.findByIdActive(id);
    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found!');

    if (order.ownerId.toString() !== ownerId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found!');
    }

    let updateData: any = {
      tenantId: [],
      contract: null,
      startAt: null,
      endAt: null
    };

    if (isSave) {
      const today = new Date();
      const orderEndAt = order.endAt ? new Date(order.endAt) : today;
      const newHistory = {
        tenantId: order.tenantId,
        contract: order.contract,
        startAt: order.startAt as Date,
        endAt: today > orderEndAt ? orderEndAt : today
      };
      updateData.history = [...order.history, newHistory];
    }

    const updatedOrder = await orderRepository.updateById(id, updateData);
    await roomRepository.updateById(order.roomId.toString(), { status: false } as any);

    return updatedOrder;
  },

  getTenantRentalHistory: async (tenantId: string) => {
    // 1. Get active orders (currently renting)
    const activeOrders = await orderRepository.findActiveByTenantIdPopulated(tenantId);
    
    // 2. Get past orders (from history)
    const pastOrders = await orderRepository.findByHistoryTenantId(tenantId);
    
    // Process active orders
    const activeList = activeOrders.map((order: any) => {
      const room: any = order.roomId;
      return {
        _id: order._id,
        roomId: room?.roomId,
        roomData: {
          _id: room?._id,
          roomId: room?.roomId,
          image: room?.image,
          price: room?.price,
          area: room?.area,
          utilities: room?.utilities,
          location: room?.departmentId?.name || "Khu vực trung tâm"
        },
        contract: order.contract?._id || order.contract,
        startAt: order.startAt,
        endAt: order.endAt,
        status: "ACTIVE" // Currently renting
      };
    });

    // Process history entries
    const historyList = pastOrders.flatMap((order: any) => {
      const room: any = order.roomId;
      if (!room || !Array.isArray(order.history)) return [];
      
      return order.history
        .filter((h: any) => h && h.tenantId && h.tenantId.toString() === tenantId)
        .map((h: any) => ({
          _id: order._id,
          roomId: room.roomId,
          roomData: {
            _id: room._id,
            roomId: room.roomId,
            image: room.image,
            price: room.price,
            area: room.area,
            utilities: room.utilities,
            location: room.departmentId?.name || "Khu vực trung tâm"
          },
          contract: h.contract?._id || h.contract,
          startAt: h.startAt,
          endAt: h.endAt,
          status: "COMPLETED" // Stay ended
        }));
    });

    // Combine and sort
    const combined = [...activeList, ...historyList];

    // Sort: Active first, then by end date descending
    return combined.sort((a: any, b: any) => {
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
      if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
      
      const dateA = a.endAt ? new Date(a.endAt).getTime() : 0;
      const dateB = b.endAt ? new Date(b.endAt).getTime() : 0;
      return dateB - dateA;
    });
  }
};
