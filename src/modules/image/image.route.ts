import express from 'express';
import { imageController } from './image.controller';
import { multerUploadMiddlewares } from '~/middlewares/multerUploadMiddlewares';

const Router = express.Router();

Router.route('/upload')
    .post(multerUploadMiddlewares.upload.single('image'), imageController.uploadImage as any);

export const imageRouter = Router;
