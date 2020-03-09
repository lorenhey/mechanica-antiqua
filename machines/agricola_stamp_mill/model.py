import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from mechanica.geometry import SVGCanvas, Circle, Line

def build_model():
    canvas = SVGCanvas(800, 600)
    
    # Camshaft
    camshaft = Circle(200, 400, 30)
    canvas.add(camshaft)
    
    # Cams
    cam1 = Line(200, 400, 240, 400)
    cam2 = Line(200, 400, 160, 400)
    canvas.add(cam1)
    canvas.add(cam2)
    
    # Stamps
    stamp1 = Line(300, 200, 300, 500)
    stamp2 = Line(400, 200, 400, 500)
    canvas.add(stamp1)
    canvas.add(stamp2)

    svg_content = canvas.render()
    
    with open(os.path.join(os.path.dirname(__file__), 'reconstruction.svg'), 'w') as f:
        f.write(svg_content)
        
    print("Stamp mill model generated.")
    
if __name__ == '__main__':
    build_model()
