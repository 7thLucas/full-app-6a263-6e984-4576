import { Router } from "express";
import { requireAuth } from "~/modules/authentication/authentication.middleware";
import {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrdersSummary,
} from "./orders.controller";

const router = Router();

router.get("/orders/summary", requireAuth, getOrdersSummary);
router.get("/orders", requireAuth, listOrders);
router.get("/orders/:id", requireAuth, getOrder);
router.post("/orders", requireAuth, createOrder);
router.put("/orders/:id", requireAuth, updateOrder);
router.patch("/orders/:id/status", requireAuth, updateOrderStatus);
router.delete("/orders/:id", requireAuth, deleteOrder);

export default router;
