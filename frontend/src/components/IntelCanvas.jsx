import React, { useCallback, useState } from "react";
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
  const [rfInstance, setRfInstance] = useState(null);

  // function to add a node at a specific coordinate
  const addNode = useCallback(
    (label, position) => {
      const newNode = {
        id: `node_${Date.now()}`,
        type: "default",
        data: { label },
        position,
        style: {
          background: "#13170f",
          color: "#fff",
          border: "1px solid #6d9100",
          borderRadius: "4px",
          fontSize: "0.8rem",
          padding: "5px",
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes],
  );

  // handle right click on the canvas
  const onPaneContextMenu = useCallback(
    (event) => {
      event.preventDefault(); // stop the standard browser menu

      if (rfInstance) {
        //mouse pixel coordinates to flow space coordinates
        const position = rfInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        addNode("New Node", position);
      }
    },
    [rfInstance, addNode],
  );

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, animated: false, style: { stroke: "#ef4444" } },
          eds,
        ),
      ),
    [setEdges],
  );

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        onPaneContextMenu={onPaneContextMenu}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1a1a1a" variant="lines" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
