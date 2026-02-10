import { Node, Edge } from "reactflow";

export type NodeType =
  | "webhook"          // Triggered by HTTP request
  | "schedule"         // Triggered by time (cron job)
  | "aiTextGenerator"  // AI text generation node
  | "aiAnalyser";      // AI analysis node


// Interface defines the structure (shape) of an object
// This describes what data each node will contain
export interface NodeData {
  label: string; // Every node must have a label (like a display name)
  type: NodeType; // The node type must be one of the NodeType values above
  config?: Record<string, any>; 
  // Optional property (because of ?)
  // Record<string, any> means:
  // An object with string keys and any type values
  // Example: { apiKey: "123", temperature: 0.7 }

  output?: any; 
  // Optional
  // This will store the result after node execution

  isExecuting?: boolean; 
  // Optional
  // Used to show loading state in UI

  error?: string; 
  // Optional
  // If execution fails, store error message
}


// Creating a new type called WorkFlowNode
// It extends (inherits from) ReactFlow's Node type
// Meaning it contains everything Node has
// PLUS we override the "data" property
export interface WorkFlowNode extends Node {
  data: NodeData; 
  // We are telling TypeScript:
  // The data inside this node MUST follow NodeData structure
}


// Creating WorkFlowEdge
// It extends ReactFlow's Edge type
// No changes, just renaming for clarity
export interface WorkFlowEdge extends Edge {}


// This interface defines the whole workflow state
export interface WorkFlowState {

  nodes: WorkFlowNode[]; // Array of all nodes in workflow
  edges: WorkFlowEdge[]; // Array of all edges (connections between nodes)
  addNode: (node: WorkFlowNode) => void; // Function that takes a WorkFlowNode and returns nothing
  updateNode: (id: string, data: Partial<NodeData>) => void; // Takes node id and partial data update, Partial<NodeData> means you don't need to pass full NodeData only the fields you want to update
  deleteNode: (id: string) => void; // Deletes node using its id

  addEdge: (edge: WorkFlowEdge) => void; // Adds a new edge
  deleteEdge: (id: string) => void; // Deletes edge by id

  setEdges: (edges: WorkFlowEdge[]) => void;
  setNodes: (nodes: WorkFlowNode[]) => void;
  clearWorkFlow: () => void; // Clears all nodes and edges
}
