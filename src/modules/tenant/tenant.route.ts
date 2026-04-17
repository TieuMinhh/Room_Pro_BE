import express from "express";
import { tenantController } from "./tenant.controller";
import { authMiddlewares } from "~/middlewares/authMiddlewares";
import { multerUploadMiddlewares } from "~/middlewares/multerUploadMiddlewares";
import { authController } from "../auth/auth.controller";

const Router = express.Router();

Router.route("/")
    .get(tenantController.getAll);

Router.route("/login")
    .post(authController.loginTenant);

Router.route("/register")
    .post(authController.registerTenant);

Router.route("/profile")
    .put(authMiddlewares.isAuthorized, multerUploadMiddlewares.upload.single("avatar"), tenantController.updateProfile);

Router.route("/create-and-assign")
    .post(authMiddlewares.isAdmin, tenantController.createAndAssign);

Router.route("/:id")
    .delete(authMiddlewares.isAdmin, tenantController.deleteTenant)
    .patch(authMiddlewares.isAdmin, tenantController.restoreTenant);

export const tenantRouter = Router;
