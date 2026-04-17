import { blogRepository } from './blog.repository';
import { roomRepository } from '~/modules/room/room.repository';
import { orderRepository } from '~/modules/order/order.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import dayjs from 'dayjs';
import { IBlog } from './blog.model';
import { pickUser } from '~/utils/algorithms';

export const blogService = {
  addRoomToBlog: async (roomId: string, ownerId: string, body: any) => {
    const { force, title, description, availableFrom, deposit } = body;

    const room = await roomRepository.findById(roomId);
    if (!room) throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy phòng.");

    if (room.post === true && !force) {
      return { existed: true };
    }

    if (room.status === true && !force) {
      const order = await orderRepository.findByIdActive(roomId); // roomId used as identifier
      const endDate = order?.endAt || new Date();
      return {
        warning: true,
        note: `Phòng đang được thuê đến ${dayjs(endDate).format("DD/MM/YYYY")}`,
        endAt: endDate
      };
    }

    if (!title) throw new ApiError(StatusCodes.BAD_REQUEST, "Tiêu đề (title) là bắt buộc.");

    const existingSoftDeleted = await blogRepository.findOneSoftDeleted(roomId, ownerId);

    if (existingSoftDeleted) {
      existingSoftDeleted.title = title;
      existingSoftDeleted.description = description;
      existingSoftDeleted.deposit = deposit || existingSoftDeleted.deposit;
      existingSoftDeleted.availableFrom = availableFrom ? new Date(availableFrom) : new Date();
      existingSoftDeleted._destroy = false;
      await existingSoftDeleted.save();

      await roomRepository.updateById(roomId, { post: true } as any);
      return { message: "Khôi phục blog thành công.", blog: existingSoftDeleted };
    }

    const blog = await blogRepository.create({
      roomId: roomId as any,
      ownerId: ownerId as any,
      title,
      description,
      deposit: deposit || 0,
      availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
      _destroy: false
    });

    await roomRepository.updateById(roomId, { post: true } as any);
    return { message: "Phòng đã được thêm vào blog.", blog };
  },

  checkRoomStatus: async (roomId: string) => {
    const existed = await blogRepository.findOneActiveByRoomId(roomId);
    const room = await roomRepository.findById(roomId);
    if (!room) throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy phòng");

    return { 
      existed: !!existed, 
      warning: room.status === true, 
      endAt: (room as any).endDate || null 
    };
  },

  removeRoomFromBlog: async (roomId: string, ownerId: string) => {
    const deleted = await blogRepository.updateByRoomAndOwner(roomId, ownerId, { _destroy: true });
    if (!deleted) throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy blog để xoá.");

    await roomRepository.updateById(roomId, { post: false } as any);
    return { message: "Đã xoá khỏi blog thành công." };
  },

  getBlogById: async (id: string) => {
    const blog: any = await blogRepository.findByIdPopulated(id);
    if (!blog) throw new ApiError(StatusCodes.NOT_FOUND, 'Blog not found!');

    const ownerData = blog.ownerId ? blog.ownerId.toObject() : {};
    const profile = ownerData.profile || {};
    const flattenedOwner = {
      ...ownerData,
      ...profile,
      _id: ownerData._id
    };
    delete flattenedOwner.profile;

    return {
      _id: blog._id,
      room: blog.roomId,
      owner: pickUser(flattenedOwner),
      availableFrom: blog.availableFrom,
      deposit: blog.deposit,
      description: blog.description,
      createdAt: (blog as any).createdAt,
      updatedAt: (blog as any).updatedAt,
    };
  },

  getAllBlogs: async () => {
    const blogs = await blogRepository.findAllActivePopulated();
    return blogs.map(blog => {
      const b: any = blog.toObject();
      const ownerData = b.ownerId || {};
      const profile = ownerData.profile || {};
      const flattenedOwner = {
        ...ownerData,
        ...profile,
        _id: ownerData._id
      };
      delete flattenedOwner.profile;

      return {
        ...b,
        ownerId: pickUser(flattenedOwner)
      };
    });
  }
};
