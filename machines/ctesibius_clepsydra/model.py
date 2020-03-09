import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from mechanica.geometry import Rectangle, Circle, Group, SVGCanvas

def build_model():
    canvas = SVGCanvas(800, 600)
    
    tank = Rectangle(300, 200, 100, 200, fill="none", stroke="black", stroke_width=2)
    water = Rectangle(300, 250, 100, 150, fill="blue")
    float_obj = Rectangle(320, 230, 60, 20, fill="brown")
    rack = Rectangle(345, 100, 10, 130, fill="gray")
    pinion = Circle(380, 120, 30, stroke="black", fill="none")
    pointer = Rectangle(380, 115, 60, 10, fill="red")
    
    machine = Group([tank, water, float_obj, rack, pinion, pointer])
    canvas.add(machine)
    
    output_path = os.path.join(os.path.dirname(__file__), "reconstruction.svg")
    with open(output_path, "w") as f:
        f.write(canvas.render())
    
    return "PROBABLY"

if __name__ == "__main__":
    build_model()
