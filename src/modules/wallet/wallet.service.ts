import { walletRepository } from './wallet.repository';
import { env } from '~/config/environment';

const ADMIN_USER_ID = env.ADMIN_USER_ID;

export const walletService = {
  getWalletByUserId: async (userId: string) => {
    return await walletRepository.findOneByUserId(userId);
  },

  getAdminWallet: async () => {
    const wallet = await walletRepository.findOneActiveByUserId(ADMIN_USER_ID as string);
    return {
      walletBalance: wallet?.balance || 0
    };
  }
};
