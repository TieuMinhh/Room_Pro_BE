import express from 'express';
import { departmentController } from './department.controller';
import { roomController } from '../room/room.controller';
import { authMiddlewares } from '~/middlewares/authMiddlewares';

const router = express.Router();

router.route('/')
    .post(authMiddlewares.isAuthorized, departmentController.createDepartment)
    .get(authMiddlewares.isAuthorized, departmentController.getDepartmentsByOwner);

router.route('/:id')
    .put(authMiddlewares.isAuthorized, departmentController.updateDepartment)
    .delete(authMiddlewares.isAuthorized, departmentController.deleteDepartment)
    .get(authMiddlewares.isAuthorized, departmentController.getDepartmentById);

router.route('/:id/rooms')
    .get(authMiddlewares.isAuthorized, roomController.getRoomsByDepartment);

export const departmentRouter = router;
