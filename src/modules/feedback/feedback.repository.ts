import FeedbackModel, { IFeedback } from './feedback.model';

export const feedbackRepository = {
  findByOwnerId: async (ownerId: string): Promise<IFeedback[]> => {
    return await FeedbackModel.find({ ownerId }).populate("tenantId", "displayName");
  },

  findByTenantId: async (tenantId: string): Promise<IFeedback[]> => {
    return await FeedbackModel.find({ tenantId }).populate("ownerId", "displayName");
  },

  updateById: async (id: string, data: Partial<IFeedback>): Promise<IFeedback | null> => {
    return await FeedbackModel.findByIdAndUpdate(id, data, { new: true });
  },

  create: async (data: Partial<IFeedback>): Promise<IFeedback> => {
    return await FeedbackModel.create(data);
  }
};
