import mongoose from 'mongoose';
import { packageRepository } from './package.repository';
import { walletRepository } from '~/modules/wallet/wallet.repository';
import { transactionRepository } from '~/modules/transaction/transaction.repository';
import { accountRepository } from '../account/account.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';
import { env } from '~/config/environment';

const ADMIN_USER_ID = env.ADMIN_USER_ID;

export const packageService = {
  createPackage: async (data: any) => {
    return await packageRepository.create(data);
  },

  getAllPackages: async () => {
    return await packageRepository.findAllActive();
  },

  updatePackage: async (id: string, data: any) => {
    return await packageRepository.updateById(id, data);
  },

  deletePackage: async (id: string) => {
    return await packageRepository.softDelete(id);
  },

  buyPackage: async (userId: string, packageId: string) => {
    if (!ADMIN_USER_ID) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Admin wallet configuration missing");

    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        // 1. Get package, user wallet, admin wallet
        const pkg = await packageRepository.findById(packageId);
        if (!pkg) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy gói.');

        // Using walletRepository (assumed to have session support)
        const userWallet = await walletRepository.findByUserId(userId);
        const adminWallet = await walletRepository.findByUserId(ADMIN_USER_ID);

        if (!userWallet) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy ví người dùng.');
        if (!adminWallet) throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy ví admin.');

        // 2. Securely subtract balance
        // Note: Repository methods might need to handle session
        const updatedUserWallet = await mongoose.model('Wallet').findOneAndUpdate(
          { _id: userWallet._id, balance: { $gte: pkg.price } },
          { $inc: { balance: -pkg.price } },
          { new: true, session }
        );
        if (!updatedUserWallet) {
          throw new ApiError(StatusCodes.PAYMENT_REQUIRED, 'Số dư không đủ hoặc lỗi khi cập nhật.');
        }

        // 3. Add to admin wallet
        await mongoose.model('Wallet').updateOne(
          { _id: adminWallet._id },
          { $inc: { balance: pkg.price } },
          { session }
        );

        // 4. Create transaction record
        await transactionRepository.create({
          senderId: userId as any,
          receiverId: ADMIN_USER_ID as any,
          amount: pkg.price,
          txnRef: uuidv4(),
          orderInfo: packageId,
          description: `Nâng cấp gói ${pkg.name}`,
          status: 'success',
          bank: '-',
          cardType: '-'
        } as any);

        // 5. Update user expiration
        const user = await accountRepository.findById(userId);
        if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

        const now = new Date();
        const baseTime = user.timeExpired && user.timeExpired > now
          ? new Date(user.timeExpired)
          : now;

        baseTime.setMonth(baseTime.getMonth() + pkg.availableTime);
        
        await accountRepository.update(userId, { timeExpired: baseTime });
      });

      return { message: 'Thanh toán gói thành công!' };
    } catch (error) {
      throw error;
    } finally {
      await session.endSession();
    }
  }
};
