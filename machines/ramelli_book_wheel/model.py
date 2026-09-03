import os
import math
import matplotlib.pyplot as plt
from mechanica.units import Length
from mechanica.kinematics import epicyclic_train_ratio
from mechanica.geometry import generate_svg_epicyclic

def simulate():
    print("Simulando Rueda de Libros de Ramelli...")
    
    # Datos Inferidos (Nivel B)
    # A partir del grabado, el engranaje central (fijo) parece tener 
    # el mismo diámetro que los engranajes satélites acoplados a los atriles.
    # El engranaje intermedio (que invierte el giro) no afecta la relación final.
    
    # Supongamos medidas en "piedi"
    radius_sun = Length(value=1.5, unit="piede", region_period="italy_16th")
    radius_planet = Length(value=1.5, unit="piede", region_period="italy_16th")
    
    # Verificación cinemática
    # La rueda principal actúa como carrier. 
    # ω_planet = ω_carrier + (ω_sun - ω_carrier) * (R_sun / R_planet)
    # Como el sol está fijo a la base, ω_sun = 0.
    # ω_planet = ω_carrier + (-ω_carrier) * (R_sun / R_planet)
    # Si R_sun == R_planet, entonces ω_planet = ω_carrier - ω_carrier = 0
    # Es decir, la rotación neta del planeta respecto a la tierra es CERO. El atril no se inclina.
    
    r_s = radius_sun.typical_m
    r_p = radius_planet.typical_m
    r_ring = r_s + 2.5 * r_p # Un anillo virtual para el dibujo
    
    print(f"Radio central (m): {r_s:.3f}")
    print(f"Radio planeta (m): {r_p:.3f}")
    
    # Generar figura para un ángulo específico (pi/4)
    svg_data = generate_svg_epicyclic(r_s, r_p, r_ring, angle_sun=math.pi/4)
    
    out_path = os.path.join(os.path.dirname(__file__), "reconstruction.svg")
    with open(out_path, "w") as f:
        f.write(svg_data)
        
    print(f"SVG generado en {out_path}")

if __name__ == "__main__":
    simulate()
