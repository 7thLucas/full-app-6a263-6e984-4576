import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import type { Ref } from "@typegoose/typegoose";
import { Order } from "~/florista/orders/api/orders.model";

export enum DeliveryStatus {
  Scheduled = "scheduled",
  OutForDelivery = "out_for_delivery",
  Delivered = "delivered",
  Failed = "failed",
  Cancelled = "cancelled",
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_deliveries",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Delivery extends CommonTypegooseEntity {
  @prop({ ref: () => Order, required: false })
  order?: Ref<Order>;

  @prop({ type: String, required: false })
  order_number?: string;

  @prop({ type: String, required: false })
  customer_name?: string;

  @prop({ type: String, required: true })
  delivery_address!: string;

  @prop({ type: Date, required: true })
  scheduled_date!: Date;

  @prop({ type: String, required: false })
  time_window?: string; // e.g. "10:00 - 12:00"

  @prop({ type: String, required: false })
  driver_name?: string;

  @prop({ type: String, required: false })
  driver_phone?: string;

  @prop({ type: String, enum: DeliveryStatus, default: DeliveryStatus.Scheduled })
  status!: DeliveryStatus;

  @prop({ type: Number, required: false, min: 1 })
  route_order?: number;

  @prop({ type: String, required: false })
  notes?: string;

  @prop({ type: Date, required: false })
  delivered_at?: Date;
}

export const DeliveryModel = getModelForClass(Delivery);
