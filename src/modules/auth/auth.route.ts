import express from 'express';
import { authController } from './auth.controller';

const Router = express.Router();

Router.post('/login', authController.login);
Router.post('/logout', authController.logout);
Router.post('/tenant/login', authController.loginTenant);
Router.post('/tenant/register', authController.registerTenant);
Router.post('/refresh-token', authController.refreshToken);

export const authRoute = Router;
