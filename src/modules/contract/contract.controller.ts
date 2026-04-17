import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { contractService } from "./contract.service";

const createContract = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await contractService.createContract(req.body, req.file);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const getContractsByTenantId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.jwtDecoded?._id;
    if (!tenantId) throw new Error("Unauthorized");
    const result = await contractService.getContractsByTenantId(tenantId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const updateContract = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await contractService.updateContract(id as string, req.body, req.file);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const contractController = {
  createContract,
  getContractsByTenantId,
  updateContract
};
