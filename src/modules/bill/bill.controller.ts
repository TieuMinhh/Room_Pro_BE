import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { billService } from "./bill.service";

const getBills = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        const bills = await billService.getBillsForOwner(userId);
        res.status(StatusCodes.OK).json(bills);
    } catch (error) {
        next(error);
    }
};

const createBill = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        const { roomId, date } = req.body;
        const result = await billService.createBill(roomId, date, userId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const getBillById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error("ID is required");
        const bill = await billService.getBillById(id as string);
        res.status(StatusCodes.OK).json(bill);
    } catch (error) {
        next(error);
    }
};

const updateBill = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        if (!id) throw new Error("ID is required");
        const updatedBill = await billService.updateBill(id as string, req.body);
        res.status(StatusCodes.OK).json(updatedBill);
    } catch (error) {
        next(error);
    }
};

const deleteBill = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        if (!id) throw new Error("ID is required");
        const result = await billService.deleteBill(id as string, userId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const getBillsByTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.jwtDecoded?._id;
        if (!tenantId) throw new Error("Unauthorized");
        const bills = await billService.getBillsForTenant(tenantId);
        res.status(StatusCodes.OK).json(bills);
    } catch (error) {
        next(error);
    }
};

const sendMail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { billId } = req.query;
        if (billId && typeof billId === 'string') {
            const bill = await billService.sendBillMail(billId);
            res.status(StatusCodes.OK).json(bill);
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "Missing billId" });
        }
    } catch (error) {
        next(error);
    }
};

export const billController = {
    getBills,
    createBill,
    getBillById,
    updateBill,
    deleteBill,
    getBillsByTenant,
    sendMail
};
