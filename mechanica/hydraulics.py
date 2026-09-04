import math

def pump_volumetric_flow(cylinder_radius: float, stroke_length: float, rpm: float, efficiency: float = 0.85) -> float:
    """
    Caudal volumétrico de una bomba de pistón simple (m^3 / s).
    """
    area = math.pi * cylinder_radius**2
    volume_per_stroke = area * stroke_length
    strokes_per_second = rpm / 60.0
    return volume_per_stroke * strokes_per_second * efficiency

def archimedes_screw_theoretical_volume(radius_outer: float, radius_inner: float, pitch: float, length: float) -> float:
    """
    Volumen de agua teórico transportado por un tornillo de Arquímedes.
    Estimación simplificada basada en el volumen libre por paso.
    """
    area_outer = math.pi * radius_outer**2
    area_inner = math.pi * radius_inner**2
    free_area = (area_outer - area_inner) * 0.5 # Aprox mitad lleno
    volume_per_pitch = free_area * pitch
    num_pitches = length / pitch
    return volume_per_pitch * num_pitches

def nozzle_mass_flow(pressure_pa: float, temp_k: float, nozzle_area: float) -> float:
    """
    Flujo másico aproximado de vapor a través de una tobera (modelo incompresible simple para bajas presiones de la eolípila).
    """
    R_specific = 461.5 # J/(kg*K) para vapor de agua
    density = pressure_pa / (R_specific * temp_k)
    # Ecuación de Bernoulli simplificada (asumiendo descarga a atmósfera P_atm)
    P_atm = 101325
    if pressure_pa <= P_atm:
        return 0.0
    
    velocity = math.sqrt(2 * (pressure_pa - P_atm) / density)
    return density * nozzle_area * velocity

def bernoulli_velocity(area_1: float, velocity_1: float, area_2: float) -> float:
    """
    Calculates velocity in a narrowed conduit using continuity equation.
    Q = A1 * V1 = A2 * V2
    """
    if area_2 == 0:
        return 0.0
    return (area_1 * velocity_1) / area_2

def pressure_head(velocity: float) -> float:
    """
    Calculates pressure head from velocity.
    h = v^2 / (2 * g)
    """
    g = 9.81
    return (velocity**2) / (2 * g)


def mannings_equation(slope: float, hydraulic_radius: float, roughness: float) -> float:
    """
    Calculates velocity of open-channel gravity flow using Manning's equation (m/s).
    V = (1 / n) * R**(2/3) * S**(1/2)
    """
    return (1.0 / roughness) * (hydraulic_radius ** (2.0 / 3.0)) * math.sqrt(slope)

def inverted_siphon_pressure(head_difference: float, fluid_density: float = 1000.0) -> float:
    """
    Calculates static pressure at the lowest point of an inverted siphon (Pa).
    P = rho * g * h
    """
    g = 9.81
    return fluid_density * g * head_difference

def steelyard_clepsydra_escapement_time(flow_rate_m3_s: float, trigger_mass_kg: float, fluid_density: float = 1000.0) -> float:
    """
    Calculates the time interval (in seconds) between escapement steps for a 
    waterwheel steelyard clepsydra (like Su Song's clock).
    
    flow_rate_m3_s: The constant volumetric flow rate into the scoop.
    trigger_mass_kg: The mass of water required in a scoop to trip the steelyard mechanism.
    fluid_density: Density of the fluid (default 1000 kg/m^3 for water).
    
    Returns: time in seconds per step.
    """
    if flow_rate_m3_s <= 0:
        return float("inf")
    mass_flow_rate = flow_rate_m3_s * fluid_density
    return trigger_mass_kg / mass_flow_rate
