import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from mechanica.geometry import Rectangle, Circle, Group, SVGCanvas

def build_model():
    canvas = SVGCanvas(800, 600)
    
    reservoir = Rectangle(300, 100, 150, 200, fill="none", stroke="black", stroke_width=2)
    water_res = Rectangle(300, 150, 150, 150, fill="blue")
    pipe = Rectangle(370, 300, 10, 100, fill="gray")
    basin = Rectangle(250, 400, 250, 50, fill="none", stroke="black", stroke_width=2)
    water_basin = Rectangle(250, 420, 250, 30, fill="blue")
    
    machine = Group([reservoir, water_res, pipe, basin, water_basin])
    canvas.add(machine)
    
    output_path = os.path.join(os.path.dirname(__file__), "reconstruction.svg")
    with open(output_path, "w") as f:
        f.write(canvas.render())
    
    return "YES"

if __name__ == "__main__":
    build_model()
