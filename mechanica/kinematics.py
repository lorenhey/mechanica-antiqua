import math
from typing import Tuple, Dict, Any

class GearMechanism:
    def __init__(self, gear_ratio: float):
        self.gear_ratio = gear_ratio
        
    def calculate_output_speed(self, input_speed: float) -> float:
        return input_speed * self.gear_ratio
        
def epicyclic_train_ratio(R_sun: float, R_planet: float, R_ring: float) -> float:
    """Relación del tren epicicloidal respecto a la corona o portaplanetario."""
    return R_sun / (R_sun + R_ring)

def crank_slider_position(crank_radius: float, rod_length: float, angle_rad: float, eccentricity: float = 0.0) -> float:
    """
    Calcula la posición exacta del cursor de un mecanismo biela-manivela.
    x = r * cos(theta) + sqrt(l^2 - (r * sin(theta) - e)^2)
    """
    r = crank_radius
    l = rod_length
    theta = angle_rad
    e = eccentricity
    radicand = l**2 - (r * math.sin(theta) - e)**2
    if radicand < 0:
        raise ValueError("Longitud de biela insuficiente para el radio y excentricidad dados.")
    return r * math.cos(theta) + math.sqrt(radicand)

def crank_slider_velocity(crank_radius: float, rod_length: float, angle_rad: float, angular_vel: float, eccentricity: float = 0.0) -> float:
    """
    Velocidad lineal exacta del pistón/cursor: dx/dt.
    """
    r = crank_radius
    l = rod_length
    theta = angle_rad
    omega = angular_vel
    e = eccentricity
    sin_t = math.sin(theta)
    cos_t = math.cos(theta)
    radicand = l**2 - (r * sin_t - e)**2
    if radicand <= 0:
        return 0.0
    v = -r * omega * sin_t - (r * omega * (r * sin_t - e) * cos_t) / math.sqrt(radicand)
    return v

def crank_slider_acceleration(crank_radius: float, rod_length: float, angle_rad: float, angular_vel: float, angular_acc: float = 0.0, eccentricity: float = 0.0) -> float:
    """
    Aceleración lineal exacta del pistón/cursor: d²x/dt².
    """
    r = crank_radius
    l = rod_length
    theta = angle_rad
    omega = angular_vel
    alpha = angular_acc
    e = eccentricity
    sin_t = math.sin(theta)
    cos_t = math.cos(theta)
    delta = r * sin_t - e
    radicand = l**2 - delta**2
    if radicand <= 0:
        return 0.0
    sqrt_rad = math.sqrt(radicand)
    
    term1 = -r * (alpha * sin_t + omega**2 * cos_t)
    term2_num = (r * alpha * delta * cos_t + r**2 * omega**2 * cos_t**2 - r * omega**2 * delta * sin_t)
    term2 = term2_num / sqrt_rad
    term3 = (r * omega * delta * cos_t)**2 / (radicand * sqrt_rad)
    
    return term1 - term2 - term3

def connecting_rod_angle(crank_radius: float, rod_length: float, angle_rad: float, eccentricity: float = 0.0) -> float:
    """
    Calcula el ángulo de inclinación de la biela (phi) respecto al eje del cilindro.
    sin(phi) = (r * sin(theta) - e) / l
    """
    r = crank_radius
    l = rod_length
    e = eccentricity
    val = (r * math.sin(angle_rad) - e) / l
    val = max(-1.0, min(1.0, val))
    return math.asin(val)

def scotch_yoke_kinematics(radius: float, angle_rad: float, angular_vel: float) -> Tuple[float, float, float]:
    """
    Cinemática armónica pura del mecanismo de yugo escocés / corredera ranurada (ej. Al-Jazari).
    Retorna (desplazamiento x, velocidad v, aceleración a).
    """
    x = radius * math.cos(angle_rad)
    v = -radius * angular_vel * math.sin(angle_rad)
    a = -radius * (angular_vel**2) * math.cos(angle_rad)
    return x, v, a

