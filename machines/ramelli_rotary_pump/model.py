import os
import sys

# Add root to path to import mechanica
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

try:
    from mechanica.hydraulics import calculate_flow_rate
    from mechanica.units import cm
except ImportError:
    pass

def calculate_physics():
    # DOCUMENTED: dimensions from text
    radius = 20 # cm
    width = 30 # cm
    rpm = 30
    
    # Calculate volume per rotation
    # INFERRED: cylinder volume
    volume = 3.14159 * radius**2 * width 
    flow = volume * rpm
    return flow

def generate_svg():
    svg_content = """<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    <circle cx="150" cy="150" r="80" stroke="black" stroke-width="4" fill="none" />
    <rect x="70" y="145" width="160" height="10" fill="gray" />
    <text x="100" y="280" font-family="sans-serif" font-size="14">Ramelli Rotary Pump</text>
</svg>"""
    with open(os.path.join(os.path.dirname(__file__), 'reconstruction.svg'), 'w') as f:
        f.write(svg_content)

if __name__ == "__main__":
    flow = calculate_physics()
    generate_svg()
    print(f"Generated SVG. Flow rate: {flow} cm^3/min")
