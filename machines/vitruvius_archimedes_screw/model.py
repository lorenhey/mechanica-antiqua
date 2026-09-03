import os
import math
from mechanica.hydraulics import archimedes_screw_theoretical_volume
from mechanica.geometry import generate_archimedes_screw_2d

def simulate():
    print("Simulando Tornillo de Arquímedes (Vitruvio)...")
    
    # Proporciones estrictas de Vitruvio (Nivel A)
    # Longitud = L
    # Radio exterior = L / 16 (Vitruvio divide en 8 partes el diámetro)
    # Paso = L / 8
    
    length_m = 5.0
    radius_outer = length_m / 16.0
    radius_inner = radius_outer / 2.0 # Tronco central
    pitch = length_m / 8.0
    
    # Inclinación pitagórica 3-4-5 (cateto vertical 3, horizontal 4, hipotenusa 5)
    # sen(theta) = 3/5
    incline_rad = math.asin(3.0 / 5.0)
    incline_deg = math.degrees(incline_rad)
    
    vol = archimedes_screw_theoretical_volume(radius_outer, radius_inner, pitch, length_m)
    
    print(f"Longitud: {length_m} m")
    print(f"Inclinación: {incline_deg:.1f} grados")
    print(f"Volumen teórico por ciclo continuo (estático): {vol*1000:.1f} Litros")
    
    svg_data = generate_archimedes_screw_2d(incline_deg, radius_outer, pitch, length_m)
    out_path = os.path.join(os.path.dirname(__file__), "reconstruction.svg")
    with open(out_path, "w") as f:
        f.write(svg_data)
        
    print(f"SVG generado en {out_path}")

if __name__ == "__main__":
    simulate()
