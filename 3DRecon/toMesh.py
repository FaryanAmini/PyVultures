from sys import path

import numpy as np
import open3d as o3d

# load in the GLB file
target_mesh = ""
mesh = o3d.io.read_triangle_mesh(target_mesh)

# extract verticies to numpy array
points = np.asarray(mesh.verticies)
print(f"loaded {len(points)} points from glb")

# function to create mesh


def generate_mesh(input_path, output_path):
    pcd = o3d.io.read_point_cloud(input_path)
    if not pcd.has_points():
        mesh = o3d.io.read_triangle_mesh(input_path)
        pcd.points = mesh.vertices
        pcd.colors = mesh.vertex_colors

    print(f"loaded {len(pcd.points)} points from {input_path}")

    # remove statistical outliers

    # estimate normals

    # mesh reconstruction
