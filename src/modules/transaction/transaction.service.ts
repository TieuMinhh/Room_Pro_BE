import { transactionRepository } from './transaction.repository';
import { env } from '~/config/environment';

const ADMIN_USER_ID = env.ADMIN_USER_ID;

export const transactionService = {
  getTransactionsByUserId: async (userId: string) => {
    return await transactionRepository.findByUserId(userId);
  },

  getAdminTransactions: async () => {
    return await transactionRepository.findByReceiverId(ADMIN_USER_ID as string);
  }
};
