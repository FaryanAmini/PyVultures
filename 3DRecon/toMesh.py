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
    print("cleaning")
    pcd, ind = pcd.remove_statistical_outliers(nb_neighbors=20, std_ratio=2.0)
    print(f"removed {len(pcd.points) - len(ind)} outliers")

    # estimate normals
    print("estimating normals")
    pcd.estimate_normals(
        search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30)
    )
    pcd.orient_normals_consistent_tangent_plane(10)

    # mesh reconstruction
    print("reconstructing mesh")
    mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
        pcd, depth=9
    )

    # trim and cut low confidence
    print("trimming mesh")
    verticies_to_remove = densities < np.quantile(densities, 0.1)
    mesh.remove_vertices_by_index(verticies_to_remove)

    # export to glb with color and scale
    print(f"saving mesh to {output_path}")
    o3d.io.write_triangle_mesh(output_path, mesh)
