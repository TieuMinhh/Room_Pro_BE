import express from "express";
import { blogController } from "./blog.controller";
import { authMiddlewares } from "~/middlewares/authMiddlewares";

const router = express.Router();

router.route("/")
    .get(blogController.getAllBlog);

router.route("/check-status/:roomId")
    .get(blogController.checkRoomStatus);

router.route("/:id")
    .get(blogController.getBlogById)
    .post(authMiddlewares.isAuthorized, blogController.addRoomToBlog)
    .delete(authMiddlewares.isAuthorized, blogController.removeRoomFromBlog);

export const blogRouter = router;
