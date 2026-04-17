import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { incidentalCostService } from "./incidental-cost.service";

const getAllIncidentalCosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        const results = await incidentalCostService.getIncidentalCostsForOwner(userId);
        res.status(StatusCodes.OK).json(results);
    } catch (error) {
        next(error);
    }
};

const createIncidentalCost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        const result = await incidentalCostService.createIncidentalCost(userId, req.body);
        res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
        next(error);
    }
};

const deleteIncidentalCost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        if (!id) throw new Error("ID is required");
        const result = await incidentalCostService.deleteIncidentalCost(id as string, userId);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const updateIncidentalCost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        if (!id) throw new Error("ID is required");
        const result = await incidentalCostService.updateIncidentalCost(id as string, userId, req.body);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const getAllIncidentalCostsByTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        const results = await incidentalCostService.getIncidentalCostsForTenant(userId);
        res.status(StatusCodes.OK).json(results);
    } catch (error) {
        next(error);
    }
};

export const incidentalCostsController = {
    getAllIncidentalCosts,
    createIncidentalCost,
    deleteIncidentalCost,
    updateIncidentalCost,
    getAllIncidentalCostsByTenant
};
