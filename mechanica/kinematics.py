import math
import numpy as np

class GearMechanism:
    def __init__(self, gear_ratio):
        self.gear_ratio = gear_ratio
        
    def calculate_output_speed(self, input_speed):
        return input_speed * self.gear_ratio
        
def epicyclic_train_ratio(R_sun: float, R_planet: float, R_ring: float) -> float:
    return R_sun / (R_sun + R_ring)

def crank_slider_position(crank_radius: float, rod_length: float, angle_rad: float) -> float:
    r = crank_radius
    l = rod_length
    theta = angle_rad
    x = r * math.cos(theta) + math.sqrt(l**2 - (r * math.sin(theta))**2)
    return x

def crank_slider_velocity(crank_radius: float, rod_length: float, angle_rad: float, angular_vel: float) -> float:
    r = crank_radius
    l = rod_length
    theta = angle_rad
    omega = angular_vel
    sin_t = math.sin(theta)
    cos_t = math.cos(theta)
    v = -r * omega * sin_t - (r**2 * omega * sin_t * cos_t) / math.sqrt(l**2 - (r * sin_t)**2)
    return v

def cam_follower_displacement(cam_profile: callable, angle_rad: float) -> float:
    return cam_profile(angle_rad)
