import argparse
import glob
import os

import gsplat
import numpy as np
import torch
from depth_anything_3.api import DepthAnything3

# force PyTorch to use its own memory efficient backends
torch.backends.cuda.enable_flash_sdp(True)
torch.backends.cuda.enable_math_sdp(False)
torch.backends.cuda.enable_mem_efficient_sdp(True)

# memory settings
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
os.environ["XFORMERS_DISABLED"] = "0"


# init and run inference
model = DepthAnything3.from_pretrained("depth-anything/DA3-LARGE-1.1").to("cuda")

parser = argparse.ArgumentParser(description="Generate 3D Model from images")
parser.add_argument(
    "--input", type=str, default="slukesRoad", help="Input folder with images"
)
parser.add_argument("--output", type=str, default="./output", help="Output directory")
args = parser.parse_args()

# get all images from the provided input folder
image_paths = sorted(
    glob.glob(f"{args.input}/*.jpg")
    + glob.glob(f"{args.input}/*.JPG")
    + glob.glob(f"{args.input}/*.png")
)

# inference to clean up the data first
prediction = model.inference(
    image=image_paths,
    process_res=392,
)

# ero out confidence for pixels detected as sky so they are filtered during export
if prediction.sky is not None and prediction.conf is not None:
    prediction.conf[prediction.sky] = 0.0

# xport with a higher confidence threshold (top 30% of points)
# filter out low confidence points during export
model._export_results(
    prediction,
    export_format="mini_npz-glb",
    export_dir=args.output,
    conf_thresh_percentile=50.0,
)
