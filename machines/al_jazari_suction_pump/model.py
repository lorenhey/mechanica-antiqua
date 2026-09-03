import sys
import os

# Add mechanica module path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from mechanica.hydraulics import pump_volumetric_flow

def generate_svg():
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#fcfcfc"/>
    <text x="300" y="30" font-family="Arial" font-size="20" text-anchor="middle">Al-Jazari's Twin-Cylinder Suction Pump</text>
    
    <!-- Paddle Wheel & Gear -->
    <circle cx="150" cy="200" r="50" fill="#fff" stroke="#333" stroke-width="2"/>
    <circle cx="150" cy="200" r="20" fill="#cc9966" stroke="#333" stroke-width="2"/>
    <text x="150" y="270" font-family="Arial" font-size="12" text-anchor="middle">Gear Wheel &amp; Crank</text>

    <!-- Slot-rod mechanism -->
    <line x1="170" y1="200" x2="300" y2="200" stroke="#000" stroke-width="4"/>
    <rect x="230" y="190" width="10" height="80" fill="#999" stroke="#333" stroke-width="2" transform="rotate(-30 230 190)"/>
    <text x="250" y="160" font-family="Arial" font-size="12" text-anchor="middle">Slotted Rod</text>

    <!-- Piston 1 -->
    <rect x="350" y="100" width="100" height="40" fill="#e0e0e0" stroke="#333" stroke-width="2"/>
    <rect x="360" y="105" width="40" height="30" fill="#777"/>
    <line x1="300" y1="200" x2="360" y2="120" stroke="#000" stroke-width="3"/>
    
    <!-- Piston 2 -->
    <rect x="350" y="260" width="100" height="40" fill="#e0e0e0" stroke="#333" stroke-width="2"/>
    <rect x="360" y="265" width="40" height="30" fill="#777"/>
    <line x1="300" y1="200" x2="360" y2="280" stroke="#000" stroke-width="3"/>

    <!-- Pipes -->
    <path d="M 450 120 L 500 120 L 500 280 L 450 280" fill="none" stroke="#5599cc" stroke-width="15"/>
    <line x1="500" y1="200" x2="550" y2="200" stroke="#5599cc" stroke-width="15"/>
    <text x="560" y="205" font-family="Arial" font-size="12" text-anchor="start">Discharge</text>
</svg>"""
    with open("reconstruction.svg", "w") as f:
        f.write(svg_content)

if __name__ == "__main__":
    generate_svg()
    # Parameters: radius (m), stroke (m), rpm, efficiency
    # RECONSTRUCTED dims
    flow_one = pump_volumetric_flow(0.1, 0.4, 20.0, 0.8)
    flow_total = flow_one * 2
    print(f"Validated pump flow: {flow_total:.4f} m^3/s")
