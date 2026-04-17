import { feedbackRepository } from './feedback.repository';
import { orderRepository } from '~/modules/order/order.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { IFeedback } from './feedback.model';

export const feedbackService = {
  getFeedbacksByOwner: async (ownerId: string) => {
    const feedback = await feedbackRepository.findByOwnerId(ownerId);
    return feedback.map((fb: any) => ({
      _id: fb._id,
      tenantName: fb.tenantId?.displayName || "",
      description: fb.description,
      images: fb.images,
      status: fb.status,
      reply: fb.reply
    }));
  },

  getMyFeedbacks: async (tenantId: string) => {
    const feedbacks = await feedbackRepository.findByTenantId(tenantId);
    return feedbacks.map((fb: any) => ({
      _id: fb._id,
      ownerName: fb.ownerId?.displayName || "",
      description: fb.description,
      images: fb.images,
      status: fb.status,
      reply: fb.reply
    }));
  },

  replyToFeedback: async (id: string, reply: string) => {
    const updated = await feedbackRepository.updateById(id, {
      reply,
      status: "Replied"
    } as any);

    if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy phản hồi để cập nhật.");
    return updated;
  },

  getMyOwners: async (tenantId: string) => {
    const orders = await orderRepository.findActiveByTenantIdPopulated(tenantId);
    const owners = orders
      .map((order: any) => order.ownerId)
      .filter(Boolean);

    return Array.from(
      new Map(owners.map((owner: any) => [owner._id.toString(), owner])).values()
    );
  },

  createFeedback: async (tenantId: string, body: any) => {
    const { ownerId, description, images } = body;
    if (!tenantId || !ownerId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu thông tin người dùng.");
    }

    return await feedbackRepository.create({
      tenantId: tenantId as any,
      ownerId: ownerId as any,
      description,
      images,
      status: "Pending",
      reply: ""
    });
  }
};
