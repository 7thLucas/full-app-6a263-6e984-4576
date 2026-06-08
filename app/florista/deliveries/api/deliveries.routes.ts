import { Router } from "express";
import { requireAuth } from "~/modules/authentication/authentication.middleware";
import {
  listDeliveries,
  getDelivery,
  createDelivery,
  updateDelivery,
  deleteDelivery,
  updateDeliveryStatus,
  getDeliveriesSummary,
} from "./deliveries.controller";

const router = Router();

router.get("/deliveries/summary", requireAuth, getDeliveriesSummary);
router.get("/deliveries", requireAuth, listDeliveries);
router.get("/deliveries/:id", requireAuth, getDelivery);
router.post("/deliveries", requireAuth, createDelivery);
router.put("/deliveries/:id", requireAuth, updateDelivery);
router.patch("/deliveries/:id/status", requireAuth, updateDeliveryStatus);
router.delete("/deliveries/:id", requireAuth, deleteDelivery);

export default router;
