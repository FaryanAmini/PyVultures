import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

// handles loading the actual 3D file
function DroneScanModel({ url }) {
  // useGLTF automatically loads the .glb/.gltf file
  const { scene } = useGLTF(url);

  return <primitive object={scene} />;
}

export default function ModelViewer({ modelUrl }) {
  return (
    <div
      style={{ width: "100%", height: "800px", background: "var(--surface)" }}
    >
      {/* The Canvas is your 3D world */}
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
        {/* Controls let you drag, zoom, and rotate */}
        <OrbitControls makeDefault />

        {/* basic lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        <Environment preset="city" />

        {/* Suspense shows a fallback (like a loader) while the 3D model downloads */}
        <Suspense fallback={<HtmlFallback />}>
          {modelUrl && <DroneScanModel url={modelUrl} />}
        </Suspense>
      </Canvas>
    </div>
  );
}

// loading text component
function HtmlFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial color="var(--accent)" wireframe />
    </mesh>
  );
}
