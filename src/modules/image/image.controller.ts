import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { imageService } from "./image.service";

const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "No image file provided" });
        }
        const result = await imageService.uploadImage(file);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const imageController = {
  uploadImage
};
