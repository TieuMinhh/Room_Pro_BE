import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { tenantService } from "./tenant.service";
import ApiError from "~/utils/ApiError";
import ms from "ms";

const getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const tenants = await tenantService.getAll();
        res.status(StatusCodes.OK).json(tenants);
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
        const updatedUser = await tenantService.updateProfile(userId, req.body, req.file);
        res.status(StatusCodes.OK).json(updatedUser);
    } catch (error) {
        next(error);
    }
};

const createAndAssign = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await tenantService.createAndAssign(req.body);
        res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
        next(error);
    }
};

const deleteTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const currentUserId = req.jwtDecoded?._id;
        if (!currentUserId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
        const result = await tenantService.deleteTenant(id as string, currentUserId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const restoreTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const currentUserId = req.jwtDecoded?._id;
        if (!currentUserId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
        const result = await tenantService.restoreTenant(id as string, currentUserId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const tenantController = {
    getAll,
    deleteTenant,
    restoreTenant,
    updateProfile,
    createAndAssign
};
