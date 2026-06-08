import { OrderModel, OrderStatus } from "./orders.model";

export interface CreateOrderDto {
  customer: { name: string; phone?: string; email?: string };
  occasion?: string;
  arrangement_description?: string;
  flowers_requested?: string[];
  requested_delivery_date?: string;
  delivery_address?: string;
  total_price?: number;
  notes?: string;
  assigned_staff?: string;
}

export interface UpdateOrderDto extends Partial<CreateOrderDto> {
  status?: OrderStatus;
}

let orderCounter = 0;

async function generateOrderNumber(): Promise<string> {
  const count = await OrderModel.countDocuments();
  const year = new Date().getFullYear();
  const num = String(count + 1 + orderCounter++).padStart(4, "0");
  return `FLR-${year}-${num}`;
}

export class OrdersService {
  static async list(filters?: { status?: OrderStatus }) {
    const query: Record<string, any> = {};
    if (filters?.status) query.status = filters.status;
    return OrderModel.find(query).sort({ createdAt: -1 }).lean();
  }

  static async getById(id: string) {
    const order = await OrderModel.findById(id).lean();
    if (!order) throw new Error("Order not found");
    return order;
  }

  static async create(dto: CreateOrderDto) {
    const order_number = await generateOrderNumber();
    return OrderModel.create({
      ...dto,
      order_number,
      requested_delivery_date: dto.requested_delivery_date
        ? new Date(dto.requested_delivery_date)
        : undefined,
    });
  }

  static async update(id: string, dto: UpdateOrderDto) {
    const order = await OrderModel.findById(id);
    if (!order) throw new Error("Order not found");

    if (dto.requested_delivery_date) {
      (dto as any).requested_delivery_date = new Date(dto.requested_delivery_date);
    }

    Object.assign(order, dto);
    return order.save();
  }

  static async delete(id: string) {
    const result = await OrderModel.findByIdAndDelete(id);
    if (!result) throw new Error("Order not found");
    return result;
  }

  static async updateStatus(id: string, status: OrderStatus) {
    const order = await OrderModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!order) throw new Error("Order not found");
    return order;
  }

  static async getSummary() {
    const all = await OrderModel.find({}).lean();
    const pending = all.filter((o) => o.status === OrderStatus.Pending).length;
    const inProgress = all.filter((o) => o.status === OrderStatus.InProgress).length;
    const ready = all.filter((o) => o.status === OrderStatus.Ready).length;
    const fulfilled = all.filter((o) => o.status === OrderStatus.Fulfilled).length;
    const cancelled = all.filter((o) => o.status === OrderStatus.Cancelled).length;
    return { total: all.length, pending, inProgress, ready, fulfilled, cancelled };
  }
}
