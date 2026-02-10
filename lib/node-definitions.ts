import { Webhook } from "lucide-react";

export interface ConfigField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required: boolean;
  defaultValue?: any;
}

export interface NodeDefinitions {
  type: string;
  label: string;
  description: string;
  category: "trigger" | "ai" | "action" | "logic";
  icon: any;
  color: string;
  defaultConfig: Record<string, any>;
  configFields: ConfigField[];
}

export const nodeDefinitions: Record<string, NodeDefinitions> = {
  webhook: {
    type: "webhook",
    label: "Webhook Trigger",
    description: "Trigger workflow when receiving HTTP request",
    category: "trigger",
    icon: Webhook,
    color: "bg-blue-500",
    defaultConfig: {
      method: "POST",
      path: "/webhook",
    },
    configFields: [
      {
        name: "method",
        label: "HTTP Method",
        type: "select",
        options: [
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
          { value: "PATCH", label: "PATCH" },
        ],
        defaultValue: "POST",
      },
    ],
  },
};
