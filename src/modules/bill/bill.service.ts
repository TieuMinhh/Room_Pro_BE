import { billRepository } from './bill.repository';
import { roomRepository } from '~/modules/room/room.repository';
import { orderRepository } from '~/modules/order/order.repository';
import { sendEmail } from '~/providers/MailProvider';
import { generateElectricBillHTML } from '~/utils/form-html';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { IBill } from './bill.model';

export const billService = {
  getBillsForOwner: async (userId: string) => {
    return await billRepository.findByOwnerId(userId);
  },

  createBill: async (roomId: string, date: string, ownerId: string) => {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');

    const orderRoom = await orderRepository.findOneByRoomIdActive(roomId);
    if (!orderRoom) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order room not found');
    }

    const billData = {
      roomId: roomId as any,
      tenantId: orderRoom.tenantId[0],
      ownerId: ownerId as any,
      price: room.price,
      serviceFee: room.serviceFee,
      oldElectricity: orderRoom.oldElectricNumber || 0,
      oldWater: orderRoom.oldWaterNumber || 0,
      time: new Date(date),
    };

    return await billRepository.create(billData);
  },

  getBillById: async (id: string) => {
    const bill = await billRepository.findByIdPopulated(id);
    if (!bill) throw new ApiError(StatusCodes.NOT_FOUND, 'Bill not found');
    return bill;
  },

  updateBill: async (id: string, body: any) => {
    const bill = await billRepository.findById(id);
    if (!bill) throw new ApiError(StatusCodes.NOT_FOUND, 'Bill not found');

    const dataUpdate: any = {
      price: body.price,
      oldElectricity: body.oldElectricity,
      newElectricity: body.newElectricity,
      oldWater: body.oldWater,
      newWater: body.newWater,
      prepay: body.prepay,
      duration: new Date(body.deadline),
      total: body.total,
      status: true
    };

    if (dataUpdate.prepay === dataUpdate.total) {
      dataUpdate.isPaid = true;
    }

    await orderRepository.updateById(bill.roomId.toString(), { 
        oldElectricNumber: dataUpdate.newElectricity, 
        oldWaterNumber: dataUpdate.newWater 
    } as any);

    return await billRepository.updateById(id, dataUpdate);
  },

  deleteBill: async (id: string, userId: string) => {
    const bill = await billRepository.findById(id);
    if (!bill) throw new ApiError(StatusCodes.NOT_FOUND, 'Bill not found');

    if (bill.ownerId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to delete this bill');
    }

    return await billRepository.deleteById(id);
  },

  getBillsForTenant: async (tenantId: string) => {
    return await billRepository.findByTenantId(tenantId);
  },

  sendBillMail: async (billId: string) => {
    const bill = await billRepository.findByIdPopulated(billId);
    if (!bill) throw new ApiError(StatusCodes.NOT_FOUND, 'Bill not found');

    sendEmail('Bill', (bill.tenantId as any).email, 'Bill', generateElectricBillHTML(bill as any));
    return bill;
  }
};
