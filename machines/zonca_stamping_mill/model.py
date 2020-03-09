import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

def calculate_impact():
    # DOCUMENTED: hammer mass
    mass = 50 # kg
    # INFERRED: drop height
    drop_height = 0.6 # meters
    
    # RECONSTRUCTED: impact energy
    g = 9.81
    energy = mass * g * drop_height
    return energy

def generate_svg():
    svg_content = """<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect x="100" y="50" width="20" height="150" fill="brown" />
    <rect x="80" y="200" width="60" height="40" fill="gray" />
    <text x="100" y="280" font-family="sans-serif" font-size="14">Zonca Stamping Mill</text>
</svg>"""
    with open(os.path.join(os.path.dirname(__file__), 'reconstruction.svg'), 'w') as f:
        f.write(svg_content)

if __name__ == "__main__":
    energy = calculate_impact()
    generate_svg()
    print(f"Generated SVG. Impact Energy: {energy} Joules")
