import express from 'express';
import { profileController } from './profile.controller';
import { authMiddlewares } from '~/middlewares/authMiddlewares';
import { multerUploadMiddlewares } from '~/middlewares/multerUploadMiddlewares';

const Router = express.Router();

Router.route('/')
  .get(authMiddlewares.isAuthorized, profileController.getProfile)
  .put(authMiddlewares.isAuthorized, multerUploadMiddlewares.upload.single('avatar'), profileController.updateProfile);

export const profileRoute = Router;
