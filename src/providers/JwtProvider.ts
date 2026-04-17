import jwt from 'jsonwebtoken';

const generateToken = async (userInfo: object, secretSignature: string, tokenLife: string | number): Promise<string> => {
  try {
    return jwt.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife as any });
  } catch (error: any) {
    throw new Error(error);
  }
};

const verifyToken = async (token: string, secretSignature: string): Promise<any> => {
  try {
    return jwt.verify(token, secretSignature);
  } catch (error: any) {
    throw new Error(error);
  }
};

export const JwtProvider = { generateToken, verifyToken };
