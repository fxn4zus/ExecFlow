"use client";

import SideBar from "@/component/Sidebar";
import { nodeDefinitions } from "@/lib/node-definitions";
import { useWorkFlowStore } from "@/lib/store";
import { NodeData, WorkFlowNode } from "@/lib/types";
import { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  OnNodesChange,
  useEdgesState,
  useNodesState,
} from "reactflow";

let nodeIdCounter = 0;

export default function Home() {
  const { nodes, edges, addNode, addEdge, updateNode, setNodes, setEdges } =
    useWorkFlowStore();
  const [, , onNodesChange] = useNodesState([]);
  const [, , onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Handles node move/delete events from ReactFlow
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes); // let ReactFlow handle UI updates

      changes.forEach((change) => {
        if (change.type === "remove") {
          // remove node from store
          const { nodes: currentNodes } = useWorkFlowStore.getState();
          setNodes(currentNodes.filter((node) => node.id !== change.id));
        } else if (change.type === "position" && "position" in change) {
          // update node position in store
          const updatedNodes = nodes.map((n) =>
            n.id === change.id ? { ...n, position: change.position! } : n,
          );
          setNodes(updatedNodes);
        }
      });
    },
    [nodes, onNodesChange, setNodes],
  );

  // Creates a new node when dragged from sidebar and dropped on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault(); // allow drop

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;

      const definition = nodeDefinitions[type];
      if (!definition) return;

      // convert screen coords → canvas coords
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkFlowNode = {
        id: `node-${nodeIdCounter++}`,
        type: "custom",
        position,
        data: {
          label: definition.label,
          type: definition.type,
          config: definition.defaultConfig,
        } as NodeData,
      };

      addNode(newNode); // add to store
    },
    [reactFlowInstance, addNode],
  );

  // Enables dropping onto the ReactFlow canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    // Necessary to allow dropping
    event.preventDefault();

    // Show move cursor while dragging
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-950">
      {/* <SideBar onExecute={} isExecuting={} /> */}
      <SideBar />

      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="bg-gray-100 dark:bg-gray-900"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
