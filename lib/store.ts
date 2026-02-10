import { create } from "zustand";
import { WorkFlowEdge, WorkFlowNode, WorkFlowState } from "./types";
import { addEdge as addReactFlowEdge, Connection } from "reactflow";

export const useWorkFlowStore = create<WorkFlowState>((set, get) => ({
  nodes: [],
  edges: [],

  addNode: (node: WorkFlowNode) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
  },

  updateNode: (id: string, data: Partial<WorkFlowNode["data"]>) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    }));
  },

  deleteNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    }));
  },

  addEdge: (edge: WorkFlowEdge) => {
    set((state) => ({
      edges: addReactFlowEdge(edge as Connection, state.edges),
    }));
  },

  deleteEdge: (id: string) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
  },

  setNodes: (nodes: WorkFlowNode[]) => {
    set({ nodes });
  },

  setEdges: (edges: WorkFlowEdge[]) => {
    set({ edges });
  },

  clearWorkFlow: () => {
    set({ nodes: [], edges: [] });
  },
}));
