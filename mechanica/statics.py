"""
Statics calculations, including catenary curves for cables and bridges.
"""
import math
import numpy as np
from typing import Tuple

def _find_catenary_a(span: float, sag: float) -> float:
    """Find the catenary parameter 'a' using bisection."""
    if sag <= 0:
        return float('inf')
    
    def f(a):
        # We need a * (cosh(span/(2*a)) - 1) = sag
        # But wait, in the previous derivation I wrote a*cosh(x/a)-a.
        # So at x=span/2, a * cosh(span / (2*a)) - a = sag.
        # Thus f(a) = a * math.cosh(span / (2 * a)) - a - sag
        try:
            return a * math.cosh(span / (2 * a)) - a - sag
        except OverflowError:
            return float('inf')
            
    a_min = 0.01
    a_max = (span**2) / (8 * sag) * 2  # loose upper bound
    
    # Ensure f(a_max) and f(a_min) have different signs
    if f(a_max) > 0:
        a_max *= 10
        
    for _ in range(100):
        a_mid = (a_min + a_max) / 2
        val = f(a_mid)
        if val > 0:
            a_min = a_mid
        else:
            a_max = a_mid
            
    return (a_min + a_max) / 2

def catenary_curve(span: float, sag: float, points: int = 100) -> Tuple[np.ndarray, np.ndarray]:
    """
    Computes the x and y coordinates for a catenary curve.
    """
    a = _find_catenary_a(span, sag)
    x = np.linspace(-span / 2, span / 2, points)
    y = a * np.cosh(x / a) - a
    return x, y

def catenary_tension(span: float, sag: float, linear_density: float, gravity: float = 9.81) -> float:
    """
    Calculates the maximum tension in a catenary cable (at the supports).
    T_max = linear_density * gravity * (a + sag)
    """
    a = _find_catenary_a(span, sag)
    t_max = linear_density * gravity * (a + sag)
    return t_max


def masonry_arch_thrust(span: float, rise: float, load_per_meter: float) -> float:
    """
    Approximates the horizontal thrust of a masonry arch.
    H = (w * L**2) / (8 * f) where L is span, f is rise, w is load.
    """
    return (load_per_meter * span**2) / (8.0 * rise)

def arch_voussoir_depth(span: float) -> float:
    """
    Estimates the minimum voussoir depth (thickness) for a semi-circular Roman arch.
    Rule of thumb typically span / 10 to span / 15.
    We will return span / 10.0 for safety.
    """
    return span / 10.0
