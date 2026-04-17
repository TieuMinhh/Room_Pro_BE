import TransactionModel, { ITransaction } from './transaction.model';

export const transactionRepository = {
  findByUserId: async (userId: string): Promise<ITransaction[]> => {
    return await TransactionModel.find({
      $or: [
        { receiverId: userId },
        { senderId: userId }
      ]
    }).sort({ createdAt: -1 as any });
  },

  findByReceiverId: async (receiverId: string): Promise<ITransaction[]> => {
    return await TransactionModel.find({ receiverId })
      .populate("receiverId", "displayName email")
      .populate("senderId", "displayName email")
      .sort({ createdAt: -1 as any });
  },

  create: async (data: Partial<ITransaction>, session?: any): Promise<ITransaction> => {
    const result = await TransactionModel.create([data], { session });
    return result[0];
  }
};
