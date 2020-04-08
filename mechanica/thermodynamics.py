import math

def calculate_draft_pressure(h: float, t_in: float, t_out: float) -> float:
    """
    Calculate the natural draft pressure (chimney effect) in Pascals.
    h: height of the furnace (meters)
    t_in: average temperature inside the furnace (Kelvin)
    t_out: average temperature outside (Kelvin)
    
    Formula: Delta P = C * a * h * (1/T_out - 1/T_in)
    where C = 0.0342 K/m, a = atmospheric pressure ~ 101325 Pa at sea level
    For high altitudes (e.g. Potosi at ~4000m), pressure is lower, roughly 61600 Pa.
    """
    g = 9.81
    R_specific = 287.058 # J/(kg*K) for dry air
    p_atm = 61600 # Assume high altitude Andean environment
    
    rho_out = p_atm / (R_specific * t_out)
    rho_in = p_atm / (R_specific * t_in)
    
    delta_p = (rho_out - rho_in) * g * h
    return delta_p

def calculate_venturi_pressure_drop(v_wind: float, a_inlet: float, a_constriction: float) -> float:
    """
    Calculate the pressure drop due to the Venturi effect (Bernoulli's principle).
    v_wind: ambient wind velocity (m/s)
    a_inlet: cross-sectional area of wind inlet (m^2)
    a_constriction: cross-sectional area of internal constriction (m^2)
    """
    # Using continuity: v1 * A1 = v2 * A2
    v_constriction = v_wind * (a_inlet / a_constriction)
    
    rho_air = 1.0 # Approximate density of air at high altitude in kg/m^3
    
    # Bernoulli equation simplified
    delta_p = 0.5 * rho_air * (v_constriction**2 - v_wind**2)
    return delta_p
