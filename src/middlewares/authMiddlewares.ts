import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { env } from "~/config/environment";
import { JwtProvider } from "~/providers/JwtProvider";
import ApiError from "~/utils/ApiError";
import { USER_ROLES } from "~/utils/constants";

// Extend Express Request interface to include jwtDecoded
declare global {
  namespace Express {
    interface Request {
      jwtDecoded?: any;
    }
  }
}

//Middleware ensure user is authorized: authenticate jwt accessToken recived from frontend is correct or not
const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
  //get accessToken from cookie
  const clientToken = req.cookies?.accessToken;

  if (!clientToken) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized(Token not found)'));
  }
  try {
    //verify token
    const accessTokenDecoded = await JwtProvider.verifyToken(clientToken, env.ACCESS_TOKEN_SECRET_SIGNATURE);

    //if token is valid , save token to req to use later
    req.jwtDecoded = accessTokenDecoded;

    //allow next
    next();
  } catch (error: any) {
    //if accesToken is expired(hết hạn) return error 410 for FE to call api refeshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Token is expired!'));
      return;
    }

    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'));
  }
};

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  //get accessToken from cookie
  const clientToken = req.cookies?.accessToken;

  if (!clientToken) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized(Token not found)'));
  }
  try {
    //verify token
    const accessTokenDecoded = (await JwtProvider.verifyToken(clientToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)) as any;

    if (accessTokenDecoded.role !== USER_ROLES.ADMIN) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized(Not admin)'));
      return;
    }

    //if token is valid , save token to req to use later
    req.jwtDecoded = accessTokenDecoded;

    //allow next
    next();
  } catch (error: any) {
    //if accesToken is expired(hết hạn) return error 410 for FE to call api refeshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Token is expired!'));
      return;
    }

    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'));
  }
};

export const authMiddlewares = {
  isAuthorized,
  isAdmin
};
