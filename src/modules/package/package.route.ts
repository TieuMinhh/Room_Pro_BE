import express from 'express';
import { packageController } from './package.controller';
import { authMiddlewares } from '~/middlewares/authMiddlewares';

const Router = express.Router();

Router.route('/')
    .get(packageController.getAllPackages)
    .post(authMiddlewares.isAdmin, packageController.createPackage);

Router.route('/:id')
    .put(authMiddlewares.isAdmin, packageController.updatePackage)
    .delete(authMiddlewares.isAdmin, packageController.deletePackage)
    .post(authMiddlewares.isAuthorized, packageController.buyPackage);

Router.route('/buy/:id')
    .post(authMiddlewares.isAuthorized, packageController.buyPackage);

export const packageRouter = Router;
