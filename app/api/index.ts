// Import global routes
import routes from "./routes";
import { initializeModels } from "./models";
// Florista domain models — register with Mongoose on startup
import "~/florista/inventory/api/inventory.model";
import "~/florista/orders/api/orders.model";
import "~/florista/deliveries/api/deliveries.model";
import { seedFlorista } from "~/florista/seed/florista.seed";

// Initialize models
await initializeModels();

// Run Florista demo seed
await seedFlorista();

export default routes;
