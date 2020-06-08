import sys
import os
import math

# Add mechanica to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from mechanica.kinematics import perpendicular_gear_transmission

def generate_svg():
    # Saqiya parameters
    # Input from animal (e.g. ox): ~2 RPM
    omega_input = 2 * (2 * math.pi / 60) # rad/s
    
    # The animal walks in a circle, turning a vertical shaft. 
    # The vertical shaft has a horizontal crown gear.
    # The crown gear meshes with a vertical lantern gear on a horizontal shaft.
    # The horizontal shaft holds the chain of buckets.
    n_teeth_crown = 36 # Input gear
    n_teeth_lantern = 12 # Output gear
    
    omega_output = perpendicular_gear_transmission(omega_input, n_teeth_crown, n_teeth_lantern)
    
    # SVG string
    svg_content = f"""<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="800" height="600" fill="#f4f1ea"/>
    
    <!-- Title -->
    <text x="400" y="40" font-family="sans-serif" font-size="24" text-anchor="middle" fill="#333">Saqiya (Animal-Driven Water Wheel)</text>
    <text x="400" y="70" font-family="sans-serif" font-size="16" text-anchor="middle" fill="#555">Right-Angle Gear Transmission</text>
    
    <!-- Vertical Shaft (driven by animal) -->
    <rect x="240" y="150" width="20" height="250" fill="#8b5a2b"/>
    <!-- Draw Bar for Animal -->
    <rect x="100" y="180" width="150" height="15" fill="#a0522d"/>
    
    <!-- Crown Gear (Horizontal Plane) -->
    <ellipse cx="250" cy="380" rx="120" ry="40" fill="none" stroke="#5c4033" stroke-width="10"/>
    <text x="250" y="380" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#333">Crown Gear ({n_teeth_crown} teeth)</text>
    
    <!-- Lantern Gear (Vertical Plane) -->
    <rect x="375" y="330" width="30" height="100" fill="#a0522d" stroke="#5c4033" stroke-width="3"/>
    <text x="390" y="450" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#333">Lantern Gear ({n_teeth_lantern} teeth)</text>
    
    <!-- Horizontal Shaft -->
    <rect x="400" y="375" width="250" height="10" fill="#8b5a2b"/>
    
    <!-- Water Wheel / Chain of Pots -->
    <circle cx="650" cy="380" r="100" fill="none" stroke="#5c4033" stroke-width="8"/>
    <!-- Chain and Pots -->
    <path d="M 550 380 L 550 550" stroke="#444" stroke-width="4" fill="none" />
    <path d="M 750 380 L 750 550" stroke="#444" stroke-width="4" fill="none" />
    
    <!-- Pots -->
    <rect x="535" y="450" width="30" height="40" fill="#cd853f" rx="5"/>
    <rect x="735" y="450" width="30" height="40" fill="#cd853f" rx="5"/>
    <rect x="535" y="520" width="30" height="40" fill="#cd853f" rx="5"/>
    <rect x="735" y="520" width="30" height="40" fill="#cd853f" rx="5"/>
    
    <!-- Water Level -->
    <rect x="500" y="500" width="300" height="100" fill="#4682b4" opacity="0.5"/>
    
    <!-- Kinematic Data -->
    <rect x="50" y="450" width="250" height="120" fill="#fff" stroke="#333" stroke-width="2"/>
    <text x="60" y="475" font-family="sans-serif" font-size="14" fill="#333">Input Speed: {omega_input:.2f} rad/s</text>
    <text x="60" y="505" font-family="sans-serif" font-size="14" fill="#333">Output Speed: {omega_output:.2f} rad/s</text>
    <text x="60" y="535" font-family="sans-serif" font-size="14" fill="#333">Gear Ratio: {n_teeth_crown/n_teeth_lantern:.2f}</text>
    
</svg>"""

    with open(os.path.join(os.path.dirname(__file__), "reconstruction.svg"), "w") as f:
        f.write(svg_content)
        
if __name__ == "__main__":
    generate_svg()
