import sys
import os
import math

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from mechanica.hydraulics import mannings_equation, inverted_siphon_pressure
from mechanica.statics import masonry_arch_thrust, arch_voussoir_depth

def main():
    print("Simulating Roman Aqueduct System...")

    # 1. Open-channel gravity flow
    # Assuming typical roman aqueduct slope
    slope = 0.002 # 0.2%
    width = 1.2
    depth_of_flow = 0.8
    area = width * depth_of_flow
    wetted_perimeter = width + 2 * depth_of_flow
    hydraulic_radius = area / wetted_perimeter
    roughness = 0.015 # Smooth masonry
    
    velocity = mannings_equation(slope, hydraulic_radius, roughness)
    flow_rate = area * velocity
    print(f"Flow velocity: {velocity:.2f} m/s")
    print(f"Volumetric flow rate: {flow_rate:.2f} m^3/s")

    # 2. Masonry arch
    span = 6.0
    rise = 3.0
    load_per_meter = 25000 # N/m (masonry weight approx)
    thrust = masonry_arch_thrust(span, rise, load_per_meter)
    voussoir_depth = arch_voussoir_depth(span)
    print(f"Arch thrust: {thrust:.2f} N")
    print(f"Voussoir depth: {voussoir_depth:.2f} m")

    # 3. Inverted siphon
    head_diff = 50.0 # 50m deep valley
    max_pressure = inverted_siphon_pressure(head_diff)
    print(f"Max pressure in siphon: {max_pressure:.2f} Pa")
    
    # Generate SVG
    svg_content = f"""<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#e0f7fa"/>
    <text x="20" y="30" font-size="20" font-family="Arial" fill="#006064">Roman Aqueduct System (Vitruvius)</text>
    
    <!-- Open channel section -->
    <rect x="50" y="100" width="200" height="20" fill="#b0bec5"/>
    <text x="50" y="90" font-size="12" fill="#37474f">Channel Flow (Manning)</text>
    <text x="50" y="140" font-size="12" fill="#37474f">Velocity: {velocity:.2f} m/s</text>
    
    <!-- Arched Viaduct -->
    <path d="M 250 120 L 250 300 L 280 300 L 280 120 Z" fill="#78909c" />
    <path d="M 340 120 L 340 300 L 370 300 L 370 120 Z" fill="#78909c" />
    <path d="M 430 120 L 430 300 L 460 300 L 460 120 Z" fill="#78909c" />
    
    <path d="M 250 120 Q 310 50 370 120" fill="none" stroke="#78909c" stroke-width="{voussoir_depth * 10}" />
    <path d="M 340 120 Q 400 50 460 120" fill="none" stroke="#78909c" stroke-width="{voussoir_depth * 10}" />
    <rect x="250" y="100" width="210" height="20" fill="#b0bec5"/>
    <text x="280" y="90" font-size="12" fill="#37474f">Masonry Arches (Thrust: {thrust/1000:.1f} kN)</text>

    <!-- Inverted Siphon -->
    <path d="M 460 110 L 520 110 L 600 350 L 700 350 L 760 150 L 800 150" fill="none" stroke="#1565c0" stroke-width="10"/>
    <text x="600" y="370" font-size="12" fill="#37474f">Inverted Siphon</text>
    <text x="600" y="385" font-size="12" fill="#37474f">Max Press: {max_pressure/1000:.1f} kPa</text>
</svg>"""

    with open('reconstruction.svg', 'w') as f:
        f.write(svg_content)
    
    print("Generated reconstruction.svg")

if __name__ == "__main__":
    main()
