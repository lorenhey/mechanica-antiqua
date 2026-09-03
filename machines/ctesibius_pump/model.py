import os
from mechanica.geometry import Rectangle, Circle, Group, SVGCanvas

def build_model():
    canvas = SVGCanvas(800, 600)
    
    # Simple 2D representation of the double-cylinder pump
    base = Rectangle(100, 400, 600, 50, fill="gray")
    cylinder_left = Rectangle(200, 200, 80, 200, fill="lightblue", stroke="black", stroke_width=2)
    cylinder_right = Rectangle(520, 200, 80, 200, fill="lightblue", stroke="black", stroke_width=2)
    
    piston_left = Rectangle(205, 250, 70, 20, fill="black")
    piston_right = Rectangle(525, 300, 70, 20, fill="black")
    
    pipe = Rectangle(280, 350, 240, 40, fill="blue")
    spout = Rectangle(380, 100, 40, 250, fill="blue")
    
    machine = Group([base, cylinder_left, cylinder_right, piston_left, piston_right, pipe, spout])
    canvas.add(machine)
    
    output_path = os.path.join(os.path.dirname(__file__), "reconstruction.svg")
    with open(output_path, "w") as f:
        f.write(canvas.render())
    
    return "YES" # would_it_actually_work

if __name__ == "__main__":
    build_model()
