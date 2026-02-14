"use client";

import CustomNode from "@/components/CustomNode";
import NodeConfigPanel from "@/components/NodeConfigPanel";
import NodeConfig from "@/components/NodeConfigPanel";
import SideBar from "@/components/Sidebar";
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
  OnConnect,
  Panel,
  Connection,
  OnEdgesChange,
} from "reactflow";
import {WorkFlowExecutor} from "@/lib/executor"
import "reactflow/dist/style.css";

//each node has a unique ID
let nodeIdCounter = 0;

// Custom node types for ReactFlow
const nodeType: NodeTypes = {
  custom: CustomNode, // custom node component
};

export default function Home() {
  // Get workflow state and actions from  store
  const { nodes, edges, addNode, addEdge, updateNode, setNodes, setEdges } =
    useWorkFlowStore();

  // ReactFlow internal hooks for nodes/edges state management
  const [, , onNodesChange] = useNodesState([]);
  const [, , onEdgesChange] = useEdgesState([]);

  // Local component state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null); // track selected node
  const [isExecuting, setIsExecuting] = useState(false); // track workflow execution state
  const reactFlowWrapper = useRef<HTMLDivElement>(null); // reference to the ReactFlow wrapper div
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null); // ReactFlow instance

  // Handle changes to edges (eg. when user deletes or moves an edge)
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes); // ReactFlow internal handling

      changes.forEach((change) => {
        if (change.type === "remove") {
          // remove from Zustand store
          const { edges: currentEdges } = useWorkFlowStore.getState();
          setEdges(currentEdges.filter((edge) => edge.id !== change.id));
        }
      });
    },
    [edges, onEdgesChange, setEdges],
  );

  // Handles node move/delete events from ReactFlow
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes); // ReactFlow handle UI updates

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

  // Handles dropping a node from sidebar onto canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault(); // allow drop

      const type = event.dataTransfer.getData("application/reactflow"); // get node type
      if (!type || !reactFlowInstance) return;

      const definition = nodeDefinitions[type]; // get node config
      if (!definition) return;

      // convert screen coordinates to canvas coordinates
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
    event.preventDefault();
    event.dataTransfer.dropEffect = "move"; // show move cursor
  }, []);

  // Handles connecting two nodes
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        ...connection,
        id: `${connection.source}-${connection.target}`,
        type: "smoothstep",
        animated: true,
      };
      addEdge(edge as any); // add to store
    },
    [addEdge],
  );

  // Handles double-clicking on a node (to open settings panel)
  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      setSelectedNodeId(node.id);
    },
    [],
  );

  const executeWorkFlow=async()=>{
    if(nodes.length===0){
      alert("Add some nodes to the workflow")
      return 
    }

    setIsExecuting(true)
    const executor=new WorkFlowExecutor()
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-950">
      <SideBar /> {/* Sidebar with draggable nodes */}
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onInit={setReactFlowInstance} // store instance for drop calculations
          onDrop={onDrop}
          nodeTypes={nodeType} // custom node rendering
          onDragOver={onDragOver} // allow dropping
          className="bg-gray-100 dark:bg-gray-900"
          onConnect={onConnect} // handle node connections
          onNodeDoubleClick={onNodeDoubleClick} // select node
        >
          <Background color="#aaa" gap={20} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const definition = nodeDefinitions[node.data.type];
              return definition?.color.includes("gradient")
                ? "#8b5cf6"
                : definition?.color.replace("bg-", "") || "#6366f1";
            }}
            className="bg-white dark:bg-gray-800"
          />
          <Panel
            position="top-center"
            className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">
                {nodes.length}
              </span>{" "}
              nodes .{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {edges.length}
              </span>{" "}
              connections .
            </div>
          </Panel>
        </ReactFlow>
      </div>
      {selectedNodeId && (
        <NodeConfigPanel
          nodeId={selectedNodeId}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
