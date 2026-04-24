import React, { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export default function IntelCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const addNode = (label) => {
    const newNode = {
      id: Date.now().toString(),
      type: "default",
      data: { label },
      position: { x: 0, y: 0 },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
