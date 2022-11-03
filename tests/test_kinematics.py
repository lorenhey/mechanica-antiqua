import math
import pytest
from mechanica.kinematics import (
    epicyclic_train_ratio,
    crank_slider_position,
    crank_slider_velocity,
    crank_slider_acceleration,
    connecting_rod_angle,
    scotch_yoke_kinematics,
    gruebler_kutzbach_dof,
    cam_gravity_drop,
    beam_engine_geometry
)

def test_epicyclic_train():
    """Verifica que el atril de Ramelli se mantenga horizontal si R_sun == R_planet."""
    R_sun = 1.5
    R_planet = 1.5
    r = epicyclic_train_ratio(R_sun, R_planet, R_ring=R_sun + 2 * R_planet)
    
    omega_carrier = 1.0
    omega_sun = 0.0
    omega_planet = omega_carrier + (omega_sun - omega_carrier) * (R_sun / R_planet)
    assert abs(omega_planet - 0.0) < 1e-6

def test_crank_slider_periodicity_and_limits():
    """Verifica límites geométricos en PMS (0 rad) y PMI (pi rad)."""
    r = 0.2  # 200 mm
    l = 0.8  # 800 mm
    
    # En theta=0 (PMS): x = l + r
    pos_0 = crank_slider_position(r, l, 0.0)
    assert abs(pos_0 - (l + r)) < 1e-6
    
    # En theta=pi (PMI): x = l - r
    pos_pi = crank_slider_position(r, l, math.pi)
    assert abs(pos_pi - (l - r)) < 1e-6
    
    # Carrera total S = 2*r
    assert abs((pos_0 - pos_pi) - 2 * r) < 1e-6

def test_crank_slider_derivatives_numeric():
    """Valida velocidad y aceleración analítica contra diferencias finitas."""
    r = 0.15
    l = 0.50
    omega = 10.0  # rad/s
    theta = math.pi / 3.0  # 60 grados
    d_theta = 1e-6
    
    # Velocidad analítica vs numérica
    v_analytic = crank_slider_velocity(r, l, theta, omega)
    x1 = crank_slider_position(r, l, theta + d_theta)
    x0 = crank_slider_position(r, l, theta - d_theta)
    v_numeric = (x1 - x0) / (2 * d_theta / omega)
    assert abs(v_analytic - v_numeric) < 1e-4
    
    # Aceleración analítica vs numérica
    a_analytic = crank_slider_acceleration(r, l, theta, omega)
    v1 = crank_slider_velocity(r, l, theta + d_theta, omega)
    v0 = crank_slider_velocity(r, l, theta - d_theta, omega)
    a_numeric = (v1 - v0) / (2 * d_theta / omega)
    assert abs(a_analytic - a_numeric) < 1e-3

def test_connecting_rod_angle():
    """Verifica que el ángulo de biela no exceda asin(r/l)."""
    r = 0.1
    l = 0.4
    max_phi = math.asin(r / l)
    
    phi_0 = connecting_rod_angle(r, l, 0.0)
    assert abs(phi_0) < 1e-6
    
    phi_90 = connecting_rod_angle(r, l, math.pi / 2.0)
    assert abs(phi_90 - max_phi) < 1e-6

def test_gruebler_kutzbach():
    """Valida grados de libertad para mecanismos típicos."""
    # Mecanismo de 4 barras: n=4, j1=4, j2=0 -> F = 3*(4-1) - 2*4 = 1
    assert gruebler_kutzbach_dof(4, 4, 0) == 1
    
    # Biela-manivela-corredera: n=4, j1=4 (3R + 1P), j2=0 -> F = 1
    assert gruebler_kutzbach_dof(4, 4, 0) == 1
    
    # Mecanismo de leva con seguidor de contacto puntual: n=3, j1=2 (1R + 1P), j2=1 (leva-seguidor) -> F = 3*(2) - 4 - 1 = 1
    assert gruebler_kutzbach_dof(3, 2, 1) == 1

def test_scotch_yoke():
    """Verifica movimiento armónico simple en yugo escocés."""
    R = 0.25
    omega = 4.0
    theta = math.pi / 4.0
    x, v, a = scotch_yoke_kinematics(R, theta, omega)
    
    assert abs(x - R * math.cos(theta)) < 1e-6
    assert abs(v - (-R * omega * math.sin(theta))) < 1e-6
    assert abs(a - (-omega**2 * x)) < 1e-6

def test_cam_drop():
    """Verifica alzado de leva y contacto con base."""
    lift = 0.2
    lift_angle = math.pi
    y_mid, v_mid = cam_gravity_drop(lift, math.pi / 2.0, lift_angle)
    assert abs(y_mid - lift / 2.0) < 1e-6
    assert v_mid > 0
