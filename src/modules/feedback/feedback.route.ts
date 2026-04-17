import express from "express";
import { feedbackController } from "./feedback.controller";
import { authMiddlewares } from "~/middlewares/authMiddlewares";

const Router = express.Router();

Router.route("/owner")
    .get(authMiddlewares.isAuthorized, feedbackController.getFeedbacksByOwner);

Router.route("/myfeedbacks")
    .get(authMiddlewares.isAuthorized, feedbackController.getMyFeedbacks);

Router.route("/me/owners")
    .get(authMiddlewares.isAuthorized, feedbackController.getMyOwners);

Router.route("/")
    .get(authMiddlewares.isAuthorized, feedbackController.getFeedbacksByOwner)
    .post(authMiddlewares.isAuthorized, feedbackController.createFeedback);

Router.route("/:id/reply")
    .put(authMiddlewares.isAuthorized, feedbackController.replyToFeedback);

export const feedbackRouter = Router;
