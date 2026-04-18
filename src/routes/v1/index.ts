import express from 'express';
import { authRoute } from '~/modules/auth/auth.route';
import { adminRoute } from '~/modules/admin/admin.route';
import { ownerRoute } from '~/modules/owner/owner.route';
import { orderRouter } from '~/modules/order';
import { departmentRouter } from '~/modules/department';
import { tenantRouter } from '~/modules/tenant';
import { feedbackRouter } from '~/modules/feedback';
import { contractRouter } from '~/modules/contract';
import { imageRouter } from '~/modules/image';
import { roomRouter } from '~/modules/room';
import { blogRouter } from '~/modules/blog';
import { bookRoomRouter } from '~/modules/book-room';
import { transactionRouter } from '~/modules/transaction';
import { walletRouter } from '~/modules/wallet';
import { paymentRouter } from '~/modules/payment';
import { billRouter } from '~/modules/bill';
import { packageRouter } from '~/modules/package';
import { incidentalCostRouter } from '~/modules/incidental-cost';
import { profileRoute } from '~/modules/profile/profile.route';
import { accountRepository } from '~/modules/account/account.repository';

const Router = express.Router();

Router.get('/status', (req, res) => {
  res.status(200).json({ message: 'Api v1 is ready (V2 Account-Profile Architecture)' });
});

Router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'RoomPro Server is running' });
});

Router.get('/time', async (req, res, next) => {
  try {
    const userId = req.jwtDecoded?._id;
    if (!userId) {
      return res.status(200).json({ timeExpired: null });
    }
    const account = await accountRepository.findById(userId);
    res.status(200).json({ timeExpired: account?.timeExpired || null });
  } catch (error) {
    next(error);
  }
});

// APIs
Router.use('/auth', authRoute);
Router.use('/users', authRoute); // Alias for legacy
Router.use('/admin', adminRoute);
Router.use('/owner', ownerRoute);
Router.use('/tenants', tenantRouter);
Router.use('/orders', orderRouter);
Router.use('/departments', departmentRouter);
Router.use('/feedbacks', feedbackRouter);
Router.use('/contracts', contractRouter);
Router.use('/images', imageRouter);
Router.use('/rooms', roomRouter);
Router.use('/blogs', blogRouter);
Router.use('/book-rooms', bookRoomRouter);
Router.use('/transaction', transactionRouter);
Router.use('/wallet', walletRouter);
Router.use('/payment', paymentRouter);
Router.use('/bills', billRouter);
Router.use('/packages', packageRouter);
Router.use('/incidental-costs', incidentalCostRouter);
Router.use('/profile', profileRoute);

export const APIs_V1 = Router;

