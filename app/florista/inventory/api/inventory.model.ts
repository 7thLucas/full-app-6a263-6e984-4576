import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export enum FlowerStatus {
  Fresh = "fresh",
  UseSoon = "use_soon",
  Critical = "critical",
  Expired = "expired",
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_inventory",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class InventoryItem extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  flower_name!: string;

  @prop({ type: String, required: false, trim: true })
  variety?: string;

  @prop({ type: Number, required: true, min: 0 })
  quantity!: number;

  @prop({ type: String, required: false })
  unit?: string; // stems, bunches, etc.

  @prop({ type: Date, required: true })
  purchase_date!: Date;

  @prop({ type: Number, required: true, min: 1 })
  shelf_life_days!: number;

  @prop({ type: Date, required: true })
  expiry_date!: Date;

  @prop({ type: String, enum: FlowerStatus, default: FlowerStatus.Fresh })
  status!: FlowerStatus;

  @prop({ type: String, required: false })
  supplier?: string;

  @prop({ type: Number, required: false, min: 0 })
  cost_per_unit?: number;

  @prop({ type: String, required: false })
  notes?: string;
}

export const InventoryModel = getModelForClass(InventoryItem);
