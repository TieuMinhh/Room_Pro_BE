import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { departmentService } from './department.service';

const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.jwtDecoded?._id;
    if (!ownerId) throw new Error('Unauthorized');
    const newDepartment = await departmentService.createDepartment(req.body, ownerId);
    res.status(StatusCodes.CREATED).json(newDepartment);
  } catch (error: any) {
    next(error);
  }
};

const getDepartmentsByOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.jwtDecoded?._id;
    if (!userId) throw new Error('Unauthorized');
    const departments = await departmentService.getDepartmentsByOwner(userId);
    res.status(StatusCodes.OK).json(departments);
  } catch (error: any) {
    next(error);
  }
};

const updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    if (!id) throw new Error("ID is required");
    const updatedDepartment = await departmentService.updateDepartment(id as string, req.body);
    res.status(StatusCodes.OK).json(updatedDepartment);
  } catch (error: any) {
    next(error);
  }
};

const deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    if (!id) throw new Error("ID is required");
    const result = await departmentService.deleteDepartment(id as string);
    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    next(error);
  }
};

const getDepartmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    if (!id) throw new Error("ID is required");
    const department = await departmentService.getDepartmentById(id as string);
    res.status(StatusCodes.OK).json(department);
  } catch (error: any) {
    next(error);
  }
};

export const departmentController = {
  createDepartment,
  getDepartmentsByOwner,
  updateDepartment,
  deleteDepartment,
  getDepartmentById
};
