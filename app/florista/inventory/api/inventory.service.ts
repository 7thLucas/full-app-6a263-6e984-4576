import { InventoryModel, FlowerStatus } from "./inventory.model";
import type { InventoryItem } from "./inventory.model";

export interface CreateInventoryDto {
  flower_name: string;
  variety?: string;
  quantity: number;
  unit?: string;
  purchase_date: string;
  shelf_life_days: number;
  supplier?: string;
  cost_per_unit?: number;
  notes?: string;
}

export interface UpdateInventoryDto extends Partial<CreateInventoryDto> {
  status?: FlowerStatus;
}

function computeStatus(expiryDate: Date, thresholdDays = 3): FlowerStatus {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / msPerDay;

  if (daysUntilExpiry <= 0) return FlowerStatus.Expired;
  if (daysUntilExpiry <= 1) return FlowerStatus.Critical;
  if (daysUntilExpiry <= thresholdDays) return FlowerStatus.UseSoon;
  return FlowerStatus.Fresh;
}

export class InventoryService {
  static async list(filters?: { status?: FlowerStatus }) {
    const query: Record<string, any> = {};
    if (filters?.status) query.status = filters.status;
    return InventoryModel.find(query).sort({ expiry_date: 1 }).lean();
  }

  static async getById(id: string) {
    const item = await InventoryModel.findById(id).lean();
    if (!item) throw new Error("Inventory item not found");
    return item;
  }

  static async create(dto: CreateInventoryDto) {
    const purchaseDate = new Date(dto.purchase_date);
    const expiryDate = new Date(purchaseDate);
    expiryDate.setDate(expiryDate.getDate() + dto.shelf_life_days);

    const status = computeStatus(expiryDate);

    return InventoryModel.create({
      ...dto,
      purchase_date: purchaseDate,
      expiry_date: expiryDate,
      status,
    });
  }

  static async update(id: string, dto: UpdateInventoryDto) {
    const item = await InventoryModel.findById(id);
    if (!item) throw new Error("Inventory item not found");

    if (dto.purchase_date || dto.shelf_life_days) {
      const purchaseDate = dto.purchase_date ? new Date(dto.purchase_date) : item.purchase_date;
      const shelfLife = dto.shelf_life_days ?? item.shelf_life_days;
      const expiryDate = new Date(purchaseDate);
      expiryDate.setDate(expiryDate.getDate() + shelfLife);
      (dto as any).expiry_date = expiryDate;
      if (!dto.status) {
        (dto as any).status = computeStatus(expiryDate);
      }
    }

    Object.assign(item, dto);
    return item.save();
  }

  static async delete(id: string) {
    const result = await InventoryModel.findByIdAndDelete(id);
    if (!result) throw new Error("Inventory item not found");
    return result;
  }

  static async refreshStatuses() {
    const items = await InventoryModel.find({});
    for (const item of items) {
      const newStatus = computeStatus(item.expiry_date);
      if (item.status !== newStatus) {
        item.status = newStatus;
        await item.save();
      }
    }
  }

  static async getAtRiskItems(thresholdDays = 3) {
    const now = new Date();
    const thresholdDate = new Date(now);
    thresholdDate.setDate(thresholdDate.getDate() + thresholdDays);

    return InventoryModel.find({
      expiry_date: { $lte: thresholdDate },
      status: { $ne: FlowerStatus.Expired },
      quantity: { $gt: 0 },
    })
      .sort({ expiry_date: 1 })
      .lean();
  }

  static async getSummary() {
    const all = await InventoryModel.find({}).lean();
    const fresh = all.filter((i) => i.status === FlowerStatus.Fresh).length;
    const useSoon = all.filter((i) => i.status === FlowerStatus.UseSoon).length;
    const critical = all.filter((i) => i.status === FlowerStatus.Critical).length;
    const expired = all.filter((i) => i.status === FlowerStatus.Expired).length;
    const totalStems = all.reduce((acc, i) => acc + i.quantity, 0);

    return { total: all.length, fresh, useSoon, critical, expired, totalStems };
  }
}
