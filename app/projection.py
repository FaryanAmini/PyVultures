import math
from typing import Tuple

from pydantic import BaseModel, Field
from pydantic.types import ImportString


class GroundBoundingBox(BaseModel):
    """Coordinates of the bounding box relative to the centre"""

    top_left: Tuple[float, float] = (0.0, 0.0)
    top_right: Tuple[float, float] = (0.0, 0.0)
    bottom_left: Tuple[float, float] = (0.0, 0.0)
    bottom_right: Tuple[float, float] = (0.0, 0.0)


class GroundProjection(BaseModel):
    """calculates ground projection based on UAV heigh, FOV, and aspect ratio"""

    # default values
    aspect_ratio: float = 16.0 / 9.0  # camera aspect ratio
    distance_from_ground: float = 100.0  # distance from ground to camera (meters)
    fov: float = 60.0  # field of view in degrees
    yaw: float = 0.0  # camera angle relative to north
    # calculated outputs
    width: float = 0.0
    height: float = 0.0
    diagonal: float = 0.0

    # nested bounding box object
    bounding_box: GroundBoundingBox = Field(default_factory=GroundBoundingBox)
