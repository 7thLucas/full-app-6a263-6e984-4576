/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "sidebarTitle",
      type: "string",
      required: false,
      label: "Sidebar Title",
    },
    {
      fieldName: "dashboardWelcomeMessage",
      type: "string",
      required: false,
      label: "Dashboard Welcome Message",
    },
    {
      fieldName: "spoilageAlertThresholdDays",
      type: "number",
      required: false,
      label: "Spoilage Alert Threshold (days)",
      min: 1,
      max: 14,
    },
    {
      fieldName: "shopAddress",
      type: "string",
      required: false,
      label: "Shop Address",
    },
    {
      fieldName: "shopPhone",
      type: "string",
      required: false,
      label: "Shop Phone",
    },
    {
      fieldName: "enableDeliveryModule",
      type: "boolean",
      required: false,
      label: "Enable Delivery Module",
    },
    {
      fieldName: "enableSpoilageDashboard",
      type: "boolean",
      required: false,
      label: "Enable Spoilage Dashboard",
    },
    {
      fieldName: "defaultItemsPerPage",
      type: "number",
      required: false,
      label: "Default Items Per Page",
      min: 5,
      max: 100,
    },
  ],
};