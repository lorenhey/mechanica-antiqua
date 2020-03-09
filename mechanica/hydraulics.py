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
