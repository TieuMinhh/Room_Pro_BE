import { VNPay, ProductCode, VnpLocale, dateFormat, ignoreLogger } from 'vnpay';
import { env } from '~/config/environment';
import { v4 as uuidv4 } from 'uuid';
import { orderRepository } from '~/modules/order/order.repository';
import { transactionRepository } from '~/modules/transaction/transaction.repository';
import { contractRepository } from '~/modules/contract/contract.repository';
import { roomRepository } from '~/modules/room/room.repository';
import { walletRepository } from '~/modules/wallet/wallet.repository';
import { billRepository } from '~/modules/bill/bill.repository';
import { incidentalCostRepository } from '~/modules/incidental-cost/incidental-cost.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import dayjs from 'dayjs';
import { WEBSITE_DOMAIN } from '~/utils/constants';

export const paymentService = {
  createPaymentUrl: async (data: any, ip: string, typePayment: string) => {
    // Hardcode sandbox values for testing to avoid env issues
    const TMN_CODE = 'O9F6Y3N2';
    const SECRET = 'O9NRMTAYCZXQHVYIYKUPFUTXTYUPGRLC';
    const HOST = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

    const vnpay = new VNPay({
      tmnCode: TMN_CODE,
      secureSecret: SECRET,
      vnpayHost: HOST,
      testMode: true,
      hashAlgorithm: 'SHA512' as any,
      loggerFn: ignoreLogger,
    });

    const returnUrl = typePayment === 'contract' ? 'http://localhost:8081/api/v1/payment/check-payment-contract' :
      typePayment === 'bill' ? 'http://localhost:8081/api/v1/payment/check-payment-bill' :
        typePayment === 'incidentalCost' ? 'http://localhost:8081/api/v1/payment/check-payment-incidental-cost' :
          'http://localhost:8081/api/v1/payment/check-payment-vnpay';

    const url = await vnpay.buildPaymentUrl({
      vnp_Amount: Number(data.amount), // The library handles amount * 100 if we pass it as a number and use certain versions
      vnp_IpAddr: ip || '127.0.0.1',
      vnp_TxnRef: uuidv4(),
      vnp_OrderInfo: data._id,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(new Date(Date.now() + 15 * 60 * 1000)),
    });

    // console.log("VNPAY URL (HARDCODED):", url);
    return url;
  },

  processContractPayment: async (query: any, userId: string) => {
    const orderRoom = await orderRepository.findByIdActivePopulated(query.vnp_OrderInfo);
    if (!orderRoom) throw new ApiError(StatusCodes.NOT_FOUND, "Order not found");

    const amount = Number(query.vnp_Amount) / 100;
    const success = query.vnp_ResponseCode === '00';

    const transaction = {
      receiverId: orderRoom.ownerId as any,
      senderId: userId as any,
      amount,
      bank: query.vnp_BankCode,
      orderInfo: query.vnp_OrderInfo as any,
      cardType: query.vnp_CardType,
      description: `Thanh toán thuê phòng trọ từ ${dayjs(orderRoom.startAt).format('DD/MM/YYYY')} - ${dayjs(orderRoom.endAt).format('DD/MM/YYYY')}`,
      txnRef: query.vnp_TxnRef,
      status: success ? 'success' as any : 'failed' as any,
    };

    if (success) {
      await transactionRepository.create(transaction);
      if (orderRoom.contract) {
        await contractRepository.updateById(orderRoom.contract.toString(), { paid: true });
      }
      await roomRepository.updateById((orderRoom.roomId as any)._id.toString(), { status: true } as any);
      await walletRepository.incrementBalance(orderRoom.ownerId.toString(), amount);
      return `${WEBSITE_DOMAIN}/payment/success`;
    }
    return `${WEBSITE_DOMAIN}/payment/error`;
  },

  processBillPayment: async (query: any, userId: string) => {
    const bill = await billRepository.findByIdPopulated(query.vnp_OrderInfo);
    if (!bill) throw new ApiError(StatusCodes.NOT_FOUND, "Bill not found");

    const amount = Number(query.vnp_Amount) / 100;
    const success = query.vnp_ResponseCode === '00';

    const transaction = {
      receiverId: bill.ownerId as any,
      senderId: userId as any,
      amount,
      bank: query.vnp_BankCode,
      orderInfo: query.vnp_OrderInfo as any,
      cardType: query.vnp_CardType,
      description: `Thanh toán thuê hóa đơn tháng ${dayjs(bill.time).format('MM/YYYY')} cho phòng ${(bill.roomId as any).roomId} - ${(bill.roomId as any).departmentId?.name}`,
      txnRef: query.vnp_TxnRef,
      status: success ? 'success' as any : 'failed' as any,
    };

    if (success) {
      await transactionRepository.create(transaction);
      await billRepository.updateById(bill._id as string, { prepay: amount, isPaid: true });
      await walletRepository.incrementBalance(bill.ownerId.toString(), amount);
      // Update order meter numbers
      await orderRepository.updateById((bill.roomId as any)._id.toString(), { // Assuming roomId used correctly in old controller
        oldElectricNumber: (bill as any).newElectricity,
        oldWaterNumber: (bill as any).newWater
      } as any);
      return `${WEBSITE_DOMAIN}/payment/success?type=bill`;
    }
    return `${WEBSITE_DOMAIN}/payment/error`;
  },

  processIncidentalPayment: async (query: any, userId: string) => {
    const incidentalCost = await incidentalCostRepository.findById(query.vnp_OrderInfo);
    if (!incidentalCost) throw new ApiError(StatusCodes.NOT_FOUND, "Incidental cost not found");

    const amount = Number(query.vnp_Amount) / 100;
    const success = query.vnp_ResponseCode === '00';

    const transaction = {
      receiverId: incidentalCost.ownerId as any,
      senderId: userId as any,
      amount,
      bank: query.vnp_BankCode,
      orderInfo: query.vnp_OrderInfo as any,
      cardType: query.vnp_CardType,
      description: `Thanh toán chi phí phát sinh do ${incidentalCost.description} của phòng ${(incidentalCost.roomId as any)?.roomId}`,
      txnRef: query.vnp_TxnRef,
      status: success ? 'success' as any : 'failed' as any,
    };

    if (success) {
      await transactionRepository.create(transaction);
      await incidentalCostRepository.updateById(incidentalCost._id as string, { isPaid: true });
      await walletRepository.incrementBalance(incidentalCost.ownerId.toString(), amount);
      return `${WEBSITE_DOMAIN}/payment/success?type=incidentalCost`;
    }
    return `${WEBSITE_DOMAIN}/payment/error`;
  }
};
