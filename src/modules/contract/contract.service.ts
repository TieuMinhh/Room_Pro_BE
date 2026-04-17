import { contractRepository } from './contract.repository';
import { orderRepository } from '~/modules/order/order.repository';
import { roomRepository } from '~/modules/room/room.repository';
import { cloudinaryProvider } from '~/providers/CloudinaryProvider';
import { sendEmail } from '~/providers/MailProvider';
import { WEBSITE_DOMAIN } from '~/utils/constants';
import { generateContractAppendixHTML } from '~/utils/form-html';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { pickUser } from '~/utils/algorithms';

const flattenUser = (account: any) => {
  if (!account) return null;
  const profile = account.profile || {};
  return {
    ...account.toObject ? account.toObject() : account,
    ...profile.toObject ? profile.toObject() : profile,
    _id: account._id
  };
};

export const contractService = {
  createContract: async (body: any, file?: Express.Multer.File) => {
    const { orderId, deposit, content, signature_A } = body;
    if (!file) throw new ApiError(StatusCodes.BAD_REQUEST, "File is required");

    const order = await orderRepository.findByIdActivePopulated(orderId);
    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found!');

    const fileNameWithExt = path.parse(file.originalname).name + path.extname(file.originalname);
    const sanitized = fileNameWithExt.replace(/[^a-zA-Z0-9.-]/g, '_');
    const resultUpload = await cloudinaryProvider.streamUploadFile(file.buffer, 'contracts', sanitized);

    const dataNew = {
      tenantId: (order.tenantId as any).map((t: any) => t._id),
      ownerId: (order.ownerId as any)._id,
      roomId: (order.roomId as any)._id,
      content,
      signature_A,
      contractURI: resultUpload.secure_url,
      deposit: parseInt(deposit),
      image1CCCD: "",
      image2CCCD: "",
      status: 'pending_signature' as any,
    };

    const newContract = await contractRepository.create(dataNew);
    await orderRepository.updateById(orderId, { contract: newContract._id } as any);

    const html = generateContractAppendixHTML(WEBSITE_DOMAIN, order.tenantId as any[], dataNew.contractURI);

    try {
      await Promise.all([
        sendEmail('RoomRentPro', (order.ownerId as any).email, "Tạo hợp đồng trọ", html),
        ...(order.tenantId as any[]).map(tenant => sendEmail('RoomRentPro', tenant.email, "Tạo hợp đồng trọ", html)),
      ]);
    } catch (error) {
      console.error("Failed to send contract emails:", error);
    }

    return { message: "Created successfully" };
  },

  getContractsByTenantId: async (tenantId: string) => {
    const contracts = await contractRepository.findByTenantId(tenantId);
    return contracts.map(c => ({
      _id: c._id,
      tenant: (c.tenantId as any).map((t: any) => pickUser(flattenUser(t))),
      owner: pickUser(flattenUser(c.ownerId)),
      room: c.roomId,
      contractURI: c.contractURI,
      deposit: c.deposit,
      reason: c.reason,
      image1CCCD: c.image1CCCD,
      image2CCCD: c.image2CCCD,
      status: c.status,
      paid: c.paid,
      createdAt: (c as any).createdAt
    }));
  },

  updateContract: async (id: string, body: any, file?: Express.Multer.File) => {
    if (file) {
      const fileNameWithExt = path.parse(file.originalname).name + path.extname(file.originalname);
      const sanitized = fileNameWithExt.replace(/[^a-zA-Z0-9.-]/g, '_');
      const resultUpload = await cloudinaryProvider.streamUploadFile(file.buffer, 'contracts', sanitized);
      
      const dataUpdate = {
        signature_B: body.signature_B,
        image1CCCD: body.image1CCCD,
        image2CCCD: body.image2CCCD,
        contractURI: resultUpload.secure_url,
        status: 'pending_review' as any
      };
      await contractRepository.updateById(id, dataUpdate);
      return { message: 'Update contract successfully' };
    }

    const updated = await contractRepository.updateById(id, body);
    if (updated && body.paid) {
      await roomRepository.updateById(updated.roomId.toString(), { status: true } as any);
    }
    return { message: 'Update contract successfully' };
  }
};
