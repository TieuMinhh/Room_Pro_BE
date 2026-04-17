import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { blogService } from "./blog.service";

const addRoomToBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomId = req.params.id;
    const ownerId = req.jwtDecoded?._id;
    if (!ownerId) throw new Error("Unauthorized");
    if (!roomId) throw new Error("Room ID is required");
    const result = await blogService.addRoomToBlog(roomId as string, ownerId, req.body);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const checkRoomStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params;
    if (!roomId) throw new Error("Room ID is required");
    const result = await blogService.checkRoomStatus(roomId as string);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const removeRoomFromBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomId = req.params.id;
    const ownerId = req.jwtDecoded?._id;
    if (!ownerId) throw new Error("Unauthorized");
    if (!roomId) throw new Error("Room ID is required");
    const result = await blogService.removeRoomFromBlog(roomId as string, ownerId);
    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    next(error);
  }
};

const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    if (!id) throw new Error("ID is required");
    const result = await blogService.getBlogById(id as string);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getAllBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await blogService.getAllBlogs();
    res.status(StatusCodes.OK).json(results);
  } catch (error) {
    next(error);
  }
};

export const blogController = {
  addRoomToBlog,
  checkRoomStatus,
  removeRoomFromBlog,
  getBlogById,
  getAllBlog
};
