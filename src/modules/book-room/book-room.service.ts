import { bookRoomRepository } from './book-room.repository';
import { blogRepository } from '~/modules/blog/blog.repository';
import { orderRepository } from '~/modules/order/order.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from '~/utils/constants';
import { roomRepository } from '../room/room.repository';
import { IOrderRoom } from '../order/order.model';

export const bookRoomService = {
  createBookRoom: async (tenantId: string, body: any) => {
    const blog = await blogRepository.findByIdPopulated(body.blogId);
    if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, "Blog not found");

    return await bookRoomRepository.create({
      ...body,
      tenantId: tenantId as any,
      roomId: (blog.roomId as any)._id
    });
  },

  getBookRooms: async (userId: string, isRole: string) => {
    let results: any[] = [];
    if (isRole === USER_ROLES.TENANT) {
      results = await bookRoomRepository.findByTenantId(userId);
    } else if (isRole === 'owner') {
      results = await bookRoomRepository.findAllPopulatedForOwner(userId);
      const roomsWithOrder = await orderRepository.findActiveByOwnerIdPopulated(userId);

      results = results.map((br: any) => {
        const order = roomsWithOrder.find(o => o.roomId?._id.toString() === br.roomId?._id.toString());
        const obj = br.toObject ? br.toObject() : br;
        obj.orderId = order?._id;
        return obj;
      });
    }

    // Flatten tenantId.profile into tenantId for client compatibility
    return results.map(br => {
      const bookRoom = br.toObject ? br.toObject() : br;
      if (bookRoom.tenantId && bookRoom.tenantId.profile) {
        const profile = bookRoom.tenantId.profile;
        bookRoom.tenantId = {
          ...bookRoom.tenantId,
          ...profile,
          _id: bookRoom.tenantId._id // Ensure it's the Account ID
        };
        delete bookRoom.tenantId.profile;
      }
      return bookRoom;
    });
  },
  updateBookRoom: async (id: string, body: any) => {
    const bookRoom = await bookRoomRepository.findById(id);
    if (!bookRoom) throw new ApiError(StatusCodes.NOT_FOUND, 'BookRoom not found');

    if (body.status === 'approve') {
      let orderRoom = await orderRepository.findOneByRoomIdActive(bookRoom.roomId.toString());

      // Recovery: If OrderRoom is missing, create a default one
      if (!orderRoom) {
        const room = await roomRepository.findByIdPopulated(bookRoom.roomId.toString());
        if (!room) throw new ApiError(StatusCodes.NOT_FOUND, 'Room not found');

        const department = room.departmentId as any;
        if (!department || !department.ownerId) {
          throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Owner not found for this room');
        }

        orderRoom = await orderRepository.create({
          roomId: room._id as any,
          ownerId: department.ownerId,
          tenantId: [],
          history: [],
          _destroy: false
        }) as IOrderRoom;
      }
      if (!bookRoom.tenantId) throw new ApiError(StatusCodes.BAD_REQUEST, 'Tenant ID is required for approval');
      if (orderRoom.tenantId && orderRoom.tenantId.length > 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Phòng này đã có người thuê');
      }

      await bookRoomRepository.updateById(id, body);
      const currentTenants = orderRoom.tenantId || [];

      return await orderRepository.updateById(orderRoom._id as string, {
        tenantId: [...currentTenants, bookRoom.tenantId],
        startAt: new Date(bookRoom.startDate),
        endAt: new Date(bookRoom.endDate)
      } as any);
    }

    return await bookRoomRepository.updateById(id, body);
  }
};
