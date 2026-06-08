import { Router } from "express";
import { requireAuth } from "~/modules/authentication/authentication.middleware";
import {
  listInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventorySummary,
  getAtRiskInventory,
} from "./inventory.controller";

const router = Router();

router.get("/inventory/summary", requireAuth, getInventorySummary);
router.get("/inventory/at-risk", requireAuth, getAtRiskInventory);
router.get("/inventory", requireAuth, listInventory);
router.get("/inventory/:id", requireAuth, getInventoryItem);
router.post("/inventory", requireAuth, createInventoryItem);
router.put("/inventory/:id", requireAuth, updateInventoryItem);
router.delete("/inventory/:id", requireAuth, deleteInventoryItem);

export default router;
