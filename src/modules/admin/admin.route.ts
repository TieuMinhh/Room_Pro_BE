import express from 'express';
import { adminController } from './admin.controller';
import { authMiddlewares } from '~/middlewares/authMiddlewares';

const Router = express.Router();

Router.use(authMiddlewares.isAuthorized);
Router.use(authMiddlewares.isAdmin);

Router.get('/all', adminController.getAllUsers);
Router.delete('/:id', adminController.deleteUser);
Router.patch('/restore/:id', adminController.restoreUser);

export const adminRoute = Router;
