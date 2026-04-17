import { accountRepository } from '../account/account.repository';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { JwtProvider } from '~/providers/JwtProvider';
import { env } from '~/config/environment';
import { pickUser } from '~/utils/algorithms';
import TenantModel from '../tenant/tenant.model';

const flattenUser = (account: any) => {
  if (!account) return null;
  const profile = account.profile || {};
  return {
    ...account.toObject(),
    ...profile.toObject ? profile.toObject() : profile,
    _id: account._id
  };
};

export const authService = {
  login: async (email: string, password: string, expectedRole?: string) => {
    const account = await accountRepository.findByEmail(email);
    if (!account) throw new ApiError(StatusCodes.BAD_REQUEST, 'Email is not exist!');
    if (!account.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'This account is not activated!');

    if (expectedRole && account.role !== expectedRole) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied for this role!');
    }

    if (!account.password || !bcrypt.compareSync(password, account.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'The email or password is incorrect!');
    }

    const userInfo = { _id: account._id, email: account.email, role: account.role };

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
      role: account.role
    };
  },

  registerTenant: async (data: any) => {
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

    const populatedAccount = await accountRepository.findById(account._id as string);
    return pickUser(flattenUser(populatedAccount));
  },

  refreshToken: async (refreshToken: string) => {
    try {
      const decoded = await JwtProvider.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE);
      const account = await accountRepository.findById(decoded._id);
      if (!account) throw new Error('Account not found');
      if (!account.isActive || account._destroy) throw new Error('Account is inactive');

      const userInfo = { _id: account._id, email: account.email, role: account.role };
      const accessToken = await JwtProvider.generateToken(
        userInfo,
        env.ACCESS_TOKEN_SECRET_SIGNATURE,
        env.ACCESS_TOKEN_LIFE
      );

      return {
        accessToken,
        ...pickUser(flattenUser(account))
      };
    } catch (error) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token is invalid or expired! Please login again.');
    }
  }
};
