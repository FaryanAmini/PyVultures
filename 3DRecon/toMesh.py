import numpy as np
import open3d as o3d

# load in the GLB file
target_mesh = ""
mesh = o3d.io.read_triangle_mesh(target_mesh)

# extract verticies to numpy array
points = np.asarray(mesh.verticies)
print(f"loaded {len(points)} points from glb")
