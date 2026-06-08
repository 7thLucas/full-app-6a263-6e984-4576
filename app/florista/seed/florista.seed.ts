import { createLogger } from "~/lib/logger";
import { InventoryModel, FlowerStatus } from "~/florista/inventory/api/inventory.model";
import { OrderModel, OrderStatus, OrderOccasion } from "~/florista/orders/api/orders.model";
import { DeliveryModel, DeliveryStatus } from "~/florista/deliveries/api/deliveries.model";

const logger = createLogger("FloristaSeed");

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function computeStatus(expiryDate: Date): FlowerStatus {
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilExpiry = (expiryDate.getTime() - Date.now()) / msPerDay;
  if (daysUntilExpiry <= 0) return FlowerStatus.Expired;
  if (daysUntilExpiry <= 1) return FlowerStatus.Critical;
  if (daysUntilExpiry <= 3) return FlowerStatus.UseSoon;
  return FlowerStatus.Fresh;
}

export async function seedFlorista(): Promise<void> {
  try {
    const inventoryCount = await InventoryModel.countDocuments();
    if (inventoryCount === 0) {
      logger.info("Seeding demo inventory...");
      const today = new Date();

      const items = [
        { flower_name: "Rose", variety: "Red Velvet", quantity: 200, unit: "stems", shelf_life_days: 10, purchase_date: addDays(today, -2), supplier: "Green Valley Farms" },
        { flower_name: "Tulip", variety: "Purple Triumph", quantity: 150, unit: "stems", shelf_life_days: 7, purchase_date: addDays(today, -1), supplier: "Holland Blooms" },
        { flower_name: "Lily", variety: "Oriental White", quantity: 80, unit: "stems", shelf_life_days: 9, purchase_date: addDays(today, -3), supplier: "Pacific Growers" },
        { flower_name: "Sunflower", variety: "Lemon Queen", quantity: 120, unit: "stems", shelf_life_days: 6, purchase_date: addDays(today, -4), supplier: "Sunny Side Farm" },
        { flower_name: "Peony", variety: "Sarah Bernhardt", quantity: 50, unit: "stems", shelf_life_days: 5, purchase_date: addDays(today, -3), supplier: "Green Valley Farms" },
        { flower_name: "Hydrangea", variety: "Blue Hortensia", quantity: 40, unit: "bunches", shelf_life_days: 7, purchase_date: addDays(today, -5), supplier: "Holland Blooms" },
        { flower_name: "Carnation", variety: "Pink Blush", quantity: 300, unit: "stems", shelf_life_days: 14, purchase_date: addDays(today, 0), supplier: "Pacific Growers" },
        { flower_name: "Iris", variety: "Blue Moon", quantity: 60, unit: "stems", shelf_life_days: 5, purchase_date: addDays(today, -4), supplier: "Sunny Side Farm" },
      ];

      for (const item of items) {
        const expiryDate = addDays(item.purchase_date, item.shelf_life_days);
        await InventoryModel.create({
          ...item,
          expiry_date: expiryDate,
          status: computeStatus(expiryDate),
        });
      }

      logger.info("Demo inventory seeded.");
    }

    const ordersCount = await OrderModel.countDocuments();
    if (ordersCount === 0) {
      logger.info("Seeding demo orders...");
      const today = new Date();

      const orders = [
        {
          order_number: "FLR-2026-0001",
          customer: { name: "Sarah Johnson", phone: "+1 555 100 2000", email: "sarah@example.com" },
          occasion: OrderOccasion.Birthday,
          arrangement_description: "Romantic red rose bouquet with baby's breath",
          flowers_requested: ["Rose", "Baby's Breath"],
          status: OrderStatus.InProgress,
          requested_delivery_date: addDays(today, 1),
          delivery_address: "123 Maple St, Springfield",
          total_price: 85.00,
          assigned_staff: "Maria",
        },
        {
          order_number: "FLR-2026-0002",
          customer: { name: "Michael Chen", phone: "+1 555 200 3000" },
          occasion: OrderOccasion.Anniversary,
          arrangement_description: "Mixed seasonal arrangement in pastel tones",
          flowers_requested: ["Peony", "Hydrangea", "Rose"],
          status: OrderStatus.Pending,
          requested_delivery_date: addDays(today, 2),
          delivery_address: "456 Oak Ave, Springfield",
          total_price: 120.00,
        },
        {
          order_number: "FLR-2026-0003",
          customer: { name: "Emily Davis", email: "emily@example.com" },
          occasion: OrderOccasion.Wedding,
          arrangement_description: "Bridal bouquet — white lilies and peonies",
          flowers_requested: ["Lily", "Peony", "White Rose"],
          status: OrderStatus.Ready,
          requested_delivery_date: addDays(today, 0),
          delivery_address: "789 Church Rd, Springfield",
          total_price: 250.00,
          assigned_staff: "Carlos",
        },
        {
          order_number: "FLR-2026-0004",
          customer: { name: "Robert Kim", phone: "+1 555 400 5000" },
          occasion: OrderOccasion.GetWell,
          arrangement_description: "Cheerful sunflower and tulip mix",
          flowers_requested: ["Sunflower", "Tulip"],
          status: OrderStatus.Fulfilled,
          requested_delivery_date: addDays(today, -1),
          delivery_address: "321 Pine St, Springfield",
          total_price: 65.00,
          assigned_staff: "Maria",
        },
      ];

      for (const order of orders) {
        await OrderModel.create(order);
      }

      logger.info("Demo orders seeded.");
    }

    const deliveriesCount = await DeliveryModel.countDocuments();
    if (deliveriesCount === 0) {
      logger.info("Seeding demo deliveries...");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deliveries = [
        {
          order_number: "FLR-2026-0001",
          customer_name: "Sarah Johnson",
          delivery_address: "123 Maple St, Springfield",
          scheduled_date: addDays(today, 1),
          time_window: "10:00 - 12:00",
          driver_name: "Jake Rivera",
          driver_phone: "+1 555 600 7000",
          status: DeliveryStatus.Scheduled,
          route_order: 1,
        },
        {
          order_number: "FLR-2026-0002",
          customer_name: "Michael Chen",
          delivery_address: "456 Oak Ave, Springfield",
          scheduled_date: addDays(today, 1),
          time_window: "14:00 - 16:00",
          driver_name: "Jake Rivera",
          driver_phone: "+1 555 600 7000",
          status: DeliveryStatus.Scheduled,
          route_order: 2,
        },
        {
          order_number: "FLR-2026-0003",
          customer_name: "Emily Davis",
          delivery_address: "789 Church Rd, Springfield",
          scheduled_date: today,
          time_window: "09:00 - 11:00",
          driver_name: "Ana Lopez",
          driver_phone: "+1 555 700 8000",
          status: DeliveryStatus.OutForDelivery,
          route_order: 1,
        },
      ];

      for (const delivery of deliveries) {
        await DeliveryModel.create(delivery);
      }

      logger.info("Demo deliveries seeded.");
    }
  } catch (error) {
    logger.error("Florista seed failed:", error);
  }
}
