import express from 'express';
import { ownerController } from './owner.controller';
import { authMiddlewares } from '~/middlewares/authMiddlewares';
import { multerUploadMiddlewares } from '~/middlewares/multerUploadMiddlewares';

const Router = express.Router();

Router.use(authMiddlewares.isAuthorized);

Router.get('/profile', ownerController.getProfile);
Router.put('/profile', multerUploadMiddlewares.upload.single('avatar'), ownerController.updateProfile);

export const ownerRoute = Router;