def gruebler_kutzbach_dof(n_links: int, j1_full_joints: int, j2_half_joints: int = 0) -> int:
    """
    Criterio de Grübler-Kutzbach para mecanismos planos:
    F = 3 * (n - 1) - 2 * j1 - j2
    """
    return 3 * (n_links - 1) - 2 * j1_full_joints - j2_half_joints

def cam_profile_harmonic(lift: float, angle_rad: float, period: float = 2 * math.pi) -> float:
    """Perfil armónico de leva de alzado suave."""
    return (lift / 2.0) * (1.0 - math.cos(2.0 * math.pi * angle_rad / period))

def cam_gravity_drop(lift: float, angle_rad: float, lift_angle_rad: float = 2.0 * math.pi / 3.0, g: float = 9.81, angular_vel: float = 5.0) -> Tuple[float, float]:
    """
    Cinemática de pisón de bocarte/batán (Agricola, Zonca).
    Retorna (altura y, velocidad v_y).
    """
    theta = angle_rad % (2.0 * math.pi)
    if theta <= lift_angle_rad:
        # Alzado uniforme por la leva
        fraction = theta / lift_angle_rad
        y = lift * fraction
        v = (lift / lift_angle_rad) * angular_vel
        return y, v
    else:
        # Caída libre por gravedad hasta tocar el mortero
        t_drop = (theta - lift_angle_rad) / angular_vel
        y = lift - 0.5 * g * (t_drop**2)
        if y <= 0.0:
            return 0.0, 0.0
        v = -g * t_drop
        return y, v

def beam_engine_geometry(beam_half_length: float, crank_radius: float, rod_length: float, angle_rad: float) -> Dict[str, float]:
    """
    Cinemática de máquina con balancín oscilante (Newcomen, Papin, Leupold).
    """
    r = crank_radius
    l = rod_length
    L = beam_half_length
    
    # Ángulo del balancín (aprox lineal para arcos de arco con cadenas)
    stroke = 2.0 * r
    max_beam_angle = math.asin(min(1.0, stroke / (2.0 * L)))
    beam_angle = max_beam_angle * math.sin(angle_rad)
    
    piston_disp = L * math.sin(beam_angle)
    return {
        "beam_angle_rad": beam_angle,
        "beam_angle_deg": math.degrees(beam_angle),
        "piston_displacement": piston_disp,
        "stroke": stroke
    }

def third_class_lever_velocity(arm_length: float, angular_vel: float) -> float:
    return arm_length * angular_vel

def elastic_energy_transfer(stiffness: float, displacement: float, mass: float, efficiency: float = 1.0) -> float:
    return math.sqrt(efficiency * (stiffness / mass) * displacement**2)

def lever_slider_position(lever_pivot_x: float, lever_pivot_y: float, 
                          lever_length: float, angle_rad: float, 
                          attachment_radius: float) -> tuple[float, float]:
    x = lever_pivot_x + attachment_radius * math.cos(angle_rad)
    y = lever_pivot_y + attachment_radius * math.sin(angle_rad)
    return x, y

def leaf_spring_force(E: float, I: float, L: float, deflection: float) -> float:
    return (3.0 * E * I * deflection) / (L**3)

def leaf_spring_energy(E: float, I: float, L: float, max_deflection: float) -> float:
    return (3.0 * E * I * max_deflection**2) / (2.0 * L**3)

def differential_gear_speed(omega_left: float, omega_right: float, ratio: float = 0.5) -> float:
    return (omega_left + omega_right) * ratio

def perpendicular_gear_transmission(omega_input: float, n_teeth_input: int, n_teeth_output: int) -> float:
    if n_teeth_output == 0:
        raise ValueError("Number of output teeth cannot be zero.")
    return omega_input * (n_teeth_input / n_teeth_output)

def belt_drive_transmission(omega_input: float, d_input: float, d_output: float) -> float:
    if d_output == 0:
        raise ValueError("Output diameter cannot be zero.")
    return omega_input * (d_input / d_output)
