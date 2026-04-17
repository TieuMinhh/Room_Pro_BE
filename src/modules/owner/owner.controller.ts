import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ownerService } from './owner.service';

const updateProfile = async (req: Request, res: Response, Next: NextFunction) => {
  try {
    const userId = (req as any).jwtDecoded._id;
    const result = await ownerService.updateProfile(userId, req.body, req.file);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    Next(error);
  }
};

const getProfile = async (req: Request, res: Response, Next: NextFunction) => {
  try {
    const userId = (req as any).jwtDecoded._id;
    const result = await ownerService.getProfile(userId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    Next(error);
  }
};

export const ownerController = {
  updateProfile,
  getProfile
};
