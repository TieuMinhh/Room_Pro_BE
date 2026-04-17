import { tenantRepository } from './tenant.repository';
import { orderRepository } from '~/modules/order/order.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { JwtProvider } from '~/providers/JwtProvider';
import { env } from '~/config/environment';
import { pickUser } from '~/utils/algorithms';
import { cloudinaryProvider } from '~/providers/CloudinaryProvider';
import { sendEmail } from '~/providers/MailProvider';
import { generateAccountInfoHTML, generateDeleteAccountHTML, generateRestoreAccountHTML } from '~/utils/form-html';
import { accountRepository } from '../account/account.repository';
import TenantModel from './tenant.model';
import OwnerModel from '../owner/owner.model';
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

export const tenantService = {
  getAll: async () => {
    const accounts = await tenantRepository.findAll();
    return accounts.map(acc => pickUser(flattenUser(acc)));
  },

  login: async (email: string, password: string) => {
    const account = await tenantRepository.findOneByEmail(email);
    if (!account) throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is not exist!');

    if (!account.password || !bcrypt.compareSync(password, account.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'The email or password is incorrect!');
    }

    const userInfo = { _id: account._id, email: account.email, role: "tenant" };

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    );

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    );

    return {
      accessToken,
      refreshToken,
      ...pickUser(flattenUser(account)),
      role: "tenant"
    };
  },

  register: async (data: any) => {
    const { email, password, displayName, phone } = data;
    const existingAccount = await accountRepository.findByEmail(email);
    if (existingAccount) throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã tồn tại !');

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // 1. Create Account
    const account = await accountRepository.create({
      email,
      password: hashedPassword,
      role: 'tenant',
      isActive: true,
      timeExpired: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    // 2. Create Profile
    await TenantModel.create({
      id_account: account._id,
      userName: email.split('@')[0],
      phone,
      displayName
    });

    const populatedAccount = await tenantRepository.findById(account._id as string);
    return pickUser(flattenUser(populatedAccount));
  },

  updateProfile: async (userId: string, body: any, file?: Express.Multer.File) => {
    const account = await accountRepository.findById(userId);
    if (!account) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

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
      const [existingTenant, existingOwner, existingAdmin] = await Promise.all([
        TenantModel.findOne({ CCCD: profileUpdateData.CCCD, id_account: { $ne: userId } }),
        OwnerModel.findOne({ CCCD: profileUpdateData.CCCD }),
        AdminModel.findOne({ CCCD: profileUpdateData.CCCD })
      ]);

      if (existingTenant || existingOwner || existingAdmin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Số CCCD đã được sử dụng bởi một tài khoản khác!');
      }
    }

    // Update Account
    if (Object.keys(accountUpdateData).length > 0) {
      await accountRepository.update(userId, accountUpdateData);
    }

    // Update Profile
    await tenantRepository.updateProfile(userId, profileUpdateData);

    const updatedAccount = await tenantRepository.findById(userId);
    return pickUser(flattenUser(updatedAccount));
  },

  createAndAssign: async (body: any) => {
    const { displayName, email, password, phone, orderId, startAt, endAt } = body;

    const existingAccount = await accountRepository.findByEmail(email);
    if (existingAccount) throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã tồn tại!');

    const hashedPassword = bcrypt.hashSync(password, 10);

    // 1. Create Account
    const account = await accountRepository.create({
      email,
      password: hashedPassword,
      role: 'tenant',
      isActive: true,
      timeExpired: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    // 2. Create Profile
    const newTenantProfile = await TenantModel.create({
      id_account: account._id,
      displayName,
      phone,
      userName: email.split('@')[0]
    });

    const order = await orderRepository.findByIdActive(orderId);
    if (!order) throw new ApiError(StatusCodes.NOT_FOUND, 'Đơn thuê không tồn tại!');

    await orderRepository.updateById(orderId, {
      tenantId: [account._id as any],
      startAt: startAt ? new Date(startAt) : undefined,
      endAt: endAt ? new Date(endAt) : undefined,
    });

    const html = generateAccountInfoHTML(
      'RoomRentPro',
      displayName,
      email,
      password,
      "Người thuê"
    );

    sendEmail('RoomRentPro', email, 'Chào mừng bạn đến với RoomRentPro', html);

    const fullTenantData = await tenantRepository.findById(account._id as string);
    return {
      message: 'Tạo tài khoản và gán phòng thành công',
      tenant: pickUser(flattenUser(fullTenantData))
    };
  },

  deleteTenant: async (id: string, currentUserId: string) => {
    if (id === currentUserId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn không thể tự xoá tài khoản của chính mình.');
    }

    const account = await tenantRepository.findOneActiveById(id);
    if (!account) throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại.');

    account._destroy = true;
    await account.save({ validateBeforeSave: false });

    // Mark profile as destroyed
    await tenantRepository.updateProfile(id, { _destroy: true });

    const profile: any = account.profile || {};
    const html = generateDeleteAccountHTML('RoomRentPro', profile.displayName || account.email);
    await sendEmail('RoomRentPro', account.email, 'Thông báo xoá tài khoản', html);

    return { message: 'Xoá người dùng và gửi email thành công.' };
  },

  restoreTenant: async (id: string, currentUserId: string) => {
    if (id === currentUserId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn không thể tự khôi phục tài khoản của chính mình.');
    }

    const account = await accountRepository.findById(id);
    if (!account) throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại.');

    account._destroy = false;
    await account.save({ validateBeforeSave: false });

    // Mark profile as active
    await tenantRepository.updateProfile(id, { _destroy: false });

    const profile: any = account.profile || {};
    const html = generateRestoreAccountHTML('RoomRentPro', profile.displayName || account.email);
    await sendEmail('RoomRentPro', account.email, 'Thông báo khôi phục tài khoản', html);

    return { message: 'Khôi phục thành công!' };
  }
};
