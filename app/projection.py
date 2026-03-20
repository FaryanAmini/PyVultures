import math
from typing import Tuple

from pydantic import BaseModel, Field


class GroundBoundingBox(BaseModel):
    """Coordinates of the bounding box relative to the center"""

    top_left: Tuple[float, float] = (0.0, 0.0)
    top_right: Tuple[float, float] = (0.0, 0.0)
    bottom_left: Tuple[float, float] = (0.0, 0.0)
    bottom_right: Tuple[float, float] = (0.0, 0.0)


class GroundProjection(BaseModel):
    """Calculates ground projection based on UAV height, FOV, and aspect ratio"""

    # Input parameters with defaults
    aspect_ratio: float = 16.0 / 9.0  # Camera aspect ratio
    distance_from_ground: float = 100.0  # Distance from ground to camera (meters)
    fov: float = 60.0  # Field of view in degrees
    yaw: float = 0.0  # Camera angle relative to north

    # Calculated outputs
    width: float = 0.0
    height: float = 0.0
    diagonal: float = 0.0

    # Nested bounding box object, instantiated automatically
    bounding_box: GroundBoundingBox = Field(default_factory=GroundBoundingBox)

    def calculate(self) -> None:
        """
        Calculates the properties of the bounding box based on the UAV height,
        camera aspect ratio, and field of view.
        """
        # Convert FOV from degrees to radians for the calculation
        fov_radians = math.radians(self.fov)

        # Calculate diagonal based on distance and FOV
        self.diagonal = 2.0 * self.distance_from_ground * math.tan(fov_radians / 2.0)

        # Calculate width and height based on diagonal and aspect ratio
        # Equivalent to f64::sqrt(1.0 + (1.0 / self.aspect_ratio).powi(2))
        self.width = self.diagonal / math.sqrt(1.0 + (1.0 / self.aspect_ratio) ** 2)
        self.height = self.diagonal / math.sqrt(1.0 + self.aspect_ratio**2)

        # Calculate corner coordinates relative to the center of the bounding box
        half_w = self.width / 2.0
        half_h = self.height / 2.0

        self.bounding_box.top_right = (half_w, half_h)
        self.bounding_box.top_left = (-half_w, half_h)
        self.bounding_box.bottom_right = (half_w, -half_h)
        self.bounding_box.bottom_left = (-half_w, -half_h)


# Example usage:
if __name__ == "__main__":
    projection = GroundProjection(distance_from_ground=100.0, yaw=45.0)
    projection.calculate()

    # Automatically converts to a dictionary or JSON for your API response!
    print(projection.model_dump_json(indent=2))
