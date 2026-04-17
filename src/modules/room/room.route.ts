import express from 'express';
import { roomController } from './room.controller';
import { authMiddlewares } from '~/middlewares/authMiddlewares';

const router = express.Router();

router.route('/')
    .post(authMiddlewares.isAuthorized, roomController.createRoom)
    .get(authMiddlewares.isAuthorized, roomController.getAllRooms);

router.route('/:id')
    .put(authMiddlewares.isAuthorized, roomController.updateRoom)
    .delete(authMiddlewares.isAuthorized, roomController.deleteRoom)
    .get(authMiddlewares.isAuthorized, roomController.getRoomById);

export const roomRouter = router;
