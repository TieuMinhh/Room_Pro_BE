import { adminRepository } from './admin.repository';
import { accountRepository } from '../account/account.repository';
import { ownerRepository } from '../owner/owner.repository';
import { tenantRepository } from '../tenant/tenant.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { pickUser } from '~/utils/algorithms';
import { generateDeleteAccountHTML, generateRestoreAccountHTML } from '~/utils/form-html';
import { sendEmail } from '~/providers/MailProvider';

const flattenUser = (account: any) => {
  if (!account) return null;
  const profile = account.profile || {};
  return {
    ...account.toObject(),
    ...profile.toObject ? profile.toObject() : profile,
    _id: account._id
  };
};

export const adminService = {
  getAllUsers: async () => {
    const accounts = await adminRepository.findAll();
    return accounts.map(acc => pickUser(flattenUser(acc)));
  },

  deleteUser: async (id: string, currentUserId: string) => {
    if (id === currentUserId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn không thể tự xoá tài khoản của chính mình.');
    }

    const account = await accountRepository.findById(id);
    if (!account) throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại.');

    account._destroy = true;
    await account.save({ validateBeforeSave: false });

    // Mark profile as destroyed based on role
    if (account.role === 'owner') {
      await ownerRepository.updateProfile(id, { _destroy: true });
    } else if (account.role === 'tenant') {
      await tenantRepository.updateProfile(id, { _destroy: true });
    } else {
      await adminRepository.updateProfile(id, { _destroy: true });
    }

    const profile: any = account.profile || {};
    try {
      const html = generateDeleteAccountHTML('RoomRentPro', profile.displayName || account.email);
      await sendEmail('RoomRentPro', account.email, 'Thông báo xoá tài khoản', html);
    } catch (emailError) {
      console.error('Failed to send account deletion email:', emailError);
    }

    return { message: 'Xoá người dùng thành công.' };
  },

  restoreUser: async (id: string, currentUserId: string) => {
    if (id === currentUserId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn không thể tự khôi phục tài khoản của chính mình.');
    }

    const account = await accountRepository.findById(id);
    if (!account) throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại.');

    account._destroy = false;
    await account.save({ validateBeforeSave: false });

    // Mark profile as active based on role
    if (account.role === 'owner') {
      await ownerRepository.updateProfile(id, { _destroy: false });
    } else if (account.role === 'tenant') {
      await tenantRepository.updateProfile(id, { _destroy: false });
    } else {
      await adminRepository.updateProfile(id, { _destroy: false });
    }

    const profile: any = account.profile || {};
    try {
      const html = generateRestoreAccountHTML('RoomRentPro', profile.displayName || account.email);
      await sendEmail('RoomRentPro', account.email, 'Thông báo khôi phục tài khoản', html);
    } catch (emailError) {
      console.error('Failed to send account restoration email:', emailError);
    }

    return { message: 'Khôi phục tài khoản thành công!' };
  }
};
