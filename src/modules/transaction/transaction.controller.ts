import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { transactionService } from "./transaction.service";

const getTransactionsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const transactions = await transactionService.getTransactionsByUserId(userId as string);
        res.status(StatusCodes.OK).json(transactions);
    } catch (err: any) {
        next(err);
    }
};

const getTransactionByAdmin = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const adminTransactions = await transactionService.getAdminTransactions();
        res.status(StatusCodes.OK).json(adminTransactions);
    } catch (error: any) {
        next(error);
    }
};

export const transactionController = {
    getTransactionByAdmin,
    getTransactionsByUserId
};
