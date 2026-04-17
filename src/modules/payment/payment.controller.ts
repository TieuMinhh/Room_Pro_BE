import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { paymentService } from "./payment.service";

const createPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await paymentService.createPaymentUrl(req.body, req.ip || "127.0.0.1", req.query.typePayment as string);
        res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
        next(error);
    }
};

const checkPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.query.vnp_ResponseCode !== '00') {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Payment failed" });
        }
        res.status(StatusCodes.OK).json({
            message: 'Payment check successful',
            data: req.query,
        });
    } catch (error) {
        next(error);
    }
};

const checkPaymentContract = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        const redirectUrl = await paymentService.processContractPayment(req.query, userId);
        res.redirect(redirectUrl);
    } catch (error) {
        next(error);
    }
};

const checkPaymentBill = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        const redirectUrl = await paymentService.processBillPayment(req.query, userId);
        res.redirect(redirectUrl);
    } catch (error) {
        next(error);
    }
};

const checkPaymentIncidentalCost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        const redirectUrl = await paymentService.processIncidentalPayment(req.query, userId);
        res.redirect(redirectUrl);
    } catch (error) {
        next(error);
    }
};

export const paymentController = {
    createPayment,
    checkPayment,
    checkPaymentContract,
    checkPaymentBill,
    checkPaymentIncidentalCost
};
