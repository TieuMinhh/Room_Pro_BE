import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { roomService } from "./room.service";

const getRoomsByDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: departmentId } = req.params;
    if (!departmentId) throw new Error("Department ID is required");
    const rooms = await roomService.getRoomsByDepartment(departmentId as string);
    res.status(StatusCodes.OK).json(rooms);
  } catch (error: any) {
    next(error);
  }
};

const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.jwtDecoded?._id;
    if (!ownerId) throw new Error("Unauthorized");
    const newRoom = await roomService.createRoom(req.body, ownerId);
    res.status(StatusCodes.CREATED).json({
      message: "Tạo phòng và đơn thuê thành công!",
      room: newRoom
    });
  } catch (error) {
    next(error);
  }
};

const deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("ID is required");
    const result = await roomService.deleteRoom(id as string);
    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    next(error);
  }
};

const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("ID is required");
    const updatedRoom = await roomService.updateRoom(id as string, req.body);
    res.status(StatusCodes.OK).json({
      message: 'Cập nhật phòng thành công',
      room: updatedRoom
    });
  } catch (error: any) {
    next(error);
  }
};

const getRoomById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error("ID is required");
    const room = await roomService.getRoomById(id as string);
    res.status(StatusCodes.OK).json(room);
  } catch (error: any) {
    next(error);
  }
};

const getAllRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtDecoded?._id;
    if (!userId) throw new Error("Unauthorized");
    const results = await roomService.getAllOwnerRooms(userId);
    res.status(StatusCodes.OK).json(results);
  } catch (error) {
    next(error);
  }
};

export const roomController = {
  getRoomsByDepartment,
  createRoom,
  deleteRoom,
  updateRoom,
  getRoomById,
  getAllRooms
};
