import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { orderService } from "./order.service";

const getOrderByOwnerId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ownerId = req.jwtDecoded?._id;
        if (!ownerId) throw new Error("Unauthorized");
        const results = await orderService.getOrdersByOwnerId(ownerId);
        res.status(StatusCodes.OK).json(results);
    } catch (error) {
        next(error);
    }
};

const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) throw new Error("ID is required");
        const orderUpload = await orderService.updateOrder(id as string, req.body);
        res.status(StatusCodes.OK).json(orderUpload);
    } catch (error) {
        next(error);
    }
};

const getTenantOrderList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ownerId = req.jwtDecoded?._id;
        if (!ownerId) throw new Error("Unauthorized");
        const uniqueTenants = await orderService.getUniqueTenantsByOwner(ownerId);
        res.status(StatusCodes.OK).json(uniqueTenants);
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ownerId = req.jwtDecoded?._id;
        if (!ownerId) throw new Error("Unauthorized");
        const id = req.params.id;
        if (!id) throw new Error("ID is required");
        const findBy = req.query.findBy as string;
        const result = await orderService.getOrderById(id as string, ownerId, findBy);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const getOrdersOfTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.jwtDecoded?._id;
        if (!tenantId) throw new Error("Unauthorized");
        const roomData = await orderService.getTenantRooms(tenantId);
        res.status(StatusCodes.OK).json(roomData);
    } catch (error) {
        next(error);
    }
};

const getTenantHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.jwtDecoded?._id;
        if (!tenantId) throw new Error("Unauthorized");
        const historyData = await orderService.getTenantRentalHistory(tenantId);
        res.status(StatusCodes.OK).json(historyData);
    } catch (error) {
        next(error);
    }
};

const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const isSave = req.query.isSave === 'true';
        const ownerId = req.jwtDecoded?._id;
        if (!ownerId) throw new Error("Unauthorized");

        const result = await orderService.deleteOrder(id as string, ownerId, isSave);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const orderController = {
    getOrderByOwnerId,
    updateOrder,
    getTenantOrderList,
    getOrderById,
    getOrdersOfTenant,
    getTenantHistory,
    deleteOrder
};
