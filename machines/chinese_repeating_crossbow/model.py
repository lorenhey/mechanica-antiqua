import sys
import os
sys.path.append(os.path.abspath('../../'))
from mechanica.kinematics import lever_slider_position, elastic_energy_transfer
import math

def generate_svg():
    width, height = 800, 400
    svg = f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">\\n'
    svg += '  <rect width="100%" height="100%" fill="#f4f4f4"/>\\n'
    
    # Stock
    svg += '  <!-- Stock (DOCUMENTED) -->\\n'
    svg += '  <rect x="100" y="200" width="600" height="40" fill="#8B4513" rx="5"/>\\n'
    
    # Bow Prod
    svg += '  <!-- Bow (DOCUMENTED) -->\\n'
    svg += '  <path d="M 700 100 Q 750 220 700 340" fill="none" stroke="#5C4033" stroke-width="15"/>\\n'
    
    # Lever linkage (INFERRED kinematics)
    lever_pivot_x = 250
    lever_pivot_y = 220
    attachment_radius = 60
    
    # Different states
    angles = [math.pi * 0.7, math.pi * 0.4]  # Forward (catch), Back (draw/release)
    colors = ['#cccccc', '#666666']
    
    for i, angle in enumerate(angles):
        mag_x, mag_y = lever_slider_position(lever_pivot_x, lever_pivot_y, 200, angle, attachment_radius)
        
        # Lever
        svg += f'  <line x1="{lever_pivot_x}" y1="{lever_pivot_y}" x2="{lever_pivot_x + 200 * math.cos(angle)}" y2="{lever_pivot_y + 200 * math.sin(angle)}" stroke="{colors[i]}" stroke-width="10"/>\\n'
        
        # Magazine (Slider)
        # The magazine slides along the stock, driven by the attachment point
        mag_rect_x = mag_x - 50
        mag_rect_y = 160
        svg += f'  <rect x="{mag_rect_x}" y="{mag_rect_y}" width="150" height="40" fill="{colors[i]}" opacity="0.8"/>\\n'
        
        # String
        if i == 0:
            # String resting
            svg += f'  <path d="M 700 100 L {mag_rect_x + 150} 220 L 700 340" fill="none" stroke="black" stroke-width="2"/>\\n'
        else:
            # String drawn
            svg += f'  <path d="M 700 100 L {mag_rect_x + 100} 220 L 700 340" fill="none" stroke="red" stroke-width="2"/>\\n'

    svg += '</svg>\\n'
    
    with open('reconstruction.svg', 'w') as f:
        f.write(svg)
        
    print("reconstruction.svg generated successfully.")
    
    # Validate physics
    # Energy of the bow
    stiffness = 5000 # N/m, ASSUMED
    draw_length = 0.3 # m, INFERRED
    mass = 0.05 # kg (bolt mass)
    vel = elastic_energy_transfer(stiffness, draw_length, mass, 0.7)
    print(f"Estimated bolt velocity: {vel:.2f} m/s")

if __name__ == "__main__":
    generate_svg()
