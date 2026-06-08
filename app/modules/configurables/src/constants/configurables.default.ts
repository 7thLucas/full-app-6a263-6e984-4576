/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  tagline?: string;
  logoUrl: string;
  brandColor: TBrandColor;
  sidebarTitle?: string;
  dashboardWelcomeMessage?: string;
  spoilageAlertThresholdDays?: number;
  shopAddress?: string;
  shopPhone?: string;
  enableDeliveryModule?: boolean;
  enableSpoilageDashboard?: boolean;
  defaultItemsPerPage?: number;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Florista",
  tagline: "Freshness. Zero Waste. On Time.",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#10b981",
    secondary: "#f43f5e",
    accent: "#64748b",
  },
  sidebarTitle: "Florista",
  dashboardWelcomeMessage: "Welcome back. Here's what needs your attention today.",
  spoilageAlertThresholdDays: 3,
  shopAddress: "",
  shopPhone: "",
  enableDeliveryModule: true,
  enableSpoilageDashboard: true,
  defaultItemsPerPage: 20,
};
