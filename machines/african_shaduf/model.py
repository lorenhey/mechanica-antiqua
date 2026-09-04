import sys
import os
import math

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from mechanica.statics import first_class_lever_balance

def run_model():
    # Dimensions (DOCUMENTED from general Shaduf proportions, ASSUMED exact values)
    # Total lever length typically 3-5 meters.
    L_load = 3.0 # meters (INFERRED from reach to water)
    L_cw = 1.0   # meters (ASSUMED shorter counterweight arm)
    
    # Masses
    water_volume = 15.0 # liters (ASSUMED bucket size)
    water_mass = water_volume # 15 kg
    bucket_mass = 2.0 # kg (ASSUMED)
    total_load_mass = water_mass + bucket_mass
    
    lever_linear_density = 2.0 # kg/m (ASSUMED wooden pole)
    
    # Calculate required counterweight (RECONSTRUCTED)
    cw_mass = first_class_lever_balance(total_load_mass, L_load, L_cw, lever_linear_density)
    
    print(f"Required counterweight mass: {cw_mass:.2f} kg")
    
    # Generate SVG
    svg_content = f"""<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="800" height="600" fill="#f0f8ff" />
    
    <!-- Ground -->
    <rect x="0" y="500" width="800" height="100" fill="#8b4513" />
    <!-- Water -->
    <rect x="600" y="520" width="200" height="80" fill="#1e90ff" />
    
    <!-- Pillar (Fulcrum) -->
    <rect x="290" y="250" width="20" height="250" fill="#a0522d" />
    <circle cx="300" cy="250" r="5" fill="black" />
    
    <!-- Lever (First-class) -->
    <!-- Assuming angle of 20 degrees up towards the load side -->
    <g transform="translate(300, 250) rotate(20)">
        <!-- Counterweight arm goes left -->
        <line x1="-150" y1="0" x2="0" y2="0" stroke="#8b4513" stroke-width="15" />
        <!-- Load arm goes right -->
        <line x1="0" y1="0" x2="450" y2="0" stroke="#8b4513" stroke-width="10" />
        
        <!-- Counterweight -->
        <circle cx="-150" cy="0" r="{math.sqrt(cw_mass)*4}" fill="#696969" />
        <text x="-180" y="-30" font-family="Arial" font-size="14" fill="black">CW: {cw_mass:.1f} kg</text>
        
        <!-- Load Drop line (always vertical in reality, but here attached to end of lever) -->
        <g transform="translate(450, 0) rotate(-20)">
            <line x1="0" y1="0" x2="0" y2="200" stroke="black" stroke-width="2" />
            <!-- Bucket -->
            <path d="M-15,200 L15,200 L10,230 L-10,230 Z" fill="#cd853f" />
            <text x="20" y="215" font-family="Arial" font-size="14" fill="black">Load: {total_load_mass:.1f} kg</text>
        </g>
    </g>
    
    <!-- Annotations -->
    <text x="320" y="220" font-family="Arial" font-size="16" fill="black">Fulcrum</text>
    <text x="50" y="50" font-family="Arial" font-size="20" fill="black">Shaduf Reconstruction</text>
    <text x="50" y="80" font-family="Arial" font-size="14" fill="black">Dimensions: L_load={L_load}m, L_cw={L_cw}m (ASSUMED)</text>
    <text x="50" y="100" font-family="Arial" font-size="14" fill="black">Required Counterweight calculated using mechanica.statics</text>
</svg>"""
    
    svg_path = os.path.join(os.path.dirname(__file__), "reconstruction.svg")
    with open(svg_path, "w") as f:
        f.write(svg_content)
    print(f"SVG written to {svg_path}")

if __name__ == "__main__":
    run_model()
