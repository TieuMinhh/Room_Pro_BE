import { ownerRepository } from './owner.repository';
import { accountRepository } from '../account/account.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { pickUser } from '~/utils/algorithms';
import bcrypt from 'bcryptjs';
import { cloudinaryProvider } from '~/providers/CloudinaryProvider';
import OwnerModel from './owner.model';
import TenantModel from '../tenant/tenant.model';
import AdminModel from '../admin/admin.model';

const flattenUser = (account: any) => {
  if (!account) return null;
  const profile = account.profile || {};
  return {
    ...account.toObject(),
    ...profile.toObject ? profile.toObject() : profile,
    _id: account._id
  };
};

export const ownerService = {
  updateProfile: async (userId: string, body: any, file?: Express.Multer.File) => {
    const account = await accountRepository.findById(userId);
    if (!account) throw new ApiError(StatusCodes.NOT_FOUND, 'Owner not found');

    const profileUpdateData = { ...body };
    const accountUpdateData: any = {};

    // Remove immutable or sensitive fields that shouldn't be in the profile update payload
    const protectedFields = ['_id', 'id_account', 'role', 'email', 'createdAt', 'updatedAt', '__v', 'isActive', '_destroy', 'accessToken', 'refreshToken'];
    protectedFields.forEach(field => delete profileUpdateData[field]);

    if (file) {
      const result = await cloudinaryProvider.streamUpload(file.buffer, 'users');
      profileUpdateData.avatar = result.secure_url;
    }

    if (body.currentPassword && body.newPassword) {
      if (!account.password || !bcrypt.compareSync(body.currentPassword, account.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Mật khẩu hiện tại không chính xác!');
      }
      accountUpdateData.password = bcrypt.hashSync(body.newPassword, 10);
      delete profileUpdateData.currentPassword;
      delete profileUpdateData.newPassword;
    }

    // Validation: Min age 16
    if (profileUpdateData.dateOfBirth) {
      const dob = new Date(profileUpdateData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 16) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn phải từ 16 tuổi trở lên mới được tham gia hệ thống!');
      }
    }

    // Validation: Unique CCCD
    if (profileUpdateData.CCCD) {
      const [existingOwner, existingTenant, existingAdmin] = await Promise.all([
        OwnerModel.findOne({ CCCD: profileUpdateData.CCCD, id_account: { $ne: userId } }),
        TenantModel.findOne({ CCCD: profileUpdateData.CCCD }),
        AdminModel.findOne({ CCCD: profileUpdateData.CCCD })
      ]);

      if (existingOwner || existingTenant || existingAdmin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Số CCCD đã được sử dụng bởi một tài khoản khác!');
      }
    }

    // Update Account
    if (Object.keys(accountUpdateData).length > 0) {
      await accountRepository.update(userId, accountUpdateData);
    }

    // Update Profile
    await ownerRepository.updateProfile(userId, profileUpdateData);

    const updatedAccount = await accountRepository.findById(userId);
    return pickUser(flattenUser(updatedAccount));
  },

  getProfile: async (userId: string) => {
    const account = await accountRepository.findById(userId);
    if (!account) throw new ApiError(StatusCodes.NOT_FOUND, 'Owner not found');
    return pickUser(flattenUser(account));
  }
};
