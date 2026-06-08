import type { Request, Response } from "express";
import { InventoryService } from "./inventory.service";
import { FlowerStatus } from "./inventory.model";

export async function listInventory(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query.status as FlowerStatus | undefined;
    const items = await InventoryService.list(status ? { status } : undefined);
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getInventoryItem(req: Request, res: Response): Promise<void> {
  try {
    const item = await InventoryService.getById(req.params.id);
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function createInventoryItem(req: Request, res: Response): Promise<void> {
  try {
    const item = await InventoryService.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateInventoryItem(req: Request, res: Response): Promise<void> {
  try {
    const item = await InventoryService.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteInventoryItem(req: Request, res: Response): Promise<void> {
  try {
    await InventoryService.delete(req.params.id);
    res.json({ success: true, message: "Item deleted" });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function getInventorySummary(req: Request, res: Response): Promise<void> {
  try {
    const summary = await InventoryService.getSummary();
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAtRiskInventory(req: Request, res: Response): Promise<void> {
  try {
    const threshold = parseInt(String(req.query.threshold ?? "3"), 10);
    const items = await InventoryService.getAtRiskItems(threshold);
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
