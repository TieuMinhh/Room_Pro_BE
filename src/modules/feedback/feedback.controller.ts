import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { feedbackService } from "./feedback.service";

const getFeedbacksByOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ownerId = req.jwtDecoded?._id;
        if (!ownerId) throw new Error("Unauthorized");
        const results = await feedbackService.getFeedbacksByOwner(ownerId);
        res.status(StatusCodes.OK).json(results);
    } catch (error) {
        next(error);
    }
};

const getMyFeedbacks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.jwtDecoded?._id;
    if (!tenantId) throw new Error("Unauthorized");
    const result = await feedbackService.getMyFeedbacks(tenantId);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

const replyToFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;
        if (!id) throw new Error("ID is required");
        const result = await feedbackService.replyToFeedback(id as string, reply);
        res.status(StatusCodes.OK).json({
            message: "Phản hồi thành công.",
            data: result,
        });
    } catch (err: any) {
        next(err);
    }
};

const getMyOwners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.jwtDecoded?._id;
    if (!tenantId) throw new Error("Unauthorized");
    const uniqueOwners = await feedbackService.getMyOwners(tenantId);
    res.status(StatusCodes.OK).json(uniqueOwners);
  } catch (err: any) {
    next(err);
  }
};

const createFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.jwtDecoded?._id;
    if (!tenantId) throw new Error("Unauthorized");
    const feedback = await feedbackService.createFeedback(tenantId, req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Feedback đã được gửi",
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const feedbackController = {
  getFeedbacksByOwner,
  replyToFeedback,
  createFeedback,
  getMyOwners,
  getMyFeedbacks
};
