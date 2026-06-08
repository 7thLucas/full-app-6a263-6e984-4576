import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export enum OrderStatus {
  Pending = "pending",
  InProgress = "in_progress",
  Ready = "ready",
  OutForDelivery = "out_for_delivery",
  Fulfilled = "fulfilled",
  Cancelled = "cancelled",
}

export enum OrderOccasion {
  Birthday = "birthday",
  Anniversary = "anniversary",
  Wedding = "wedding",
  Funeral = "funeral",
  ValentinesDay = "valentines_day",
  MothersDay = "mothers_day",
  Graduation = "graduation",
  GetWell = "get_well",
  Congratulations = "congratulations",
  Other = "other",
}

class CustomerInfo {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, required: false })
  phone?: string;

  @prop({ type: String, required: false })
  email?: string;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_orders",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Order extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  order_number!: string;

  @prop({ type: () => CustomerInfo, required: true })
  customer!: CustomerInfo;

  @prop({ type: String, enum: OrderOccasion, default: OrderOccasion.Other })
  occasion!: OrderOccasion;

  @prop({ type: String, required: false })
  arrangement_description?: string;

  @prop({ type: [String], default: [] })
  flowers_requested!: string[];

  @prop({ type: String, enum: OrderStatus, default: OrderStatus.Pending })
  status!: OrderStatus;

  @prop({ type: Date, required: false })
  requested_delivery_date?: Date;

  @prop({ type: String, required: false })
  delivery_address?: string;

  @prop({ type: Number, required: false, min: 0 })
  total_price?: number;

  @prop({ type: String, required: false })
  notes?: string;

  @prop({ type: String, required: false })
  assigned_staff?: string;
}

export const OrderModel = getModelForClass(Order);
