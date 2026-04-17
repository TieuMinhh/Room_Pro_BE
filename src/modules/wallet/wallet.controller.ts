import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { walletService } from "./wallet.service";

const getWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error('Unauthorized');
        const wallet = await walletService.getWalletByUserId(userId);
        res.status(StatusCodes.OK).json(wallet);
    } catch (error) {
        next(error);
    }
};

const getWalletByAdmin = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await walletService.getAdminWallet();
    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const walletController = {
    getWallet,
    getWalletByAdmin
};
