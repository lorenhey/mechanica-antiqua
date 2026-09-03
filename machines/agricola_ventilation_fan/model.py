import sys
import os
import math

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from mechanica.geometry import SVGCanvas, Circle, Line

def build_model():
    canvas = SVGCanvas(800, 600)
    
    # Fan casing
    casing = Circle(400, 300, 150)
    canvas.add(casing)
    
    # Blades
    num_blades = 6
    for i in range(num_blades):
        angle = 2 * math.pi * i / num_blades
        x2 = 400 + 130 * math.cos(angle)
        y2 = 300 + 130 * math.sin(angle)
        blade = Line(400, 300, x2, y2)
        canvas.add(blade)

    svg_content = canvas.render()
    
    with open(os.path.join(os.path.dirname(__file__), 'reconstruction.svg'), 'w') as f:
        f.write(svg_content)
        
    print("Ventilation fan model generated.")
    
if __name__ == '__main__':
    build_model()
