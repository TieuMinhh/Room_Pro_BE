import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { adminService } from './admin.service';

const getAllUsers = async (req: Request, res: Response, Next: NextFunction) => {
  try {
    const result = await adminService.getAllUsers();
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    Next(error);
  }
};

const deleteUser = async (req: Request, res: Response, Next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const currentUserId = (req as any).jwtDecoded._id;
    const result = await adminService.deleteUser(id, currentUserId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    Next(error);
  }
};

const restoreUser = async (req: Request, res: Response, Next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const currentUserId = (req as any).jwtDecoded._id;
    const result = await adminService.restoreUser(id, currentUserId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    Next(error);
  }
};

export const adminController = {
  getAllUsers,
  deleteUser,
  restoreUser
};
