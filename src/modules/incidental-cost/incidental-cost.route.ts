import express from "express";
import { incidentalCostsController } from "./incidental-cost.controller";
import { authMiddlewares } from "~/middlewares/authMiddlewares";

const router = express.Router();

router.route("/")
    .get(authMiddlewares.isAuthorized, incidentalCostsController.getAllIncidentalCosts)
    .post(authMiddlewares.isAuthorized, incidentalCostsController.createIncidentalCost);

router.route("/tenant")
    .get(authMiddlewares.isAuthorized, incidentalCostsController.getAllIncidentalCostsByTenant);

router.route("/:id")
    .put(authMiddlewares.isAuthorized, incidentalCostsController.updateIncidentalCost)
    .delete(authMiddlewares.isAuthorized, incidentalCostsController.deleteIncidentalCost);

export const incidentalCostRouter = router;
