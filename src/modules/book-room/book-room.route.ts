import express from 'express';
import { bookRoomController } from './book-room.controller';
import { authMiddlewares } from '~/middlewares/authMiddlewares';

const router = express.Router();

router.route('/')
    .post(authMiddlewares.isAuthorized, bookRoomController.createBookRoom)
    .get(authMiddlewares.isAuthorized, bookRoomController.getBookRoomList);

router.route('/:id')
    .put(authMiddlewares.isAuthorized, bookRoomController.updateBookRoom);

export const bookRoomRouter = router;
