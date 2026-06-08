import type { Request, Response } from "express";
import { DeliveriesService } from "./deliveries.service";
import { DeliveryStatus } from "./deliveries.model";

export async function listDeliveries(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query.status as DeliveryStatus | undefined;
    const date = req.query.date as string | undefined;
    const driver = req.query.driver as string | undefined;
    const deliveries = await DeliveriesService.list({ status, date, driver });
    res.json({ success: true, data: deliveries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getDelivery(req: Request, res: Response): Promise<void> {
  try {
    const delivery = await DeliveriesService.getById(req.params.id);
    res.json({ success: true, data: delivery });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function createDelivery(req: Request, res: Response): Promise<void> {
  try {
    const delivery = await DeliveriesService.create(req.body);
    res.status(201).json({ success: true, data: delivery });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateDelivery(req: Request, res: Response): Promise<void> {
  try {
    const delivery = await DeliveriesService.update(req.params.id, req.body);
    res.json({ success: true, data: delivery });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteDelivery(req: Request, res: Response): Promise<void> {
  try {
    await DeliveriesService.delete(req.params.id);
    res.json({ success: true, message: "Delivery deleted" });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function updateDeliveryStatus(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.body;
    if (!Object.values(DeliveryStatus).includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status" });
      return;
    }
    const delivery = await DeliveriesService.updateStatus(req.params.id, status);
    res.json({ success: true, data: delivery });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getDeliveriesSummary(req: Request, res: Response): Promise<void> {
  try {
    const summary = await DeliveriesService.getSummary();
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
