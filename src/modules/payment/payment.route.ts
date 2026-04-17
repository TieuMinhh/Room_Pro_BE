import express from 'express';
import { paymentController } from './payment.controller';
import { authMiddlewares } from '~/middlewares/authMiddlewares';

const router = express.Router();

router.route('/create-qr')
    .post(paymentController.createPayment);

router.route('/check-payment-vnpay')
    .get(paymentController.checkPayment);

router.route('/check-payment-contract')
    .get(authMiddlewares.isAuthorized, paymentController.checkPaymentContract);

router.route('/check-payment-bill')
    .get(authMiddlewares.isAuthorized, paymentController.checkPaymentBill);

router.route('/check-payment-incidental-cost')
    .get(authMiddlewares.isAuthorized, paymentController.checkPaymentIncidentalCost);

export const paymentRouter = router;
