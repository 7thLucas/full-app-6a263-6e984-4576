import type { Request, Response } from "express";
import { OrdersService } from "./orders.service";
import { OrderStatus } from "./orders.model";

export async function listOrders(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query.status as OrderStatus | undefined;
    const orders = await OrdersService.list(status ? { status } : undefined);
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  try {
    const order = await OrdersService.getById(req.params.id);
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const order = await OrdersService.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateOrder(req: Request, res: Response): Promise<void> {
  try {
    const order = await OrdersService.update(req.params.id, req.body);
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteOrder(req: Request, res: Response): Promise<void> {
  try {
    await OrdersService.delete(req.params.id);
    res.json({ success: true, message: "Order deleted" });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.body;
    if (!Object.values(OrderStatus).includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status" });
      return;
    }
    const order = await OrdersService.updateStatus(req.params.id, status);
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getOrdersSummary(req: Request, res: Response): Promise<void> {
  try {
    const summary = await OrdersService.getSummary();
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
