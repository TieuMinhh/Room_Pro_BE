import express from 'express';
import { contractController } from './contract.controller';
import { authMiddlewares } from '~/middlewares/authMiddlewares';
import { multerUploadMiddlewares } from '~/middlewares/multerUploadMiddlewares';

const Router = express.Router();

Router.route('/')
    .get(authMiddlewares.isAuthorized, contractController.getContractsByTenantId)
    .post(authMiddlewares.isAuthorized, multerUploadMiddlewares.upload.single('pdf'), contractController.createContract as any);

Router.route('/:id')
    .put(authMiddlewares.isAuthorized, multerUploadMiddlewares.upload.single('pdf'), contractController.updateContract as any);

export const contractRouter = Router;
