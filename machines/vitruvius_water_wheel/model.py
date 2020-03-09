import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from mechanica.geometry import Rectangle, Circle, Group, SVGCanvas

def build_model():
    canvas = SVGCanvas(800, 600)
    
    river = Rectangle(0, 450, 800, 150, fill="blue")
    wheel = Circle(400, 350, 150, stroke="saddlebrown", stroke_width=10, fill="none")
    hub = Circle(400, 350, 20, stroke="black", fill="black")
    
    # Generate 8 blades
    blades = []
    import math
    for i in range(8):
        angle = i * math.pi / 4
        x1 = 400 + 20 * math.cos(angle)
        y1 = 350 + 20 * math.sin(angle)
        x2 = 400 + 150 * math.cos(angle)
        y2 = 350 + 150 * math.sin(angle)
        # We can just use thin rectangles for blades or a line if we had a line class.
        # But we don't have line class in our subset of mechanica.geometry updated here (wait, Line was in original geometry.py!)
        # Let's import Line
        from mechanica.geometry import Line
        blades.append(Line(x1, y1, x2, y2, stroke="saddlebrown", stroke_width=5))
    
    machine = Group([river, wheel, hub] + blades)
    canvas.add(machine)
    
    output_path = os.path.join(os.path.dirname(__file__), "reconstruction.svg")
    with open(output_path, "w") as f:
        f.write(canvas.render())
    
    return "YES"

if __name__ == "__main__":
    build_model()
