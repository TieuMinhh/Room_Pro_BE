import express from 'express';
import { transactionController } from './transaction.controller';
import { authMiddlewares } from '~/middlewares/authMiddlewares';

const Router = express.Router();

Router.route('/user/:userId').get(transactionController.getTransactionsByUserId);

Router.route('/admin')
    .get(authMiddlewares.isAdmin, transactionController.getTransactionByAdmin);

export const transactionRouter = Router;
