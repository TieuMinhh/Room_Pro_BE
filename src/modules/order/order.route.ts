import express from 'express';
import { orderController } from './order.controller';
import { authMiddlewares } from '~/middlewares/authMiddlewares';

const Router = express.Router();

Router.route('/')
    .get(authMiddlewares.isAuthorized, orderController.getOrderByOwnerId);

Router.route('/owner')
    .get(authMiddlewares.isAuthorized, orderController.getOrderByOwnerId);

Router.route('/tenants')
    .get(authMiddlewares.isAuthorized, orderController.getTenantOrderList);

Router.route('/tenant')
    .get(authMiddlewares.isAuthorized, orderController.getOrdersOfTenant);

Router.route('/tenant/my-rooms')
    .get(authMiddlewares.isAuthorized, orderController.getOrdersOfTenant);

Router.route('/tenant/history')
    .get(authMiddlewares.isAuthorized, orderController.getTenantHistory);

Router.route('/:id')
    .put(authMiddlewares.isAuthorized, orderController.updateOrder)
    .delete(authMiddlewares.isAuthorized, orderController.deleteOrder)
    .get(authMiddlewares.isAuthorized, orderController.getOrderById);

export const orderRouter = Router;
