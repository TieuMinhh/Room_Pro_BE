import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { accountRepository } from '../account/account.repository';
import { ownerService } from '../owner/owner.service';
import { tenantService } from '../tenant/tenant.service';
import { adminRepository } from '../admin/admin.repository';
import ApiError from '~/utils/ApiError';
import { pickUser } from '~/utils/algorithms';

const flattenUser = (account: any) => {
  if (!account) return null;
  const profile = account.profile || {};
  return {
    ...account.toObject(),
    ...profile.toObject ? profile.toObject() : profile,
    _id: account._id
  };
};

const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtDecoded?._id;
    if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');

    const account = await accountRepository.findById(userId);
    if (!account) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found');

    res.status(StatusCodes.OK).json(pickUser(flattenUser(account)));
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtDecoded?._id;
    const role = req.jwtDecoded?.role;
    if (!userId || !role) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');

    let result;
    if (role === 'owner') {
      result = await ownerService.updateProfile(userId, req.body, req.file);
    } else if (role === 'tenant') {
      result = await tenantService.updateProfile(userId, req.body, req.file);
    } else if (role === 'admin') {
      // Direct update for admin if needed, or implement adminService.updateProfile
      result = await adminRepository.updateProfile(userId, req.body);
      const updatedAccount = await accountRepository.findById(userId);
      result = pickUser(flattenUser(updatedAccount));
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid role for profile update');
    }

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const profileController = {
  getProfile,
  updateProfile
};
