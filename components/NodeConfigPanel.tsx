"use client";

import React, { useState, useEffect } from "react";
import { useWorkFlowStore } from "@/lib/store";
import { nodeDefinitions } from "@/lib/node-definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/select";
import { X } from "lucide-react";

interface NodeConfigPanelProps {
  nodeId: string;
  onClose: () => void;
}

export default function NodeConfigPanel({
  nodeId,
  onClose,
}: NodeConfigPanelProps) {
  const { nodes, updateNode } = useWorkFlowStore();
  const node = nodes.find((n) => n.id === nodeId);

  const [config, setConfig] = useState<Record<string, any>>(
    node?.data.config || {}
  );

  useEffect(() => {
    if (node?.data.config) {
      setConfig(node.data.config);
    }
  }, [node]);

  if (!node) return null;

  const definition = nodeDefinitions[node.data.type];
  if (!definition) return null;

  const handleSave = () => {
    updateNode(nodeId, { config });
    onClose();
  };

  const handleChange = (name: string, value: any) => {
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configure Node
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {definition.label}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {definition.configFields.map((field) => (
          <div key={field.name}>
            <Label className="text-gray-700 dark:text-gray-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.type === "text" && (
              <Input
                type="text"
                value={config[field.name] || field.defaultValue || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}

            {field.type === "number" && (
              <Input
                type="number"
                value={config[field.name] || field.defaultValue || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                value={config[field.name] || field.defaultValue || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="mt-1 font-mono text-sm"
                rows={6}
              />
            )}

            {field.type === "select" && (
              <Select
                value={config[field.name] || field.defaultValue || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="mt-1"
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          </div>
        ))}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Configuration
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        </div>

        {node.data.output && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Last Output
            </h4>
            <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
              {JSON.stringify(node.data.output, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}