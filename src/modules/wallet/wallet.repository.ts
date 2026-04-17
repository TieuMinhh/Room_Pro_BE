import WalletModel, { IWallet } from './wallet.model';

export const walletRepository = {
  findOneByUserId: async (userId: string): Promise<IWallet | null> => {
    return await WalletModel.findOne({ userId });
  },

  findOneActiveByUserId: async (userId: string): Promise<IWallet | null> => {
    return await WalletModel.findOne({ userId, status: 'active' });
  },

  create: async (data: Partial<IWallet>): Promise<IWallet> => {
    return await WalletModel.create(data);
  },

  updateBalance: async (walletId: string, amount: number, session?: any): Promise<IWallet | null> => {
    return await WalletModel.findByIdAndUpdate(
      walletId,
      { $inc: { balance: amount } },
      { new: true, session }
    );
  },

  incrementBalance: async (userId: string, amount: number): Promise<IWallet | null> => {
    return await WalletModel.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true }
    );
  },

  findByUserId: async (userId: string): Promise<IWallet | null> => {
    return await WalletModel.findOne({ userId });
  }
};
