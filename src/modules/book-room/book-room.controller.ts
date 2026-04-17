import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { bookRoomService } from "./book-room.service";
import ApiError from "~/utils/ApiError";

const createBookRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tenantId = req.jwtDecoded?._id;
        if (!tenantId) throw new Error("Unauthorized");
        const result = await bookRoomService.createBookRoom(tenantId, req.body);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

const getBookRoomList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.jwtDecoded?._id;
        if (!userId) throw new Error("Unauthorized");
        const isRole = req.query.isRole as string || "";
        const results = await bookRoomService.getBookRooms(userId, isRole);
        res.status(StatusCodes.OK).json(results);
    } catch (error) {
        next(error);
    }
};

const updateBookRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, "BookRoom ID is required");
        const result = await bookRoomService.updateBookRoom(id as string, req.body);
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        next(error);
    }
};

export const bookRoomController = {
    createBookRoom,
    getBookRoomList,
    updateBookRoom
};
