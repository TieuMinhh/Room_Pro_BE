import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { packageService } from "./package.service";

const createPackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newPackage = await packageService.createPackage(req.body);
        res.status(StatusCodes.CREATED).json(newPackage);
    } catch (error) {
        next(error);
    }
};

const getAllPackages = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const packages = await packageService.getAllPackages();
        res.status(StatusCodes.OK).json(packages);
    } catch (error) {
        next(error);
    }
};

const updatePackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) throw new Error("ID is required");
        const updated = await packageService.updatePackage(id as string, req.body);
        res.status(StatusCodes.OK).json(updated);
    } catch (error) {
        next(error);
    }
};

const deletePackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) throw new Error("ID is required");
        const result = await packageService.deletePackage(id as string);
        res.status(StatusCodes.OK).json({ message: 'Xoá gói thành công' });
    } catch (error) {
        next(error);
    }
};

const buyPackage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        const packageId = req.params.id;
        if (!packageId) throw new Error("Package ID is required");
        const result = await packageService.buyPackage(userId, packageId as string);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const packageController = {
    getAllPackages,
    createPackage,
    updatePackage,
    deletePackage,
    buyPackage
};
