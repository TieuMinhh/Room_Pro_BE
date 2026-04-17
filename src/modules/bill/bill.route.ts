import express from "express";
import { billController } from "./bill.controller";
import { authMiddlewares } from "~/middlewares/authMiddlewares";

const router = express.Router();

router.route("/")
    .get(authMiddlewares.isAuthorized, billController.getBills)
    .post(authMiddlewares.isAuthorized, billController.createBill);

router.route("/tenant")
    .get(authMiddlewares.isAuthorized, billController.getBillsByTenant);

router.route("/send-mail")
    .post(authMiddlewares.isAdmin, billController.sendMail);

router.route("/:id")
    .get(authMiddlewares.isAuthorized, billController.getBillById)
    .put(authMiddlewares.isAuthorized, billController.updateBill)
    .delete(authMiddlewares.isAuthorized, billController.deleteBill);


export const billRouter = router;
