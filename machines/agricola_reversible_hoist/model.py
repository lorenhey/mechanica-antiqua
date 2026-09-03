import sys
import os

# Add parent directory to path to import mechanica
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from mechanica.geometry import SVGCanvas, Circle, Line
from mechanica.kinematics import GearMechanism

def build_model():
    # DOCUMENTED dimensions from Agricola
    # Reversible water wheel
    wheel_radius = 2.0 # meters (assumed/reconstructed)
    drum_radius = 0.5 # meters

    canvas = SVGCanvas(800, 600)
    
    # Draw water wheel
    wheel = Circle(400, 300, 150)
    canvas.add(wheel)
    
    # Draw drum
    drum = Circle(400, 300, 50)
    canvas.add(drum)
    
    # Ropes
    rope1 = Line(350, 300, 350, 500)
    rope2 = Line(450, 300, 450, 500)
    canvas.add(rope1)
    canvas.add(rope2)

    svg_content = canvas.render()
    
    with open(os.path.join(os.path.dirname(__file__), 'reconstruction.svg'), 'w') as f:
        f.write(svg_content)
        
    print("Reversible water hoist model generated.")
    
if __name__ == '__main__':
    build_model()
