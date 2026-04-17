import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { LIMIT_COMMON_FILE_SIZE } from "~/utils/validators";

const customizFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  // Add custom filtering logic if needed
  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customizFileFilter
});

export const multerUploadMiddlewares = { upload };
