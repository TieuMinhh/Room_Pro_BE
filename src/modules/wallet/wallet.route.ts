import express from 'express';
import { walletController } from './wallet.controller';
import { authMiddlewares } from '~/middlewares/authMiddlewares';

const Router = express.Router();

Router.route('/')
    .get(authMiddlewares.isAuthorized, walletController.getWallet);

Router.route('/admin')
    .get(authMiddlewares.isAdmin, walletController.getWalletByAdmin);

export const walletRouter = Router;
