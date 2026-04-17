import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import ApiError from "~/utils/ApiError";

const login = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    try {
        await schema.validateAsync(req.body, { abortEarly: false });
        next();
    } catch (error: any) {
        next(new ApiError(StatusCodes.BAD_REQUEST, error.message));
    }
};

export const userValidations = {
    login
};
