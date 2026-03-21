import math

from .projection import GroundProjection


def pixels_to_gps(
    pixel_x: float,
    pixel_y: float,
    image_width: int,
    image_height: int,
    drone_lat: float,
    drone_lon: float,
    projection: GroundProjection,
) -> tuple[float, float]:
    """convert pixel coordinates to GPS coordinates

    args:
        pixel_x: pixel x coordinate
        pixel_y: pixel y coordinate
        image_width: image width in pixels
        image_height: image height in pixels
        drone_lat: drone latitude
        drone_lon: drone longitude
        projection: ground projection object

    returns:
        tuple of GPS coordinates (latitude, longitude)
    """

    # normalize pixel to range relative to image center
    norm_x = (pixel_x / image_width) - 0.5
    norm_y = (pixel_y / image_height) - 0.5

    # scale to meters using ground projection
    offset_x_meters = norm_x * projection.width  # offset in meters from image center
    offset_y_meters = norm_y * projection.height  # offset in meters from image center

    # rotate by yaw to align with true north
    yaw_rad = math.radians(projection.yaw)
    rotated_x = offset_x_meters * math.cos(yaw_rad) - offset_y_meters * math.sin(
        yaw_rad
    )
    rotated_y = offset_x_meters * math.sin(yaw_rad) + offset_y_meters * math.cos(
        yaw_rad
    )

    # convert meters to gps cords

    meters_per_degree_lat = 111_139.0
    meters_per_degree_lon = 111_139.0 * math.cos(math.radians(drone_lat))

    delta_lat = rotated_y / meters_per_degree_lat
    delta_lon = rotated_x / meters_per_degree_lon

    gps_lat = drone_lat - delta_lat
    gps_lon = drone_lon + delta_lon

    return (gps_lat, gps_lon)


def detection_to_gps(
    detection: dict,
    image_width: int,
    image_height: int,
    drone_lat: float,
    drone_lng: float,
    projection: GroundProjection,
) -> dict:
    """
    Takes a YOLO detection dict and adds GPS coordinates for the center of its bounding box.
    """
    box = detection["box"]

    # Get the center pixel of the bounding box
    center_x = (box["x1"] + box["x2"]) / 2
    center_y = (box["y1"] + box["y2"]) / 2

    lat, lng = pixels_to_gps(
        center_x, center_y, image_width, image_height, drone_lat, drone_lng, projection
    )

    return {**detection, "gps": {"lat": lat, "lng": lng}}
