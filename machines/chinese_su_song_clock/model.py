import math
import os
import sys

# Add mechanica to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from mechanica.hydraulics import steelyard_clepsydra_escapement_time

# Parameters
SCOOPS = 36
WHEEL_RADIUS = 1.5  # meters
WATER_FLOW_RATE = 0.0005  # m^3/s (0.5 liters per second)
TRIGGER_MASS = 10.0  # kg

def generate_svg(filename: str):
    time_per_step = steelyard_clepsydra_escapement_time(WATER_FLOW_RATE, TRIGGER_MASS)
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="100%" height="100%" fill="#f4f4f4"/>
        <text x="200" y="30" font-family="Arial" font-size="20" text-anchor="middle">Su Song's Clock Waterwheel</text>
        <circle cx="200" cy="200" r="150" fill="none" stroke="#333" stroke-width="5"/>
        <circle cx="200" cy="200" r="10" fill="#333"/>
    '''
    
    for i in range(SCOOPS):
        angle = 2 * math.pi * i / SCOOPS
        x1 = 200 + 10 * math.cos(angle)
        y1 = 200 + 10 * math.sin(angle)
        x2 = 200 + 150 * math.cos(angle)
        y2 = 200 + 150 * math.sin(angle)
        svg += f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#666" stroke-width="2"/>\n'
        
        # Draw scoop
        sx = 200 + 140 * math.cos(angle)
        sy = 200 + 140 * math.sin(angle)
        svg += f'<circle cx="{sx}" cy="{sy}" r="5" fill="#00aaff"/>\n'
        
    svg += f'''
        <text x="20" y="370" font-family="Arial" font-size="14">Escapement Time per Step: {time_per_step:.2f} s</text>
        <text x="20" y="390" font-family="Arial" font-size="14">Flow Rate: {WATER_FLOW_RATE*1000} L/s | Trigger Mass: {TRIGGER_MASS} kg</text>
    '''
    
    svg += '</svg>'
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(svg)

if __name__ == "__main__":
    generate_svg("reconstruction.svg")
    print("Reconstruction SVG generated.")
