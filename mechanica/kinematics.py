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

def third_class_lever_velocity(arm_length: float, angular_vel: float) -> float:
    """
    Calculates the linear velocity at the end of a lever arm.
    Useful for Atlatl kinematics.
    """
    return arm_length * angular_vel

def elastic_energy_transfer(stiffness: float, displacement: float, mass: float, efficiency: float = 1.0) -> float:
    """
    Calculates the theoretical velocity of a projectile based on elastic potential energy.
    E = 1/2 * k * x^2
    1/2 * m * v^2 = efficiency * 1/2 * k * x^2 -> v = sqrt(efficiency * (k/m) * x^2)
    """
    return math.sqrt(efficiency * (stiffness / mass) * displacement**2)

def lever_slider_position(lever_pivot_x: float, lever_pivot_y: float, 
                          lever_length: float, angle_rad: float, 
                          attachment_radius: float) -> tuple[float, float]:
    """
    Calculates the position of the magazine (slider) driven by a lever.
    Used for the Repeating Crossbow (Zhuge Nu).
    """
    x = lever_pivot_x + attachment_radius * math.cos(angle_rad)
    y = lever_pivot_y + attachment_radius * math.sin(angle_rad)
    return x, y

def leaf_spring_force(E: float, I: float, L: float, deflection: float) -> float:
    """Calculates the restoring force of a cantilevered leaf spring (like whalebone).
    F = (3 * E * I * y) / L^3"""
    return (3 * E * I * deflection) / (L**3)

def leaf_spring_energy(E: float, I: float, L: float, max_deflection: float) -> float:
    """
    Calculates the stored elastic potential energy in a cantilevered leaf spring.
    U = (3 * E * I * y^2) / (2 * L^3)
    """
    return (3 * E * I * max_deflection**2) / (2 * L**3)

def cam_profile_harmonic(lift: float, angle_rad: float, period: float = 2 * math.pi) -> float:
    """
    Harmonic cam profile often used in early automata for smooth motion.
    """
    return (lift / 2) * (1 - math.cos(2 * math.pi * angle_rad / period))

def differential_gear_speed(omega_left: float, omega_right: float, ratio: float = 0.5) -> float:
    """
    Calculates the output angular velocity of a differential gear carrier.
    By default, ratio is 0.5 (standard differential).
    """
    return (omega_left + omega_right) * ratio

