import numpy as np
import open3d as o3d
import trimesh
import trimesh.smoothing
from scipy.spatial import cKDTree


def load_glb(path):
    """extracts points and colors from a glb regardless of source"""
    scene = trimesh.load(path)
    geoms = scene.geometry.values() if isinstance(scene, trimesh.Scene) else [scene]

    points_list = []
    colors_list = []

    for g in geoms:
        if not hasattr(g, "vertices") or len(g.vertices) == 0:
            continue

        points_list.append(g.vertices)

        # handle color extraction safely
        if (
            hasattr(g, "visual")
            and hasattr(g.visual, "vertex_colors")
            and g.visual.vertex_colors is not None
        ):
            colors_list.append(g.visual.vertex_colors[:, :3])
        elif hasattr(g, "colors") and g.colors is not None:
            colors_list.append(g.colors[:, :3])
        else:
            # fallback to neutral grey
            colors_list.append(np.ones((len(g.vertices), 3)) * 128)

    if not points_list:
        raise ValueError(f"no valid points found in {path}")

    return np.concatenate(points_list), np.concatenate(colors_list)


def generate_mesh(input_file, output_file):
    # 1. load raw data from glb
    print(f"loading: {input_file}")
    pts, clrs = load_glb(input_file)

    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(pts)
    pcd.colors = o3d.utility.Vector3dVector(clrs / 255.0)

    # 2. unify density and remove noise
    # voxel downsampling makes the normal estimation math much more stable
    print("unifying point density...")
    pcd = pcd.voxel_down_sample(voxel_size=0.001)
    pcd, _ = pcd.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)

    # 3. create solid mesh via marching cubes
    # Voxel remeshing bypasses point normal estimation, ensuring correct outward-facing normals
    print("generating solid mesh via voxel remeshing...")

    points = np.asarray(pcd.points)
    colors = np.asarray(pcd.colors)

    pitch = 0.001
    mesh_tri = trimesh.voxel.ops.points_to_marching_cubes(points, pitch=pitch)

    print("smoothing mesh...")
    trimesh.smoothing.filter_taubin(mesh_tri, iterations=20)

    print("mapping colors...")
    tree = cKDTree(points)
    _, indices = tree.query(mesh_tri.vertices)
    mesh_tri.visual.vertex_colors = (colors[indices] * 255).astype(np.uint8)

    # 4. save the final result
    print(f"saving solid mesh to: {output_file}")
    mesh_tri.export(output_file)
    print("success")


if __name__ == "__main__":
    # replace these paths with your test files
    generate_mesh("../frontend/public/latest.glb", "output/mesh.glb")
