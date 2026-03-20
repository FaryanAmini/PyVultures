import math
from typing import Tuple

from pydantic.types import ImportString


class GroundBoundingBox:
    """Coordinates of the bounding box relative to the centre"""

    top_left: Tuple[float, float] = (0.0, 0.0)
    top_right: Tuple[float, float] = (0.0, 0.0)
    bottom_left: Tuple[float, float] = (0.0, 0.0)
    bottom_right: Tuple[float, float] = (0.0, 0.0)
