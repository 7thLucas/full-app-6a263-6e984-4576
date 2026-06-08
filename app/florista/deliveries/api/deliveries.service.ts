import { DeliveryModel, DeliveryStatus } from "./deliveries.model";

export interface CreateDeliveryDto {
  order?: string;
  order_number?: string;
  customer_name?: string;
  delivery_address: string;
  scheduled_date: string;
  time_window?: string;
  driver_name?: string;
  driver_phone?: string;
  route_order?: number;
  notes?: string;
}

export interface UpdateDeliveryDto extends Partial<CreateDeliveryDto> {
  status?: DeliveryStatus;
}

export class DeliveriesService {
  static async list(filters?: { date?: string; driver?: string; status?: DeliveryStatus }) {
    const query: Record<string, any> = {};

    if (filters?.status) query.status = filters.status;
    if (filters?.driver) query.driver_name = { $regex: filters.driver, $options: "i" };
    if (filters?.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      query.scheduled_date = { $gte: start, $lte: end };
    }

    return DeliveryModel.find(query).sort({ scheduled_date: 1, route_order: 1 }).lean();
  }

  static async getById(id: string) {
    const delivery = await DeliveryModel.findById(id).lean();
    if (!delivery) throw new Error("Delivery not found");
    return delivery;
  }

  static async create(dto: CreateDeliveryDto) {
    return DeliveryModel.create({
      ...dto,
      scheduled_date: new Date(dto.scheduled_date),
    });
  }

  static async update(id: string, dto: UpdateDeliveryDto) {
    const delivery = await DeliveryModel.findById(id);
    if (!delivery) throw new Error("Delivery not found");

    if (dto.scheduled_date) {
      (dto as any).scheduled_date = new Date(dto.scheduled_date);
    }

    if (dto.status === DeliveryStatus.Delivered && !delivery.delivered_at) {
      (dto as any).delivered_at = new Date();
    }

    Object.assign(delivery, dto);
    return delivery.save();
  }

  static async delete(id: string) {
    const result = await DeliveryModel.findByIdAndDelete(id);
    if (!result) throw new Error("Delivery not found");
    return result;
  }

  static async updateStatus(id: string, status: DeliveryStatus) {
    const update: Record<string, any> = { status };
    if (status === DeliveryStatus.Delivered) update.delivered_at = new Date();
    const delivery = await DeliveryModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!delivery) throw new Error("Delivery not found");
    return delivery;
  }

  static async getByDate(date: string) {
    return DeliveriesService.list({ date });
  }

  static async getSummary() {
    const all = await DeliveryModel.find({}).lean();
    const scheduled = all.filter((d) => d.status === DeliveryStatus.Scheduled).length;
    const outForDelivery = all.filter((d) => d.status === DeliveryStatus.OutForDelivery).length;
    const delivered = all.filter((d) => d.status === DeliveryStatus.Delivered).length;
    const failed = all.filter((d) => d.status === DeliveryStatus.Failed).length;

    // Today's deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayCount = all.filter(
      (d) => d.scheduled_date >= today && d.scheduled_date < tomorrow,
    ).length;

    return { total: all.length, scheduled, outForDelivery, delivered, failed, todayCount };
  }
}
